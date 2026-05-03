const Joi = require('joi');

// User validation (register)
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'employee').default('employee')
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Product validation
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  sku: Joi.string().max(50).required(),
  category: Joi.string().max(50).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  minStock: Joi.number().integer().min(0).default(5),
  description: Joi.string().max(500).optional()
});

// Order validation
const orderItemSchema = Joi.object({
  productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  quantity: Joi.number().integer().min(1).required()
});

const orderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required(),
  customerEmail: Joi.string().email().optional(),
  items: Joi.array().items(orderItemSchema).min(1).required()
});

// Order status update validation
const orderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

// Employee validation
const employeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
  position: Joi.string().max(50).optional(),
  department: Joi.string().max(50).optional(),
  salary: Joi.number().positive().required(),
  joiningDate: Joi.date().iso().optional(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

// Attendance validation
const attendanceSchema = Joi.object({
  employeeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  date: Joi.date().iso().required(),
  status: Joi.string().valid('present', 'absent', 'half-day').default('absent'),
  checkInTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  checkOutTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
});

// Salary validation
const salarySchema = Joi.object({
  employeeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  basic: Joi.number().positive().optional(),
  allowances: Joi.number().min(0).optional(),
  deductions: Joi.number().min(0).optional(),
  netSalary: Joi.number().positive().optional(),
  paymentDate: Joi.date().iso().optional(),
  status: Joi.string().valid('paid', 'pending').default('pending')
});

// Transaction validation (income/expense)
const transactionSchema = Joi.object({
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().max(50).required(),
  amount: Joi.number().positive().required(),
  date: Joi.date().iso().default(Date.now),
  description: Joi.string().max(200).optional(),
  reference: Joi.string().max(100).optional()
});

// Supplier validation
const supplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  contactPerson: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
  address: Joi.string().max(200).optional()
});

// Purchase Order validation
const purchaseItemSchema = Joi.object({
  productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  name: Joi.string().max(100).required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().positive().required()
});

const purchaseOrderSchema = Joi.object({
  supplierId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  orderDate: Joi.date().iso().default(Date.now),
  items: Joi.array().items(purchaseItemSchema).min(1).required(),
  totalAmount: Joi.number().positive().optional(),
  status: Joi.string().valid('pending', 'received', 'cancelled').default('pending'),
  receivedDate: Joi.date().iso().optional()
});

// Export all schemas
module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  orderSchema,
  orderStatusSchema,
  employeeSchema,
  attendanceSchema,
  salarySchema,
  transactionSchema,
  supplierSchema,
  purchaseOrderSchema
};