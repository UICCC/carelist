const mongoose = require("mongoose");

// Define schema for hospital
const hospitalSchema = new mongoose.Schema({
  HospitalID: { type: Number, required: true, unique: true },
  Name: { type: String, required: true },
  Address: { type: String, required: true },
  Phone: { type: String },
  Email: { type: String },
  Department: { type: String },
}, { collection: "hospitals" });

// Create model
const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;
