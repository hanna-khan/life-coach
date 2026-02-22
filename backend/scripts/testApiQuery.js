require('dotenv').config();
const mongoose = require('mongoose');

async function testTestimonialQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}\n`);
    
    // Create the testimonial model
    const testimonialSchema = new mongoose.Schema({
      name: String,
      role: String,
      content: String,
      videoUrl: String,
      status: String,
      isFeatured: Boolean
    }, { timestamps: true });
    
    const Testimonial = mongoose.model('Testimonial', testimonialSchema);
    
    // Test the same query the API uses
    console.log('🔍 Query: { status: "approved" }');
    const approvedTestimonials = await Testimonial.find({ status: 'approved' })
      .sort({ videoUrl: -1, createdAt: -1 })
      .select('name role content isFeatured createdAt status videoUrl');
    
    console.log(`\n📝 Found ${approvedTestimonials.length} approved testimonials\n`);
    
    approvedTestimonials.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name}`);
      console.log(`   Status: ${t.status}`);
      console.log(`   Video: ${t.videoUrl ? '✅ Yes' : '❌ No'}`);
      console.log(`   Featured: ${t.isFeatured ? '⭐ Yes' : 'No'}`);
      console.log('');
    });
    
    // Also show all testimonials for comparison
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allTestimonials = await Testimonial.find({})
      .sort({ createdAt: -1 })
      .select('name status videoUrl');
    
    console.log(`\n📊 All testimonials in database (${allTestimonials.length} total):\n`);
    allTestimonials.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} - Status: ${t.status} - Video: ${t.videoUrl ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testTestimonialQuery();
