"use strict";
const { dodoClient } = require("../config/dodo");
const { DODO_PRODUCTS, FRONTEND_ORIGIN } = require("../config/env");

function ensureClient() {
    if (!dodoClient) {
        const err = new Error("Dodo Payments is not configured. Set DODO_PAYMENTS_API_KEY.");
        err.status = 503;
        throw err;
    }
}

async function createCheckout({ productId, customer, returnPath, metadata, quantity = 1 }) {
    ensureClient();
    if (!productId) {
        const err = new Error("Product ID not configured. Please add the matching DODO_PROD_* env var.");
        err.status = 503;
        throw err;
    }
    const returnUrl = `${FRONTEND_ORIGIN}${returnPath}`;
    try {
        const session = await dodoClient.checkoutSessions.create({
            product_cart: [{ product_id: productId, quantity }],
            customer: { email: customer.email, name: customer.name || customer.email },
            billing_address: { country: "IN", city: "NA", state: "NA", street: "NA", zipcode: "000000" },
            return_url: returnUrl,
            metadata,
        });
        return {
            session_id: session.session_id || session.id,
            checkout_url: session.checkout_url || session.url,
        };
    } catch (e) {
        const err = new Error(`Dodo Payments error: ${e.message || e}`);
        err.status = 502;
        throw err;
    }
}

async function paymentSucceeded(paymentId) {
    if (!dodoClient || !paymentId) return null;
    try {
        const p = await dodoClient.payments.retrieve(paymentId);
        const status = (p.status || "").toString().toLowerCase();
        if (status !== "succeeded") return null;
        return { status, metadata: p.metadata || {}, payment_id: paymentId };
    } catch (e) {
        console.warn(`[dodo] retrieve failed for ${paymentId}: ${e.message}`);
        return null;
    }
}

async function subscriptionSucceeded(subscriptionId) {
    if (!dodoClient || !subscriptionId) return null;
    try {
        const s = await dodoClient.subscriptions.retrieve(subscriptionId);
        const status = (s.status || "").toString().toLowerCase();
        if (!["active", "succeeded"].includes(status)) return null;
        return { status, metadata: s.metadata || {}, payment_id: subscriptionId };
    } catch (e) {
        console.warn(`[dodo] subscription retrieve failed: ${e.message}`);
        return null;
    }
}

module.exports = {
    createCheckout,
    paymentSucceeded,
    subscriptionSucceeded,
    DODO_PRODUCTS,
};
