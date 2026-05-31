"use strict";

const DodoPayments = require("dodopayments");
const env = require("./env");

let _dodoClient = null;

function getDodoClient() {
    if (!_dodoClient) {
        if (!env.DODO_API_KEY) {
            console.warn("[promptly] DODO_API_KEY missing — Dodo flows disabled");
            return null;
        }
        _dodoClient = new DodoPayments.default({
            bearerToken: env.DODO_API_KEY,
            environment: env.DODO_ENVIRONMENT === "test_mode" ? "test_mode" : "live_mode",
        });
        console.log(`[promptly] Dodo Payments client initialised (env=${env.DODO_ENVIRONMENT})`);
    }
    return _dodoClient;
}

module.exports = { getDodoClient };
