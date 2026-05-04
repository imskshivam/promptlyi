"use strict";
const express = require("express");
const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { createCheckout, DODO_PRODUCTS } = require("../services/dodoService");

const router = express.Router();

const PLANS = {
    basic: { id: "basic", name: "Creator Basic", price_inr: 199, features: ["List up to 10 prompts", "Basic analytics", "Standard payouts"], product_key: "sub_basic" },
    pro:   { id: "pro",   name: "Creator Pro",   price_inr: 499, features: ["Unlimited prompts", "Restricted prompts (credits)", "Advanced analytics", "Priority support"], product_key: "sub_pro" },
    elite: { id: "elite", name: "Creator Elite", price_inr: 899, features: ["Everything in Pro", "Featured on homepage", "Custom storefront", "API access", "1:1 onboarding"], product_key: "sub_elite" },
};

router.get("/plans", asyncH(async (req, res) => {
    const out = Object.values(PLANS).map(({ product_key, ...rest }) => rest);
    res.json(out);
}));

router.post("/subscribe", getCurrentUser, asyncH(async (req, res) => {
    const plan = PLANS[req.body?.plan_id];
    if (!plan) throw new HttpError(404, "Plan not found");
    const sess = await createCheckout({
        productId: DODO_PRODUCTS[plan.product_key],
        customer: { email: req.user.email, name: req.user.name },
        returnPath: "/payments/success",
        metadata: {
            kind: "subscription", user_id: req.user.id, plan_id: plan.id,
            amount_inr: String(plan.price_inr),
        },
    });
    res.json({ ok: true, redirect: true, checkout_url: sess.checkout_url, session_id: sess.session_id });
}));

router.get("/mine", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const sub = await db.collection("subscriptions").findOne(
        { user_id: req.user.id, status: "active" },
        { projection: { _id: 0 }, sort: { starts_at: -1 } },
    );
    res.json(sub || {});
}));

module.exports = { router, PLANS };
