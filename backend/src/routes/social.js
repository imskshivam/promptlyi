"use strict";
const express = require("express");
const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { mapId, mapIds, toObjectId } = require("../utils/dbHelpers");

const router = express.Router();

// ─── Toggle Like ─────────────────────────────────────────────────────────────
router.post("/like/:promptId", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { promptId } = req.params;

    const existing = await db.collection("likes").findOne({
        user_id: req.user.id,
        prompt_id: promptId,
    });

    if (existing) {
        await db.collection("likes").deleteOne({ _id: existing._id });
        const count = await db.collection("likes").countDocuments({ prompt_id: promptId });
        await db.collection("prompts").updateOne({ id: promptId }, { $set: { likes_count: count } });
        return res.json({ liked: false, count });
    }

    await db.collection("likes").insertOne({
        user_id: req.user.id,
        prompt_id: promptId,
        created_at: iso(utcNow()),
    });
    const count = await db.collection("likes").countDocuments({ prompt_id: promptId });
    await db.collection("prompts").updateOne({ id: promptId }, { $set: { likes_count: count } });
    res.json({ liked: true, count });
}));

// ─── Get Likes (count + current user status) ─────────────────────────────────
router.get("/likes/:promptId", asyncH(async (req, res) => {
    const db = getDb();
    const { promptId } = req.params;

    const count = await db.collection("likes").countDocuments({ prompt_id: promptId });

    let liked = false;
    // Check cookie/header token optionally
    const cookieToken = req.cookies?.session_token;
    const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const token = cookieToken || headerToken;
    if (token) {
        try {
            const jwt = require("jsonwebtoken");
            const { JWT_SECRET } = require("../config/env");
            const payload = jwt.verify(token, JWT_SECRET);
            const existing = await db.collection("likes").findOne({
                user_id: payload.sub,
                prompt_id: promptId,
            });
            liked = !!existing;
        } catch {}
    }

    res.json({ count, liked });
}));

// ─── Post Comment ─────────────────────────────────────────────────────────────
router.post("/comment/:promptId", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { promptId } = req.params;
    const text = (req.body?.text || "").trim();
    if (!text || text.length > 1000) throw new HttpError(400, "Comment text must be 1–1000 characters");

    const prompt = await db.collection("prompts").findOne({ id: promptId });
    if (!prompt) throw new HttpError(404, "Prompt not found");

    const comment = {
        user_id: req.user.id,
        prompt_id: promptId,
        text,
        author_name: req.user.name || "Anonymous",
        author_picture: req.user.picture || "",
        created_at: iso(utcNow()),
    };
    await db.collection("comments").insertOne({ ...comment });

    // Update denormalized count on the prompt
    const count = await db.collection("comments").countDocuments({ prompt_id: promptId });
    await db.collection("prompts").updateOne({ id: promptId }, { $set: { comments_count: count } });

    delete comment._id;
    res.json(comment);
}));

// ─── Get Comments ─────────────────────────────────────────────────────────────
router.get("/comments/:promptId", asyncH(async (req, res) => {
    const db = getDb();
    const { promptId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "50", 10) || 50, 100);
    const skip = parseInt(req.query.skip || "0", 10) || 0;

    const comments = await db.collection("comments")
        .find({ prompt_id: promptId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

    const total = await db.collection("comments").countDocuments({ prompt_id: promptId });
    res.json({ comments, total });
}));

// ─── Toggle Follow ─────────────────────────────────────────────────────────────
router.post("/follow/:userId", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { userId } = req.params;

    if (userId === req.user.id) throw new HttpError(400, "Cannot follow yourself");

    const target = await db.collection("users").findOne({ id: userId });
    if (!target) throw new HttpError(404, "User not found");

    const existing = await db.collection("follows").findOne({
        follower_id: req.user.id,
        following_id: userId,
    });

    if (existing) {
        await db.collection("follows").deleteOne({ _id: existing._id });
        const followers_count = await db.collection("follows").countDocuments({ following_id: userId });
        return res.json({ following: false, followers_count });
    }

    await db.collection("follows").insertOne({
        follower_id: req.user.id,
        following_id: userId,
        created_at: iso(utcNow()),
    });
    const followers_count = await db.collection("follows").countDocuments({ following_id: userId });
    res.json({ following: true, followers_count });
}));

// ─── Follow Status ─────────────────────────────────────────────────────────────
router.get("/follow-status/:userId", asyncH(async (req, res) => {
    const db = getDb();
    const { userId } = req.params;

    const followers_count = await db.collection("follows").countDocuments({ following_id: userId });
    const following_count = await db.collection("follows").countDocuments({ follower_id: userId });

    let following = false;
    const cookieToken = req.cookies?.session_token;
    const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const token = cookieToken || headerToken;
    if (token) {
        try {
            const jwt = require("jsonwebtoken");
            const { JWT_SECRET } = require("../config/env");
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.sub !== userId) {
                const existing = await db.collection("follows").findOne({
                    follower_id: payload.sub,
                    following_id: userId,
                });
                following = !!existing;
            }
        } catch {}
    }

    res.json({ followers_count, following_count, following });
}));

// ─── Monthly Leaderboard ──────────────────────────────────────────────────────
router.get("/leaderboard/monthly", asyncH(async (req, res) => {
    const db = getDb();

    // Start of current month UTC
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    // Count likes per prompt since start of month
    const likeAgg = await db.collection("likes").aggregate([
        { $match: { created_at: { $gte: monthStart } } },
        { $group: { _id: "$prompt_id", monthly_likes: { $sum: 1 } } },
        { $sort: { monthly_likes: -1 } },
        { $limit: 10 },
    ]).toArray();

    const results = [];
    for (const entry of likeAgg) {
        const prompt = await db.collection("prompts").findOne(
            { id: entry._id, published: true },
        );
        if (!prompt) continue;
        const creator = await db.collection("users").findOne(
            { id: prompt.creator_id },
        );
        const total_likes = await db.collection("likes").countDocuments({ prompt_id: entry._id });
        results.push({
            rank: results.length + 1,
            prompt: { ...prompt, creator },
            monthly_likes: entry.monthly_likes,
            total_likes,
        });
    }

    // If there aren't enough monthly likes, pad with most-liked prompts overall
    if (results.length < 10) {
        const existingIds = results.map(r => r.prompt.id);
        const fallback = await db.collection("prompts")
            .find({ published: true, id: { $nin: existingIds } })
            .sort({ likes_count: -1, downloads: -1 })
            .limit(10 - results.length)
            .toArray();

        for (const prompt of fallback) {
            const creator = await db.collection("users").findOne(
                { id: prompt.creator_id },
            );
            const total_likes = prompt.likes_count || 0;
            results.push({
                rank: results.length + 1,
                prompt: { ...prompt, creator },
                monthly_likes: 0,
                total_likes,
            });
        }
    }

    res.json({
        month: `${now.toLocaleString("default", { month: "long" })} ${now.getUTCFullYear()}`,
        results,
    });
}));

module.exports = router;
