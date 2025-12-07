const mongoose = require("mongoose");

// Availability Schema
const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    required: true
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  DoctorName: { type: String, required: true, trim: true },
  Specialty: { type: String, required: true, trim: true },
  Department: { type: String, required: true, trim: true },
  Email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"] 
  },
  Phone: { type: String, required: true, trim: true },
  YearsOfExperience: { type: Number, min: 0, default: 0 },
  Availability: [availabilitySchema]
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);