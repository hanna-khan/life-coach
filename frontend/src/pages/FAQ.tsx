import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What kind of coaching do you offer?",
      answer: "I offer clarity and momentum coaching for men dealing with overthinking, emotional shutdown, ADHD-related struggles, addiction recovery challenges, and patterns they can't seem to break."
    },
    {
      question: "Is this therapy?",
      answer: "No. Coaching is forward-focused, action-driven, and not a substitute for therapy or licensed mental health treatment. I do work alongside men who are also in therapy."
    },
    {
      question: "How do calls work?",
      answer: "We meet on Zoom. Sessions are structured, direct, and focused on helping you move forward with clarity. Your first step is a free discovery call, where we make sure you're a good fit for coaching."
    },
    {
      question: "Do you offer refunds?",
      answer: "Coaching requires commitment, so packages are non-refundable. This protects both of us and keeps you accountable."
    },
    {
      question: "Can I book a one-off session?",
      answer: "Yes — but ongoing support is where real transformation happens."
    },
    {
      question: "Do you work with women?",
      answer: "My niche and expertise are specifically in men's coaching. For women, I can recommend trusted coaches."
    }
  ];

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
            <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Here are some common questions I receive. Don't see your question? Feel free to reach out!
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
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

          {/* CTA Section */}
          <motion.div
            className="max-w-2xl mx-auto mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-700 mb-6">
              Still have questions? I'm here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Get in Touch
              </Link>
              <Link
                to="/book-call"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Book Free Discovery Call
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;

