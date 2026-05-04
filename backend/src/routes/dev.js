"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { asyncH } = require("../middleware/errorHandler");
const { iso, utcNow } = require("../utils/time");
const { estimateCredits } = require("../services/creditEngine");

const router = express.Router();

const SAMPLES = [
    {
        title: "Cinematic Cyberpunk Cityscape",
        description: "Ultra-detailed midjourney prompt to render a neon Tokyo-style skyline at dusk.",
        content: "cinematic cyberpunk tokyo at dusk, wet pavement, neon reflections, anamorphic lens, 8k, hyper realistic --ar 16:9 --v 6",
        preview_url: "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
        media_type: "image", category: "image", tags: ["midjourney", "cyberpunk", "art"],
        price_inr: 149, is_restricted: false, requires_user_media: "none",
    },
    {
        title: "SaaS Landing Page Copy Generator",
        description: "Write conversion-optimised hero + feature copy for any SaaS in seconds.",
        content: "Act as a senior SaaS copywriter. Given a product description, produce a hero headline (max 9 words), sub-headline, three feature blurbs and a CTA...",
        preview_url: "https://images.unsplash.com/photo-1605106702842-01a887a31122?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
        media_type: "image", category: "marketing", tags: ["copywriting", "saas"],
        price_inr: 0, is_restricted: true, requires_user_media: "none",
    },
    {
        title: "Abstract 3D Product Renders",
        description: "Generate a cohesive set of abstract 3D product visuals in your brand colors. Bring your own product photo.",
        content: "abstract 3d render of product in image, brand color {{COLOR}}, soft studio lighting, shallow depth of field, clay material, octane render --ar 1:1",
        preview_url: "https://images.unsplash.com/photo-1776981986367-09705e5c6872?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
        media_type: "image", category: "design", tags: ["3d", "render", "branding"],
        price_inr: 249, is_restricted: false, requires_user_media: "image",
        user_media_instructions: "Upload a transparent PNG of your product. Best on neutral backgrounds.",
    },
    {
        title: "Full-Stack MVP Blueprint Prompt",
        description: "Produce a production-ready architecture + code skeleton for any SaaS MVP.",
        content: "You are a principal engineer. Given {{IDEA}}, produce: 1) domain model 2) REST endpoints 3) react component tree 4) deployment plan. Be detailed, step-by-step, output JSON.",
        preview_url: "https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
        media_type: "image", category: "code", tags: ["architecture", "saas", "engineering"],
        price_inr: 0, is_restricted: true, requires_user_media: "none",
    },
];

router.post("/seed", asyncH(async (req, res) => {
    const db = getDb();
    // backfill missing fields
    await db.collection("prompts").updateMany(
        { requires_user_media: { $exists: false } },
        { $set: { requires_user_media: "none", user_media_instructions: "" } },
    );

    let demo = await db.collection("users").findOne({ email: "demo-creator@promptbazaar.dev" }, { projection: { _id: 0 } });
    if (!demo) {
        demo = {
            id: uuidv4(),
            email: "demo-creator@promptbazaar.dev",
            name: "Arjun Verma",
            picture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
            role: "business",
            credits: 0,
            subscription_plan: "pro",
            bio: "Full-stack prompt engineer. Specializing in midjourney, coding & marketing prompts.",
            created_at: iso(utcNow()),
        };
        await db.collection("users").insertOne({ ...demo });
    }

    const count = await db.collection("prompts").countDocuments({ creator_id: demo.id });
    if (count === 0) {
        for (const s of SAMPLES) {
            const est = estimateCredits(s.content);
            await db.collection("prompts").insertOne({
                id: uuidv4(),
                creator_id: demo.id,
                published: true,
                downloads: 12,
                rating: 4.9,
                views: 120,
                credits_required: est.credits,
                created_at: iso(utcNow()),
                user_media_instructions: s.user_media_instructions || "",
                ...s,
            });
        }
    }

    if ((await db.collection("custom_works").countDocuments({})) === 0) {
        await db.collection("custom_works").insertOne({
            id: uuidv4(), user_id: demo.id,
            title: "Build full-stack prompt workflow automation",
            description: "Need a prompt engineer to design a multi-step chain for my SaaS onboarding emails.",
            budget_inr: 15000, deadline_days: 14, category: "engineering",
            status: "open", applicants: [], created_at: iso(utcNow()),
        });
    }
    res.json({ ok: true });
}));

module.exports = router;
