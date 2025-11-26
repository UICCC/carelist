const express = require("express");
const { validationResult } = require("express-validator");
const router = express.Router();
const conditionModel = require("../models/condition-model");
const createConditionRules = require("../middlewares/create-condition-rules");
const updateConditionRules = require("../middlewares/update-condition-rules");

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET all conditions
router.get("/", async (req, res) => {
  const conditions = await conditionModel.getAllConditions();
  res.json(conditions);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id); // convert to number
  const condition = await conditionModel.getConditionById(id);
  if (!condition) return res.status(404).json({ message: "Condition not found" });
  res.json(condition);
});

// PUT update condition
router.put("/:id", updateConditionRules, validate, async (req, res) => {
  const id = Number(req.params.id); // convert to number
  const updated = await conditionModel.updateExistingCondition(id, req.body);
  if (!updated) return res.status(404).json({ message: "Condition not found" });
  res.json(updated);
});

// DELETE condition
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id); // convert to number
  await conditionModel.deleteCondition(id);
  res.status(204).send();
});


module.exports = router;
