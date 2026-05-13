"use strict";
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { iso, utcNow } = require("../utils/time");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { OAuth2Client } = require("google-auth-library");
const { JWT_SECRET, GOOGLE_CLIENT_ID } = require("../config/env");

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const router = express.Router();

// ─── Google OAuth Login / Register ──────────────────────────────────────────────
router.post("/google", asyncH(async (req, res) => {
    const db = getDb();
    const { credential } = req.body || {};
    if (!credential) throw new HttpError(400, "Google credential is required");

    // Verify token
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new HttpError(401, "Invalid Google token");

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name;
    const picture = payload.picture;

    let user = await db.collection("users").findOne({ email }, { projection: { _id: 0, password_hash: 0 } });

    if (!user) {
        // Create new user
        user = {
            id: uuidv4(),
            email,
            name: name || email.split("@")[0],
            picture: picture || null,
            google_id: googleId,
            role: null,
            credits: 50,
            subscription_plan: null,
            bio: "",
            created_at: iso(utcNow()),
        };
        await db.collection("users").insertOne({ ...user });
    } else if (!user.google_id || user.picture !== picture) {
        // Update existing user with Google ID & picture if missing/changed
        await db.collection("users").updateOne({ email }, { $set: { google_id: googleId, picture: picture || user.picture } });
        user.google_id = googleId;
        user.picture = picture || user.picture;
    }

    const token = _issueToken(user.id);
    _setCookie(res, token);
    res.json({ user, token });
}));

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get("/me", getCurrentUser, asyncH(async (req, res) => {
    res.json(req.user);
}));

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/logout", asyncH(async (req, res) => {
    res.clearCookie("session_token", { path: "/" });
    res.json({ ok: true });
}));

// ─── Set role ─────────────────────────────────────────────────────────────────
router.post("/role", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { role } = req.body || {};
    const validRoles = ["prompt_user", "client", "business", "normal"];
    if (!validRoles.includes(role)) throw new HttpError(400, "Invalid role");
    await db.collection("users").updateOne({ id: req.user.id }, { $set: { role } });
    res.json({ ...req.user, role });
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _issueToken(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function _setCookie(res, token) {
    res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 3600 * 1000,
    });
}

module.exports = router;
