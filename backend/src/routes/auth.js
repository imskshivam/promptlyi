"use strict";
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { iso, utcNow } = require("../utils/time");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { JWT_SECRET } = require("../config/env");

const router = express.Router();

// ─── Register ─────────────────────────────────────────────────────────────────
router.post("/register", asyncH(async (req, res) => {
    const db = getDb();
    const { email, password, name } = req.body || {};
    if (!email || !password) throw new HttpError(400, "email and password are required");
    if (password.length < 6) throw new HttpError(400, "password must be at least 6 characters");

    const existing = await db.collection("users").findOne({ email }, { projection: { _id: 0 } });
    if (existing) throw new HttpError(409, "An account with that email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        id: uuidv4(),
        email,
        name: name || email.split("@")[0],
        picture: null,
        role: null,
        credits: 50,
        subscription_plan: null,
        bio: "",
        created_at: iso(utcNow()),
    };
    await db.collection("users").insertOne({ ...user, password_hash: passwordHash });

    const token = _issueToken(user.id);
    _setCookie(res, token);
    res.status(201).json({ user, token });
}));

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/login", asyncH(async (req, res) => {
    const db = getDb();
    const { email, password } = req.body || {};
    if (!email || !password) throw new HttpError(400, "email and password are required");

    const record = await db.collection("users").findOne({ email });
    if (!record || !record.password_hash) throw new HttpError(401, "Invalid email or password");

    const valid = await bcrypt.compare(password, record.password_hash);
    if (!valid) throw new HttpError(401, "Invalid email or password");

    const { _id, password_hash, ...user } = record;
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
