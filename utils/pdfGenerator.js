// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF invoice for an order
 * @param {Object} order - Order object with populated fields
 * @param {boolean} streamToResponse - If true, pipes to HTTP response; if false, returns buffer
 * @param {Object} res - Express response object (required if streamToResponse = true)
 * @returns {Promise<Buffer|void>} - Buffer if streamToResponse=false, otherwise pipes to response
 */
const generateInvoicePDF = (order, streamToResponse = true, res = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffer = null;
      
      if (!streamToResponse) {
        // Collect PDF data into buffer
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
      } else if (res) {
        // Pipe directly to HTTP response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.orderNumber}.pdf`);
        doc.pipe(res);
      } else {
        reject(new Error('When streamToResponse is true, res object is required'));
        return;
      }

      // ========== PDF Content ==========
      // Header
      doc.fontSize(20).text('ERP System Invoice', { align: 'center' });
      doc.moveDown();
      
      // Company Info (optional – customize as needed)
      doc.fontSize(10).text('Your Company Name', 50, doc.y);
      doc.text('123 Business St, City, Country');
      doc.text('Phone: +1 234 567 890 | Email: info@erp.com');
      doc.moveDown();
      
      // Order Info
      doc.fontSize(12);
      doc.text(`Order Number: ${order.orderNumber}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`Customer: ${order.customerName}`);
      if (order.customerEmail) doc.text(`Email: ${order.customerEmail}`);
      doc.moveDown();
      
      // Table Header
      const startY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Product', 50, startY);
      doc.text('Qty', 300, startY);
      doc.text('Unit Price', 350, startY);
      doc.text('Total', 450, startY);
      doc.moveDown();
      
      // Table Rows
      doc.font('Helvetica');
      let y = doc.y;
      order.items.forEach(item => {
        doc.text(item.name, 50, y);
        doc.text(item.quantity.toString(), 300, y);
        doc.text(`$${item.price.toFixed(2)}`, 350, y);
        doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 450, y);
        y += 20;
        if (y > 700) { 
          doc.addPage(); 
          y = 50; 
        }
      });
      
      doc.moveDown(2);
      doc.font('Helvetica-Bold');
      doc.fontSize(14);
      doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: 'right' });
      
      // Footer
      doc.fontSize(10);
      doc.text('Thank you for your business!', 50, doc.page.height - 50, { align: 'center' });
      
      doc.end();
      
      if (!streamToResponse) {
        // Buffer will be resolved in 'end' event
      }
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };