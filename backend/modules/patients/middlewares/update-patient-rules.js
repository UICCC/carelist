const { body, param } = require("express-validator");

const updatePatientRules = [
  param("id")
    .isInt({ gt: 0 }).withMessage("Patient ID must be a positive integer"),

  body("FirstName")
    .optional()
    .isAlpha().withMessage("First name must contain only letters"),

  body("LastName")
    .optional()
    .isAlpha().withMessage("Last name must contain only letters"),

  body("DateOfBirth")
    .optional()
    .isISO8601().withMessage("Date of birth must be valid"),

  body("Gender")
    .optional()
    .isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female, or Other"),

  body("Address")
    .optional()
    .isLength({ min: 5 }).withMessage("Address must be at least 5 characters long"),

  body("Phone")
    .optional()
    .isMobilePhone().withMessage("Phone number must be valid"),

  body("Email")
    .optional()
    .isEmail().withMessage("Email must be valid"),

  body("InsuranceProviderID")
    .optional()
    .isInt({ gt: 0 }).withMessage("Insurance Provider ID must be a positive integer")
];

module.exports = updatePatientRules;
