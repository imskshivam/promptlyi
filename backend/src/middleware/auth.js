"use strict";
const { getDb } = require("../config/db");
const { iso, utcNow } = require("../utils/time");

async function getCurrentUser(req, res, next) {
    try {
        const db = getDb();
        const cookieToken = req.cookies?.session_token;
        const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
        const token = cookieToken || headerToken;
        if (!token) return res.status(401).json({ detail: "Not authenticated" });

        const sess = await db.collection("sessions").findOne({ session_token: token }, { projection: { _id: 0 } });
        if (!sess) return res.status(401).json({ detail: "Invalid session" });
        if (new Date(sess.expires_at) < utcNow()) return res.status(401).json({ detail: "Session expired" });

        const user = await db.collection("users").findOne({ id: sess.user_id }, { projection: { _id: 0 } });
        if (!user) return res.status(401).json({ detail: "User not found" });
        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
}

function requireBusiness(req, res, next) {
    if (!req.user) return res.status(401).json({ detail: "Not authenticated" });
    if (req.user.role !== "business") return res.status(403).json({ detail: "Business role required" });
    next();
}

module.exports = { getCurrentUser, requireBusiness };
