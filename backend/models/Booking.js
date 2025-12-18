const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Please provide client name'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Please provide client email'],
    lowercase: true
  },
  clientPhone: {
    type: String,
    required: [true, 'Please provide client phone']
  },
  serviceType: {
    type: String,
    required: [true, 'Please select a service type']
    // Removed enum to allow dynamic package names from Pricing model
  },
  preferredDate: {
    type: Date,
    required: [true, 'Please select a preferred date']
  },
  preferredTime: {
    type: String,
    required: [true, 'Please select a preferred time'],
    enum: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  stripeSessionId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
