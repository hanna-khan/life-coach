const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    videoUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Video URL cannot be more than 500 characters']
    },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  role: {
    type: String,
    trim: true,
    maxlength: [200, 'Role/location cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please share your experience'],
    trim: true,
    minlength: [20, 'Experience must be at least 20 characters'],
    maxlength: [1000, 'Experience cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);

