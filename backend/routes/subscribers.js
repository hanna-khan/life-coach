const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   POST /api/subscribers
// @desc    Create newsletter subscriber
// @access  Public
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingSubscriber = await Subscriber.findOne({ email: normalizedEmail });
    if (existingSubscriber) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed.'
      });
    }

    const subscriber = await Subscriber.create({
      name: name.trim(),
      email: normalizedEmail,
      source: req.body.source || 'website-home'
    });

    return res.status(201).json({
      success: true,
      message: 'Subscribed successfully.',
      subscriber
    });
  } catch (error) {
    console.error('Create subscriber error:', error);

    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed.'
      });
    }

    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const subscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Subscriber.countDocuments();

    return res.json({
      success: true,
      subscribers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
