"use strict";

module.exports = {
    MONGO_URL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017",
    DB_NAME: process.env.DB_NAME || "promptly",
    
    // Automatically allow localhost and promptlyi.com, plus anything from .env
    CORS_ORIGINS: [...new Set([
        "http://localhost:3000",
        "http://localhost:4000",
        "http://promptlyi.com",
        "https://promptlyi.com",
        "https://www.promptlyi.com",
        "http://www.promptlyi.com",
        ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [])
    ])],

    JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_in_production",

    DODO_API_KEY: (process.env.DODO_PAYMENTS_API_KEY || "").trim(),
    DODO_ENVIRONMENT: (process.env.DODO_ENVIRONMENT || "test_mode").trim(),
    DODO_WEBHOOK_SECRET: (process.env.DODO_WEBHOOK_SECRET || "").trim(),
    
    // Fallback to promptlyi.com if frontend origin isn't explicitly set
    FRONTEND_ORIGIN: (process.env.FRONTEND_ORIGIN || "http://promptlyi.com").trim(),
    GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com").trim(),

    DODO_PRODUCTS: {
        sub_basic: (process.env.DODO_PROD_SUB_BASIC || "").trim(),
        sub_pro: (process.env.DODO_PROD_SUB_PRO || "").trim(),
        sub_elite: (process.env.DODO_PROD_SUB_ELITE || "").trim(),
        pack_starter: (process.env.DODO_PROD_PACK_STARTER || "").trim(),
        pack_pro: (process.env.DODO_PROD_PACK_PRO || "").trim(),
        pack_max: (process.env.DODO_PROD_PACK_MAX || "").trim(),
        prompt: (process.env.DODO_PROD_PROMPT || "").trim(),
    },

    COMMISSION_RATE: 0.05,
    MIN_PAYOUT_USD: 100, // $100
};
