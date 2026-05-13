"use strict";
const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDb() {
    if (db) return db;
    // Read MONGO_URL dynamically so server.js can update it before calling connectDb()
    const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
    const dbName = process.env.DB_NAME || "promptly";
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log(`[promptly] connected to MongoDB (db=${dbName})`);
    return db;
}

function getDb() {
    if (!db) throw new Error("Database not initialised. Call connectDb() first.");
    return db;
}

async function closeDb() {
    if (client) await client.close();
    client = null;
    db = null;
}

module.exports = { connectDb, getDb, closeDb };
