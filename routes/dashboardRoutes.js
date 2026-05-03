const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), getDashboardStats);

module.exports = router;