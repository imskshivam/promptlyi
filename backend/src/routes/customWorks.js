"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");

const router = express.Router();

router.get("/", asyncH(async (req, res) => {
    const db = getDb();
    const query = {};
    if (req.query.status_f) query.status = req.query.status_f;
    const rows = await db.collection("custom_works").find(query, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    for (const w of rows) {
        w.posted_by = await db.collection("users").findOne(
            { id: w.user_id },
            { projection: { _id: 0, name: 1, picture: 1, id: 1 } },
        );
    }
    res.json(rows);
}));

router.post("/", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const b = req.body || {};
    if (!b.title || !b.description || !b.budget_inr) throw new HttpError(400, "Missing fields");
    const w = {
        id: uuidv4(),
        user_id: req.user.id,
        title: b.title,
        description: b.description,
        budget_inr: parseInt(b.budget_inr, 10) || 0,
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
    const w = await db.collection("custom_works").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!w) throw new HttpError(404, "Work not found");
    if ((w.applicants || []).some((a) => a.user_id === req.user.id)) throw new HttpError(400, "Already applied");
    const applicant = {
        user_id: req.user.id,
        user_name: req.user.name,
        user_picture: req.user.picture,
        message: req.body?.message || "",
        quoted_price_inr: parseInt(req.body?.quoted_price_inr || 0, 10) || 0,
        applied_at: iso(utcNow()),
    };
    await db.collection("custom_works").updateOne({ id: req.params.id }, { $push: { applicants: applicant } });
    res.json({ ok: true, applicant });
}));

router.get("/mine", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("custom_works").find({ user_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    res.json(rows);
}));

module.exports = router;
