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

// Auto-increment PatientID before saving
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.PatientID) {
    try {
      const lastPatient = await mongoose.model('Patient').findOne().sort({ PatientID: -1 });
      this.PatientID = lastPatient ? lastPatient.PatientID + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Patient", patientSchema);