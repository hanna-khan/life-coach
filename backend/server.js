const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Check if running in developer mode
const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';

// Security middleware (skip in developer mode)
if (!IS_DEVELOPER) {
  app.use(helmet());
}

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting (skip in developer mode)
if (!IS_DEVELOPER) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection (optional in developer mode)
if (!IS_DEVELOPER) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/life-coach', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('🔧 Developer mode: MongoDB connection skipped');
}

// Routes
if (IS_DEVELOPER) {
  // In developer mode, use mock routes
  console.log('🔧 Developer mode: Using mock API routes');
  app.use('/api/blogs', require('./routes/dev'));
  app.use('/api/bookings', require('./routes/dev'));
  app.use('/api/contact', require('./routes/dev'));
  app.use('/api/admin', require('./routes/dev'));
} else {
  // Production routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/blogs', require('./routes/blogs'));
  app.use('/api/bookings', require('./routes/bookings'));
  app.use('/api/contact', require('./routes/contact'));
  app.use('/api/payments', require('./routes/payments'));
  app.use('/api/admin', require('./routes/admin'));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
