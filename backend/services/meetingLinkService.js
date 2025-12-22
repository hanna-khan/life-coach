let google;
try {
  google = require('googleapis').google;
} catch (error) {
  console.warn('⚠️  googleapis package not found. Google Meet features will be disabled.');
  console.warn('   Run: npm install googleapis');
  google = null;
}

const path = require('path');
const fs = require('fs');

class MeetingLinkService {
  constructor() {
    this.auth = null;
    this.calendar = null;
  }

  async getCalendarAuth() {
    // Check if googleapis is available
    if (!google) {
      console.warn('⚠️  googleapis package not installed. Google Meet links will not be generated.');
      return null;
    }

    // If already authenticated, return existing auth
    if (this.auth) {
      return this.auth;
    }

    try {
      // Check if service account key path is configured
      const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        './config/google-service-account.json';

      const fullPath = path.resolve(serviceAccountPath);

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.warn('⚠️  Google service account key not found:', fullPath);
        console.warn('   Google Meet links will not be generated automatically.');
        console.warn('   Please set up Google Calendar API and add service account key.');
        return null;
      }

      const serviceAccountKey = require(fullPath);

      this.auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });

      console.log('✅ Google Calendar authentication successful');
      return this.auth;
    } catch (error) {
      console.error('❌ Google Calendar authentication error:', error.message);
      console.warn('⚠️  Google Meet links will not be generated automatically.');
      return null;
    }
  }

  async generateGoogleMeetLink(booking) {
    try {
      if (!google) {
        console.warn('⚠️  googleapis package not installed. Meeting link not generated.');
        return null;
      }

      const auth = await this.getCalendarAuth();

      if (!auth) {
        console.warn('⚠️  Google Calendar not configured. Meeting link not generated.');
        return null;
      }

      const calendar = google.calendar({ version: 'v3', auth });

      // Calculate start and end times
      const startTime = new Date(booking.preferredDate);
      const [hours, minutes] = booking.preferredTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime.getTime() + booking.duration * 60000);

      // Get timezone (default to America/New_York, can be configured)
      const timezone = process.env.TIMEZONE || 'America/New_York';

      // Create calendar event with Google Meet
      const event = {
        summary: `${booking.serviceType} - ${booking.clientName}`,
        description: `
Client: ${booking.clientName}
Email: ${booking.clientEmail}
Phone: ${booking.clientPhone}
Service: ${booking.serviceType}
Duration: ${booking.duration} minutes
${booking.message ? `Message: ${booking.message}` : ''}
        `.trim(),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: timezone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: timezone,
        },
        // Try to add Google Meet conference
        // Note: This requires Google Meet to be enabled on the calendar
        conferenceData: {
          createRequest: {
            requestId: `meet-${booking._id.toString()}-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        // Note: Service accounts cannot add attendees without Domain-Wide Delegation
        // Attendees will be added manually or via calendar sharing
        // attendees: [
        //   { email: booking.clientEmail },
        //   ...(process.env.ADMIN_EMAIL ? [{ email: process.env.ADMIN_EMAIL }] : [])
        // ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 15 } // 15 minutes before
          ]
        }
      };

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      let createdEvent;
      
      // Try to create event with Google Meet
      try {
        createdEvent = await calendar.events.insert({
          calendarId: calendarId,
          resource: event,
          conferenceDataVersion: 1
        });
      } catch (insertError) {
        // Log full error for debugging
        console.error('❌ Error creating event with Google Meet:', insertError.message);
        console.error('   Error code:', insertError.code);
        console.error('   Calendar ID used:', calendarId);
        
        // If "Invalid conference type value" error, try alternative approaches
        if (insertError.message && (
          insertError.message.includes('Invalid conference type') ||
          insertError.message.includes('conference type value')
        )) {
          console.warn('⚠️  Google Meet conference creation failed. Trying alternative approach...');
          
          // Try creating event first, then patching with Meet link
          try {
            const eventWithoutMeet = { ...event };
            delete eventWithoutMeet.conferenceData;
            
            createdEvent = await calendar.events.insert({
              calendarId: calendarId,
              resource: eventWithoutMeet
            });
            
            console.log('✅ Calendar event created:', createdEvent.data.id);
            
            // Try to patch event with Google Meet
            try {
              const patchedEvent = await calendar.events.patch({
                calendarId: calendarId,
                eventId: createdEvent.data.id,
                resource: {
                  conferenceData: {
                    createRequest: {
                      requestId: `meet-${booking._id.toString()}-${Date.now()}`,
                      conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                      }
                    }
                  }
                },
                conferenceDataVersion: 1
              });
              
              // Extract Meet link from patched event
              const meetLink = patchedEvent.data.hangoutLink || 
                              patchedEvent.data.conferenceData?.entryPoints?.[0]?.uri;
              
              if (meetLink) {
                console.log(`✅ Google Meet link generated via patch: ${meetLink}`);
                return meetLink;
              }
            } catch (patchError) {
              console.warn('⚠️  Failed to add Google Meet via patch:', patchError.message);
            }
            
            console.log('   Event Link:', createdEvent.data.htmlLink);
            console.warn('   ⚠️  Google Meet link not generated. Event created without Meet link.');
            console.warn('   Possible causes:');
            console.warn('   1. Google Meet not enabled on calendar: ' + calendarId);
            console.warn('   2. Service account lacks permissions');
            console.warn('   3. Calendar ID might be incorrect');
            
            return null; // Return null since no Meet link was generated
          } catch (createError) {
            console.error('❌ Failed to create event:', createError.message);
            throw createError;
          }
        } else {
          // Re-throw other errors
          throw insertError;
        }
      }

      console.log('📅 Calendar event created:', createdEvent.data.id);
      console.log('🔍 Event response keys:', Object.keys(createdEvent.data));

      // Extract Google Meet link - try multiple possible locations
      let meetLink = null;
      
      // Try different possible locations for the Meet link
      if (createdEvent.data.hangoutLink) {
        meetLink = createdEvent.data.hangoutLink;
      } else if (createdEvent.data.conferenceData?.hangoutLink) {
        meetLink = createdEvent.data.conferenceData.hangoutLink;
      } else if (createdEvent.data.conferenceData?.entryPoints?.[0]?.uri) {
        meetLink = createdEvent.data.conferenceData.entryPoints[0].uri;
      } else if (createdEvent.data.conferenceData?.entryPoints?.[0]?.joinUrl) {
        meetLink = createdEvent.data.conferenceData.entryPoints[0].joinUrl;
      }

      if (!meetLink) {
        console.warn('⚠️  Google Meet link not found in event response');
        console.warn('   Event data:', JSON.stringify(createdEvent.data, null, 2));
        console.warn('   Conference data:', createdEvent.data.conferenceData);
        
        // Try to get the link from the event by fetching it again
        try {
          const fetchedEvent = await calendar.events.get({
            calendarId: calendarId,
            eventId: createdEvent.data.id,
            conferenceDataVersion: 1
          });
          
          meetLink = fetchedEvent.data.hangoutLink || 
                    fetchedEvent.data.conferenceData?.entryPoints?.[0]?.uri;
          
          if (meetLink) {
            console.log('✅ Google Meet link found after fetching event');
          }
        } catch (fetchError) {
          console.error('❌ Error fetching event:', fetchError.message);
        }
      }

      if (!meetLink) {
        console.error('❌ Google Meet link could not be extracted from event');
        console.error('   Event ID:', createdEvent.data.id);
        console.error('   Event HTML Link:', createdEvent.data.htmlLink);
        console.error('   Full event response:', JSON.stringify(createdEvent.data, null, 2));
        
        // Alternative: Try creating a simple Meet link manually
        // Note: This won't be a scheduled meeting, but will work
        console.warn('⚠️  Attempting to create manual Meet link...');
        
        // Return the event HTML link as fallback (user can add Meet manually)
        // Or return null to let admin add manually
        return null;
      }

      console.log(`✅ Google Meet link generated: ${meetLink}`);
      return meetLink;

    } catch (error) {
      console.error('❌ Google Meet generation error:', error.message);
      if (error.code === 404) {
        console.error('   Calendar not found. Check GOOGLE_CALENDAR_ID in .env');
      } else if (error.code === 403) {
        console.error('   Permission denied. Check service account permissions.');
      }
      return null;
    }
  }

  // Fallback method: Generate a placeholder link (for testing)
  generatePlaceholderLink(booking) {
    // This is just for testing - in production, use Google Meet
    return `https://meet.google.com/new?hs=122&authuser=0`;
  }
}

module.exports = new MeetingLinkService();

