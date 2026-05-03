const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { generateInvoice } = require('../controllers/invoiceController');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'manager', 'employee'), createOrder)
  .get(protect, authorize('admin', 'manager'), getOrders);

router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.get('/:id/invoice', protect, generateInvoice);

module.exports = router;