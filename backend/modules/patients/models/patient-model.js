const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  PatientID: { type: Number, unique: true },
  FullName: { type: String, required: true },
  Age: { type: Number, required: true },
  Condition: { type: String, required: true },
  PreferredDate: { type: Date, required: true },
  PreferredTime: { type: String, required: true },
  Gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  Doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }
});

module.exports = mongoose.model("Patient", patientSchema);
