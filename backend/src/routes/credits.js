"use strict";
const express = require("express");
const { getDb } = require("../config/db");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { createCheckout, DODO_PRODUCTS } = require("../services/dodoService");

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
    const sess = await createCheckout({
        productId: DODO_PRODUCTS[pack.product_key],
        customer: { email: req.user.email, name: req.user.name },
        returnPath: "/payments/success",
        metadata: {
            kind: "credit_pack", user_id: req.user.id, pack_id: pack.id,
            credits: String(pack.credits), amount_usd: String(pack.price_usd),
        },
    });
    res.json({ ok: true, redirect: true, checkout_url: sess.checkout_url, session_id: sess.session_id });
}));

router.get("/history", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const rows = await db.collection("credit_transactions").find({ user_id: req.user.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    res.json(rows);
}));

module.exports = { router, CREDIT_PACKS };
