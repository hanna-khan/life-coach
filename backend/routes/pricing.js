const express = require('express');
const { body, validationResult } = require('express-validator');
const Pricing = require('../models/Pricing');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/pricing
// @desc    Get all active pricing packages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const packages = await Pricing.find({ isActive: true })
      .sort({ price: 1 });

    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pricing/admin/all
// @desc    Get all pricing packages (admin)
// @access  Private (Admin)
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const packages = await Pricing.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error('Get admin pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/pricing
// @desc    Create new pricing package
// @access  Private (Admin)
router.post('/', auth, adminAuth, [
  body('name').trim().isLength({ min: 3 }).withMessage('Package name must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('features').isArray().withMessage('Features must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const packageData = {
      ...req.body,
      features: Array.isArray(req.body.features) 
        ? req.body.features 
        : (typeof req.body.features === 'string' 
          ? req.body.features.split('\n').filter(f => f.trim())
          : [])
    };

    const pricingPackage = await Pricing.create(packageData);

    res.status(201).json({
      success: true,
      package: pricingPackage
    });
  } catch (error) {
    console.error('Create pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/pricing/:id
// @desc    Update pricing package
// @access  Private (Admin)
router.put('/:id', auth, adminAuth, [
  body('name').optional().trim().isLength({ min: 3 }).withMessage('Package name must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  body('features').optional().isArray().withMessage('Features must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };
    
    // Handle features if it's a string
    if (updateData.features && typeof updateData.features === 'string') {
      updateData.features = updateData.features.split('\n').filter(f => f.trim());
    }

    const pricingPackage = await Pricing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!pricingPackage) {
      return res.status(404).json({ message: 'Pricing package not found' });
    }

    res.json({
      success: true,
      package: pricingPackage
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/pricing/:id
// @desc    Delete pricing package
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const pricingPackage = await Pricing.findByIdAndDelete(req.params.id);

    if (!pricingPackage) {
      return res.status(404).json({ message: 'Pricing package not found' });
    }

    res.json({
      success: true,
      message: 'Pricing package deleted successfully'
    });
  } catch (error) {
    console.error('Delete pricing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

