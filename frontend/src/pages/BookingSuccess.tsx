import React from 'react';

const BookingSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your session has been successfully booked. You'll receive a confirmation email shortly.</p>
        <button className="btn-primary">Return to Home</button>
      </div>
    </div>
  );
};

export default BookingSuccess;
