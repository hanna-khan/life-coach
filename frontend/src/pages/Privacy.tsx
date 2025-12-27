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
              <p className="text-lg">
                <strong className="text-gray-900">Note:</strong> This is NOT legal advice — but it's a standard small-coaching-business version.
              </p>

              <p className="text-xl font-semibold text-gray-900">
                Your privacy matters.
              </p>

              <p>
                Luke Westbrook-Manhattan Coaching ("we") collects minimal personal information such as your name, email, and details you voluntarily submit when booking a call or submitting a form.
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-8">
                We use this information to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Respond to enquiries</li>
                <li>Deliver coaching services</li>
                <li>Improve our website and client experience</li>
              </ul>

              <p className="mt-8">
                We do not sell or share your information with third parties.
              </p>

              <p>
                Your data is stored securely and only accessed when required for communication or service delivery.
              </p>

              <p className="mt-8">
                You may request to have your data deleted at any time by contacting:
              </p>
              <p className="text-lg">
                <a 
                  href="mailto:lukewestbrookmanhattan@gmail.com" 
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  lukewestbrookmanhattan@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;

