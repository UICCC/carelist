// shared/middlewares/connect-db.js
const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  const DB_URL = process.env.DB_URL;
  const DB_NAME = process.env.DB_NAME;

  if (!DB_URL) {
    throw new Error("❌ DB_URL not found in environment variables");
  }

  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      return;
    }

    const connectOptions = {};
    if (DB_NAME) connectOptions.dbName = DB_NAME;

    await mongoose.connect(DB_URL, connectOptions);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    throw err; // Let the caller handle it (server.js)
  }
}

module.exports = connectDB;
