const { body, param } = require("express-validator");

const updateInsuranceRules = [
  param("id")
    .isInt({ gt: 0 }).withMessage("Insurance Provider ID must be a positive integer"),

  body("ProviderName")
    .optional()
    .isLength({ min: 3 }).withMessage("Provider name must be at least 3 characters long"),

  body("ContactNumber")
    .optional()
    .isMobilePhone().withMessage("Contact number must be valid"),

  body("Email")
    .optional()
    .isEmail().withMessage("Email must be valid")
];

module.exports = updateInsuranceRules;
