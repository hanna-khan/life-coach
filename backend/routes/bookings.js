const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Public
router.post('/', [
  body('clientName').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('clientEmail').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('clientPhone').trim().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('preferredDate').isISO8601().withMessage('Please provide a valid date'),
  body('preferredTime').isIn(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']).withMessage('Please select a valid time'),
  body('packageId').optional().isMongoId().withMessage('Invalid package ID'),
  body('serviceType').optional().isString().withMessage('Service type must be a string'),
  body('duration').optional().isIn([30, 60, 90]).withMessage('Duration must be 30, 60, or 90 minutes'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot be more than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let serviceType = req.body.serviceType;
    let duration = req.body.duration;
    let price = req.body.price;

    // If packageId is provided, fetch pricing from package
    if (req.body.packageId) {
      const pricingPackage = await Pricing.findById(req.body.packageId);
      if (!pricingPackage || !pricingPackage.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive pricing package' });
      }
      
      serviceType = pricingPackage.name;
      duration = pricingPackage.duration;
      price = pricingPackage.price;
    } else {
      // Fallback to hardcoded pricing if no packageId
      const pricing = {
        'Initial Consultation': { 30: 75, 60: 150, 90: 200 },
        'Life Coaching Session': { 30: 100, 60: 180, 90: 250 },
        'Career Guidance': { 30: 90, 60: 160, 90: 220 },
        'Relationship Coaching': { 30: 95, 60: 170, 90: 240 },
        'Goal Setting Session': { 30: 85, 60: 150, 90: 210 }
      };

      if (!serviceType) {
        return res.status(400).json({ message: 'Service type or package ID is required' });
      }

      duration = duration || 60;
      if (!pricing[serviceType] || !pricing[serviceType][duration]) {
        return res.status(400).json({ message: 'Invalid service type or duration combination' });
      }
      price = pricing[serviceType][duration];
    }

    const bookingData = {
      clientName: req.body.clientName,
      clientEmail: req.body.clientEmail,
      clientPhone: req.body.clientPhone,
      serviceType: serviceType,
      preferredDate: req.body.preferredDate,
      preferredTime: req.body.preferredTime,
      duration: duration,
      price: price,
      message: req.body.message || '',
      status: 'pending',
      paymentStatus: 'pending'
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private (Admin)
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin)
router.put('/:id/status', auth, adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('meetingLink').optional().isURL().withMessage('Please provide a valid meeting link')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { status: req.body.status };
    if (req.body.meetingLink) {
      updateData.meetingLink = req.body.meetingLink;
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/available-times/:date
// @desc    Get available times for a specific date
// @access  Public
router.get('/available-times/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

    // Find bookings for the specific date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      preferredDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending'] }
    });

    const bookedTimes = bookings.map(booking => booking.preferredTime);
    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

    res.json({
      success: true,
      availableTimes
    });
  } catch (error) {
    console.error('Get available times error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
