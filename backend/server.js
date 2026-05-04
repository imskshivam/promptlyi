"use strict";
require("dotenv").config();

const app = require("./src/app");
const { connectDb } = require("./src/config/db");

const PORT = parseInt(process.env.PORT || "8002", 10);

(async () => {
    try {
        await connectDb();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`[promptly] Node backend listening on :${PORT}`);
        });
    } catch (e) {
        console.error("[promptly] Failed to start:", e);
        process.exit(1);
    }
})();
