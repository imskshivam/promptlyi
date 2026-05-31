"use strict";
/**
 * Dodo Payments Webhook Handler
 */

const express = require("express");
const { getDb } = require("../config/db");
const { asyncH } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { toObjectId } = require("../utils/dbHelpers");
const { DODO_WEBHOOK_SECRET, DODO_PRODUCTS } = require("../config/env");
const { getDodoClient } = require("../config/dodo");

const router = express.Router();

const CREDIT_PACKS = {
    starter: { id: "starter", credits: 100,  price_usd: 3,  label: "Starter Pack", product_key: "pack_starter" },
    pro:     { id: "pro",     credits: 500,  price_usd: 10,  label: "Pro Pack",     product_key: "pack_pro" },
    max:     { id: "max",     credits: 1500, price_usd: 25, label: "Max Pack",     product_key: "pack_max" },
};

// Map productId back to plan/pack
function findProductDetails(productId) {
    if (productId === DODO_PRODUCTS.pack_starter) return { type: "credit_pack", data: CREDIT_PACKS.starter };
    if (productId === DODO_PRODUCTS.pack_pro) return { type: "credit_pack", data: CREDIT_PACKS.pro };
    if (productId === DODO_PRODUCTS.pack_max) return { type: "credit_pack", data: CREDIT_PACKS.max };
    return null;
}

// Ensure express.raw or text is used for this webhook in app.js, or we handle it here
router.post("/dodo", async (req, res) => {
    console.log("[payment/dodo] Received webhook");

    const webhookSecret = DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("[payment/dodo] DODO_WEBHOOK_SECRET is not configured");
        return res.status(500).send("Webhook secret not configured");
    }

    try {
        const dodo = getDodoClient();
        if (!dodo) return res.status(500).send("Dodo client not configured");

        const rawPayload = req.rawBody instanceof Buffer
            ? req.rawBody.toString("utf8")
            : typeof req.rawBody === "string"
            ? req.rawBody
            : JSON.stringify(req.body);

        const event = dodo.webhooks.unwrap(rawPayload, {
            "webhook-id": req.headers["webhook-id"],
            "webhook-signature": req.headers["webhook-signature"],
            "webhook-timestamp": req.headers["webhook-timestamp"],
        }, webhookSecret);

        console.log(`[payment/dodo] Verified event: \${event.type}`);

        const eventType = event.type;
        const data = event.data;
        const db = getDb();

        if (eventType === "payment.succeeded") {
            const customerEmail = data.customer?.email;
            const productId = data.product_cart?.[0]?.product_id;
            const dodoReferenceId = data.payment_id || data.id;

            if (customerEmail && productId) {
                const user = await db.collection("users").findOne({ email: customerEmail });
                if (user) {
                    const productDetails = findProductDetails(productId);
                    if (!productDetails) {
                        console.warn(`[payment/dodo] Unknown product ID: \${productId}`);
                        return res.status(200).send("Unknown product");
                    }

                    // Idempotency: skip if already processed
                    const existing = await db.collection("dodo_processed").findOne({ payment_id: dodoReferenceId });
                    if (existing) {
                        console.log(`[payment/dodo] Event \${dodoReferenceId} already processed — skipping`);
                        return res.status(200).send("Already processed");
                    }

                    const amountTotal = (data.total_amount || 0) / 100;
                    const currency = (data.currency || "USD").toUpperCase();

                    // Record transaction
                    await db.collection("transactions").insertOne({
                        payment_id: dodoReferenceId,
                        event_type: eventType,
                        amount: amountTotal,
                        currency,
                        status: "succeeded",
                        created_at: iso(utcNow()),
                        user_id: user.id,
                        product_id: productId
                    });

                    if (productDetails.type === "credit_pack") {
                        const pack = productDetails.data;
                        await db.collection("users").updateOne({ _id: toObjectId(user.id) }, { $inc: { credits: pack.credits } });
                        await db.collection("credit_transactions").insertOne({
                            user_id: user.id,
                            amount: pack.credits,
                            type: "purchase",
                            pack_id: pack.id,
                            price_usd: pack.price_usd,
                            payment_id: dodoReferenceId,
                            created_at: iso(utcNow()),
                        });
                        console.log(`[payment/dodo] credit_pack: +\${pack.credits} credits → user \${user.id}`);
                    } else if (productDetails.type === "subscription") {
                        const plan = productDetails.data;
                        const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
                        await db.collection("users").updateOne(
                            { _id: toObjectId(user.id) },
                            { $set: { subscription_plan: plan.id, subscription_expires_at: iso(expiresAt) } }
                        );
                        await db.collection("subscriptions").insertOne({
                            user_id: user.id,
                            plan_id: plan.id,
                            status: "active",
                            starts_at: iso(utcNow()),
                            expires_at: iso(expiresAt),
                            payment_id: dodoReferenceId,
                        });
                        console.log(`[payment/dodo] subscription active: plan \${plan.id} → user \${user.id}`);
                    }

                    await db.collection("dodo_processed").insertOne({
                        payment_id: dodoReferenceId,
                        user_id: user.id,
                        type: productDetails.type,
                        created_at: iso(utcNow()),
                    });
                } else {
                    console.warn(`[payment/dodo] No user found for email: \${customerEmail}`);
                }
            }
        }

        if (eventType === "payment.failed") {
            const dodoReferenceId = data.payment_id || data.id;
            console.warn(`[payment/dodo] payment.failed — id: \${dodoReferenceId}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("[payment/dodo] Webhook error:", error);
        res.status(400).send("Webhook processing failed");
    }
});

module.exports = router;
