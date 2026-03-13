const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const adminAuth = require('../middleware/adminAuth');

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

router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get various statistics from database
    const [
      totalUsers,
      totalBlogs,
      totalBookings,
      totalContacts,
      publishedBlogs,
      draftBlogs,
      pendingBookings,
      confirmedBookings,
      newContacts,
      readContacts
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Booking.countDocuments(),
      Contact.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'read' })
    ]);

    // Get recent activities
    const recentBlogs = await Blog.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get total revenue (all-time)
    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    // Get monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    // Get previous month revenue
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    previousMonth.setDate(1);
    previousMonth.setHours(0, 0, 0, 0);
    const previousMonthEnd = new Date(currentMonth);
    previousMonthEnd.setDate(0);
    previousMonthEnd.setHours(23, 59, 59, 999);

    const previousMonthRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: previousMonth, $lt: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const prevRevenue = previousMonthRevenue[0]?.total || 0;
    const monthlyGrowth = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? 100 : 0;

    // Get booking status breakdown
    const bookingStatusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      completed: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0
    };
    bookingStatusBreakdown.forEach(item => {
      if (item._id === 'completed' || item._id === 'confirmed') {
        statusMap.completed += item.count;
      } else if (item._id === 'pending') {
        statusMap.pending = item.count;
      } else if (item._id === 'cancelled') {
        statusMap.cancelled = item.count;
      }
    });

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalBlogs,
          totalBookings,
          totalContacts,
          publishedBlogs,
          draftBlogs,
          pendingBookings,
          confirmedBookings,
          newContacts,
          readContacts,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: currentRevenue,
          previousMonthRevenue: prevRevenue,
          monthlyGrowth: parseFloat(monthlyGrowth),
          bookingStatusBreakdown: statusMap
        },
        recentActivities: {
          blogs: recentBlogs,
          bookings: recentBookings,
          contacts: recentContacts
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data from database
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Get monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$price' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Weekly bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // User growth (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: fourWeeksAgo }
        }
      },
      {
        $group: {
          _id: { $week: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Blog stats by category
    const blogStats = await Blog.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Booking stats by service type
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        blogStats: blogStats,
        bookingStats: bookingStats,
        monthlyRevenue: monthlyRevenue,
        weeklyBookings: weeklyBookings,
        userGrowth: userGrowth.map(g => g.count),
        conversionRate: 0,
        blogEngagement: 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Theme routes (use real database for theme)
const Theme = require('../models/Theme');

// @route   GET /api/admin/theme
// @desc    Get current theme
// @access  Private (Admin)
router.get('/theme', adminAuth, async (req, res) => {
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
router.put('/theme', adminAuth, async (req, res) => {
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
