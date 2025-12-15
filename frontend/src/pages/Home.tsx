import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const testimonials = [
    {
      name: "Michael Chen",
      role: "Software Engineer, 34",
      content: "I was stuck in people-pleasing patterns and couldn't set boundaries. Luke helped me understand why I was doing it and gave me practical tools to change. Three months later, I'm saying no without guilt and my relationships are actually better.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "David Martinez",
      role: "Marketing Director, 41",
      content: "After years of numbing with work and alcohol, I felt completely disconnected from myself. Luke's approach helped me feel again—not just the hard stuff, but actually experiencing joy and purpose. The identity work was game-changing.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "James Thompson",
      role: "Entrepreneur, 38",
      content: "I've tried therapy, self-help books, everything. What Luke does differently is he's been through it. He doesn't just understand—he gets it. The accountability and structure kept me moving when I wanted to quit.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Ryan Foster",
      role: "Sales Manager, 29",
      content: "ADHD made everything feel overwhelming. Luke's strategies actually work with how my brain functions instead of against it. I finally have clarity on what to do next instead of spinning in circles.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Alex Rodriguez",
      role: "Teacher, 36",
      content: "I was overthinking every decision, paralyzed by fear of making the wrong choice. Luke helped me break that cycle and start taking action. Now I'm making moves I've been putting off for years. The momentum is real.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const whoIHelp = [
    "Feel stuck in old habits, addictions, or emotional patterns",
    "Struggle with overthinking, people-pleasing, or lack of direction",
    "Want to rebuild confidence and identity",
    "Are ready to stop numbing, start feeling, and step into leadership of their own life"
  ];

  const whyThisWorks = [
    {
      title: "Trauma-informed understanding",
      description: "Deep understanding of how past experiences shape current patterns"
    },
    {
      title: "ADHD-specific strategies",
      description: "Practical tools designed for how your brain actually works"
    },
    {
      title: "Identity work",
      description: "Helping you discover and build who you really are"
    },
    {
      title: "Accountability",
      description: "Real support that keeps you moving forward"
    },
    {
      title: "Clear, actionable structure",
      description: "No fluff. Just practical clarity and real momentum"
    }
  ];

  const whatYouGet = [
    "A clear direction when life feels overwhelming",
    "Emotional tools to stop spiraling or shutting down",
    "Accountability that keeps you moving",
    "A coach who actually gets it — without judgment"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-max relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Break Old Patterns.
                <span className="block text-yellow-300">Build a Life on Your Terms.</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Coaching for men who are done repeating the same cycles and ready to take ownership, gain clarity, and move forward with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/book-call"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Book Your Free Discovery Call Now
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=700&fit=crop"
                  alt="Life Coach"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">3 Years Sober</p>
                      <p className="text-sm text-gray-600">Lived Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Who I Help Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Who I Help</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Men who:
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {whoIHelp.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700 font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Works Section */}
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Why This Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              I coach you from lived experience — not theory.
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              I've been through addiction, detachment, trauma responses, and rebuilding my life from the ground up. I understand the internal battles men face because I've lived them.
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-6 mb-8">
              My coaching blends:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {whyThisWorks.map((item, index) => (
              <motion.div
                key={item.title}
                className="card p-6 lg:p-8 bg-white shadow-md hover:shadow-xl transition-all duration-300 border-t-4 border-primary-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-lg font-semibold text-gray-900">
              No fluff. No vague empowerment talk. Just practical clarity and real momentum.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What You Get</h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {whatYouGet.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-5 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700 font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What Men Are Saying</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real transformations from men who've worked with me.
            </p>
          </motion.div>

          {/* Testimonials Slider */}
          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                animate={{
                  x: `-${currentSlide * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-2"
                  >
                    {testimonials
                      .slice(slideIndex * itemsPerView, slideIndex * itemsPerView + itemsPerView)
                      .map((testimonial, index) => (
                        <motion.div
                          key={testimonial.name}
                          className="card p-6 lg:p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="flex items-center mb-4">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-primary-100"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
                              <p className="text-sm text-gray-600">{testimonial.role}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 group"
              aria-label="Previous testimonials"
            >
              <svg
                className="w-6 h-6 text-primary-600 group-hover:text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 group"
              aria-label="Next testimonials"
            >
              <svg
                className="w-6 h-6 text-primary-600 group-hover:text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-primary-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Share Your Experience Section */}
          <motion.div
            className="max-w-2xl mx-auto card p-8 lg:p-10 bg-gradient-to-br from-white to-gray-50 shadow-xl border-2 border-primary-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Share Your Experience</h3>
              <p className="text-gray-600">
                Have you worked with me? I'd love to hear about your journey. Your story can help other men take that first step.
              </p>
            </div>
            <form className="space-y-5">
              <div>
                <label htmlFor="testimonial-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="testimonial-name"
                  name="name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all duration-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="testimonial-role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Role / Location (optional)
                </label>
                <input
                  type="text"
                  id="testimonial-role"
                  name="role"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all duration-300"
                  placeholder="e.g., Software Engineer, Denver"
                />
              </div>
              <div>
                <label htmlFor="testimonial-message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Experience
                </label>
                <textarea
                  id="testimonial-message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 resize-none transition-all duration-300"
                  placeholder="Share your story and transformation..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Submit Your Experience
              </button>
            </form>
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
              Ready to stop thinking about change and actually make it happen?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book your free discovery call now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book-call"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Book Your Free Discovery Call Now
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
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

export default Home;
