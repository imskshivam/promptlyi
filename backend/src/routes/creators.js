"use strict";
const express = require("express");
const { getDb } = require("../config/db");
const { asyncH, HttpError } = require("../middleware/errorHandler");

const router = express.Router();

// trending FIRST so /:id doesn't shadow it
router.get("/trending", asyncH(async (req, res) => {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || "6", 10) || 6, 20);
    const rows = await db.collection("prompts").aggregate([
        { $group: { _id: "$creator_id", total_downloads: { $sum: "$downloads" }, prompts_count: { $sum: 1 } } },
        { $sort: { total_downloads: -1, prompts_count: -1 } },
        { $limit: limit },
    ]).toArray();
    const out = [];
    for (const r of rows) {
        const u = await db.collection("users").findOne(
            { id: r._id },
            { projection: { _id: 0, name: 1, picture: 1, id: 1, bio: 1 } },
        );
        if (!u) continue;
        out.push({ creator: u, total_downloads: r.total_downloads || 0, prompts_count: r.prompts_count || 0 });
    }
    res.json(out);
}));

router.get("/:id", asyncH(async (req, res) => {
    const db = getDb();
    const u = await db.collection("users").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!u) throw new HttpError(404, "Creator not found");
    const prompts = await db.collection("prompts").find({ creator_id: req.params.id, published: true }, { projection: { _id: 0 } }).toArray();
    const total_downloads = prompts.reduce((s, p) => s + (p.downloads || 0), 0);
    const publicPrompts = prompts.map((p) => ({ ...p, content: null }));
    res.json({
        creator: { id: u.id, name: u.name, picture: u.picture, bio: u.bio || "", created_at: u.created_at },
        prompts: publicPrompts,
        stats: { prompts_count: prompts.length, total_downloads },
    });
}));

module.exports = router;
