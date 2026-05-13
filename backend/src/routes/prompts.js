"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { getCurrentUser, requirePromptUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");

const router = express.Router();

// Categories available for prompts
const CATEGORIES = [
    "image", "video", "code", "marketing", "design",
    "writing", "business", "seo", "chatgpt", "midjourney", "3d", "music",
];

function publicView(prompt, hideContent = true) {
    const out = { ...prompt };
    delete out._id;
    if (hideContent) out.content = null;
    return out;
}

// ─── Credit estimate (kept for reference, not used in pricing now) ────────────
router.post("/credit-estimate", asyncH(async (req, res) => {
    const text = req.body?.text || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const credits = Math.max(1, Math.round(words / 10));
    res.json({ credits, words, tier: words > 200 ? "premium" : "basic", complexity: Math.min(10, Math.round(words / 50)) });
}));

// ─── Categories list ──────────────────────────────────────────────────────────
router.get("/categories", asyncH(async (req, res) => {
    res.json(CATEGORIES);
}));

// ─── List prompts ─────────────────────────────────────────────────────────────
router.get("/prompts", asyncH(async (req, res) => {
    const db = getDb();
    const { q, category, limit } = req.query;
    const query = { published: true };
    if (q) {
        query.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { tags: { $in: [String(q).toLowerCase()] } },
        ];
    }
    if (category && category !== "all") query.category = category;

    const lim = Math.min(parseInt(limit || "50", 10) || 50, 200);
    const rows = await db.collection("prompts").find(query, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(lim).toArray();

    const out = [];
    for (const p of rows) {
        const creator = await db.collection("users").findOne({ id: p.creator_id }, { projection: { _id: 0, name: 1, picture: 1, id: 1 } });
        p.creator = creator;
        out.push(publicView(p, true));
    }
    res.json(out);
}));

// ─── My prompts (prompt user only) ───────────────────────────────────────────
router.get("/prompts/mine", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("prompts").find({ creator_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    res.json(rows);
}));

// ─── Single prompt ────────────────────────────────────────────────────────────
router.get("/prompts/:id", asyncH(async (req, res) => {
    const db = getDb();
    const p = await db.collection("prompts").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!p) throw new HttpError(404, "Prompt not found");
    p.creator = await db.collection("users").findOne(
        { id: p.creator_id },
        { projection: { _id: 0, name: 1, picture: 1, id: 1, bio: 1 } },
    );

    let reveal = false;
    const cookieToken = req.cookies?.session_token;
    const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const token = cookieToken || headerToken;
    if (token) {
        try {
            const jwt = require("jsonwebtoken");
            const { JWT_SECRET } = require("../config/env");
            const payload = jwt.verify(token, JWT_SECRET);
            const me = await db.collection("users").findOne({ id: payload.sub }, { projection: { _id: 0 } });
            if (me) {
                if (me.id === p.creator_id) reveal = true;
                else {
                    const owned = await db.collection("purchases").findOne({ user_id: me.id, prompt_id: p.id });
                    if (owned) reveal = true;
                }
            }
        } catch {}
    }
    res.json(publicView(p, !reveal));
}));

// ─── Create prompt (prompt user only) ────────────────────────────────────────
router.post("/prompts", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const b = req.body || {};
    if (!b.title || !b.description || !b.content || !b.category) throw new HttpError(400, "Missing required fields: title, description, content, category");
    if (!CATEGORIES.includes(b.category)) throw new HttpError(400, `Invalid category. Valid: ${CATEGORIES.join(", ")}`);

    const priceCredits = Math.max(0, parseInt(b.price_credits || 0, 10) || 0);

    const doc = {
        id: uuidv4(),
        creator_id: req.user.id,
        title: b.title,
        description: b.description,
        content: b.content,
        // Preview media
        preview_url: b.preview_url || "",
        media_type: b.media_type === "video" ? "video" : "image",
        // Example outputs (up to 5 image URLs + optional video)
        example_images: Array.isArray(b.example_images)
            ? b.example_images.slice(0, 5).filter(u => typeof u === "string" && u.trim())
            : [],
        example_video_url: b.example_video_url || "",
        // Requirements / what user should provide
        requirements: b.requirements || "",
        // Taxonomy
        category: b.category,
        tags: (b.tags || []).map((t) => String(t).toLowerCase()),
        // Pricing — credits only
        price_credits: priceCredits,
        // Legacy fields kept for backwards-compat
        price_inr: 0,
        is_restricted: priceCredits > 0,
        credits_required: priceCredits,
        requires_user_media: ["none", "image", "video"].includes(b.requires_user_media) ? b.requires_user_media : "none",
        user_media_instructions: b.user_media_instructions || "",
        published: true,
        downloads: 0,
        rating: 4.8,
        views: 0,
        created_at: iso(utcNow()),
    };
    await db.collection("prompts").insertOne({ ...doc });
    res.json(doc);
}));

// ─── Update prompt ────────────────────────────────────────────────────────────
router.put("/prompts/:id", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const p = await db.collection("prompts").findOne({ id: req.params.id });
    if (!p) throw new HttpError(404, "Prompt not found");
    if (p.creator_id !== req.user.id) throw new HttpError(403, "Not your prompt");

    const allowed = [
        "title", "description", "content", "preview_url", "media_type",
        "example_images", "example_video_url", "requirements",
        "category", "tags", "price_credits",
        "requires_user_media", "user_media_instructions",
    ];
    const update = {};
    for (const k of allowed) {
        if (req.body && req.body[k] !== undefined && req.body[k] !== null) update[k] = req.body[k];
    }
    if (update.price_credits !== undefined) {
        update.price_credits = Math.max(0, parseInt(update.price_credits, 10) || 0);
        update.credits_required = update.price_credits;
        update.is_restricted = update.price_credits > 0;
    }
    if (Object.keys(update).length) await db.collection("prompts").updateOne({ id: req.params.id }, { $set: update });
    const updated = await db.collection("prompts").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    res.json(updated);
}));

// ─── Delete prompt ────────────────────────────────────────────────────────────
router.delete("/prompts/:id", getCurrentUser, requirePromptUser, asyncH(async (req, res) => {
    const db = getDb();
    const p = await db.collection("prompts").findOne({ id: req.params.id });
    if (!p || p.creator_id !== req.user.id) throw new HttpError(404, "Prompt not found");
    await db.collection("prompts").deleteOne({ id: req.params.id });
    res.json({ ok: true });
}));

// ─── Purchase a prompt (credits only) ────────────────────────────────────────
router.post("/prompts/purchase", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { prompt_id } = req.body || {};
    if (!prompt_id) throw new HttpError(400, "prompt_id is required");

    const p = await db.collection("prompts").findOne({ id: prompt_id }, { projection: { _id: 0 } });
    if (!p) throw new HttpError(404, "Prompt not found");
    if (p.creator_id === req.user.id) throw new HttpError(400, "Cannot purchase your own prompt");

    // Already owned?
    const owned = await db.collection("purchases").findOne({ user_id: req.user.id, prompt_id });
    if (owned) return res.json({ ok: true, already_owned: true, content: p.content });

    const cost = p.price_credits || 0;

    // Free prompt
    if (cost === 0) {
        const purchase = {
            id: uuidv4(), user_id: req.user.id, prompt_id, creator_id: p.creator_id,
            method: "free", amount_inr: 0, credits_used: 0, created_at: iso(utcNow()),
        };
        await db.collection("purchases").insertOne({ ...purchase });
        await db.collection("prompts").updateOne({ id: prompt_id }, { $inc: { downloads: 1 } });
        return res.json({ ok: true, purchase, content: p.content });
    }

    // Credits purchase
    const userCredits = req.user.credits || 0;
    if (userCredits < cost) {
        throw new HttpError(402, `Insufficient credits. You have ${userCredits}, need ${cost}.`);
    }

    await db.collection("users").updateOne({ id: req.user.id }, { $inc: { credits: -cost } });
    await db.collection("credit_transactions").insertOne({
        id: uuidv4(), user_id: req.user.id, amount: -cost,
        type: "spend", ref: p.id, prompt_title: p.title, created_at: iso(utcNow()),
    });
    const purchase = {
        id: uuidv4(), user_id: req.user.id, prompt_id, creator_id: p.creator_id,
        method: "credits", amount_inr: 0, credits_used: cost, created_at: iso(utcNow()),
    };
    await db.collection("purchases").insertOne({ ...purchase });
    await db.collection("prompts").updateOne({ id: prompt_id }, { $inc: { downloads: 1 } });

    return res.json({ ok: true, purchase, content: p.content });
}));

// ─── Purchase history (client) ────────────────────────────────────────────────
router.get("/purchases", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("purchases").find({ user_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    for (const r of rows) {
        r.prompt = await db.collection("prompts").findOne(
            { id: r.prompt_id },
            { projection: { _id: 0, title: 1, preview_url: 1, category: 1, id: 1, price_credits: 1 } },
        );
    }
    res.json(rows);
}));

module.exports = router;
