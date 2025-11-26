const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  PatientID: { type: Number, required: true, unique: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  DateOfBirth: { type: String, required: true },
  Gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  Address: { type: String },
  Phone: { type: String },
  Email: { type: String },
  InsuranceProviderID: { type: Number },  // Optional link to insurance
}, { collection: "patients" });

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
