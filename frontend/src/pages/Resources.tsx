import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { hexToRgba } from '../utils/themeHelpers.ts';

const Resources: React.FC = () => {
  const { themeColors } = useTheme();
  const guides = [
    {
      id: 1,
      title: "The Pattern Breaking Workbook",
      description: "A comprehensive guide to identifying and breaking the patterns that hold you back from living authentically.",
      category: "Breaking Patterns",
      readTime: "45 min",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      downloadUrl: "#",
      featured: true
    },
    {
      id: 2,
      title: "Authentic Masculinity Framework",
      description: "Redefine what it means to be a man in today's world. Strength, integrity, and purpose without the toxic stereotypes.",
      category: "Authentic Masculinity",
      readTime: "30 min",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      downloadUrl: "#",
      featured: false
    },
    {
      id: 3,
      title: "Building Boundaries That Work",
      description: "Learn to set and maintain healthy boundaries in relationships, work, and personal life.",
      category: "Relationships",
      readTime: "25 min",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      downloadUrl: "#",
      featured: false
    },
    {
      id: 4,
      title: "Purpose-Driven Career Guide",
      description: "Find work that aligns with your values and builds the life you actually want to live.",
      category: "Career",
      readTime: "35 min",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop",
      downloadUrl: "#",
      featured: false
    },
    {
      id: 5,
      title: "The Accountability System",
      description: "Build systems that keep you on track with your goals and commitments to yourself.",
      category: "Purpose",
      readTime: "20 min",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      downloadUrl: "#",
      featured: false
    },
    {
      id: 6,
      title: "Leadership Without Ego",
      description: "Lead with authenticity, strength, and wisdom. Build teams and relationships that last.",
      category: "Leadership",
      readTime: "40 min",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
      downloadUrl: "#",
      featured: false
    }
  ];

  const categories = ["All", "Breaking Patterns", "Authentic Masculinity", "Relationships", "Career", "Purpose", "Leadership"];

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
            <h1 className="text-5xl font-bold mb-6 text-white">Resources & Guides</h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Practical tools and frameworks to help you break old patterns and build authentic lives. 
              Download these guides and start implementing change today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container-max">
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  category === "All"
                    ? "bg-theme-accent text-white"
                    : "bg-gray-100 text-gray-700 hover:text-theme-accent"
                }`}
                onMouseEnter={(e) => {
                  if (category !== "All") {
                    e.currentTarget.style.backgroundColor = hexToRgba(themeColors.accent, 0.1);
                  }
                }}
                onMouseLeave={(e) => {
                  if (category !== "All") {
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Guide */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Resource</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our most comprehensive guide to breaking old patterns and building authentic lives.
            </p>
          </motion.div>

          {guides.filter(guide => guide.featured).map((guide) => (
            <motion.div
              key={guide.id}
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="card overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="relative">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-theme-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="mb-4">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: 'rgba(var(--theme-accent-rgb), 0.1)',
                          color: 'var(--theme-accent)'
                        }}
                      >
                        {guide.category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{guide.title}</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">{guide.description}</p>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-500">{guide.readTime} read</span>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      className="btn-primary text-lg px-8 py-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Download Free Guide
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Resources */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our complete library of guides, frameworks, and tools for breaking patterns and building authentic lives.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.filter(guide => !guide.featured).map((guide, index) => (
              <motion.article
                key={guide.id}
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-theme-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                      {guide.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{guide.readTime} read</span>
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    className="w-full btn-outline"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Download Guide
                  </motion.button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding bg-theme-accent">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Get New Resources First
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Be the first to access new guides, frameworks, and tools as they're released. 
              Plus get exclusive content not available anywhere else.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2"
                style={{ '--tw-ring-offset-color': 'var(--theme-accent)' } as React.CSSProperties}
              />
              <motion.button
                className="bg-white hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                style={{ color: 'var(--theme-accent)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
