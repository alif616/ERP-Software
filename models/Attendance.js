const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'half-day'], default: 'absent' },
  checkInTime: String,
  checkOutTime: String
});

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);