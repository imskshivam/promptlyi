"use strict";
require("dotenv").config();

const app = require("./src/app");
const { connectDb } = require("./src/config/db");

const PORT = parseInt(process.env.PORT || "4000", 10);

async function maybeStartMemoryMongo() {
    const url = (process.env.MONGO_URL || "").trim();

    // If a real (non-localhost) connection string is provided, skip memory server
    if (url && !url.includes("127.0.0.1") && !url.includes("localhost")) return;

    // If a localhost URL is set, try connecting to it first
    if (url) {
        const { MongoClient } = require("mongodb");
        const client = new MongoClient(url, { serverSelectionTimeoutMS: 2000 });
        try {
            await client.connect();
            await client.close();
            return; // real Mongo is running — use it
        } catch {
            // Not available — fall through to memory server
        }
    }

    // Start in-memory MongoDB
    try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        console.log("[promptly] No MongoDB available — starting in-memory MongoDB (dev mode)...");
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        process.env.MONGO_URL = memUri;
        console.log(`[promptly] In-memory MongoDB started at ${memUri}`);
        process.on("exit", () => mongod.stop());
        process.on("SIGINT", async () => { await mongod.stop(); process.exit(0); });
        process.on("SIGTERM", async () => { await mongod.stop(); process.exit(0); });
    } catch (e) {
        console.error("[promptly] Could not start in-memory MongoDB:", e.message);
        console.error("[promptly] Please install MongoDB locally or set MONGO_URL in backend/.env to a MongoDB Atlas string");
        process.exit(1);
    }
}

(async () => {
    try {
        await maybeStartMemoryMongo();
        await connectDb();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`[promptly] Backend listening on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error("[promptly] Failed to start:", e.message || e);
        process.exit(1);
    }
})();
