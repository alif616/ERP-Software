const { body, validationResult } = require('express-validator');

// 🔹 Validation result handler (common middleware)
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

// 🔹 User Register Validation
const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  body('email')
    .isEmail().withMessage('Valid email required'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  validate
];

// 🔹 User Login Validation
const loginValidation = [
  body('email')
    .isEmail().withMessage('Valid email required'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate
];

// 🔹 Product Validation
const productValidation = [
  body('name')
    .notEmpty().withMessage('Product name is required'),

  body('price')
    .isNumeric().withMessage('Price must be a number'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a positive number'),

  validate
];

// 🔹 Order Validation
const orderValidation = [
  body('products')
    .isArray({ min: 1 }).withMessage('At least one product is required'),

  body('totalAmount')
    .isNumeric().withMessage('Total amount must be a number'),

  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation
};