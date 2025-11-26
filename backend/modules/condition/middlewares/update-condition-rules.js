const { body, param } = require("express-validator");

const updateConditionRules = [
  param("id")
    .isInt({ gt: 0 }).withMessage("Condition ID must be a positive integer"),

  body("Name")
    .optional()
    .isLength({ min: 3 }).withMessage("Condition name must be at least 3 characters"),

  body("Description")
    .optional()
    .isLength({ min: 5 }).withMessage("Description must be at least 5 characters long")
];

module.exports = updateConditionRules;
