import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const approachPoints = [
    "Honesty & challenge — no sugar-coating",
    "Structure & clarity — so you know exactly what to do next",
    "Accountability — because change requires momentum",
    "Depth & emotional understanding",
    "Lived experience — not abstract theory"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg section-padding">
        <div className="container-max">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6 text-white">About Luke</h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Men's clarity and momentum coach. Helping men break old patterns and build lives on their terms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who I Am Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Who I Am</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  I'm Luke Westbrook-Manhattan, a men's clarity and momentum coach.
                </p>
                <p>
                  For most of my life, I battled addiction, people-pleasing, identity confusion, emotional numbness, and the pressure to be "fine" when I wasn't. I struggled to speak up, set boundaries, and feel like I had any real direction.
                </p>
                <p>
                  Three years sober, deep personal work, men's groups, trauma healing, ADHD understanding, and confronting my past — that journey reshaped my entire life.
                </p>
                <p>
                  Now I coach men who feel the same way I once did: stuck, overwhelmed, burnt out, or disconnected from who they really are.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop"
                alt="Luke Westbrook-Manhattan"
                className="rounded-2xl shadow-2xl"
              />
              <div 
                className="absolute -bottom-6 -right-6 text-white p-6 rounded-xl shadow-lg"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">3 Years</div>
                  <div className="text-sm">Sober</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* My Approach Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">My Approach</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              What you can expect from working with me:
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 mb-8">
              {approachPoints.map((point, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700">{point}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-gray-700 italic">
                My coaching is not clinical, therapeutic, or diagnostic.
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                It's practical, grounded, and built to help you take action.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why I Do This Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why I Do This</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                Because too many men suffer in silence.
              </p>
              <p>
                We are never taught how to manage emotions, build identity, express anger safely, set boundaries, or stop the cycles we learned growing up.
              </p>
              <p>
                I coach men because I know what it's like to feel lost — and I know how powerful life becomes when you finally take control of your story.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-bg">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              If you're ready to get unstuck and build something real:
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Book your free discovery call today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book-call"
                className="bg-white hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                style={{ color: 'var(--theme-accent)' }}
              >
                Book Your Free Discovery Call
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--theme-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'white';
                }}
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
