require('dotenv').config();
const mongoose = require('mongoose');

async function showConnectionDetails() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📡 MONGODB CONNECTION DETAILS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🔗 Connection String from .env:');
    console.log(`   ${mongoURI}\n`);
    
    // Parse the connection string
    if (mongoURI.includes('mongodb+srv://')) {
      console.log('📍 Type: MongoDB Atlas (Cloud)');
    } else if (mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1')) {
      console.log('📍 Type: Local MongoDB Instance');
    } else {
      console.log('📍 Type: Remote MongoDB Instance');
    }
    
    console.log('\n🔄 Connecting...\n');
    await mongoose.connect(mongoURI);
    
    console.log('✅ CONNECTED SUCCESSFULLY!');
    console.log(`📊 Database Name: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'N/A (using SRV)'}`);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 TO VIEW IN MONGODB COMPASS, CONNECT USING:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`   ${mongoURI}\n`);
    console.log('Then navigate to:');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Collection: testimonials\n`);
    
    // Count documents
    const Testimonial = mongoose.model('Testimonial', new mongoose.Schema({}, { strict: false }));
    const count = await Testimonial.countDocuments();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 TESTIMONIALS COUNT: ${count}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

showConnectionDetails();
