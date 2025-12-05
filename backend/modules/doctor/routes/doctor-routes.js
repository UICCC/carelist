const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctor-model");

// ----------------- GET all doctors -----------------
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctors", error });
  }
});

// ----------------- GET unique specialties -----------------
router.get("/specialties/all", async (req, res) => {
  try {
    const specialties = await Doctor.distinct("Specialty");
    res.json(specialties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching specialties", error });
  }
});

// ----------------- GET Doctor Availability -----------------
router.get("/availability/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("DoctorName Specialty Availability");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching availability", error });
  }
});

// ----------------- UPDATE Doctor Availability -----------------
router.put("/availability/:id", async (req, res) => {
  try {
    const { Availability } = req.body;
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { Availability },
      { new: true }
    );
    if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Availability updated", doctor: updatedDoctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating availability", error });
  }
});

// ----------------- GET doctor by ID -----------------
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctor", error });
  }
});

// ----------------- POST new doctor -----------------
router.post("/", async (req, res) => {
  try {
    const { DoctorName, Specialty } = req.body;
    if (!DoctorName || !Specialty) {
      return res.status(400).json({ message: "DoctorName and Specialty are required" });
    }
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error adding doctor", error });
  }
});

// ----------------- PUT update doctor -----------------
router.put("/:id", async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating doctor", error });
  }
});

// ----------------- DELETE doctor -----------------
router.delete("/:id", async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting doctor", error });
  }
});

module.exports = router;