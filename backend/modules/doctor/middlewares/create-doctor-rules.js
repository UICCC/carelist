const { body } = require("express-validator");

const createDoctorRules = [
  body("Name")
    .notEmpty().withMessage("Doctor name is required")
    .isLength({ min: 3 }).withMessage("Doctor name must be at least 3 characters"),

  body("Specialization")
    .notEmpty().withMessage("Specialization is required")
    .isLength({ min: 3 }).withMessage("Specialization must be at least 3 characters"),

  body("Phone")
    .optional()
    .isMobilePhone().withMessage("Phone number must be valid"),

  body("Email")
    .optional()
    .isEmail().withMessage("Email must be valid")
];

module.exports = createDoctorRules;
