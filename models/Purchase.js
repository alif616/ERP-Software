const mongoose = require('mongoose');

const purchaseItemSchema = mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  quantity: Number,
  unitPrice: Number
});

const purchaseOrderSchema = mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  orderDate: { type: Date, default: Date.now },
  items: [purchaseItemSchema],
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'received', 'cancelled'], default: 'pending' },
  receivedDate: Date
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);