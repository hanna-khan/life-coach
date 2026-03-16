import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '../config/api.ts';

const API_BASE_URL = getApiBaseUrl();
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = API_BASE_URL;
}

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
        // Ensure sessionId is properly encoded (Stripe session IDs are safe but encode anyway)
        const encodedSessionId = encodeURIComponent(sessionId);
        
        console.log('Verifying payment with session ID:', sessionId);
        console.log('API Base URL:', API_BASE_URL);
        console.log('Axios baseURL:', axios.defaults.baseURL);
        
        // Use full URL to ensure it goes to the backend (not frontend)
        const fullUrl = `${API_BASE_URL}/api/payments/session/${encodedSessionId}`;
        console.log('Full request URL:', fullUrl);
        
        const response = await axios.get(fullUrl);
        
        console.log('Payment verification response:', response.data);
        
        // Check if response is successful
        if (!response.data || !response.data.success) {
          const errorMsg = response.data?.message || 'Payment verification failed';
          console.error('Verification failed:', errorMsg);
          toast.error(errorMsg);
          setTimeout(() => navigate('/book-call'), 2000);
          return;
        }
        
        // Check if payment is paid
        if (response.data.paid === true) {
          // Payment is successful
          if (response.data.booking) {
            setBooking(response.data.booking);
            toast.success('Payment successful! Booking confirmed.');
          } else {
            // Payment successful but booking not found - retry once
            console.log('Payment successful but booking not found, retrying...');
            setTimeout(async () => {
              try {
                const retryResponse = await axios.get(`/api/payments/session/${sessionId}`);
                if (retryResponse.data?.success && retryResponse.data?.paid && retryResponse.data?.booking) {
                  setBooking(retryResponse.data.booking);
                  toast.success('Payment successful! Booking confirmed.');
                } else {
                  toast.success('Payment successful! Your booking will be confirmed shortly.');
                  // Still show success even without booking details
                }
              } catch (retryError: any) {
                console.error('Retry error:', retryError);
                toast.success('Payment successful! Your booking will be confirmed shortly.');
              } finally {
                setLoading(false);
              }
            }, 2000);
            return;
          }
        } else {
          // Payment not completed
          const status = response.data.paymentStatus || 'pending';
          console.log('Payment not completed, status:', status);
          toast.error(`Payment status: ${status}. Please complete the payment.`);
          setTimeout(() => navigate('/book-call'), 2000);
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to verify payment';
        console.error('Error details:', {
          message: errorMessage,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(errorMessage);
        setTimeout(() => navigate('/book-call'), 3000);
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
