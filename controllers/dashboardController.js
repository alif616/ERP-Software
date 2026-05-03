const Product = require('../models/Product');
const Order = require('../models/Order');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');

// @desc    Dashboard stats
const getDashboardStats = async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalEmployees = await Employee.countDocuments();

  const revenueData = await Transaction.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);

  res.json({
    totalProducts,
    totalOrders,
    totalEmployees,
    totalRevenue: revenueData[0]?.totalRevenue || 0
  });
};

module.exports = { getDashboardStats };