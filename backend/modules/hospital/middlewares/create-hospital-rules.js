const { body } = require("express-validator");

const createHospitalRules = [
  body("Name")
    .notEmpty().withMessage("Hospital name is required")
    .isLength({ min: 3 }).withMessage("Hospital name must be at least 3 characters"),

  body("Address")
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 5 }).withMessage("Address must be at least 5 characters"),

  body("ContactNumber")
    .optional()
    .isMobilePhone().withMessage("Contact number must be valid")
];

module.exports = createHospitalRules;
