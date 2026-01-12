const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const Theme = require('../models/Theme');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Get various statistics
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

    // Get total revenue (all-time) from bookings table
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

    // Get previous month revenue for growth calculation
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
          totalUsers, // From User table
          totalBlogs, // From Blog table
          totalBookings, // From Booking table
          totalContacts,
          publishedBlogs, // From Blog table
          draftBlogs, // From Blog table
          pendingBookings, // From Booking table
          confirmedBookings, // From Booking table
          newContacts,
          readContacts,
          totalRevenue: totalRevenue[0]?.total || 0, // All-time revenue from Booking table
          monthlyRevenue: currentRevenue, // Current month revenue from Booking table
          previousMonthRevenue: prevRevenue,
          monthlyGrowth: parseFloat(monthlyGrowth),
          bookingStatusBreakdown: statusMap // From Booking table
        },
        recentActivities: {
          blogs: recentBlogs,
          bookings: recentBookings,
          contacts: recentContacts
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Get total counts first
    const [totalBlogs, totalBookings, totalContacts] = await Promise.all([
      Blog.countDocuments(),
      Booking.countDocuments(),
      Contact.countDocuments()
    ]);

    // Blog analytics
    const blogStats = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // Booking analytics
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    // Monthly revenue for the last 6 months
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
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Weekly bookings (last 7 days) - get bookings per day
    const weeklyBookings = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const count = await Booking.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });
      
      // Get day of week (0=Sunday, 1=Monday, etc.)
      const dayOfWeek = dayStart.getDay();
      // MongoDB $dayOfWeek returns 1=Sunday, 2=Monday, etc., so we add 1
      weeklyBookings.push({
        _id: dayOfWeek === 0 ? 1 : dayOfWeek + 1, // Convert to MongoDB format (1=Sunday, 2=Monday, etc.)
        count: count
      });
    }

    // User growth (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: fourWeeksAgo }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      }
    ]);

    // Get total users count for cumulative growth
    const totalUsers = await User.countDocuments();
    const userGrowthCumulative = [];
    let cumulative = totalUsers - userGrowth.reduce((sum, item) => sum + item.count, 0);
    
    for (let i = 0; i < 4; i++) {
      const weekData = userGrowth.find((ug, idx) => idx === i);
      if (weekData) {
        cumulative += weekData.count;
      }
      userGrowthCumulative.push(cumulative);
    }

    // Booking status breakdown
    const bookingStatusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate conversion rate (bookings / contacts)
    const conversionRate = totalContacts > 0 
      ? ((totalBookings / totalContacts) * 100).toFixed(1)
      : 0;

    // Calculate blog engagement (average views per blog)
    const totalBlogViews = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);
    const avgViewsPerBlog = totalBlogs > 0 && totalBlogViews[0]?.totalViews
      ? Math.round(totalBlogViews[0].totalViews / totalBlogs)
      : 0;
    // Convert to percentage (assuming 100 views = 100%)
    const blogEngagement = Math.min(avgViewsPerBlog, 100);

    res.json({
      success: true,
      analytics: {
        blogStats,
        bookingStats,
        monthlyRevenue,
        weeklyBookings,
        userGrowth: userGrowthCumulative,
        bookingStatusBreakdown,
        conversionRate: parseFloat(conversionRate),
        blogEngagement: parseInt(blogEngagement)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/seed-data
// @desc    Seed initial data for development
// @access  Private (Admin)
router.post('/seed-data', auth, adminAuth, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }

    // Create sample blogs
    const sampleBlogs = [
      {
        title: "The Power of Mindful Living",
        excerpt: "Discover how mindfulness can transform your daily life and bring peace to your mind.",
        content: "Mindfulness is more than just a buzzword...",
        category: "Mindfulness",
        tags: ["mindfulness", "meditation", "peace"],
        featuredImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        status: "published",
        isFeatured: true
      },
      {
        title: "Building Confidence in Your Career",
        excerpt: "Learn practical strategies to boost your confidence and advance in your professional life.",
        content: "Confidence is not something you're born with...",
        category: "Career",
        tags: ["career", "confidence", "success"],
        featuredImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        status: "published",
        isFeatured: true
      }
    ];

    for (const blogData of sampleBlogs) {
      const existingBlog = await Blog.findOne({ title: blogData.title });
      if (!existingBlog) {
        await Blog.create({
          ...blogData,
          author: req.user.id
        });
      }
    }

    res.json({
      success: true,
      message: 'Sample data seeded successfully'
    });
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
