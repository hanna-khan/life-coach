import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface PricingPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

const BookCall: React.FC = () => {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/pricing');
        if (response.data.success) {
          setPackages(response.data.packages || []);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking submission
    console.log('Booking submitted:', { selectedPackage, selectedDate, selectedTime, formData });
  };

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
              Ready to break old patterns and build a life on your terms? 
              Choose your session and let's get started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Package Selection */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Session</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the coaching session that best fits your needs and goals.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No packages available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg._id}
                  className={`card p-8 cursor-pointer transition-all duration-300 relative ${
                    selectedPackage === pkg._id 
                      ? 'ring-2 ring-primary-600 bg-primary-50' 
                      : 'hover:shadow-lg'
                  } ${pkg.isPopular ? 'ring-2 ring-primary-500' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPackage(pkg._id)}
                >
                  {pkg.isPopular && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 mb-2">
                      Popular
                    </div>
                  )}
                  <div className={`text-center mb-6 ${pkg.isPopular ? 'mt-8' : ''}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      ${pkg.price}
                    </div>
                    <div className="text-gray-600">{pkg.duration} minutes</div>
                  </div>
                  <p className="text-gray-600 mb-6 text-center">{pkg.description}</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features && pkg.features.length > 0 ? (
                      pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 text-center">No features listed</li>
                    )}
                  </ul>
                  <div className={`w-full py-3 px-4 rounded-lg text-center font-medium ${
                    selectedPackage === pkg._id 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedPackage === pkg._id ? 'Selected' : 'Select'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Form */}
      {selectedPackage && (
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="card p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Schedule Your Session</h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to work on? (Optional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-field"
                      rows={4}
                      placeholder="Tell me about your goals, challenges, or what you'd like to focus on in our session..."
                    />
                  </div>

                  <div className="text-center">
                    <motion.button
                      type="submit"
                      className="btn-primary text-lg px-8 py-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Book Your Session
                    </motion.button>
                    <p className="text-sm text-gray-600 mt-4">
                      You'll receive a confirmation email with session details and video call link.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about booking and preparing for your session.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "What should I expect in my first session?",
                answer: "We'll start by discussing your goals and identifying the patterns that might be holding you back. I'll ask direct questions and provide practical insights you can act on immediately."
              },
              {
                question: "How do I prepare for my session?",
                answer: "Come with an open mind and be ready to be honest about your challenges. Think about what patterns you want to break and what kind of life you want to build."
              },
              {
                question: "What if I need to reschedule?",
                answer: "No problem. Just let me know at least 24 hours in advance, and we can find another time that works for you."
              },
              {
                question: "Is this therapy or medical advice?",
                answer: "No. This is coaching focused on breaking patterns and building authentic lives. If you need therapy or medical support, I'll recommend appropriate professionals."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookCall;
