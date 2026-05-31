"use strict";
const express = require("express");

const { getDb } = require("../config/db");
const { getCurrentUser, requireBusiness } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { mapId, mapIds, toObjectId } = require("../utils/dbHelpers");
const { COMMISSION_RATE, MIN_PAYOUT_USD } = require("../config/env");

const router = express.Router();

router.get("/config", asyncH(async (req, res) => {
    res.json({ min_payout_usd: MIN_PAYOUT_USD, commission_rate: COMMISSION_RATE });
}));

router.post("/request", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const amount = parseInt(req.body?.amount_usd || 0, 10);
    if (!amount || amount <= 0) throw new HttpError(400, "Amount must be positive");
    if (amount < MIN_PAYOUT_USD) throw new HttpError(400, `Minimum payout is $${MIN_PAYOUT_USD.toLocaleString("en-IN")} (~$100). Earn more to cash out.`);

    let earnings = 0;
    for await (const p of db.collection("purchases").find({ creator_id: req.user.id })) {
        earnings += p.amount_usd || 0;
    }
    let locked = 0;
    for await (const po of db.collection("payouts").find({ user_id: req.user.id, status: { $in: ["pending", "processed"] } })) {
        locked += po.amount_usd || 0;
    }
    const available = Math.max(0, earnings - locked);
    if (amount > available) throw new HttpError(400, `Insufficient balance. Available: $${available}`);

    const commission = Math.round(amount * COMMISSION_RATE);
    const net = amount - commission;
    const payout = {
        user_id: req.user.id,
        amount_usd: amount,
        commission_usd: commission,
        net_usd: net,
        status: "pending",
        requested_at: iso(utcNow()),
        processed_at: null,
        MOCKED: true,
    };
    await db.collection("payouts").insertOne({ ...payout });
    res.json(payout);
}));

router.get("/history", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("payouts").find({ user_id: req.user.id }).sort({ requested_at: -1 }).toArray();
    res.json(rows);
}));

module.exports = router;
