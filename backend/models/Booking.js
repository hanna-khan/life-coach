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
    required: false
  },
  preferredTime: {
    type: String,
    required: false,
    enum: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '']
  },
  duration: {
    type: Number,
    required: false,
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
  },
  // Multi-session package tracking
  frequency: {
    type: String,
    enum: ['one-time', 'after-3-mins', 'weekly', 'biweekly', 'monthly'],
    default: 'one-time'
  },
  totalSessions: {
    type: Number,
    default: 1,
    min: [1, 'Total sessions must be at least 1']
  },
  currentSession: {
    type: Number,
    default: 1,
    min: [1, 'Current session must be at least 1']
  },
  sessionsCompleted: {
    type: Number,
    default: 0
  },
  nextSessionDate: {
    type: Date,
    default: null
  },
  lastSessionCompletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
