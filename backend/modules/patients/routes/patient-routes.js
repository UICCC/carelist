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
      const Doctor = require("../../doctor/models/doctor-model");
      const doctorRecord = await Doctor.findOne({ Email: req.user.email });
      if (!doctorRecord) return res.json([]);
      patients = await Patient.find({ Doctor: doctorRecord._id }).populate("Doctor");
    } else {
      patients = await Patient.find().populate("Doctor");
    }

    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// GET patient by ID (using MongoDB _id)
router.get("/:id", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("Doctor");
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

// POST new patient (Admin only) - PatientID will auto-increment
router.post("/", verifyToken, requireRole("admin"), createPatientRules, checkValidation, async (req, res) => {
  try {
    const newPatient = new Patient({
      status: "Pending",
      ...req.body
      // PatientID will be automatically assigned by mongoose-sequence
    });

    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({ error: "Failed to add patient", details: err.message });
  }
});

// PUT update patient (Admin only) - using MongoDB _id
router.put("/:id", verifyToken, requireRole("admin"), updatePatientRules, checkValidation, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Convert Age to number if present
    if (updateData.Age) updateData.Age = Number(updateData.Age);

    // Ensure Doctor field is just the _id
    if (updateData.Doctor && typeof updateData.Doctor === "object") {
      updateData.Doctor = updateData.Doctor._id;
    }

    // Don't allow updating PatientID
    delete updateData.PatientID;

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("Doctor");

    if (!updatedPatient) return res.status(404).json({ error: "Patient not found" });

    res.json(updatedPatient);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update patient", details: err.message });
  }
});

// PATCH status (Admin & Doctor) - using MongoDB _id
router.patch("/:id/status", verifyToken, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Accepted", "Rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const patient = await Patient.findById(req.params.id).populate("Doctor");
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (req.user.role === "doctor") {
      const Doctor = require("../../doctor/models/doctor-model");
      const doctorRecord = await Doctor.findOne({ Email: req.user.email });
      if (!doctorRecord || String(patient.Doctor?._id) !== String(doctorRecord._id)) {
        return res.status(403).json({ error: "Access denied. Not your appointment." });
      }
    }

    patient.status = status;
    await patient.save();
    res.json(patient);
  } catch (err) {
    console.error("Error updating patient status:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

// DELETE patient (Admin only) - using MongoDB _id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

module.exports = router;