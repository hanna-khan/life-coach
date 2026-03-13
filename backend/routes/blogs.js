const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category;
    const search = req.query.search;

    let query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured blogs
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(3);

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to strip HTML and get text length
const getTextLength = (html) => {
  if (!html) return 0;
  // Remove HTML tags and decode entities
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length;
};

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private (Admin)
router.post('/', adminAuth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('excerpt').trim().isLength({ min: 10 }).withMessage('Excerpt must be at least 10 characters'),
  body('content').custom((value) => {
    const textLength = getTextLength(value);
    if (textLength < 50) {
      throw new Error('Content must be at least 50 characters (excluding HTML tags)');
    }
    return true;
  }),
  body('category').isIn(['Personal Growth', 'Career', 'Relationships', 'Health', 'Mindfulness', 'Success']).withMessage('Invalid category'),
  body('featuredImage').custom((value) => {
    // Accept either URL or base64 data URL
    if (!value) {
      throw new Error('Please provide a featured image');
    }
    const isUrl = /^https?:\/\/.+/.test(value);
    const isBase64 = /^data:image\/[a-z]+;base64,.+/.test(value);
    if (!isUrl && !isBase64) {
      throw new Error('Please provide a valid image URL or base64 data');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Handle author field - Blog author refs User; admin may be AdminUser so resolve to User
    const mongoose = require('mongoose');
    const User = require('../models/User');
    let authorId = req.user.id;

    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected. Please check your database connection.');
    }

    const isValidUser = authorId && mongoose.Types.ObjectId.isValid(authorId) && authorId !== 'dev-user-id' && authorId !== 'dev-admin-id';
    const existingUser = isValidUser ? await User.findById(authorId) : null;
    if (authorId === 'dev-user-id' || authorId === 'dev-admin-id' || !mongoose.Types.ObjectId.isValid(authorId) || !existingUser) {
      try {
        let adminUser = await User.findOne({ role: 'admin' }).limit(1);
        if (!adminUser) {
          adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@lifecoach.com',
            password: 'temp123456',
            role: 'admin'
          });
        }
        authorId = adminUser._id;
      } catch (userError) {
        console.error('Error resolving blog author:', userError);
        throw new Error(`Failed to set blog author: ${userError.message}`);
      }
    }

    // Generate slug from title if not provided
    const generateSlug = (title) => {
      if (!title) return '';
      return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    };

    const blogData = {
      ...req.body,
      author: authorId,
      // Ensure slug is generated from title
      slug: req.body.slug || generateSlug(req.body.title)
    };

    console.log('Creating blog with data:', {
      title: blogData.title,
      slug: blogData.slug,
      author: authorId,
      category: blogData.category,
      status: blogData.status
    });

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name');

    res.status(201).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('❌ Create blog error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Send detailed error in development
    const errorResponse = {
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        stack: error.stack
      } : undefined
    };
    
    res.status(500).json(errorResponse);
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private (Admin)
router.put('/:id', adminAuth, [
  body('title').optional().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('excerpt').optional().trim().isLength({ min: 10 }).withMessage('Excerpt must be at least 10 characters'),
  body('content').optional().custom((value) => {
    if (!value) return true; // Optional field, skip if not provided
    const textLength = getTextLength(value);
    if (textLength < 50) {
      throw new Error('Content must be at least 50 characters (excluding HTML tags)');
    }
    return true;
  }),
  body('category').optional().isIn(['Personal Growth', 'Career', 'Relationships', 'Health', 'Mindfulness', 'Success']).withMessage('Invalid category'),
  body('featuredImage').optional().custom((value) => {
    if (!value) return true;
    const isUrl = /^https?:\/\/.+/.test(value);
    const isBase64 = /^data:image\/[a-z]+;base64,.+/.test(value);
    if (!isUrl && !isBase64) {
      throw new Error('Please provide a valid image URL or base64 data');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/admin/all
// @desc    Get all blogs for admin
// @access  Private (Admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
