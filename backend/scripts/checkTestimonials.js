require('dotenv').config();
const mongoose = require('mongoose');

async function checkTestimonials() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    console.log('🔄 Connecting to MongoDB...');
    console.log('📌 URI:', mongoURI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log('');
    
    // Get all testimonials
    const Testimonial = mongoose.model('Testimonial', new mongoose.Schema({}, { strict: false }));
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    
    console.log(`📝 Total testimonials in database: ${testimonials.length}`);
    console.log('');
    
    if (testimonials.length > 0) {
      console.log('📋 Recent testimonials:');
      testimonials.forEach((t, index) => {
        console.log(`\n${index + 1}. ID: ${t._id}`);
        console.log(`   Name: ${t.name}`);
        console.log(`   Status: ${t.status}`);
        console.log(`   Created: ${t.createdAt}`);
        console.log(`   Video: ${t.videoUrl ? 'Yes ✅' : 'No ❌'}`);
      });
    } else {
      console.log('⚠️  No testimonials found in the database!');
    }
    
    // Check collections in database
    console.log('\n📦 Collections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

checkTestimonials();
