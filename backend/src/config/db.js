"use strict";
const { MongoClient } = require("mongodb");
const { MONGO_URL, DB_NAME } = require("./env");

let client;
let db;

async function connectDb() {
    if (db) return db;
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[promptly] connected to MongoDB (db=${DB_NAME})`);
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
