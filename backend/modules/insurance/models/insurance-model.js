const mongoose = require("mongoose");

// Define schema for insurance provider
const insuranceSchema = new mongoose.Schema({
  InsuranceProviderID: { type: Number, required: true, unique: true },
  ProviderName: { type: String, required: true },
  ContactNumber: { type: String },
  Email: { type: String },
  Address: { type: String },
  PolicyType: { type: String },
}, { collection: "insurance" });

// Create model
const Insurance = mongoose.model("Insurance", insuranceSchema);

module.exports = Insurance;
