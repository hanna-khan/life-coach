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
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || IS_DEVELOPER) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
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

// MongoDB connection - always connect for database operations
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      if (!IS_DEVELOPER) {
        process.exit(1);
      }
      return;
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (IS_DEVELOPER) {
      console.log('⚠️  Developer mode: Continuing without MongoDB (some features may not work)');
    } else {
      console.error('💥 Fatal: Database connection failed. Exiting...');
      process.exit(1);
    }
  }
};

connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Life Coach API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      blogs: '/api/blogs',
      bookings: '/api/bookings',
      contact: '/api/contact',
      payments: '/api/payments',
      pricing: '/api/pricing',
      admin: '/api/admin'
    },
    developerMode: IS_DEVELOPER
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
// Auth route - always available (needed for login/register)
app.use('/api/auth', require('./routes/auth'));

// Admin Auth route - always available (needed for admin login)
app.use('/api/admin-auth', require('./routes/adminAuth'));

// Pricing route - always available (needs database)
app.use('/api/pricing', require('./routes/pricing'));

// Blogs route - always available (needs database for admin endpoints)
app.use('/api/blogs', require('./routes/blogs'));

// Payments route - always available (needs database and Stripe)
app.use('/api/payments', require('./routes/payments'));

// Bookings route - always available (needs database for Stripe integration)
app.use('/api/bookings', require('./routes/bookings'));

if (IS_DEVELOPER) {
  // In developer mode, use mock routes for some endpoints
  console.log('🔧 Developer mode: Using mock API routes for some endpoints');
  app.use('/api/contact', require('./routes/dev'));
  app.use('/api/admin', require('./routes/dev'));
} else {
  // Production routes
  app.use('/api/contact', require('./routes/contact'));
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
