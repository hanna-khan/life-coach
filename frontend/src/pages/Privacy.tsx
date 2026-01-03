import React from 'react';
import { motion } from 'framer-motion';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-bg section-padding">
        <div className="container-max text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6 text-white">Privacy Policy</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="max-w-3xl mx-auto prose prose-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl font-semibold text-gray-900">
                Your privacy matters.
              </p>

              <p>
                Luke Westbrook-Manhattan Coaching ("we", "us") collects minimal personal information, including your name, email address, and any details you voluntarily provide when booking a call or submitting a form through this website.
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-8">
                We use this information solely to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Respond to enquiries</li>
                <li>Deliver coaching services</li>
                <li>Improve our website and overall client experience</li>
              </ul>

              <p className="mt-8">
                We do not sell, rent, or share your personal information with third parties for marketing or advertising purposes.
              </p>

              <p>
                Your data may be processed and securely stored using trusted third-party tools (such as scheduling, payment, or email service providers) strictly for communication, administration, and service delivery. Reasonable technical and organisational measures are taken to protect your information from unauthorised access or misuse.
              </p>

              <p className="mt-8">
                This website may use basic cookies or analytics to understand site usage and improve functionality. No personally identifiable information is sold, shared, or used for targeted advertising.
              </p>

              <p className="mt-8">
                You may request access to, correction of, or deletion of your personal data at any time by contacting:
              </p>
              <p className="text-lg">
                <a 
                  href="mailto:lukewestbrookmanhattan@gmail.com" 
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  lukewestbrookmanhattan@gmail.com
                </a>
              </p>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Coaching Disclaimer
                </h2>
                <p>
                  Coaching services provided by Luke Westbrook-Manhattan Coaching are not therapy, counselling, or medical treatment, and are not a substitute for professional mental health care, medical advice, or diagnosis.
                </p>
              </div>

              <p className="mt-8 text-sm text-gray-500">
                Last updated: January 2026
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;

