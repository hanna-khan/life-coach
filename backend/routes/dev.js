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
  res.json({
    success: true,
    dashboard: {
      stats: {
        totalUsers: 150,
        totalBlogs: 25,
        totalBookings: 89,
        totalContacts: 45,
        publishedBlogs: 20,
        draftBlogs: 5,
        pendingBookings: 12,
        confirmedBookings: 77,
        newContacts: 8,
        readContacts: 37,
        monthlyRevenue: 12500
      },
      recentActivities: {
        blogs: mockBlogs.slice(0, 3),
        bookings: mockBookings,
        contacts: mockContacts
      }
    }
  });
});

module.exports = router;
