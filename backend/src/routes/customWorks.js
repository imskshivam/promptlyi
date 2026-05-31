"use strict";
const express = require("express");

const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { mapId, mapIds, toObjectId } = require("../utils/dbHelpers");

const router = express.Router();

router.get("/", asyncH(async (req, res) => {
    const db = getDb();
    const query = {};
    if (req.query.status_f) query.status = req.query.status_f;
    const rows = await db.collection("custom_works").find(query).sort({ created_at: -1 }).toArray();
    for (const w of rows) {
        w.posted_by = await db.collection("users").findOne(
            { id: w.user_id },
        );
    }
    res.json(rows);
}));

router.post("/", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const b = req.body || {};
    if (!b.title || !b.description || !b.budget_usd) throw new HttpError(400, "Missing fields");
    const w = {
        user_id: req.user.id,
        title: b.title,
        description: b.description,
        budget_usd: parseInt(b.budget_usd, 10) || 0,
        deadline_days: parseInt(b.deadline_days || 7, 10) || 7,
        category: b.category || "general",
        status: "open",
        applicants: [],
        created_at: iso(utcNow()),
    };
    await db.collection("custom_works").insertOne({ ...w });
    res.json(w);
}));

router.post("/:id/apply", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const w = await db.collection("custom_works").findOne({ _id: toObjectId(req.params.id) });
    if (!w) throw new HttpError(404, "Work not found");
    if ((w.applicants || []).some((a) => a.user_id === req.user.id)) throw new HttpError(400, "Already applied");
    const applicant = {
        user_id: req.user.id,
        user_name: req.user.name,
        user_picture: req.user.picture,
        message: req.body?.message || "",
        quoted_price_usd: parseInt(req.body?.quoted_price_usd || 0, 10) || 0,
        applied_at: iso(utcNow()),
    };
    await db.collection("custom_works").updateOne({ _id: toObjectId(req.params.id) }, { $push: { applicants: applicant } });
    res.json({ ok: true, applicant });
}));

router.get("/mine", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("custom_works").find({ user_id: req.user.id }).sort({ created_at: -1 }).toArray();
    res.json(rows);
}));

module.exports = router;
