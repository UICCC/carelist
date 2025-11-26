// module/admission/middlewares/update-admission-rules.js
const { body, param } = require('express-validator');

const updateAdmissionRules = [
  param('id')
    .isInt({ gt: 0 }).withMessage('Admission ID must be a positive integer'),
  body('patientId')
    .optional()
    .isInt({ gt: 0 }).withMessage('Patient ID must be a positive integer'),
  body('doctorId')
    .optional()
    .isInt({ gt: 0 }).withMessage('Doctor ID must be a positive integer'),
  body('admissionDate')
    .optional()
    .isISO8601().withMessage('Admission date must be a valid date'),
  body('dischargeDate')
    .optional()
    .isISO8601().withMessage('Discharge date must be a valid date'),
  body('reason')
    .optional()
    .isLength({ min: 3 }).withMessage('Reason must be at least 3 characters long'),
];

module.exports = updateAdmissionRules;
