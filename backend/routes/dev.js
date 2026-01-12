const express = require('express');
const router = express.Router();

// Mock data for developer mode
const mockBlogs = [
  {
    _id: '1',
    title: 'The Power of Mindful Living',
    excerpt: 'Discover how mindfulness can transform your daily life and bring peace to your mind.',
    content: 'Mindfulness is more than just a buzzword...',
    category: 'Mindfulness',
    tags: ['mindfulness', 'meditation', 'peace'],
    featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    status: 'published',
    isFeatured: true,
    author: { name: 'Life Coach' },
    publishedAt: new Date(),
    readTime: 5,
    views: 150,
    likes: 25
  },
  {
    _id: '2',
    title: 'Building Confidence in Your Career',
    excerpt: 'Learn practical strategies to boost your confidence and advance in your professional life.',
    content: 'Confidence is not something you\'re born with...',
    category: 'Career',
    tags: ['career', 'confidence', 'success'],
    featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    status: 'published',
    isFeatured: true,
    author: { name: 'Life Coach' },
    publishedAt: new Date(),
    readTime: 7,
    views: 200,
    likes: 30
  }
];

const mockBookings = [
  {
    _id: '1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+1234567890',
    serviceType: 'Life Coaching Session',
    preferredDate: new Date(),
    preferredTime: '14:00',
    duration: 60,
    price: 150,
    status: 'pending',
    paymentStatus: 'pending'
  }
];

const mockContacts = [
  {
    _id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Interested in coaching',
    message: 'I would like to learn more about your services.',
    status: 'new',
    isRead: false
  }
];

// Mock API routes for developer mode
router.get('/blogs', (req, res) => {
  res.json({
    success: true,
    blogs: mockBlogs,
    pagination: {
      current: 1,
      pages: 1,
      total: mockBlogs.length
    }
  });
});

router.get('/blogs/featured', (req, res) => {
  res.json({
    success: true,
    blogs: mockBlogs.filter(blog => blog.isFeatured)
  });
});

router.get('/blogs/:slug', (req, res) => {
  const blog = mockBlogs.find(b => b.title.toLowerCase().replace(/\s+/g, '-') === req.params.slug);
  if (blog) {
    res.json({ success: true, blog });
  } else {
    res.status(404).json({ message: 'Blog not found' });
  }
});

router.get('/bookings', (req, res) => {
  res.json({
    success: true,
    bookings: mockBookings,
    pagination: {
      current: 1,
      pages: 1,
      total: mockBookings.length
    }
  });
});

router.get('/contact', (req, res) => {
  res.json({
    success: true,
    contacts: mockContacts,
    pagination: {
      current: 1,
      pages: 1,
      total: mockContacts.length
    }
  });
});

router.get('/dashboard', (req, res) => {
  const monthlyRevenue = 12500;
  const previousMonthRevenue = 10800;
  const monthlyGrowth = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1);
  const totalRevenue = 125000; // All-time revenue

  res.json({
    success: true,
    dashboard: {
      stats: {
        totalUsers: 150, // From User table
        totalBlogs: 25, // From Blog table
        totalBookings: 89, // From Booking table
        totalContacts: 45,
        publishedBlogs: 20, // From Blog table
        draftBlogs: 5, // From Blog table
        pendingBookings: 12, // From Booking table
        confirmedBookings: 77, // From Booking table
        newContacts: 8,
        readContacts: 37,
        totalRevenue: totalRevenue, // All-time revenue from Booking table
        monthlyRevenue: monthlyRevenue, // Current month revenue from Booking table
        previousMonthRevenue: previousMonthRevenue,
        monthlyGrowth: parseFloat(monthlyGrowth),
        bookingStatusBreakdown: {
          completed: 60, // From Booking table
          pending: 12, // From Booking table
          cancelled: 17 // From Booking table
        }
      },
      recentActivities: {
        blogs: mockBlogs.slice(0, 3),
        bookings: mockBookings,
        contacts: mockContacts
      }
    }
  });
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data (mock for developer mode)
router.get('/analytics', (req, res) => {
  // Generate mock monthly revenue data for last 6 months
  const monthlyRevenue = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyRevenue.push({
      _id: {
        year: date.getFullYear(),
        month: date.getMonth() + 1
      },
      revenue: Math.floor(Math.random() * 5000) + 5000, // Random between 5000-10000
      bookings: Math.floor(Math.random() * 20) + 10
    });
  }

  // Weekly bookings (last 7 days) - get bookings per day
  const weeklyBookings = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayOfWeek = dayStart.getDay();
    // MongoDB $dayOfWeek returns 1=Sunday, 2=Monday, etc., so we add 1
    weeklyBookings.push({
      _id: dayOfWeek === 0 ? 1 : dayOfWeek + 1, // Convert to MongoDB format (1=Sunday, 2=Monday, etc.)
      count: Math.floor(Math.random() * 10) + 5
    });
  }

  // User growth (last 4 weeks) - cumulative
  const userGrowth = [];
  let cumulative = 50;
  for (let week = 0; week < 4; week++) {
    cumulative += Math.floor(Math.random() * 15) + 5;
    userGrowth.push(cumulative);
  }

  res.json({
    success: true,
    analytics: {
      blogStats: [
        { _id: 'Personal Growth', count: 8, totalViews: 1200 },
        { _id: 'Career', count: 6, totalViews: 900 },
        { _id: 'Relationships', count: 5, totalViews: 750 },
        { _id: 'Health', count: 4, totalViews: 600 },
        { _id: 'Mindfulness', count: 2, totalViews: 300 }
      ],
      bookingStats: [
        { _id: 'Life Coaching Session', count: 45, totalRevenue: 6750 },
        { _id: 'Career Guidance', count: 25, totalRevenue: 3750 },
        { _id: 'Relationship Coaching', count: 15, totalRevenue: 2250 },
        { _id: 'Initial Consultation', count: 4, totalRevenue: 600 }
      ],
      monthlyRevenue,
      weeklyBookings,
      userGrowth,
      bookingStatusBreakdown: [
        { _id: 'completed', count: 60 },
        { _id: 'pending', count: 12 },
        { _id: 'cancelled', count: 8 }
      ],
      conversionRate: 12.5,
      blogEngagement: 78
    }
  });
});

// Theme routes (use real database for theme)
const Theme = require('../models/Theme');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/admin/theme
// @desc    Get current theme
// @access  Private (Admin)
router.get('/theme', auth, adminAuth, async (req, res) => {
  try {
    const theme = await Theme.getTheme();
    res.json(theme);
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/theme
// @desc    Update theme
// @access  Private (Admin)
router.put('/theme', auth, adminAuth, async (req, res) => {
  try {
    const { selectedTheme } = req.body;
    
    if (!selectedTheme) {
      return res.status(400).json({ message: 'Theme selection is required' });
    }

    const theme = await Theme.updateTheme(selectedTheme, req.user.id);
    res.json(theme);
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
