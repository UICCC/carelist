const { body, param } = require("express-validator");

const updateHospitalRules = [
  param("id")
    .isInt({ gt: 0 }).withMessage("Hospital ID must be a positive integer"),

  body("Name")
    .optional()
    .isLength({ min: 3 }).withMessage("Hospital name must be at least 3 characters"),

  body("Address")
    .optional()
    .isLength({ min: 5 }).withMessage("Address must be at least 5 characters long"),

  body("ContactNumber")
    .optional()
    .isMobilePhone().withMessage("Contact number must be valid")
];

module.exports = updateHospitalRules;
