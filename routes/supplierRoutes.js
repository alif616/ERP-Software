const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createSupplier,
  getSuppliers
} = require('../controllers/supplierController');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'manager'), createSupplier)
  .get(protect, getSuppliers);

module.exports = router;