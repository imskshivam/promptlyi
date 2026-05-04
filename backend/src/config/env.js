"use strict";

module.exports = {
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,
    CORS_ORIGINS: (process.env.CORS_ORIGINS || "*").split(","),

    DODO_API_KEY: (process.env.DODO_PAYMENTS_API_KEY || "").trim(),
    DODO_ENVIRONMENT: (process.env.DODO_ENVIRONMENT || "test_mode").trim(),
    FRONTEND_ORIGIN: (process.env.FRONTEND_ORIGIN || "").trim(),

    DODO_PRODUCTS: {
        sub_basic: (process.env.DODO_PROD_SUB_BASIC || "").trim(),
        sub_pro: (process.env.DODO_PROD_SUB_PRO || "").trim(),
        sub_elite: (process.env.DODO_PROD_SUB_ELITE || "").trim(),
        pack_starter: (process.env.DODO_PROD_PACK_STARTER || "").trim(),
        pack_pro: (process.env.DODO_PROD_PACK_PRO || "").trim(),
        pack_max: (process.env.DODO_PROD_PACK_MAX || "").trim(),
        prompt: (process.env.DODO_PROD_PROMPT || "").trim(),
    },

    EMERGENT_AUTH_URL: "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",

    COMMISSION_RATE: 0.05,
    MIN_PAYOUT_INR: 8500, // ~ $100
};
