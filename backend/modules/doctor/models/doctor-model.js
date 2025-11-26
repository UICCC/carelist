const mongoose = require("mongoose");

// ✅ Doctor Schema
const doctorSchema = new mongoose.Schema({
  DoctorName: {
    type: String,
    required: true,
    trim: true,
  },
  Specialty: {
    type: String,
    required: true,
    trim: true,
  },
  Department: {
    type: String,
    required: true,
    trim: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
  },
  Phone: {
    type: String,
    required: true,
    trim: true,
  },
  YearsOfExperience: {
    type: Number,
    min: 0,
    default: 0,
  },
}, { timestamps: true });

// ✅ Create & export model
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
