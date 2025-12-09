const { body } = require("express-validator");

const createPatientRules = [
  body("FullName")
    .notEmpty().withMessage("Full name is required")
    .isString().withMessage("Full name must be a string")
    .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),

  body("Age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 0, max: 120 }).withMessage("Age must be a valid number between 0 and 120"),

  body("Condition")
    .notEmpty().withMessage("Condition is required")
    .isString().withMessage("Condition must be a string"),

  body("PreferredDate")
    .notEmpty().withMessage("Preferred date is required")
    .isISO8601().withMessage("Preferred date must be a valid date"),

  body("PreferredTime")
    .notEmpty().withMessage("Preferred time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Preferred time must be in HH:MM format"),

  body("Gender")
    .notEmpty().withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("Doctor")
    .notEmpty().withMessage("Doctor is required")
    .isMongoId().withMessage("Doctor must be a valid ID")
];

module.exports = createPatientRules;