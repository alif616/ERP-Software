const Salary = require('../models/Salary');

// @desc    Calculate & create salary
const createSalary = async (req, res) => {
  const { employeeId, baseSalary, bonus, deductions } = req.body;

  const total = baseSalary + bonus - deductions;

  const salary = await Salary.create({
    employeeId,
    baseSalary,
    bonus,
    deductions,
    total
  });

  res.status(201).json(salary);
};

// @desc    Get salaries
const getSalaries = async (req, res) => {
  const data = await Salary.find().populate('employeeId', 'name');
  res.json(data);
};

module.exports = { createSalary, getSalaries };