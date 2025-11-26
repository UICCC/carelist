const express = require("express");
const router = express.Router();
const Patient = require("../models/patient-model");
const createPatientRules = require("../middlewares/create-patient-rules");
const updatePatientRules = require("../middlewares/update-patient-rules");
const checkValidation = require("../../../shared/middlewares/check-validation");

// ✅ GET all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// ✅ GET patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findOne({ PatientID: req.params.id });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// ✅ POST new patient
router.post("/", createPatientRules, checkValidation, async (req, res) => {
  try {
    const lastPatient = await Patient.findOne().sort({ PatientID: -1 });
    const newID = lastPatient ? lastPatient.PatientID + 1 : 1;

    const newPatient = new Patient({ PatientID: newID, ...req.body });
    await newPatient.save();

    res.status(201).json(newPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add patient" });
  }
});

// ✅ PUT update patient
router.put("/:id", updatePatientRules, checkValidation, async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { PatientID: req.params.id },
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

// ✅ DELETE patient
router.delete("/:id", async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({ PatientID: req.params.id });
    if (!deletedPatient) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

module.exports = router;
