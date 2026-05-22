"use strict";
/**
 * Polar Payments Webhook Handler
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { POLAR_WEBHOOK_SECRET } = require("../config/env");
const { Webhooks } = require("@polar-sh/express");
const { CREDIT_PACKS } = require("./credits");

const router = express.Router();

async function handleCheckoutUpdated(db, data, webhookId) {
    if (data.status !== "succeeded" && data.status !== "confirmed") return;
    
    const paymentId  = data.id;
    const metadata   = data.metadata   || {};
    const amountTotal = data.amount || data.total_amount || 0;
    const currency    = (data.currency || "USD").toUpperCase();

    // Save raw transaction
    await db.collection("transactions").updateOne(
        { payment_id: paymentId },
        {
            $setOnInsert: {
                id: uuidv4(),
                webhook_id: webhookId,
                event_type: "checkout.updated",
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

        const already = await db.collection("polar_processed").findOne({ payment_id: paymentId });
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
        await db.collection("polar_processed").insertOne({
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

        const already = await db.collection("polar_processed").findOne({ payment_id: paymentId });
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

        await db.collection("polar_processed").insertOne({
            payment_id: paymentId,
            user_id: userId,
            kind,
            metadata,
            created_at: iso(utcNow()),
        });
        console.log(`[webhook] prompt purchased: ${promptId} by user ${userId}`);
    }
}

async function handleSubscriptionEvent(db, data, webhookId, eventType) {
    const subscriptionId = data.id;
    const metadata       = data.metadata || {};
    const userId         = metadata.user_id;
    const planId         = metadata.plan_id;

    await db.collection("transactions").updateOne(
        { payment_id: subscriptionId },
        {
            $setOnInsert: {
                id: uuidv4(),
                webhook_id: webhookId,
                event_type: eventType,
                payment_id: subscriptionId,
                amount: data.amount || data.total_amount || 0,
                currency: (data.currency || "USD").toUpperCase(),
                status: "active",
                metadata,
                created_at: iso(utcNow()),
            },
        },
        { upsert: true }
    );

    if (!userId || !planId) return;

    const already = await db.collection("polar_processed").findOne({ payment_id: subscriptionId });
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
    await db.collection("polar_processed").insertOne({
        payment_id: subscriptionId,
        user_id: userId,
        kind: "subscription",
        metadata,
        created_at: iso(utcNow()),
    });
    console.log(`[webhook] subscription active: plan ${planId} → user ${userId}`);
}

async function handleRefund(db, data, webhookId, eventType) {
    const refundId  = data.id;
    const paymentId = data.charge_id || data.order_id || data.payment_id;
    const metadata  = data.metadata || {};

    await db.collection("transactions").updateOne(
        { payment_id: refundId },
        {
            $setOnInsert: {
                id: uuidv4(),
                webhook_id: webhookId,
                event_type: eventType,
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

// Polar Webhook endpoint mounted at /api/webhooks/polar
router.post("/polar", express.json(), Webhooks({
    webhookSecret: POLAR_WEBHOOK_SECRET || "fallback_secret",
    onPayload: async (payload) => {
        const webhookId = uuidv4();
        const db = getDb();
        const eventType = payload.type;
        const data = payload.data;

        console.log(`[webhook] received: ${eventType} (id=${webhookId})`);

        await db.collection("webhook_events").insertOne({
            id: uuidv4(),
            webhook_id: webhookId,
            event_type: eventType,
            payload: payload,
            received_at: iso(utcNow()),
        });

        try {
            if (eventType === "checkout.updated") {
                await handleCheckoutUpdated(db, data, webhookId);
            } else if (["subscription.active", "subscription.created", "subscription.updated"].includes(eventType)) {
                if (data.status === "active") {
                    await handleSubscriptionEvent(db, data, webhookId, eventType);
                }
            } else if (["refund.created", "refund.updated"].includes(eventType)) {
                if (data.status === "succeeded") {
                    await handleRefund(db, data, webhookId, eventType);
                }
            } else {
                console.log(`[webhook] unhandled event type: ${eventType}`);
            }
        } catch (e) {
            console.error(`[webhook] processing error for ${eventType}:`, e.message);
            await db.collection("webhook_events").updateOne(
                { webhook_id: webhookId },
                { $set: { processing_error: e.message } }
            );
        }
    }
}));

// Admin: list recent webhook events
router.get("/polar/events", asyncH(async (req, res) => {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || "50"), 200);
    const events = await db.collection("webhook_events")
        .find({}, { projection: { _id: 0, payload: 0 } })
        .sort({ received_at: -1 })
        .limit(limit)
        .toArray();
    res.json(events);
}));

// Admin: list all transactions
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
