const express = require('express');
const Booking = require('../models/Booking');
const { auth, adminAuth } = require('../middleware/auth');

// Initialize Stripe only if valid secret key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  Stripe secret key not configured or invalid. Payment features will not work.');
  console.warn('   Expected format: sk_test_... or sk_live_...');
}

const router = express.Router();

// @route   POST /api/payments/create-session
// @desc    Create Stripe checkout session
// @access  Public
router.post('/create-session', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe is not initialized. Check STRIPE_SECRET_KEY in .env file.');
      return res.status(500).json({ 
        message: 'Payment service not configured',
        error: 'Stripe secret key is missing or invalid. Should start with sk_test_ or sk_live_'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.duration) {
      return res.status(400).json({ message: 'Booking duration is missing' });
    }

    if (!booking.price || booking.price <= 0) {
      return res.status(400).json({ message: 'Invalid booking price' });
    }

    // Format date for display
    const bookingDate = booking.preferredDate instanceof Date 
      ? booking.preferredDate 
      : new Date(booking.preferredDate);
    const formattedDate = bookingDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${booking.serviceType} - ${booking.duration} minutes`,
              description: `Life coaching session scheduled for ${formattedDate} at ${booking.preferredTime}`,
            },
            unit_amount: Math.round(booking.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
      metadata: {
        bookingId: booking._id.toString(),
      },
      customer_email: booking.clientEmail,
    });

    // Update booking with session ID
    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Create payment session error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      await handleFailedPayment(paymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper function to handle successful payment
async function handleSuccessfulPayment(session) {
  try {
    const booking = await Booking.findOne({ stripeSessionId: session.id });
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
      
      // Here you could send confirmation emails, create calendar events, etc.
      console.log(`Payment successful for booking ${booking._id}`);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Helper function to handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    // Find booking by metadata or other means
    console.log('Payment failed:', paymentIntent.id);
    // Update booking status accordingly
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// @route   GET /api/payments/session/:sessionId
// @desc    Get session details
// @access  Public
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status === 'paid') {
      const booking = await Booking.findOne({ stripeSessionId: session.id });
      res.json({
        success: true,
        paid: true,
        booking
      });
    } else {
      res.json({
        success: true,
        paid: false
      });
    }
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/stats
// @desc    Get payment statistics (admin only)
// @access  Private (Admin)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const paidBookings = await Booking.countDocuments({ paymentStatus: 'paid' });
    const pendingPayments = await Booking.countDocuments({ paymentStatus: 'pending' });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        paidBookings,
        pendingPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
