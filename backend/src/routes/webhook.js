"use strict";
/**
 * Dodo Payments Webhook Handler
 * ─────────────────────────────
 * Standard Webhooks spec (https://www.standardwebhooks.com/)
 *
 * Dodo sends three headers:
 *   webhook-id         – unique event ID (use for idempotency)
 *   webhook-timestamp  – Unix seconds
 *   webhook-signature  – "v1,<base64-hmac-sha256>"  (possibly multiple, comma-sep)
 *
 * Signed payload = `${webhook-id}.${webhook-timestamp}.${rawBody}`
 * Secret is base64-encoded; decode before use.
 */

const express = require("express");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { DODO_WEBHOOK_SECRET } = require("../config/env");
const { CREDIT_PACKS } = require("./credits");

const router = express.Router();

// ─── Signature verification ───────────────────────────────────────────────────
function verifySignature(rawBody, headers) {
    if (!DODO_WEBHOOK_SECRET) {
        // If no secret configured, skip verification (dev mode only)
        console.warn("[webhook] DODO_WEBHOOK_SECRET not set — skipping signature check");
        return true;
    }

    const webhookId        = headers["webhook-id"];
    const webhookTimestamp = headers["webhook-timestamp"];
    const webhookSig       = headers["webhook-signature"];

    if (!webhookId || !webhookTimestamp || !webhookSig) {
        throw new HttpError(400, "Missing webhook signature headers");
    }

    // Reject events older than 5 minutes
    const ts = parseInt(webhookTimestamp, 10);
    const ageSec = Math.abs(Date.now() / 1000 - ts);
    if (ageSec > 300) throw new HttpError(400, "Webhook timestamp too old");

    // Decode secret (base64)
    const secretBytes = Buffer.from(DODO_WEBHOOK_SECRET, "base64");

    // Signed payload string
    const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;

    // Compute expected HMAC-SHA256
    const expectedHmac = crypto
        .createHmac("sha256", secretBytes)
        .update(signedPayload)
        .digest("base64");

    // Webhook-signature may have multiple sigs: "v1,abc123 v1,xyz456"
    const sigs = webhookSig.split(" ");
    const valid = sigs.some((s) => {
        const [, sigBase64] = s.split(",");
        if (!sigBase64) return false;
        try {
            return crypto.timingSafeEqual(
                Buffer.from(sigBase64, "base64"),
                Buffer.from(expectedHmac, "base64")
            );
        } catch {
            return false;
        }
    });

    if (!valid) throw new HttpError(401, "Webhook signature mismatch");
    return true;
}

// ─── Event processors ─────────────────────────────────────────────────────────
async function handlePaymentSucceeded(db, event, webhookId) {
    const data = event.data || event;
    const paymentId  = data.payment_id || data.id;
    const metadata   = data.metadata   || {};
    const amountTotal = data.total_amount || data.amount || 0;       // in paise/cents
    const currency    = (data.currency || "USD").toUpperCase();

    // Save raw transaction
    await db.collection("transactions").updateOne(
        { payment_id: paymentId },
        {
            $setOnInsert: {
                id: uuidv4(),
                webhook_id: webhookId,
                event_type: event.type || "payment.succeeded",
                payment_id: paymentId,
                amount: amountTotal,
                currency,
                status: "succeeded",
                metadata,
                created_at: iso(utcNow()),
            },
        },
        { upsert: true }
    );

    const kind = metadata.kind;

    // ── Credit pack purchase ──────────────────────────────────────────────
    if (kind === "credit_pack") {
        const pack = CREDIT_PACKS[metadata.pack_id];
        const userId = metadata.user_id;
        if (!pack || !userId) return;

        // Idempotency: check dodo_processed
        const already = await db.collection("dodo_processed").findOne({ payment_id: paymentId });
        if (already) return;

        await db.collection("users").updateOne({ id: userId }, { $inc: { credits: pack.credits } });
        await db.collection("credit_transactions").insertOne({
            id: uuidv4(),
            user_id: userId,
            amount: pack.credits,
            type: "purchase",
            pack_id: pack.id,
            price_usd: pack.price_usd,
            payment_id: paymentId,
            created_at: iso(utcNow()),
        });
        await db.collection("dodo_processed").insertOne({
            payment_id: paymentId,
            user_id: userId,
            kind,
            metadata,
            created_at: iso(utcNow()),
        });
        console.log(`[webhook] credit_pack: +${pack.credits} credits → user ${userId}`);
    }

    // ── Prompt direct purchase ────────────────────────────────────────────
    if (kind === "prompt") {
        const userId   = metadata.user_id;
        const promptId = metadata.prompt_id;
        if (!userId || !promptId) return;

        const already = await db.collection("dodo_processed").findOne({ payment_id: paymentId });
        if (already) return;

        const prm = await db.collection("prompts").findOne({ id: promptId });
        if (!prm) return;

        const owned = await db.collection("purchases").findOne({ user_id: userId, prompt_id: promptId });
        if (!owned) {
            await db.collection("purchases").insertOne({
                id: uuidv4(),
                user_id: userId,
                prompt_id: promptId,
                creator_id: prm.creator_id,
                method: "money",
                amount_usd: parseInt(metadata.amount_usd || 0),
                credits_used: 0,
                payment_id: paymentId,
                created_at: iso(utcNow()),
            });
            await db.collection("prompts").updateOne({ id: promptId }, { $inc: { downloads: 1 } });
        }

        await db.collection("dodo_processed").insertOne({
            payment_id: paymentId,
            user_id: userId,
            kind,
            metadata,
            created_at: iso(utcNow()),
        });
        console.log(`[webhook] prompt purchased: ${promptId} by user ${userId}`);
    }
}

async function handleSubscriptionActive(db, event, webhookId) {
    const data           = event.data || event;
    const subscriptionId = data.subscription_id || data.id;
    const metadata       = data.metadata || {};
    const userId         = metadata.user_id;
    const planId         = metadata.plan_id;

    await db.collection("transactions").updateOne(
        { payment_id: subscriptionId },
        {
            $setOnInsert: {
                id: uuidv4(),
                webhook_id: webhookId,
                event_type: event.type || "subscription.active",
                payment_id: subscriptionId,
                amount: data.total_amount || 0,
                currency: (data.currency || "USD").toUpperCase(),
                status: "active",
                metadata,
                created_at: iso(utcNow()),
            },
        },
        { upsert: true }
    );

    if (!userId || !planId) return;

    const already = await db.collection("dodo_processed").findOne({ payment_id: subscriptionId });
    if (already) return;

    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    await db.collection("users").updateOne(
        { id: userId },
        { $set: { subscription_plan: planId, subscription_expires_at: iso(expiresAt) } }
    );
    await db.collection("subscriptions").insertOne({
        id: uuidv4(),
        user_id: userId,
        plan_id: planId,
        status: "active",
        starts_at: iso(utcNow()),
        expires_at: iso(expiresAt),
        payment_id: subscriptionId,
    });
    await db.collection("dodo_processed").insertOne({
        payment_id: subscriptionId,
        user_id: userId,
        kind: "subscription",
        metadata,
        created_at: iso(utcNow()),
    });
    console.log(`[webhook] subscription active: plan ${planId} → user ${userId}`);
}

async function handleRefund(db, event, webhookId) {
    const data      = event.data || event;
    const refundId  = data.refund_id || data.id;
    const paymentId = data.payment_id;
    const metadata  = data.metadata || {};

    await db.collection("transactions").updateOne(
        { payment_id: refundId },
        {
            $setOnInsert: {
                id: uuidv4(),
                webhook_id: webhookId,
                event_type: event.type || "refund.succeeded",
                payment_id: refundId,
                original_payment_id: paymentId,
                amount: -(data.amount || 0),
                currency: (data.currency || "USD").toUpperCase(),
                status: "refunded",
                metadata,
                created_at: iso(utcNow()),
            },
        },
        { upsert: true }
    );
    console.log(`[webhook] refund recorded: ${refundId} for payment ${paymentId}`);
}

// ─── Main webhook endpoint ─────────────────────────────────────────────────────
// IMPORTANT: must use express.raw() to get raw body for HMAC — mounted in app.js
router.post(
    "/dodo",
    express.raw({ type: "application/json" }),
    asyncH(async (req, res) => {
        const rawBody  = req.body.toString("utf8");
        const webhookId = req.headers["webhook-id"] || uuidv4();

        // 1. Verify signature
        verifySignature(rawBody, req.headers);

        let event;
        try {
            event = JSON.parse(rawBody);
        } catch {
            throw new HttpError(400, "Invalid JSON payload");
        }

        const eventType = event.type || "";
        const db = getDb();

        console.log(`[webhook] received: ${eventType} (id=${webhookId})`);

        // 2. Save raw webhook event for audit
        await db.collection("webhook_events").insertOne({
            id: uuidv4(),
            webhook_id: webhookId,
            event_type: eventType,
            payload: event,
            received_at: iso(utcNow()),
        });

        // 3. Route by event type
        try {
            if (eventType === "payment.succeeded") {
                await handlePaymentSucceeded(db, event, webhookId);
            } else if (["subscription.active", "subscription.renewed"].includes(eventType)) {
                await handleSubscriptionActive(db, event, webhookId);
            } else if (["refund.succeeded", "refund.created"].includes(eventType)) {
                await handleRefund(db, event, webhookId);
            } else if (eventType === "payment.failed") {
                // Log only — no fulfillment
                await db.collection("transactions").insertOne({
                    id: uuidv4(),
                    webhook_id: webhookId,
                    event_type: eventType,
                    payment_id: (event.data || event).payment_id || (event.data || event).id,
                    amount: 0,
                    status: "failed",
                    metadata: (event.data || event).metadata || {},
                    created_at: iso(utcNow()),
                });
                console.log(`[webhook] payment.failed logged`);
            } else {
                console.log(`[webhook] unhandled event type: ${eventType}`);
            }
        } catch (e) {
            // Log the processing error but still return 200 to avoid Dodo retrying
            console.error(`[webhook] processing error for ${eventType}:`, e.message);
            await db.collection("webhook_events").updateOne(
                { webhook_id: webhookId },
                { $set: { processing_error: e.message } }
            );
        }

        // Always return 200 quickly so Dodo doesn't retry
        res.json({ ok: true, event_type: eventType });
    })
);

// ─── Admin: list recent webhook events ────────────────────────────────────────
router.get("/dodo/events", asyncH(async (req, res) => {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || "50"), 200);
    const events = await db.collection("webhook_events")
        .find({}, { projection: { _id: 0, payload: 0 } })
        .sort({ received_at: -1 })
        .limit(limit)
        .toArray();
    res.json(events);
}));

// ─── Admin: list all transactions ─────────────────────────────────────────────
router.get("/transactions", asyncH(async (req, res) => {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || "100"), 500);
    const rows = await db.collection("transactions")
        .find({}, { projection: { _id: 0 } })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
    res.json(rows);
}));

module.exports = router;
