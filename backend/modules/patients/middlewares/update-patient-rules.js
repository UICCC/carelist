const { body, param } = require("express-validator");

const updatePatientRules = [
  param("id")
    .isInt({ min: 1 }).withMessage("Patient ID must be a positive number"),

  body("FullName")
    .optional()
    .isString().withMessage("Full name must be a string")
    .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),

  body("Age")
    .optional()
    .isInt({ min: 0, max: 120 }).withMessage("Age must be a valid number"),

  body("Condition")
    .optional()
    .isString().withMessage("Condition must be a string"),

  body("PreferredDate")
    .optional()
    .isISO8601().withMessage("Preferred date must be valid"),

  body("PreferredTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Preferred time must be in HH:MM format"),

  body("Gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other")
];

module.exports = updatePatientRules;
