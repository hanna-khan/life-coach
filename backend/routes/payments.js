const express = require('express');
const Booking = require('../models/Booking');
const adminAuth = require('../middleware/adminAuth');
const emailService = require('../services/emailService');
const calendlyService = require('../services/calendlyService');

// Initialize Stripe only if valid secret key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  Stripe secret key not configured or invalid. Payment features will not work.');
  console.warn('   Expected format: sk_test_... or sk_live_...');
}

const router = express.Router();

// Base URL for Stripe redirects (success/cancel). In production, never use localhost.
function getRedirectBaseUrl() {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    return 'https://lukewestbrookmanhattan.com';
  }
  return url.replace(/\/$/, ''); // strip trailing slash
}

// IMPORTANT: GET routes should be defined before POST routes to avoid conflicts
// @route   GET /api/payments/session/:sessionId
// @desc    Get session details and verify payment
// @access  Public
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`🔍 Payment verification request for session: ${sessionId}`);
    
    if (!sessionId || sessionId.trim() === '') {
      console.error('❌ Session ID is missing or empty');
      return res.status(400).json({ 
        success: false,
        message: 'Session ID is required'
      });
    }

    if (!stripe) {
      console.error('❌ Stripe is not initialized');
      return res.status(500).json({ 
        success: false,
        message: 'Payment service not configured',
        error: 'Stripe is not initialized'
      });
    }

    console.log(`🔍 Retrieving Stripe session: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`✅ Session retrieved. Payment status: ${session.payment_status}`);
    
    let booking = null;
    
    // Try to find booking by metadata first
    if (session.metadata && session.metadata.bookingId) {
      booking = await Booking.findById(session.metadata.bookingId);
    }
    
    // Fallback: find by session ID
    if (!booking) {
      booking = await Booking.findOne({ stripeSessionId: session.id });
    }
    
    // Check payment status
    const isPaid = session.payment_status === 'paid';
    
    if (isPaid) {
      // Ensure booking is updated to paid status
      if (booking) {
        if (booking.paymentStatus !== 'paid') {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          
          // Generate Calendly booking link if not already created
          if (calendlyService.isConfigured() && !booking.meetingLink) {
            try {
              console.log(`📅 Generating Calendly booking link for booking ${booking._id}...`);
              const bookingLink = await calendlyService.createEventAndGetMeetingLink(booking);
              
              if (bookingLink) {
                booking.meetingLink = bookingLink;
                console.log(`✅ Calendly booking link added to booking: ${bookingLink}`);
              }
            } catch (calendlyError) {
              console.error('❌ Calendly integration failed:', calendlyError.message);
              // Continue with booking confirmation even if Calendly fails
            }
          }
          
          await booking.save();
          
          // Send confirmation email (includes meeting link if available)
          try {
            await emailService.sendBookingConfirmation(booking);
          } catch (error) {
            console.error('❌ Email sending failed:', error.message);
          }
          
          console.log(`✅ Updated booking ${booking._id} to paid status`);
          if (booking.meetingLink) {
            console.log(`   Meeting Link: ${booking.meetingLink}`);
          }
        }
        
        res.json({
          success: true,
          paid: true,
          booking: booking.toObject ? booking.toObject() : booking
        });
      } else {
        // Payment is paid but booking not found - this shouldn't happen but handle it
        console.warn(`⚠️  Payment paid but booking not found for session ${session.id}`);
        res.json({
          success: true,
          paid: true,
          booking: null,
          message: 'Payment successful but booking not found. Please contact support.'
        });
      }
    } else {
      // Payment not completed
      res.json({
        success: true,
        paid: false,
        paymentStatus: session.payment_status,
        booking: booking ? (booking.toObject ? booking.toObject() : booking) : null,
        message: `Payment status: ${session.payment_status}`
      });
    }
  } catch (error) {
    console.error('❌ Get session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

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
      success_url: `${getRedirectBaseUrl()}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getRedirectBaseUrl()}/booking/cancel`,
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
    let booking = null;
    
    // First try to find by bookingId from metadata (more reliable)
    if (session.metadata && session.metadata.bookingId) {
      booking = await Booking.findById(session.metadata.bookingId);
    }
    
    // Fallback: find by session ID
    if (!booking) {
      booking = await Booking.findOne({ stripeSessionId: session.id });
    }
    
    if (booking) {
      // Only update if payment is actually completed
      if (session.payment_status === 'paid') {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        
        // Generate Calendly booking link
        if (calendlyService.isConfigured()) {
          try {
            console.log(`📅 Generating Calendly booking link for booking ${booking._id}...`);
            const bookingLink = await calendlyService.createEventAndGetMeetingLink(booking);
            
            if (bookingLink) {
              booking.meetingLink = bookingLink;
              console.log(`✅ Calendly booking link added to booking: ${bookingLink}`);
            }
          } catch (calendlyError) {
            console.error('❌ Calendly integration failed:', calendlyError.message);
            // Continue with booking confirmation even if Calendly fails
            // Admin can manually add booking link later
          }
        } else {
          console.warn('⚠️  Calendly is not configured. Skipping Calendly booking link generation.');
        }
        
        await booking.save();
        
        // Send confirmation email (includes meeting link if available)
        try {
          await emailService.sendBookingConfirmation(booking);
        } catch (error) {
          console.error('❌ Email sending failed:', error.message);
          // Continue even if email fails
        }
        
        console.log(`✅ Payment successful for booking ${booking._id}`);
        console.log(`   Client: ${booking.clientName} (${booking.clientEmail})`);
        console.log(`   Amount: $${booking.price}`);
        console.log(`   Status: ${booking.status}`);
        if (booking.meetingLink) {
          console.log(`   Meeting Link: ${booking.meetingLink}`);
        }
      } else {
        console.log(`⚠️  Payment session completed but status is: ${session.payment_status}`);
      }
    } else {
      console.error(`❌ Booking not found for session ${session.id}`);
    }
  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
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

// @route   GET /api/payments/stats
// @desc    Get payment statistics (admin only)
// @access  Private (Admin)
router.get('/stats', adminAuth, async (req, res) => {
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
