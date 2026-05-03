const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// @desc    Create purchase (increase stock)
const createPurchase = async (req, res) => {
  const { supplierId, items } = req.body;

  let totalAmount = 0;

  for (let item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.stock += item.quantity;
    await product.save();

    totalAmount += item.quantity * product.price;
  }

  const purchase = await Purchase.create({
    supplierId,
    items,
    totalAmount
  });

  res.status(201).json(purchase);
};

// @desc    Get purchases
const getPurchases = async (req, res) => {
  const data = await Purchase.find().populate('supplierId');
  res.json(data);
};

module.exports = { createPurchase, getPurchases };