// backend/seeder.js
const User = require('./models/User');
const connectDB = require('./config/db');
connectDB();
const createAdmin = async () => {
  await User.create({
    name: 'Admin',
    email: 'admin@erp.com',
    password: 'admin123',
    role: 'admin'
  });
  console.log('Admin created');
  process.exit();
};
createAdmin();