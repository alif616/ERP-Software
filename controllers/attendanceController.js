const Attendance = require('../models/Attendance');

// @desc    Mark attendance
const markAttendance = async (req, res) => {
  const attendance = await Attendance.create(req.body);
  res.status(201).json(attendance);
};

// @desc    Get attendance list
const getAttendance = async (req, res) => {
  const data = await Attendance.find().populate('employeeId', 'name');
  res.json(data);
};

module.exports = { markAttendance, getAttendance };