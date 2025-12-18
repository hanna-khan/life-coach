const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { auth, adminAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Create email transporter using SMTP
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env file');
    return null;
  }

  if (!process.env.EMAIL_HOST) {
    console.warn('⚠️  EMAIL_HOST not configured. Please set SMTP host in .env file');
    return null;
  }

  // SMTP configuration
  const transporterConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  // Add TLS options if needed
  if (process.env.EMAIL_REJECT_UNAUTHORIZED === 'false') {
    transporterConfig.tls = {
      rejectUnauthorized: false
    };
  }

  // Add debug option for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    transporterConfig.debug = true;
    transporterConfig.logger = true;
  }

  console.log(`📧 SMTP Configuration: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  
  return nodemailer.createTransport(transporterConfig);
};

// @route   POST /api/contact
// @desc    Send contact message
// @access  Public
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    // Save contact message to database
    const contact = await Contact.create({ name, email, subject, message });

    // Send email notification
    try {
      const transporter = createTransporter();
      
      if (!transporter) {
        console.warn('⚠️  Email not configured. Contact form submission saved but email not sent.');
        console.warn('   Please configure EMAIL_USER and EMAIL_PASS in .env file');
      } else {
        // Admin notification email
        // Use ADMIN_EMAIL if set, otherwise use EMAIL_USER
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        
        console.log(`📧 Sending contact form email to: ${adminEmail}`);
        console.log(`   From: ${process.env.EMAIL_USER}`);
        console.log(`   User email (Reply-To): ${email}`);
        
        const mailOptions = {
          from: `"Life Coach Website" <${process.env.EMAIL_USER}>`,
          to: adminEmail, // Send to admin
          replyTo: email, // User's email for easy reply
          subject: `New Contact Form: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">New Contact Form Submission</h2>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                <em>This message was sent from your life coaching website contact form.</em><br>
                <em>Reply directly to this email to respond to ${name}.</em>
              </p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Contact form email sent to admin: ${adminEmail}`);

        // Send confirmation email to user
        const confirmationMailOptions = {
          from: `"Life Coach" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Thank you for contacting us!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Thank you for reaching out!</h2>
              <p>Hi ${name},</p>
              <p>Thank you for contacting us. We have received your message and will get back to you within 24 hours.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your message:</strong></p>
                <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p>Best regards,<br><strong>Life Coach Team</strong></p>
            </div>
          `
        };

        await transporter.sendMail(confirmationMailOptions);
        console.log(`✅ Confirmation email sent to user: ${email}`);
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Don't fail the request if email fails - message is still saved to database
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      contact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
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

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      contacts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private (Admin)
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      contact.status = 'read';
      await contact.save();
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact message status
// @access  Private (Admin)
router.put('/:id/status', auth, adminAuth, [
  body('status').isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { status: req.body.status };
    
    if (req.body.status === 'replied') {
      updateData.repliedAt = new Date();
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/contact/:id/reply
// @desc    Reply to contact message
// @access  Private (Admin)
router.post('/:id/reply', auth, adminAuth, [
  body('replyMessage').trim().isLength({ min: 10 }).withMessage('Reply message must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Send reply email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <h2>Reply to your message</h2>
        <p>Hi ${contact.name},</p>
        <p>Thank you for contacting us. Here's our reply:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          ${req.body.replyMessage.replace(/\n/g, '<br>')}
        </div>
        <p>If you have any further questions, please don't hesitate to contact us.</p>
        <hr>
        <p>Best regards,<br>Life Coach Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Update contact status
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
