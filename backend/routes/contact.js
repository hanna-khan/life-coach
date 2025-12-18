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
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
                          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">You have received a new message from your website</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px;">
                          <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                  <strong style="color: #374151; font-size: 14px; display: inline-block; width: 120px;">Name:</strong>
                                  <span style="color: #111827; font-size: 14px; font-weight: 600;">${name}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                  <strong style="color: #374151; font-size: 14px; display: inline-block; width: 120px;">Email:</strong>
                                  <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600;">${email}</a>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                  <strong style="color: #374151; font-size: 14px; display: inline-block; width: 120px;">Subject:</strong>
                                  <span style="color: #111827; font-size: 14px;">${subject}</span>
                                </td>
                              </tr>
                            </table>
                          </div>
                          
                          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">Message:</h3>
                            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                          </div>
                          
                          <!-- Action Button -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 25px;">
                            <tr>
                              <td align="center">
                                <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Reply to ${name}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                            <em>This message was sent from your life coaching website contact form.</em><br>
                            <em>Reply directly to this email to respond to ${name}.</em>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                          <div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Thank You for Reaching Out!</h1>
                          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">We've received your message</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px;">
                          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                            Hi <strong style="color: #111827;">${name}</strong>,
                          </p>
                          <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                            Thank you for contacting us! We have received your message and will get back to you within <strong style="color: #1e40af;">24 hours</strong>.
                          </p>
                          
                          <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">Your Message:</h3>
                            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                          </div>
                          
                          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                              <strong>📧 What's Next?</strong><br>
                              Our team will review your message and respond as soon as possible. If you have any urgent questions, feel free to reach out directly.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px 0; color: #111827; font-size: 16px; font-weight: 600;">Best regards,</p>
                          <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 700;">Life Coach Team</p>
                          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">
                            This is an automated confirmation email. Please do not reply to this message.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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
