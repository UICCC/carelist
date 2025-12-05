const { body } = require("express-validator");

const createPatientRules = [
  body("FullName")
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 3 }).withMessage("Full name must be at least 3 letters"),
    
  body("Age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 0 }).withMessage("Age must be a positive number"),
    
  body("Condition")
    .notEmpty().withMessage("Condition is required"),

  body("PreferredDate")
    .notEmpty().withMessage("Preferred date is required")
    .isISO8601().withMessage("Preferred date must be valid"),

  body("PreferredTime")
    .notEmpty().withMessage("Preferred time is required"),

  body("Gender")
    .notEmpty().withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female, or Other"),
];

module.exports = createPatientRules;
