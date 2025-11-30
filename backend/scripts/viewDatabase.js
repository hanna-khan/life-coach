const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/lukewestbrookmanhattan',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// View database statistics
const viewDatabase = async () => {
  await connectDB();

  const User = require('../models/User');
  const Blog = require('../models/Blog');
  const Booking = require('../models/Booking');
  const Contact = require('../models/Contact');

  console.log('\n📊 Database Statistics for lukewestbrookmanhattan\n');
  console.log('='.repeat(60));

  try {
    // Users count
    const usersCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUsersCount = await User.countDocuments({ role: 'user' });
    
    console.log('\n👥 USERS:');
    console.log(`   Total Users: ${usersCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Regular Users: ${regularUsersCount}`);
    
    if (usersCount > 0) {
      const recentUsers = await User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5);
      console.log('\n   Recent Users:');
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Blogs count
    const blogsCount = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });
    const featuredBlogs = await Blog.countDocuments({ isFeatured: true });
    
    console.log('\n📝 BLOGS:');
    console.log(`   Total Blogs: ${blogsCount}`);
    console.log(`   Published: ${publishedBlogs}`);
    console.log(`   Drafts: ${draftBlogs}`);
    console.log(`   Featured: ${featuredBlogs}`);
    
    if (blogsCount > 0) {
      const recentBlogs = await Blog.find()
        .select('title category status views createdAt')
        .sort({ createdAt: -1 })
        .limit(5);
      console.log('\n   Recent Blogs:');
      recentBlogs.forEach((blog, index) => {
        console.log(`   ${index + 1}. ${blog.title} (${blog.category}) - ${blog.status} - ${blog.views} views`);
      });
    }

    // Bookings count
    const bookingsCount = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const paidBookings = await Booking.countDocuments({ paymentStatus: 'paid' });
    
    console.log('\n📅 BOOKINGS:');
    console.log(`   Total Bookings: ${bookingsCount}`);
    console.log(`   Pending: ${pendingBookings}`);
    console.log(`   Confirmed: ${confirmedBookings}`);
    console.log(`   Completed: ${completedBookings}`);
    console.log(`   Paid: ${paidBookings}`);
    
    if (bookingsCount > 0) {
      const recentBookings = await Booking.find()
        .select('clientName clientEmail serviceType status price paymentStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(5);
      console.log('\n   Recent Bookings:');
      recentBookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.clientName} - ${booking.serviceType} - ${booking.status} - $${booking.price} (${booking.paymentStatus})`);
      });
    }

    // Contacts count
    const contactsCount = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const readContacts = await Contact.countDocuments({ status: 'read' });
    const repliedContacts = await Contact.countDocuments({ status: 'replied' });
    
    console.log('\n📧 CONTACTS:');
    console.log(`   Total Contacts: ${contactsCount}`);
    console.log(`   New: ${newContacts}`);
    console.log(`   Read: ${readContacts}`);
    console.log(`   Replied: ${repliedContacts}`);
    
    if (contactsCount > 0) {
      const recentContacts = await Contact.find()
        .select('name email subject status createdAt')
        .sort({ createdAt: -1 })
        .limit(5);
      console.log('\n   Recent Contacts:');
      recentContacts.forEach((contact, index) => {
        console.log(`   ${index + 1}. ${contact.name} (${contact.email}) - ${contact.subject} - ${contact.status}`);
      });
    }

    // Database size
    const db = mongoose.connection.db;
    const stats = await db.stats();
    const dbSizeMB = (stats.dataSize / 1024 / 1024).toFixed(2);
    
    console.log('\n💾 DATABASE SIZE:');
    console.log(`   Total Size: ${dbSizeMB} MB`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Documents: ${stats.objects}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Database view complete!\n');

  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the script
viewDatabase();

