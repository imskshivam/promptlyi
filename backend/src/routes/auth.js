"use strict";
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const { iso, utcNow } = require("../utils/time");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { OAuth2Client } = require("google-auth-library");
const { JWT_SECRET, GOOGLE_CLIENT_ID } = require("../config/env");
const { sendWelcomeEmail } = require("../services/emailService");
const { mapId, toObjectId } = require("../utils/dbHelpers");

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

    let user = await db.collection("users").findOne({ email }, { projection: { password_hash: 0 } });

    if (!user) {
        // Create new user
        user = {
            email,
            name: name || email.split("@")[0],
            picture: picture || null,
            google_id: googleId,
            role: null,
            credits: 0,
            subscription_plan: null,
            bio: "",
            created_at: iso(utcNow()),
        };
        const result = await db.collection("users").insertOne({ ...user });
        user._id = result.insertedId;
        
        // Send onboarding welcome email asynchronously
        sendWelcomeEmail(user.email, user.name);
    } else if (!user.google_id || user.picture !== picture) {
        // Update existing user with Google ID & picture if missing/changed
        await db.collection("users").updateOne({ email }, { $set: { google_id: googleId, picture: picture || user.picture } });
        user.google_id = googleId;
        user.picture = picture || user.picture;
    }

    user = mapId(user);

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
    await db.collection("users").updateOne({ _id: toObjectId(req.user.id) }, { $set: { role } });
    res.json({ ...req.user, role });
}));

// ─── Update profile (name, bio, username) ─────────────────────────────────────
router.patch("/profile", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { name, bio, username } = req.body || {};
    const update = {};
    if (name && typeof name === "string" && name.trim()) update.name = name.trim().slice(0, 60);
    if (typeof bio === "string") update.bio = bio.trim().slice(0, 300);
    if (username && typeof username === "string") {
        const clean = username.trim().replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 30);
        if (clean) {
            // Check uniqueness
            const existing = await db.collection("users").findOne({ username: clean, _id: { $ne: toObjectId(req.user.id) } });
            if (existing) throw new HttpError(409, "Username already taken");
            update.username = clean;
        }
    }
    if (Object.keys(update).length) {
        await db.collection("users").updateOne({ _id: toObjectId(req.user.id) }, { $set: update });
    }
    const updated = await db.collection("users").findOne({ _id: toObjectId(req.user.id) }, { projection: { password_hash: 0 } });
    res.json(mapId(updated));
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
