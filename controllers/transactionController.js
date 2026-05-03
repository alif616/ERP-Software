const Transaction = require('../models/Transaction');

// @desc    Create transaction
const createTransaction = async (req, res) => {
  const transaction = await Transaction.create(req.body);
  res.status(201).json(transaction);
};

// @desc    Get transactions
const getTransactions = async (req, res) => {
  const data = await Transaction.find().sort('-createdAt');
  res.json(data);
};

module.exports = { createTransaction, getTransactions };