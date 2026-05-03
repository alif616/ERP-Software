const Employee = require('../models/Employee');

// @desc    Get all employees
const getEmployees = async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
};

// @desc    Create employee
const createEmployee = async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
};

// @desc    Update employee
const updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) { res.status(404); throw new Error('Employee not found'); }

  Object.assign(employee, req.body);
  await employee.save();
  res.json(employee);
};

// @desc    Delete employee
const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) { res.status(404); throw new Error('Employee not found'); }

  await employee.deleteOne();
  res.json({ message: 'Employee removed' });
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };