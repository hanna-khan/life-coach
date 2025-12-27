const axios = require('axios');

class CalendlyService {
  constructor() {
    this.apiBaseUrl = process.env.CALENDLY_API_BASE_URL || 'https://api.calendly.com';
    this.accessToken = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
    
    // Event Type URIs for different durations
    this.eventTypeUris = {
      30: process.env.CALENDLY_EVENT_TYPE_URI_30MIN,
      60: process.env.CALENDLY_EVENT_TYPE_URI_60MIN,
      90: process.env.CALENDLY_EVENT_TYPE_URI_90MIN
    };

    // Validate configuration
    if (!this.accessToken) {
      console.warn('⚠️  CALENDLY_PERSONAL_ACCESS_TOKEN not configured. Calendly integration will be disabled.');
    }
  }

  /**
   * Check if Calendly service is properly configured
   */
  isConfigured() {
    return !!this.accessToken;
  }

  /**
   * Generate Calendly booking link based on booking duration
   * This is the recommended approach since Calendly API doesn't support direct event creation
   * @param {Object} booking - Booking object from database
   * @returns {string} Calendly booking link
   */
  generateBookingLink(booking) {
    // Map duration to Calendly event slug
    const slugs = {
      30: '30min',
      60: '60-mins-meeting',
      90: '90-mins-meeting'
    };

    const slug = slugs[booking.duration] || '60-mins-meeting';
    const baseUrl = 'https://calendly.com/devwithrafay/';

    // Build URL with pre-filled parameters
    const params = new URLSearchParams({
      email: booking.clientEmail,
      name: booking.clientName
    });

    const bookingLink = `${baseUrl}${slug}?${params.toString()}`;
    console.log(`🔗 Generated Calendly booking link for ${booking.duration} min: ${bookingLink}`);
    
    return bookingLink;
  }

  /**
   * Get Event Type URI based on duration
   * @param {number} duration - Duration in minutes (30, 60, or 90)
   * @returns {string|null} Event Type URI
   */
  getEventTypeUri(duration) {
    // For now, use 60 minutes Event Type URI for all durations
    const uri60Min = this.eventTypeUris[60];
    
    if (!uri60Min || uri60Min.includes('YOUR_') || uri60Min.includes('_HERE')) {
      console.error(`❌ 60 minutes Event Type URI is not configured. Please update .env file with CALENDLY_EVENT_TYPE_URI_60MIN.`);
      throw new Error(`Event Type URI for 60 minutes not configured. Please update CALENDLY_EVENT_TYPE_URI_60MIN in .env file.`);
    }
    
    // Use 60 minutes URI for all durations (30, 60, 90)
    console.log(`📅 Using 60 minutes Event Type URI for ${duration} minutes booking`);
    console.log(`🔗 Event Type URI: ${uri60Min}`);
    return uri60Min;
  }

  /**
   * Convert booking date and time to Calendly ISO 8601 format
   * @param {Date|string} date - Booking date
   * @param {string} time - Time in HH:MM format (e.g., "09:00")
   * @param {number} duration - Duration in minutes
   * @returns {Object} Object with startTime and endTime in ISO 8601 format
   */
  convertDateTimeToCalendlyFormat(date, time, duration) {
    try {
      // Parse the date
      const bookingDate = date instanceof Date ? date : new Date(date);
      
      // Extract hours and minutes from time string (e.g., "09:00" -> {hours: 9, minutes: 0})
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create start time (local time)
      const startTime = new Date(bookingDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time by adding duration (in milliseconds)
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      // Convert to ISO 8601 format (UTC)
      // Calendly expects format: "2024-01-15T10:00:00.000000Z"
      const startTimeISO = startTime.toISOString().replace('Z', '.000000Z');
      const endTimeISO = endTime.toISOString().replace('Z', '.000000Z');
      
      return {
        startTime: startTimeISO,
        endTime: endTimeISO
      };
    } catch (error) {
      console.error('❌ Error converting date/time to Calendly format:', error);
      throw new Error('Invalid date or time format');
    }
  }

  /**
   * Create a scheduled event in Calendly
   * @param {Object} booking - Booking object from database
   * @returns {Promise<Object>} Calendly event object
   */
  async createScheduledEvent(booking) {
    if (!this.isConfigured()) {
      throw new Error('Calendly is not configured. Please set CALENDLY_PERSONAL_ACCESS_TOKEN in .env file.');
    }

    try {
      // Get appropriate event type URI based on duration
      const eventTypeUri = this.getEventTypeUri(booking.duration);
      if (!eventTypeUri) {
        throw new Error(`No Event Type URI configured for ${booking.duration} minutes duration`);
      }

      // Convert date/time to Calendly format
      const { startTime, endTime } = this.convertDateTimeToCalendlyFormat(
        booking.preferredDate,
        booking.preferredTime,
        booking.duration
      );

      // Prepare request payload
      const payload = {
        event_type: eventTypeUri,
        start_time: startTime,
        end_time: endTime,
        name: booking.clientName,
        email: booking.clientEmail,
        text_reminder_number: booking.clientPhone || undefined
      };

      // Debug: Log the URI being used
      console.log(`🔗 Event Type URI: ${eventTypeUri}`);
      console.log(`📅 Start: ${startTime}, End: ${endTime}`);
      
      // Make API request to create event
      const response = await axios.post(
        `${this.apiBaseUrl}/scheduled_events`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Calendly event created: ${response.data.resource.uri}`);
      return response.data.resource;

    } catch (error) {
      console.error('❌ Error creating Calendly event:', error.response?.data || error.message);
      
      // Provide more helpful error messages
      if (error.response?.status === 401) {
        throw new Error('Calendly authentication failed. Please check your Personal Access Token.');
      } else if (error.response?.status === 404) {
        throw new Error('Calendly Event Type not found. Please check your Event Type URI.');
      } else if (error.response?.status === 422) {
        throw new Error(`Calendly validation error: ${error.response.data?.message || 'Invalid request data'}`);
      }
      
      throw error;
    }
  }

  /**
   * Get event details from Calendly (to extract meeting link)
   * @param {string} eventUri - Calendly event URI
   * @returns {Promise<Object>} Event details including location/meeting link
   */
  async getEventDetails(eventUri) {
    if (!this.isConfigured()) {
      throw new Error('Calendly is not configured');
    }

    try {
      // Extract event UUID from URI
      // URI format: https://api.calendly.com/scheduled_events/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
      const eventUuid = eventUri.split('/').pop();

      const response = await axios.get(
        `${this.apiBaseUrl}/scheduled_events/${eventUuid}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.resource;

    } catch (error) {
      console.error('❌ Error fetching Calendly event details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Extract meeting link from Calendly event
   * @param {Object} eventDetails - Event details from getEventDetails
   * @returns {string|null} Meeting link URL or null if not found
   */
  extractMeetingLink(eventDetails) {
    try {
      // Check for location (can be zoom, google_meet, teams, etc.)
      if (eventDetails.location) {
        if (eventDetails.location.type === 'zoom') {
          return eventDetails.location.location;
        } else if (eventDetails.location.type === 'google_meet') {
          return eventDetails.location.location;
        } else if (eventDetails.location.type === 'microsoft_teams') {
          return eventDetails.location.location;
        } else if (eventDetails.location.type === 'custom_location') {
          return eventDetails.location.location;
        } else if (eventDetails.location.type === 'physical_location') {
          return eventDetails.location.location;
        }
      }

      // Fallback: Check for calendar_event with external_id
      if (eventDetails.calendar_event?.external_id) {
        // This might contain a link in some cases
        return eventDetails.calendar_event.external_id;
      }

      // Fallback: Return event URI (user can access via Calendly)
      if (eventDetails.uri) {
        // Convert API URI to user-facing URL
        const eventUuid = eventDetails.uri.split('/').pop();
        return `https://calendly.com/scheduled_events/${eventUuid}`;
      }

      console.warn('⚠️  No meeting link found in Calendly event details');
      return null;

    } catch (error) {
      console.error('❌ Error extracting meeting link:', error);
      return null;
    }
  }

  /**
   * Generate Calendly booking link for a booking
   * This is the recommended approach since Calendly API doesn't support direct event creation
   * User will click the link and book via Calendly's official interface
   * @param {Object} booking - Booking object from database
   * @returns {string} Calendly booking link
   */
  async createEventAndGetMeetingLink(booking) {
    // Use booking link generation instead of API event creation
    // This is the recommended approach as Calendly API doesn't support direct event creation
    const bookingLink = this.generateBookingLink(booking);
    return bookingLink;
  }
}

module.exports = new CalendlyService();

