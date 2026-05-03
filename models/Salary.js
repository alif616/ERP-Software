const mongoose = require('mongoose');

const salarySchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  basic: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  paymentDate: Date,
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' }
});

salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
module.exports = mongoose.model('Salary', salarySchema);