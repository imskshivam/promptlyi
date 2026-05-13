"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { paymentSucceeded, subscriptionSucceeded } = require("../services/dodoService");
const { CREDIT_PACKS } = require("./credits");
const { PLANS } = require("./subscriptions");

const router = express.Router();

router.post("/confirm", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { payment_id, subscription_id } = req.body || {};
    const pid = payment_id || subscription_id;
    if (!pid) throw new HttpError(400, "payment_id or subscription_id required");

    const existing = await db.collection("dodo_processed").findOne({ payment_id: pid }, { projection: { _id: 0 } });
    if (existing) return res.json({ ok: true, already_processed: true, kind: existing.kind });

    let info = await paymentSucceeded(pid);
    if (!info && subscription_id) info = await subscriptionSucceeded(subscription_id);
    if (!info) throw new HttpError(402, "Payment not confirmed");

    const md = info.metadata || {};
    if (md.user_id && md.user_id !== req.user.id) throw new HttpError(403, "Payment belongs to another user");

    const kind = md.kind;
    const result = { kind };

    if (kind === "credit_pack") {
        const pack = CREDIT_PACKS[md.pack_id];
        if (pack) {
            await db.collection("users").updateOne({ id: req.user.id }, { $inc: { credits: pack.credits } });
            await db.collection("credit_transactions").insertOne({
                id: uuidv4(), user_id: req.user.id, amount: pack.credits, type: "purchase",
                pack_id: pack.id, price_usd: pack.price_usd, payment_id: pid, created_at: iso(utcNow()),
            });
            result.credits_added = pack.credits;
        }
    } else if (kind === "subscription") {
        const plan = PLANS[md.plan_id];
        if (plan) {
            const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
            await db.collection("users").updateOne(
                { id: req.user.id },
                { $set: { subscription_plan: plan.id, subscription_expires_at: iso(expiresAt) } },
            );
            await db.collection("subscriptions").insertOne({
                id: uuidv4(), user_id: req.user.id, plan_id: plan.id, status: "active",
                starts_at: iso(utcNow()), expires_at: iso(expiresAt), price_usd: plan.price_usd, payment_id: pid,
            });
            result.plan_id = plan.id;
        }
    } else if (kind === "prompt") {
        const prm = await db.collection("prompts").findOne({ id: md.prompt_id }, { projection: { _id: 0 } });
        if (prm) {
            const owned = await db.collection("purchases").findOne({ user_id: req.user.id, prompt_id: md.prompt_id });
            if (!owned) {
                await db.collection("purchases").insertOne({
                    id: uuidv4(), user_id: req.user.id, prompt_id: md.prompt_id,
                    creator_id: prm.creator_id, method: "money", amount_usd: prm.price_usd,
                    credits_used: 0, payment_id: pid, created_at: iso(utcNow()),
                });
                await db.collection("prompts").updateOne({ id: md.prompt_id }, { $inc: { downloads: 1 } });
            }
            result.prompt_id = md.prompt_id;
            result.content = prm.content;
        }
    }

    await db.collection("dodo_processed").insertOne({
        payment_id: pid, user_id: req.user.id, kind,
        metadata: md, created_at: iso(utcNow()),
    });
    res.json({ ok: true, ...result });
}));

module.exports = router;
