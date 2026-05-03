const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPurchase,
  getPurchases
} = require('../controllers/purchaseController');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'manager'), createPurchase)
  .get(protect, getPurchases);

module.exports = router;