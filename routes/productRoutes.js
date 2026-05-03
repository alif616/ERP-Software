const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'manager'), createProduct)
  .get(protect, getProducts);

router.route('/:id')
  .put(protect, authorize('admin', 'manager'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;