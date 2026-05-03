const express = require('express');
const { protect } = require('../middleware/auth');
const {
  markAttendance,
  getAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

router.route('/')
  .post(protect, markAttendance)
  .get(protect, getAttendance);

module.exports = router;