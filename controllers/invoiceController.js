const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// @desc    Generate PDF invoice for order
const generateInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('createdBy');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.orderNumber}.pdf`);
  doc.pipe(res);
  // Header
  doc.fontSize(20).text('ERP System Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Customer: ${order.customerName}`);
  doc.text(`Email: ${order.customerEmail || 'N/A'}`);
  doc.moveDown();
  // Table header
  doc.fontSize(12).text('Product', 50, doc.y);
  doc.text('Qty', 300, doc.y);
  doc.text('Price', 350, doc.y);
  doc.text('Total', 450, doc.y);
  doc.moveDown();
  let y = doc.y;
  order.items.forEach(item => {
    doc.text(item.name, 50, y);
    doc.text(item.quantity.toString(), 300, y);
    doc.text(`$${item.price.toFixed(2)}`, 350, y);
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 450, y);
    y += 20;
  });
  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: 'right' });
  doc.end();
};

module.exports = { generateInvoice };