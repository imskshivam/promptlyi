"use strict";
const { polarClient } = require("../config/polar");
const { POLAR_PRODUCTS, FRONTEND_ORIGIN } = require("../config/env");

function ensureClient() {
    if (!polarClient) {
        const err = new Error("Polar Payments is not configured. Set POLAR_ACCESS_TOKEN.");
        err.status = 503;
        throw err;
    }
}

async function createCheckout({ productId, customer, returnPath, metadata, quantity = 1 }) {
    ensureClient();
    if (!productId) {
        const err = new Error("Product ID not configured. Please add the matching POLAR_PROD_* env var.");
        err.status = 503;
        throw err;
    }
    const returnUrl = `${FRONTEND_ORIGIN}${returnPath}`;
    try {
        const checkout = await polarClient.checkouts.create({
            productId,
            customerEmail: customer.email,
            customerName: customer.name || customer.email,
            successUrl: returnUrl,
            metadata,
        });
        return {
            session_id: checkout.id,
            checkout_url: checkout.url,
        };
    } catch (e) {
        const err = new Error(`Polar Payments error: ${e.message || e}`);
        err.status = 502;
        throw err;
    }
}

async function paymentSucceeded(paymentId) {
    if (!polarClient || !paymentId) return null;
    try {
        const checkout = await polarClient.checkouts.get({ id: paymentId });
        const status = (checkout.status || "").toString().toLowerCase();
        if (status !== "succeeded" && status !== "confirmed") return null;
        return { status, metadata: checkout.metadata || {}, payment_id: paymentId };
    } catch (e) {
        console.warn(`[polar] retrieve failed for ${paymentId}: ${e.message}`);
        return null;
    }
}

async function subscriptionSucceeded(subscriptionId) {
    if (!polarClient || !subscriptionId) return null;
    try {
        const s = await polarClient.subscriptions.get({ id: subscriptionId });
        const status = (s.status || "").toString().toLowerCase();
        if (!["active", "succeeded"].includes(status)) return null;
        return { status, metadata: s.metadata || {}, payment_id: subscriptionId };
    } catch (e) {
        console.warn(`[polar] subscription retrieve failed: ${e.message}`);
        return null;
    }
}

module.exports = {
    createCheckout,
    paymentSucceeded,
    subscriptionSucceeded,
    POLAR_PRODUCTS,
};
