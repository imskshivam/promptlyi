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

    POLAR_ACCESS_TOKEN: (process.env.POLAR_ACCESS_TOKEN || "").trim(),
    POLAR_ENVIRONMENT: (process.env.POLAR_ENVIRONMENT || "sandbox").trim(),
    POLAR_WEBHOOK_SECRET: (process.env.POLAR_WEBHOOK_SECRET || "").trim(),
    
    // Fallback to promptlyi.com if frontend origin isn't explicitly set
    FRONTEND_ORIGIN: (process.env.FRONTEND_ORIGIN || "http://promptlyi.com").trim(),
    GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com").trim(),
    
    RESEND_API_KEY: (process.env.RESEND_API_KEY || "").trim(),

    POLAR_PRODUCTS: {
        sub_basic: (process.env.POLAR_PROD_SUB_BASIC || "").trim(),
        sub_pro: (process.env.POLAR_PROD_SUB_PRO || "").trim(),
        sub_elite: (process.env.POLAR_PROD_SUB_ELITE || "").trim(),
        pack_starter: (process.env.POLAR_PROD_PACK_STARTER || "").trim(),
        pack_pro: (process.env.POLAR_PROD_PACK_PRO || "").trim(),
        pack_max: (process.env.POLAR_PROD_PACK_MAX || "").trim(),
        prompt: (process.env.POLAR_PROD_PROMPT || "").trim(),
    },

    COMMISSION_RATE: 0.05,
    MIN_PAYOUT_USD: 100, // $100
};
