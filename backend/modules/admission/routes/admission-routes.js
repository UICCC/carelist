const express = require("express");
const { validationResult } = require("express-validator");
const router = express.Router();
const admissionModel = require("../models/admission-model");
const createAdmissionRules = require("../middlewares/create-admission-rules");
const updateAdmissionRules = require("../middlewares/update-admission-rules");

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET all admissions
router.get("/", async (req, res) => {
  const admissions = await admissionModel.getAllAdmissions();
  res.json(admissions);
});

// GET admission by ID
router.get("/:id", async (req, res) => {
  const admission = await admissionModel.getAdmissionById(req.params.id);
  if (!admission) return res.status(404).json({ message: "Admission not found" });
  res.json(admission);
});

// POST new admission
router.post("/", createAdmissionRules, validate, async (req, res) => {
  const newAdmission = await admissionModel.addNewAdmission(req.body);
  res.status(201).json(newAdmission);
});

// PUT update admission
router.put("/:id", updateAdmissionRules, validate, async (req, res) => {
  const updatedAdmission = await admissionModel.updateExistingAdmission(req.params.id, req.body);
  if (!updatedAdmission) return res.status(404).json({ message: "Admission not found" });
  res.json(updatedAdmission);
});

// DELETE admission
router.delete("/:id", async (req, res) => {
  await admissionModel.deleteAdmission(req.params.id);
  res.status(204).send();
});

module.exports = router;
