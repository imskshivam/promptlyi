"use strict";
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const { JWT_SECRET } = require("../config/env");

async function getCurrentUser(req, res, next) {
    try {
        const db = getDb();

        // Accept JWT from cookie or Authorization: Bearer <token>
        const cookieToken = req.cookies?.session_token;
        const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
        const token = cookieToken || headerToken;
        if (!token) return res.status(401).json({ detail: "Not authenticated" });

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch {
            return res.status(401).json({ detail: "Invalid or expired session" });
        }

        const user = await db.collection("users").findOne(
            { id: payload.sub },
            { projection: { _id: 0, password_hash: 0 } },
        );
        if (!user) return res.status(401).json({ detail: "User not found" });

        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
}

// Prompt User = seller role (was "business")
function requirePromptUser(req, res, next) {
    if (!req.user) return res.status(401).json({ detail: "Not authenticated" });
    // Support both old "business" role and new "prompt_user" role for backwards-compat
    if (req.user.role !== "prompt_user" && req.user.role !== "business") {
        return res.status(403).json({ detail: "Prompt User role required" });
    }
    next();
}

// Legacy alias so existing imports don't break during transition
const requireBusiness = requirePromptUser;

module.exports = { getCurrentUser, requirePromptUser, requireBusiness };
