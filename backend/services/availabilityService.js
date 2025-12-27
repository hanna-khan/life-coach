const Booking = require('../models/Booking');

class AvailabilityService {
  /**
   * Get available time slots for a specific date and duration
   * @param {Date|string} date - The date to check
   * @param {number} duration - Duration in minutes (30, 60, or 90)
   * @returns {Promise<string[]>} Array of available time slots (HH:MM format)
   */
  async getAvailableSlots(date, duration = 60) {
    try {
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();
      
      // Working days (Monday-Friday = 1-5, Sunday = 0, Saturday = 6)
      // Default: Allow all days (0-6) - can be restricted via WORKING_DAYS env variable
      const workingDays = process.env.WORKING_DAYS 
        ? process.env.WORKING_DAYS.split(',').map(Number)
        : [0, 1, 2, 3, 4, 5, 6]; // All days (Sunday-Saturday)
      
      if (!workingDays.includes(dayOfWeek)) {
        return [];
      }
      
      // Working hours configuration
      const workingHours = {
        start: process.env.WORKING_HOURS_START || '09:00',
        end: process.env.WORKING_HOURS_END || '17:00'
      };
      
      // Break time configuration
      const breakTime = {
        start: process.env.BREAK_TIME_START || '12:00',
        end: process.env.BREAK_TIME_END || '13:00'
      };
      
      // Buffer time between bookings (minutes)
      const bufferTime = parseInt(process.env.BUFFER_TIME_MINUTES) || 15;
      
      // Get all bookings for the date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const bookings = await Booking.find({
        preferredDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'pending'] }
      });
      
      // Generate time slots
      const slots = this.generateTimeSlots(
        workingHours.start,
        workingHours.end,
        breakTime,
        duration,
        bufferTime
      );
      
      // Filter available slots (check for conflicts)
      const availableSlots = slots.filter(slot => 
        this.isSlotAvailable(slot, duration, bookings, bufferTime, selectedDate)
      );
      
      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }
  
  /**
   * Generate time slots based on working hours, duration, and buffer time
   */
  generateTimeSlots(startTime, endTime, breakTime, duration, bufferTime) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
    const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || 
           (currentHour === endHour && currentMin < endMin)) {
      const slotTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      // Skip break time
      const isInBreak = (currentHour === breakStartHour && currentMin >= breakStartMin) &&
                        (currentHour < breakEndHour || 
                         (currentHour === breakEndHour && currentMin < breakEndMin));
      
      if (!isInBreak) {
        slots.push(slotTime);
      }
      
      // Move to next slot (duration + buffer)
      currentMin += duration + bufferTime;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    return slots;
  }
  
  /**
   * Check if a time slot is available considering duration and existing bookings
   */
  isSlotAvailable(slotTime, duration, bookings, bufferTime, selectedDate) {
    const [slotHour, slotMin] = slotTime.split(':').map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(slotHour, slotMin, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);
    
    for (const booking of bookings) {
      const bookingDate = new Date(booking.preferredDate);
      const [bookingHour, bookingMin] = booking.preferredTime.split(':').map(Number);
      bookingDate.setHours(bookingHour, bookingMin, 0, 0);
      
      const bookingEnd = new Date(
        bookingDate.getTime() + booking.duration * 60000
      );
      
      // Check overlap (with buffer time)
      const slotStartWithBuffer = new Date(slotStart.getTime() - bufferTime * 60000);
      const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferTime * 60000);
      
      // Check if slots overlap
      if (slotStartWithBuffer < bookingEnd && slotEndWithBuffer > bookingDate) {
        return false; // Conflict! Slot not available
      }
    }
    
    return true; // Available
  }

  /**
   * Check if a specific date and time slot is available
   * Uses standard static slots: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00
   */
  async isSlotAvailableForBooking(date, time, duration) {
    try {
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();
      
      // Working days (Monday-Friday = 1-5, Sunday = 0, Saturday = 6)
      // Default: Allow all days (0-6) - can be restricted via WORKING_DAYS env variable
      const workingDays = process.env.WORKING_DAYS 
        ? process.env.WORKING_DAYS.split(',').map(Number)
        : [0, 1, 2, 3, 4, 5, 6]; // All days (Sunday-Saturday)
      
      if (!workingDays.includes(dayOfWeek)) {
        return false;
      }
      
      // Standard static time slots (matching frontend)
      const standardSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
      
      // Check if requested time is in standard slots
      if (!standardSlots.includes(time)) {
        return false;
      }
      
      // Get all bookings for the date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const bookings = await Booking.find({
        preferredDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'pending'] }
      });
      
      // Buffer time between bookings (minutes)
      const bufferTime = parseInt(process.env.BUFFER_TIME_MINUTES) || 15;
      
      // Check if this specific slot conflicts with existing bookings
      return this.isSlotAvailable(time, duration, bookings, bufferTime, selectedDate);
    } catch (error) {
      console.error('Error checking slot availability:', error);
      // If error, allow booking (fail open) - admin can manage conflicts
      return true;
    }
  }
}

module.exports = new AvailabilityService();

