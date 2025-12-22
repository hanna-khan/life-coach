const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env file');
      return null;
    }

    const config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };

    // Add TLS options if needed
    if (process.env.EMAIL_REJECT_UNAUTHORIZED === 'false') {
      config.tls = {
        rejectUnauthorized: false
      };
    }

    // Debug mode for development
    if (process.env.NODE_ENV === 'development') {
      config.debug = true;
      config.logger = true;
    }

    return nodemailer.createTransport(config);
  }

  async sendBookingConfirmation(booking) {
    if (!this.transporter) {
      console.warn('⚠️  Email not configured. Skipping email.');
      return false;
    }

    try {
      const date = new Date(booking.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: `"Life Coach" <${process.env.EMAIL_USER}>`,
        to: booking.clientEmail,
        subject: '✅ Booking Confirmed - Life Coaching Session',
        html: this.getConfirmationEmailTemplate(booking, date)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Confirmation email sent to ${booking.clientEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending error:', error);
      return false;
    }
  }

  getConfirmationEmailTemplate(booking, date) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f3f4f6;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .content { 
            padding: 30px; 
            background: #ffffff; 
            border-radius: 0 0 8px 8px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .details { 
            background: #f9fafb; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #4F46E5; 
          }
          .details h3 {
            margin-top: 0;
            color: #1f2937;
            font-size: 18px;
          }
          .details p {
            margin: 8px 0;
            color: #374151;
          }
          .details strong {
            color: #111827;
            display: inline-block;
            min-width: 100px;
          }
          .button { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0; 
            font-weight: 600;
            text-align: center;
          }
          .button:hover {
            background: #4338CA;
          }
          .meeting-link {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            word-break: break-all;
            font-size: 14px;
            color: #0369a1;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #6b7280; 
            font-size: 12px; 
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.clientName},</p>
            <p>Your life coaching session has been confirmed. Here are the details:</p>
            
            <div class="details">
              <h3>Session Details</h3>
              <p><strong>Service:</strong> ${booking.serviceType}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${booking.preferredTime}</p>
              <p><strong>Duration:</strong> ${booking.duration} minutes</p>
              <p><strong>Amount Paid:</strong> $${booking.price}</p>
            </div>
            
            ${booking.meetingLink ? `
              <div class="details">
                <h3>Meeting Link</h3>
                <p>Join your session using the link below:</p>
                <div style="text-align: center;">
                  <a href="${booking.meetingLink}" class="button">Join Google Meet</a>
                </div>
                <div class="meeting-link">
                  <strong>Or copy this link:</strong><br>
                  ${booking.meetingLink}
                </div>
              </div>
            ` : `
              <div class="details">
                <h3>Meeting Link</h3>
                <p>Your meeting link will be sent to you shortly.</p>
              </div>
            `}
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Looking forward to our session!</p>
            
            <div class="footer">
              <p>Best regards,<br><strong>Life Coach Team</strong></p>
              <p style="margin-top: 10px;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();

