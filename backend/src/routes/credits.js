"use strict";
const express = require("express");
const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { getDodoClient } = require("../config/dodo");
const { DODO_PRODUCTS, FRONTEND_ORIGIN } = require("../config/env");

const router = express.Router();

const CREDIT_PACKS = {
    starter: { id: "starter", credits: 100,  price_usd: 3,  label: "Starter Pack", product_key: "pack_starter" },
    pro:     { id: "pro",     credits: 500,  price_usd: 10,  label: "Pro Pack",     product_key: "pack_pro" },
    max:     { id: "max",     credits: 1500, price_usd: 25, label: "Max Pack",     product_key: "pack_max" },
};

router.get("/packs", asyncH(async (req, res) => {
    const out = Object.values(CREDIT_PACKS).map(({ product_key, ...rest }) => rest);
    res.json(out);
}));

router.post("/buy", getCurrentUser, asyncH(async (req, res) => {
    const pack = CREDIT_PACKS[req.body?.pack_id];
    if (!pack) throw new HttpError(404, "Pack not found");
    const dodo = getDodoClient();
    if (!dodo) throw new HttpError(500, "Payment provider not configured");
    const productId = DODO_PRODUCTS[pack.product_key];
    if (!productId) throw new HttpError(500, "Product ID missing");

    const sess = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: req.user.email, name: req.user.name },
        return_url: `${FRONTEND_ORIGIN}/payments/success`,
    });
    res.json({ ok: true, redirect: true, checkout_url: sess.checkout_url, session_id: sess.session_id });
}));

router.get("/history", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("credit_transactions").find({ user_id: req.user.id }).sort({ created_at: -1 }).toArray();
    res.json(rows);
}));

module.exports = { router, CREDIT_PACKS };
