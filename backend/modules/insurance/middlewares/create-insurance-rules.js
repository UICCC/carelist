const { body } = require("express-validator");

const createInsuranceRules = [
  body("ProviderName")
    .notEmpty().withMessage("Provider name is required")
    .isLength({ min: 3 }).withMessage("Provider name must be at least 3 characters long"),

  body("ContactNumber")
    .optional()
    .isMobilePhone().withMessage("Contact number must be valid"),

  body("Email")
    .optional()
    .isEmail().withMessage("Email must be valid")
];

module.exports = createInsuranceRules;
