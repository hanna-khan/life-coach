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
            background: transparent;
            border: 1px solid #4F46E5;
            color: #4F46E5; 
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
                <h3>📅 Book Your Session</h3>
                <p>Click the link below to book your session via Calendly:</p>
                <div style="text-align: center;">
                  <a href="${booking.meetingLink}" class="button">Book via Calendly</a>
                </div>
                <div class="meeting-link">
                  <strong>Or copy this link:</strong><br>
                  ${booking.meetingLink}
                </div>
                <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
                  <strong>Note:</strong> You'll be redirected to Calendly to complete your booking. Please select the date and time you prefer.
                </p>
              </div>
            ` : `
              <div class="details">
                <h3>Meeting Link</h3>
                <p>Your booking link will be sent to you shortly.</p>
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

  async sendNextSessionReminder(booking) {
    if (!this.transporter) {
      console.warn('⚠️  Email not configured. Skipping email.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Life Coach" <${process.env.EMAIL_USER}>`,
        to: booking.clientEmail,
        subject: `📅 Time to Book Your Next Session (${booking.currentSession}/${booking.totalSessions})`,
        html: this.getNextSessionEmailTemplate(booking)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Next session reminder sent to ${booking.clientEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending error:', error);
      return false;
    }
  }

  getNextSessionEmailTemplate(booking) {
    const frequencyText = {
      'one-time': 'one-time',
      'after-3-mins': 'after 3 minutes',
      '1-day': 'daily (1 day)',
      'weekly': 'weekly',
      'biweekly': 'bi-weekly',
      'monthly': 'monthly'
    }[booking.frequency] || booking.frequency;

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
          .progress-bar {
            background: #e5e7eb;
            border-radius: 10px;
            height: 20px;
            margin: 20px 0;
            overflow: hidden;
          }
          .progress-fill {
            background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 600;
            transition: width 0.3s ease;
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
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: #ffffff !important; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0; 
            font-weight: 600;
            text-align: center;
          }
          .button:hover {
            background: linear-gradient(135deg, #4338CA 0%, #6D28D9 100%);
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
          .session-badge {
            display: inline-block;
            background: #EEF2FF;
            color: #4F46E5;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Book Your Next Session</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.clientName},</p>
            <p>Great progress! It's time to schedule your next coaching session.</p>
            
            <div class="session-badge">
              Session ${booking.currentSession} of ${booking.totalSessions}
            </div>

            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(booking.sessionsCompleted / booking.totalSessions) * 100}%">
                ${booking.sessionsCompleted} / ${booking.totalSessions} completed
              </div>
            </div>
            
            <div class="details">
              <h3>Your Package Details</h3>
              <p><strong>Package:</strong> ${booking.serviceType}</p>
              <p><strong>Session Duration:</strong> ${booking.duration} minutes</p>
              <p><strong>Frequency:</strong> ${frequencyText}</p>
              <p><strong>Total Sessions:</strong> ${booking.totalSessions}</p>
              <p><strong>Completed:</strong> ${booking.sessionsCompleted} sessions</p>
              <p><strong>Remaining:</strong> ${booking.totalSessions - booking.sessionsCompleted} sessions</p>
            </div>
            
            ${booking.meetingLink ? `
              <div class="details">
                <h3>📅 Book Your Next Session</h3>
                <p>Click the button below to schedule Session ${booking.currentSession}:</p>
                <div style="text-align: center;">
                  <a href="${booking.meetingLink}" class="button" style="color: #ffffff !important; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Book Session ${booking.currentSession} Now</a>
                </div>
                <div class="meeting-link">
                  <strong>Or copy this link:</strong><br>
                  ${booking.meetingLink}
                </div>
                <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
                  <strong>Note:</strong> Please schedule your session according to the ${frequencyText} frequency of your package.
                </p>
              </div>
            ` : ''}
            
            <p>Keep up the great work! We're excited to continue this journey with you.</p>
            
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

