const Supplier = require('../models/Supplier');

// @desc    Get suppliers
const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
};

// @desc    Create supplier
const createSupplier = async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
};

module.exports = { getSuppliers, createSupplier };