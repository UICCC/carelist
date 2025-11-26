// module/admission/middlewares/create-admission-rules.js
const { body } = require('express-validator');

const createAdmissionRules = [
  body('patientId')
    .isInt({ gt: 0 }).withMessage('Patient ID must be a positive integer'),
  body('doctorId')
    .isInt({ gt: 0 }).withMessage('Doctor ID must be a positive integer'),
  body('admissionDate')
    .notEmpty().withMessage('Admission date is required')
    .isISO8601().withMessage('Admission date must be a valid date'),
  body('dischargeDate')
    .optional()
    .isISO8601().withMessage('Discharge date must be a valid date'),
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 3 }).withMessage('Reason must be at least 3 characters long'),
];

module.exports = createAdmissionRules;
