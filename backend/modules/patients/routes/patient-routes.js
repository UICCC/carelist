const express = require("express");
const router = express.Router();
const Patient = require("../models/patient-model");
const createPatientRules = require("../middlewares/create-patient-rules");
const updatePatientRules = require("../middlewares/update-patient-rules");
const checkValidation = require("../../../shared/middlewares/check-validation");
const { verifyToken, requireRole } = require("../../auth/middlewares/auth-middleware");

// GET all patients
router.get("/", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    let patients;
    if (req.user.role === "doctor") {
      // Doctor only sees their appointments
      patients = await Patient.find({ Doctor: req.user.doctorId }).populate("Doctor");
    } else {
      // Admin sees all
      patients = await Patient.find().populate("Doctor");
    }
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// GET patient by ID
router.get("/:id", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ PatientID: Number(req.params.id) }).populate("Doctor");
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (req.user.role === "doctor" && String(patient.Doctor?._id) !== String(req.user.doctorId)) {
      return res.status(403).json({ error: "Access denied. Not your appointment." });
    }

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// POST new patient (Admin only)
router.post("/", verifyToken, requireRole("admin"), createPatientRules, checkValidation, async (req, res) => {
  try {
    const lastPatient = await Patient.findOne().sort({ PatientID: -1 });
    const newID = lastPatient ? lastPatient.PatientID + 1 : 1;

    const newPatient = new Patient({
      PatientID: newID,
      status: "Pending",
      ...req.body
    });

    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add patient" });
  }
});

// PUT update patient (Admin only)
router.put("/:id", verifyToken, requireRole("admin"), updatePatientRules, checkValidation, async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { PatientID: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedPatient) return res.status(404).json({ error: "Patient not found" });
    res.json(updatedPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// PATCH status (Admin & Doctor)
router.patch("/:id/status", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Accepted", "Rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const patient = await Patient.findOne({ PatientID: Number(req.params.id) });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Doctor can only update their own
    if (req.user.role === "doctor" && String(patient.Doctor) !== String(req.user.doctorId)) {
      return res.status(403).json({ error: "Access denied. Not your appointment." });
    }

    patient.status = status;
    await patient.save();
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE patient (Admin only)
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({ PatientID: Number(req.params.id) });
    if (!deletedPatient) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

module.exports = router;
