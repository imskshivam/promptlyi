"use strict";
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
require("./config/dodo"); // initialise dodo client at boot

const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors({
    origin: env.CORS_ORIGINS.includes("*") ? true : env.CORS_ORIGINS,
    credentials: true,
}));

// Mount routes under /api
const api = express.Router();

api.get("/", (req, res) => res.json({ service: "Promptly", ok: true }));

api.use("/auth", require("./routes/auth"));
api.use("/", require("./routes/prompts"));         // /credit-estimate, /prompts*, /purchases
api.use("/credits", require("./routes/credits").router);
api.use("/subscriptions", require("./routes/subscriptions").router);
api.use("/payments", require("./routes/payments"));
api.use("/creators", require("./routes/creators"));
api.use("/dashboard", require("./routes/dashboard"));
api.use("/payouts", require("./routes/payouts"));
api.use("/custom-works", require("./routes/customWorks"));
api.use("/dev", require("./routes/dev"));

app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
