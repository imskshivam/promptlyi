require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
    console.log(process.env.MONGO_URI);
    const client = new MongoClient(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/promptlyi");
    await client.connect();
    const db = client.db();
    await db.dropDatabase();
    console.log('Database dropped successfully for fresh start.');
    process.exit(0);
}
run();
