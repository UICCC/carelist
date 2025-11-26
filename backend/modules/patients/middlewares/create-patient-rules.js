const { body } = require("express-validator");

const createPatientRules = [
  body("FirstName")
    .notEmpty().withMessage("First name is required")
    .isAlpha().withMessage("First name must contain only letters"),

  body("LastName")
    .notEmpty().withMessage("Last name is required")
    .isAlpha().withMessage("Last name must contain only letters"),

  body("DateOfBirth")
    .notEmpty().withMessage("Date of birth is required")
    .isISO8601().withMessage("Date of birth must be a valid date"),

  body("Gender")
    .notEmpty().withMessage("Gender is required")
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

module.exports = createPatientRules;
