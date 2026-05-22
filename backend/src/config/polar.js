"use strict";
const env = require("./env");

let polarClient = null;

function initPolar() {
    if (env.POLAR_ACCESS_TOKEN) {
        const { Polar } = require("@polar-sh/sdk");
        polarClient = new Polar({
            accessToken: env.POLAR_ACCESS_TOKEN,
            server: env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
        });
        console.log(`[promptly] Polar Payments client initialised (env=${env.POLAR_ENVIRONMENT})`);
    } else {
        console.warn("[promptly] POLAR_ACCESS_TOKEN missing — Polar flows disabled");
    }
}

try {
    initPolar();
} catch (e) {
    console.warn("[promptly] Polar SDK init failed:", e.message);
}

module.exports = { polarClient };
