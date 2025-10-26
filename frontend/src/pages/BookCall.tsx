import React from 'react';
import { motion } from 'framer-motion';

const BookCall: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="hero-bg section-padding">
        <div className="container-max text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">Book Your Call</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Ready to transform your life? Book a free consultation and let's discuss how I can help you achieve your goals.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="card p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Schedule Your Session</h2>
              <p className="text-gray-600 text-center mb-8">
                Choose a time that works for you. All sessions are conducted via video call.
              </p>
              
              {/* Calendar component would go here */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">Calendar component will be integrated here</p>
                <p className="text-sm text-gray-500 mt-2">This will show available time slots</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BookCall;
