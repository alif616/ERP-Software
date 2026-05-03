const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createSalary,
  getSalaries
} = require('../controllers/salaryController');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), createSalary)
  .get(protect, authorize('admin', 'manager'), getSalaries);

module.exports = router;