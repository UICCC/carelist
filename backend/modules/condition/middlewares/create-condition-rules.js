const { body } = require('express-validator');

const createConditionRules = [
  body('ConditionName')
    .notEmpty().withMessage('Condition name is required'),
  body('Description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
  body('Severity')
    .notEmpty().withMessage('Severity is required')
    .isIn(['Mild', 'Moderate', 'Severe']).withMessage('Severity must be Mild, Moderate, or Severe'),
];

module.exports = createConditionRules;
