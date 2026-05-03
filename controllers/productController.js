const Product = require('../models/Product');
const { getIO } = require('../utils/socket');

// @desc    Get all products with pagination & search
const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const products = await Product.find(query).skip(skip).limit(limit);
  const total = await Product.countDocuments(query);
  res.json({ products, page, totalPages: Math.ceil(total / limit), total });
};

// @desc    Create product
const createProduct = async (req, res) => {
  const { name, sku, category, price, stock, minStock, description } = req.body;
  const product = await Product.create({ name, sku, category, price, stock, minStock, description });
  // Check low stock alert
  if (product.stock <= product.minStock) {
    getIO().emit('lowStock', { productId: product._id, name: product.name, stock: product.stock });
  }
  res.status(201).json(product);
};

// @desc    Update product & check low stock
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const oldStock = product.stock;
  Object.assign(product, req.body);
  await product.save();
  if (product.stock <= product.minStock && oldStock > product.minStock) {
    getIO().emit('lowStock', { productId: product._id, name: product.name, stock: product.stock });
  }
  res.json(product);
};

// @desc    Delete product
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
};

// @desc    Upload product image
const uploadProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (req.file) {
    product.imageUrl = `/uploads/${req.file.filename}`;
    await product.save();
  }
  res.json({ imageUrl: product.imageUrl });
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage };