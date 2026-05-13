"use strict";
const express = require("express");
const { getDb } = require("../config/db");
const { getCurrentUser, requirePromptUser } = require("../middleware/auth");
const { asyncH } = require("../middleware/errorHandler");
const { iso, utcNow, ymd, yearMonth, yearWeek } = require("../utils/time");
const { MIN_PAYOUT_USD } = require("../config/env");

const router = express.Router();

router.get("/creator-stats", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const userId = req.user.id;
    const promptsCount = await db.collection("prompts").countDocuments({ creator_id: userId });
    let totalDownloads = 0;
    for await (const p of db.collection("prompts").find({ creator_id: userId }, { projection: { _id: 0, downloads: 1 } })) {
        totalDownloads += p.downloads || 0;
    }
    let earnings = 0, earningsThisMonth = 0;
    const monthStart = new Date(Date.UTC(utcNow().getUTCFullYear(), utcNow().getUTCMonth(), 1));
    for await (const p of db.collection("purchases").find({ creator_id: userId }, { projection: { _id: 0, amount_usd: 1, created_at: 1 } })) {
        const amt = p.amount_usd || 0;
        earnings += amt;
        const ts = new Date(p.created_at);
        if (!isNaN(ts.getTime()) && ts >= monthStart) earningsThisMonth += amt;
    }
    let paidOut = 0;
    for await (const po of db.collection("payouts").find({ user_id: userId, status: { $in: ["pending", "processed"] } }, { projection: { _id: 0, amount_usd: 1 } })) {
        paidOut += po.amount_usd || 0;
    }
    const available = Math.max(0, earnings - paidOut);
    res.json({
        prompts_count: promptsCount,
        total_downloads: totalDownloads,
        earnings_usd: earnings,
        earnings_this_month_usd: earningsThisMonth,
        paid_out_usd: paidOut,
        available_balance_usd: available,
        min_payout_usd: MIN_PAYOUT_USD,
        payout_eligible: available >= MIN_PAYOUT_USD,
        payout_progress_pct: MIN_PAYOUT_USD ? Math.min(100, Math.round((available * 100) / MIN_PAYOUT_USD)) : 100,
        subscription_plan: req.user.subscription_plan || null,
    });
}));

router.get("/creator-revenue", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const interval = ["daily", "weekly", "monthly"].includes(req.query.interval) ? req.query.interval : "monthly";
    const now = utcNow();

    let buckets, keyOf, start;
    if (interval === "daily") {
        start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        buckets = Array.from({ length: 30 }, (_, i) => ymd(new Date(now.getTime() - (29 - i) * 24 * 3600 * 1000)));
        keyOf = ymd;
    } else if (interval === "weekly") {
        start = new Date(now.getTime() - 12 * 7 * 24 * 3600 * 1000);
        buckets = Array.from({ length: 12 }, (_, i) => yearWeek(new Date(now.getTime() - (11 - i) * 7 * 24 * 3600 * 1000)));
        keyOf = yearWeek;
    } else {
        start = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
        buckets = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
            buckets.push(yearMonth(d));
        }
        keyOf = yearMonth;
    }

    const series = {};
    for (const b of buckets) series[b] = { label: b, revenue: 0, sales: 0, credits: 0 };

    const cursor = db.collection("purchases").find(
        { creator_id: req.user.id, created_at: { $gte: iso(start) } },
        { projection: { _id: 0 } },
    );
    for await (const p of cursor) {
        const ts = new Date(p.created_at);
        if (isNaN(ts.getTime())) continue;
        const key = keyOf(ts);
        if (series[key]) {
            series[key].revenue += p.amount_usd || 0;
            series[key].sales += 1;
            series[key].credits += p.credits_used || 0;
        }
    }
    res.json({ interval, series: Object.values(series) });
}));

router.get("/creator-sales", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const sales = await db.collection("purchases").find({ creator_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(200).toArray();
    for (const s of sales) {
        s.prompt = await db.collection("prompts").findOne(
            { id: s.prompt_id },
            { projection: { _id: 0, title: 1, preview_url: 1, id: 1 } },
        );
        s.buyer = await db.collection("users").findOne(
            { id: s.user_id },
            { projection: { _id: 0, name: 1, picture: 1, id: 1 } },
        );
    }
    res.json(sales);
}));

module.exports = router;
