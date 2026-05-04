"use strict";
const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/db");
const { iso, utcNow } = require("../utils/time");
const { getCurrentUser } = require("../middleware/auth");
const { asyncH, HttpError } = require("../middleware/errorHandler");
const { EMERGENT_AUTH_URL } = require("../config/env");

const router = express.Router();

router.post("/session", asyncH(async (req, res) => {
    const db = getDb();
    const sessionId = req.headers["x-session-id"];
    if (!sessionId) throw new HttpError(400, "Missing X-Session-ID header");

    let data;
    try {
        const r = await axios.get(EMERGENT_AUTH_URL, {
            headers: { "X-Session-ID": sessionId },
            timeout: 10000,
        });
        if (r.status !== 200) throw new HttpError(401, "Invalid Emergent session");
        data = r.data;
    } catch (e) {
        if (e instanceof HttpError) throw e;
        throw new HttpError(500, `Auth failed: ${e.message}`);
    }

    const email = data.email;
    const name = data.name || (email ? email.split("@")[0] : "User");
    const picture = data.picture;
    const emergentSession = data.session_token;

    let user = await db.collection("users").findOne({ email }, { projection: { _id: 0 } });
    if (!user) {
        user = {
            id: uuidv4(),
            email,
            name,
            picture,
            role: null,
            credits: 50,
            subscription_plan: null,
            bio: "",
            created_at: iso(utcNow()),
        };
        await db.collection("users").insertOne({ ...user });
    }

    const sessionToken = emergentSession || uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await db.collection("sessions").deleteMany({ user_id: user.id });
    await db.collection("sessions").insertOne({
        session_token: sessionToken,
        user_id: user.id,
        expires_at: iso(expiresAt),
    });

    res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 3600 * 1000,
    });
    delete user._id;
    res.json({ user, session_token: sessionToken });
}));

router.get("/me", getCurrentUser, asyncH(async (req, res) => {
    res.json(req.user);
}));

router.post("/logout", asyncH(async (req, res) => {
    const db = getDb();
    const token = req.cookies?.session_token;
    if (token) await db.collection("sessions").deleteOne({ session_token: token });
    res.clearCookie("session_token", { path: "/" });
    res.json({ ok: true });
}));

router.post("/role", getCurrentUser, asyncH(async (req, res) => {
    const db = getDb();
    const { role } = req.body || {};
    if (!["business", "normal"].includes(role)) throw new HttpError(400, "Invalid role");
    await db.collection("users").updateOne({ id: req.user.id }, { $set: { role } });
    res.json({ ...req.user, role });
}));

module.exports = router;
