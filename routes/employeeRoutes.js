const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), createEmployee)
  .get(protect, authorize('admin', 'manager'), getEmployees);

router.route('/:id')
  .put(protect, authorize('admin'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;