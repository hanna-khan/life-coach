const express = require('express');
const { body, validationResult } = require('express-validator');
const Testimonial = require('../models/Testimonial');
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// @route   POST /api/testimonials
// @desc    Create new testimonial
// @access  Public

// POST /api/testimonials (with optional video upload)
router.post('/', upload.single('video'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('role').optional().trim().isLength({ max: 200 }).withMessage('Role/location cannot be more than 200 characters'),
  body('content').trim().isLength({ min: 20, max: 1000 }).withMessage('Experience must be between 20 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If multer error, add it to errors
      if (req.fileValidationError) {
        errors.errors.push({ msg: req.fileValidationError });
      }
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    let videoUrl = '';
    if (req.file) {
      // Cloudinary URL from uploaded file
      videoUrl = req.file.path;
    }

    const testimonial = await Testimonial.create({
      name: req.body.name,
      role: req.body.role || '',
      content: req.body.content,
      videoUrl,
      status: 'approved'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for sharing your experience! It has been published on our website.',
      testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/testimonials
// @desc    Get all testimonials (public) - returns all testimonials from table
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get approved testimonials only for public view, sorted by whether they have video (video first)
    const testimonials = await Testimonial.find({ status: 'approved' })
      .sort({ videoUrl: -1, createdAt: -1 }) // Video testimonials first, then by date
      .select('name role content isFeatured createdAt status videoUrl');

    res.json({
      success: true,
      testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/testimonials/admin
// @desc    Get all testimonials (admin only)
// @access  Private (Admin)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      testimonials,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin testimonials error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/testimonials/:id/status
// @desc    Update testimonial status (admin only)
// @access  Private (Admin)
router.put('/:id/status', auth, adminAuth, [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { status: req.body.status };
    if (req.body.isFeatured !== undefined) {
      updateData.isFeatured = req.body.isFeatured;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({ 
        success: false,
        message: 'Testimonial not found' 
      });
    }

    res.json({
      success: true,
      testimonial
    });
  } catch (error) {
    console.error('Update testimonial status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false,
        message: 'Testimonial not found' 
      });
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;

