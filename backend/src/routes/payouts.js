"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { getCurrentUser, requireBusiness } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { COMMISSION_RATE, MIN_PAYOUT_INR } = require("../config/env");

const router = express.Router();

router.get("/config", asyncH(async (req, res) => {
    res.json({ min_payout_inr: MIN_PAYOUT_INR, commission_rate: COMMISSION_RATE });
}));

router.post("/request", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const amount = parseInt(req.body?.amount_inr || 0, 10);
    if (!amount || amount <= 0) throw new HttpError(400, "Amount must be positive");
    if (amount < MIN_PAYOUT_INR) throw new HttpError(400, `Minimum payout is ₹${MIN_PAYOUT_INR.toLocaleString("en-IN")} (~$100). Earn more to cash out.`);

    let earnings = 0;
    for await (const p of db.collection("purchases").find({ creator_id: req.user.id }, { projection: { _id: 0, amount_inr: 1 } })) {
        earnings += p.amount_inr || 0;
    }
    let locked = 0;
    for await (const po of db.collection("payouts").find({ user_id: req.user.id, status: { $in: ["pending", "processed"] } }, { projection: { _id: 0, amount_inr: 1 } })) {
        locked += po.amount_inr || 0;
    }
    const available = Math.max(0, earnings - locked);
    if (amount > available) throw new HttpError(400, `Insufficient balance. Available: ₹${available}`);

    const commission = Math.round(amount * COMMISSION_RATE);
    const net = amount - commission;
    const payout = {
        id: uuidv4(),
        user_id: req.user.id,
        amount_inr: amount,
        commission_inr: commission,
        net_inr: net,
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
    const rows = await db.collection("payouts").find({ user_id: req.user.id }, { projection: { _id: 0 } }).sort({ requested_at: -1 }).toArray();
    res.json(rows);
}));

module.exports = router;
