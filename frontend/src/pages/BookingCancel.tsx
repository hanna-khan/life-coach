import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BookingCancel: React.FC = () => {
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
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
              <p className="text-lg text-gray-600 mb-8">
                Your payment was cancelled. No charges have been made. You can try again anytime.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/book-call"
                  className="bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Try Again
                </Link>
                <Link
                  to="/"
                  className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BookingCancel;
