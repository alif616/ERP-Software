const Order = require('../models/Order');
const Product = require('../models/Product');
const { getIO } = require('../utils/socket');

const generateOrderNumber = () => 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

// @desc    Create order (reduces stock)
const createOrder = async (req, res) => {
  const { customerName, customerEmail, items } = req.body;
  let totalAmount = 0;
  const orderItems = [];
  // Validate stock & calculate
  for (let item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product?.name || item.productId}`);
    }
    orderItems.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price
    });
    totalAmount += product.price * item.quantity;
    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
    if (product.stock <= product.minStock) {
      getIO().emit('lowStock', { productId: product._id, name: product.name, stock: product.stock });
    }
  }
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customerName,
    customerEmail,
    items: orderItems,
    totalAmount,
    createdBy: req.user._id
  });
  // Emit real-time new order notification
  getIO().emit('newOrder', { orderId: order._id, orderNumber: order.orderNumber, totalAmount });
  res.status(201).json(order);
};

// @desc    Get all orders with pagination
const getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const orders = await Order.find().populate('createdBy', 'name').sort('-createdAt').skip(skip).limit(limit);
  const total = await Order.countDocuments();
  res.json({ orders, page, totalPages: Math.ceil(total / limit), total });
};

// @desc    Update order status
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.status = req.body.status;
  order.updatedAt = Date.now();
  await order.save();
  res.json(order);
};

module.exports = { createOrder, getOrders, updateOrderStatus };