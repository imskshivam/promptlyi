"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { getCurrentUser, requireBusiness } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { estimateCredits } = require("../services/creditEngine");
const { createCheckout, DODO_PRODUCTS } = require("../services/dodoService");

const router = express.Router();

function publicView(prompt, hideContent = true) {
    const out = { ...prompt };
    delete out._id;
    if (hideContent) out.content = null;
    return out;
}

router.post("/credit-estimate", asyncH(async (req, res) => {
    res.json(estimateCredits(req.body?.text || ""));
}));

// list
router.get("/prompts", asyncH(async (req, res) => {
    const db = getDb();
    const { q, category, media_type, only_free, limit } = req.query;
    const query = { published: true };
    if (q) {
        query.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { tags: { $in: [String(q).toLowerCase()] } },
        ];
    }
    if (category) query.category = category;
    if (media_type) query.media_type = media_type;
    if (only_free === "true") query.price_inr = 0;

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

router.get("/prompts/mine", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("prompts").find({ creator_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    res.json(rows);
}));

router.get("/prompts/:id", asyncH(async (req, res) => {
    const db = getDb();
    const p = await db.collection("prompts").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!p) throw new HttpError(404, "Prompt not found");
    p.creator = await db.collection("users").findOne(
        { id: p.creator_id },
        { projection: { _id: 0, name: 1, picture: 1, id: 1, bio: 1 } },
    );

    let reveal = false;
    const token = req.cookies?.session_token;
    if (token) {
        const sess = await db.collection("sessions").findOne({ session_token: token });
        if (sess) {
            if (sess.user_id === p.creator_id) reveal = true;
            else {
                const owned = await db.collection("purchases").findOne({ user_id: sess.user_id, prompt_id: p.id });
                if (owned) reveal = true;
            }
        }
    }
    res.json(publicView(p, !reveal));
}));

router.post("/prompts", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const b = req.body || {};
    if (!b.title || !b.description || !b.content || !b.category) throw new HttpError(400, "Missing required fields");
    const est = estimateCredits(b.content);
    const doc = {
        id: uuidv4(),
        creator_id: req.user.id,
        title: b.title,
        description: b.description,
        content: b.content,
        preview_url: b.preview_url || "",
        media_type: b.media_type === "video" ? "video" : "image",
        category: b.category,
        tags: (b.tags || []).map((t) => String(t).toLowerCase()),
        price_inr: parseInt(b.price_inr || 0, 10) || 0,
        credits_required: est.credits,
        is_restricted: !!b.is_restricted,
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

router.put("/prompts/:id", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const p = await db.collection("prompts").findOne({ id: req.params.id });
    if (!p) throw new HttpError(404, "Prompt not found");
    if (p.creator_id !== req.user.id) throw new HttpError(403, "Not your prompt");
    const allowed = ["title", "description", "content", "preview_url", "media_type", "category", "tags", "price_inr", "is_restricted", "requires_user_media", "user_media_instructions"];
    const update = {};
    for (const k of allowed) if (req.body && req.body[k] !== undefined && req.body[k] !== null) update[k] = req.body[k];
    if (update.content) update.credits_required = estimateCredits(update.content).credits;
    if (Object.keys(update).length) await db.collection("prompts").updateOne({ id: req.params.id }, { $set: update });
    const updated = await db.collection("prompts").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    res.json(updated);
}));

router.delete("/prompts/:id", getCurrentUser, requireBusiness, asyncH(async (req, res) => {
    const db = getDb();
    const p = await db.collection("prompts").findOne({ id: req.params.id });
    if (!p || p.creator_id !== req.user.id) throw new HttpError(404, "Prompt not found");
    await db.collection("prompts").deleteOne({ id: req.params.id });
    res.json({ ok: true });
}));

// Purchase: credits flow internal, money flow → Dodo checkout redirect
router.post("/prompts/purchase", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { prompt_id, method } = req.body || {};
    if (!prompt_id || !["credits", "money"].includes(method)) throw new HttpError(400, "Bad request");
    const p = await db.collection("prompts").findOne({ id: prompt_id }, { projection: { _id: 0 } });
    if (!p) throw new HttpError(404, "Prompt not found");
    if (p.creator_id === req.user.id) throw new HttpError(400, "Cannot purchase your own prompt");

    const owned = await db.collection("purchases").findOne({ user_id: req.user.id, prompt_id });
    if (owned) return res.json({ ok: true, already_owned: true, content: p.content });

    if (method === "credits") {
        if (!p.is_restricted) throw new HttpError(400, "This prompt is not restricted; use 'money' to buy.");
        const cost = p.credits_required;
        if ((req.user.credits || 0) < cost) throw new HttpError(402, "Insufficient credits");
        await db.collection("users").updateOne({ id: req.user.id }, { $inc: { credits: -cost } });
        await db.collection("credit_transactions").insertOne({
            id: uuidv4(), user_id: req.user.id, amount: -cost,
            type: "spend", ref: p.id, created_at: iso(utcNow()),
        });
        const purchase = {
            id: uuidv4(), user_id: req.user.id, prompt_id, creator_id: p.creator_id,
            method: "credits", amount_inr: 0, credits_used: cost, created_at: iso(utcNow()),
        };
        await db.collection("purchases").insertOne({ ...purchase });
        await db.collection("prompts").updateOne({ id: prompt_id }, { $inc: { downloads: 1 } });
        return res.json({ ok: true, purchase, content: p.content });
    }

    // money flow
    if (p.is_restricted) throw new HttpError(400, "This prompt is restricted; credits required.");
    if ((p.price_inr || 0) <= 0) {
        const purchase = {
            id: uuidv4(), user_id: req.user.id, prompt_id, creator_id: p.creator_id,
            method: "money", amount_inr: 0, credits_used: 0, created_at: iso(utcNow()),
        };
        await db.collection("purchases").insertOne({ ...purchase });
        await db.collection("prompts").updateOne({ id: prompt_id }, { $inc: { downloads: 1 } });
        return res.json({ ok: true, purchase, content: p.content });
    }

    const sess = await createCheckout({
        productId: DODO_PRODUCTS.prompt,
        customer: { email: req.user.email, name: req.user.name },
        returnPath: "/payments/success",
        metadata: {
            kind: "prompt", user_id: req.user.id, prompt_id: p.id,
            creator_id: p.creator_id, amount_inr: String(p.price_inr),
        },
    });
    res.json({ ok: true, redirect: true, checkout_url: sess.checkout_url, session_id: sess.session_id });
}));

router.get("/purchases", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("purchases").find({ user_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    for (const r of rows) {
        r.prompt = await db.collection("prompts").findOne(
            { id: r.prompt_id },
            { projection: { _id: 0, title: 1, preview_url: 1, category: 1, id: 1 } },
        );
    }
    res.json(rows);
}));

module.exports = router;
