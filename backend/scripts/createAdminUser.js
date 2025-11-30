const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import AdminUser model
const AdminUser = require(path.join(__dirname, '../models/AdminUser'));

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/life-coach');
    console.log('✅ Connected to MongoDB');

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lifecoach.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('💡 To create a new admin, change ADMIN_EMAIL in .env file');
      console.log('💡 Or delete existing admin from database');
      process.exit(0);
    }

    // Create admin user (password will be hashed automatically)
    const adminUser = new AdminUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save hook
      isActive: true
    });

    await adminUser.save();
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminName}`);
    console.log('👑 Role: Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  SECURITY REMINDER:');
    console.log('1. Use these credentials to login at /admin-login');
    console.log('2. Change the password after first login');
    console.log('3. Keep ADMIN_PASSWORD in .env file secure');
    console.log('4. Never commit .env file to version control\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('💡 Admin with this email already exists');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();

