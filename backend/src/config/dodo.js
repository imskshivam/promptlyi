"use strict";
const env = require("./env");

let dodoClient = null;

try {
    if (env.DODO_API_KEY) {
        // dodopayments SDK is CommonJS and exposes default class
        const DodoPayments = require("dodopayments").default || require("dodopayments");
        dodoClient = new DodoPayments({
            bearerToken: env.DODO_API_KEY,
            environment: env.DODO_ENVIRONMENT,
        });
        console.log(`[promptly] Dodo Payments client initialised (env=${env.DODO_ENVIRONMENT})`);
    } else {
        console.warn("[promptly] DODO_PAYMENTS_API_KEY missing — Dodo flows disabled");
    }
} catch (e) {
    console.warn("[promptly] Dodo SDK init failed:", e.message);
}

module.exports = { dodoClient };
