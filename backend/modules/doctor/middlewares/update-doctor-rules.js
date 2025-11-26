const { body, param } = require("express-validator");

const updateDoctorRules = [
  param("id")
    .isInt({ gt: 0 }).withMessage("Doctor ID must be a positive integer"),

  body("Name")
    .optional()
    .isLength({ min: 3 }).withMessage("Doctor name must be at least 3 characters"),

  body("Specialization")
    .optional()
    .isLength({ min: 3 }).withMessage("Specialization must be at least 3 characters"),

  body("Phone")
    .optional()
    .isMobilePhone().withMessage("Phone number must be valid"),

  body("Email")
    .optional()
    .isEmail().withMessage("Email must be valid")
];

module.exports = updateDoctorRules;
