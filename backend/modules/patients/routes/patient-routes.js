const express = require("express");
const router = express.Router();
const Patient = require("../models/patient-model");
const createPatientRules = require("../middlewares/create-patient-rules");
const updatePatientRules = require("../middlewares/update-patient-rules");
const checkValidation = require("../../../shared/middlewares/check-validation");
const { verifyToken, requireRole } = require("../../auth/middlewares/auth-middleware");

// ----------------- GET all patients -----------------
// Admin sees all; Doctor sees only their patients
router.get("/", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    let patients;

    if (req.user.role === "doctor") {
      if (!req.user.doctorId) return res.json([]);
      patients = await Patient.find({ Doctor: req.user.doctorId }).populate("Doctor");
    } else {
      patients = await Patient.find().populate("Doctor");
    }

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// ----------------- GET patient by PatientID -----------------
router.get("/:id", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ PatientID: Number(req.params.id) }).populate("Doctor");
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Doctor can only view their own patient
    if (req.user.role === "doctor") {
      if (!req.user.doctorId || !patient.Doctor || !patient.Doctor._id.equals(req.user.doctorId)) {
        return res.status(403).json({ error: "Access denied. Not your patient." });
      }
    }

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// ----------------- POST new patient -----------------
// ONLY Admin
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

// ----------------- PUT update patient -----------------
// ONLY Admin
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

// ----------------- PATCH update status (Accept/Reject) -----------------
// Admin and Doctor can accept/reject appointments
router.patch("/:id/status", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const patient = await Patient.findOne({ PatientID: Number(req.params.id) }).populate("Doctor");
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Doctor can only update their own patient
    if (req.user.role === "doctor") {
      if (!req.user.doctorId || !patient.Doctor || !patient.Doctor._id.equals(req.user.doctorId)) {
        return res.status(403).json({ error: "Access denied. Not your patient." });
      }
    }

    patient.status = status;
    await patient.save();

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ----------------- DELETE patient -----------------
// ONLY Admin
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
