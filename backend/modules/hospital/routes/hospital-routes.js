const express = require("express");
const router = express.Router();
const Hospital = require("../models/hospital-model");

// ✅ GET all hospitals
router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
});

// ✅ GET hospital by ID
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ HospitalID: req.params.id });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    res.json(hospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospital" });
  }
});

// ✅ POST new hospital
router.post("/", async (req, res) => {
  try {
    const lastHospital = await Hospital.findOne().sort({ HospitalID: -1 });
    const newID = lastHospital ? lastHospital.HospitalID + 1 : 1;

    const newHospital = new Hospital({ HospitalID: newID, ...req.body });
    await newHospital.save();

    res.status(201).json(newHospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add hospital" });
  }
});

// ✅ PUT update hospital
router.put("/:id", async (req, res) => {
  try {
    const updatedHospital = await Hospital.findOneAndUpdate(
      { HospitalID: req.params.id },
      req.body,
      { new: true }
    );

    if (!updatedHospital) return res.status(404).json({ error: "Hospital not found" });
    res.json(updatedHospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update hospital" });
  }
});

// ✅ DELETE hospital
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Hospital.findOneAndDelete({ HospitalID: req.params.id });
    if (!deleted) return res.status(404).json({ error: "Hospital not found" });
    res.json({ message: "Hospital deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete hospital" });
  }
});

module.exports = router;
