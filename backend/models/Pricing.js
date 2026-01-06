const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a package name'],
    trim: true,
    maxlength: [100, 'Package name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration']
  },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'biweekly', 'monthly'],
    default: 'one-time'
  },
  sessions: {
    type: Number,
    default: 1,
    min: [1, 'Sessions must be at least 1']
  },
  features: [{
    type: String,
    trim: true
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pricing', pricingSchema);

