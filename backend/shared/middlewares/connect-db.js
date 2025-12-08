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
    // Safer, more detailed logging for debugging:
    // - print the full error object (stack) so we can see underlying network/auth issues
    // - show a masked preview of the DB_URL so we can confirm the value was loaded
    function maskConnectionString(url) {
      if (!url) return 'undefined';
      try {
        // mask password between ':' and '@' in the credentials portion
        return url.replace(/(\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
      } catch (e) {
        return 'masked';
      }
    }

    console.error("❌ MongoDB Connection Failed:", err);
    console.error("DB_URL (masked):", maskConnectionString(DB_URL));
    console.error("DB_NAME:", DB_NAME || 'not-set');
    throw err; // Let the caller handle it (server.js)
  }
}

module.exports = connectDB;
