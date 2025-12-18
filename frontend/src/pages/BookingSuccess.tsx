import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/book-call');
        return;
      }

      try {
        const response = await axios.get(`/api/payments/session/${sessionId}`);
        
        if (response.data.success && response.data.paid && response.data.booking) {
          setBooking(response.data.booking);
          toast.success('Payment successful! Booking confirmed.');
        } else {
          toast.error('Payment verification failed');
          navigate('/book-call');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast.error('Failed to verify payment');
        navigate('/book-call');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="card p-8 lg:p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Your booking has been confirmed. You'll receive a confirmation email shortly.
              </p>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{booking.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{booking.clientEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-900">{booking.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(booking.preferredDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">{booking.preferredTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{booking.duration} minutes</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 mt-3">
                    <span className="text-gray-600 font-semibold">Amount Paid:</span>
                    <span className="font-bold text-primary-600 text-lg">${booking.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Return to Home
                </Link>
                <Link
                  to="/book-call"
                  className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Book Another Session
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BookingSuccess;
