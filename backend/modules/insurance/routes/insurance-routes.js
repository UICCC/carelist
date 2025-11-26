const express = require("express");
const router = express.Router();
const Insurance = require("../models/insurance-model");

// ✅ GET all insurance providers
router.get("/", async (req, res) => {
  try {
    const providers = await Insurance.find();
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch insurance providers" });
  }
});

// ✅ GET insurance provider by ID
router.get("/:id", async (req, res) => {
  try {
    const provider = await Insurance.findOne({ InsuranceProviderID: req.params.id });
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch insurance provider" });
  }
});

// ✅ POST new insurance provider
router.post("/", async (req, res) => {
  try {
    const lastProvider = await Insurance.findOne().sort({ InsuranceProviderID: -1 });
    const newID = lastProvider ? lastProvider.InsuranceProviderID + 1 : 1;

    const newProvider = new Insurance({ InsuranceProviderID: newID, ...req.body });
    await newProvider.save();

    res.status(201).json(newProvider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add provider" });
  }
});

// ✅ PUT update provider
router.put("/:id", async (req, res) => {
  try {
    const updatedProvider = await Insurance.findOneAndUpdate(
      { InsuranceProviderID: req.params.id },
      req.body,
      { new: true }
    );

    if (!updatedProvider) return res.status(404).json({ error: "Provider not found" });
    res.json(updatedProvider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update provider" });
  }
});

// ✅ DELETE provider
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Insurance.findOneAndDelete({ InsuranceProviderID: req.params.id });
    if (!deleted) return res.status(404).json({ error: "Provider not found" });
    res.json({ message: "Provider deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete provider" });
  }
});

module.exports = router;
