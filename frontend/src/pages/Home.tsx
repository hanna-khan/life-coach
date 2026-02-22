import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import VideoUpload from '../components/UI/VideoUpload.tsx';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  // Static testimonials (always shown)
  const staticTestimonials = useMemo(() => [
    {
      name: "Doug Applegate",
      role: "Founder, Centennial State Wealth Advisors",
      content: "Over the past nine months of working with Luke, I've experienced meaningful, tangible growth—personally, emotionally, and relationally. What sets Luke apart is his rare ability to truly listen. Not just to respond, but to understand what's being said underneath the words. That creates a foundation of trust that makes real growth possible.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Roberts",
      role: "Senior Software Architect",
      content: "Luke offers feedback that challenges me to grow, but he does so in a way that is supportive, grounded, and deeply respectful. He doesn't push from a place of ego or authority—he invites growth from a place of care. Even when conversations are uncomfortable, they are always safe, constructive, and rooted in wanting the best outcome for me as a person.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "James Mitchell",
      role: "Marketing Director",
      content: "His experience shows up not as theory, but as wisdom. There's credibility in how he speaks, how he asks questions, and how he helps connect dots without forcing conclusions. He is thoughtful in his approach, intentional with his words, and genuinely invested in the people he works with.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "David Chen",
      role: "Entrepreneur & Business Owner",
      content: "What I appreciate most is Luke's authentic care for others and his commitment to his own growth. He models the work. His desire to help men become more emotionally aware, to express what they feel, to stand up for themselves, and to live within clear boundaries isn't just something he talks about—it's something he lives.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Ryan Patterson",
      role: "Executive Coach",
      content: "Through our work together, I've become more self-aware, more honest with myself and others, and more confident in setting and honoring my boundaries. I've learned how to show up more fully—not just for myself, but for the people in my life. That kind of change doesn't happen without trust, consistency, and genuine care.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Alex Thompson",
      role: "Sales Team Leader",
      content: "Luke is doing important work. For men who want to grow, who want to live with integrity, emotional clarity, and strength—for themselves and for those around them—I can't recommend him highly enough.",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face"
    }
  ], []);

  const [testimonials, setTestimonials] = useState<any[]>(staticTestimonials);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    content: ''
  });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Helper function to get background color based on name
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Handle image load error
  const handleImageError = (name: string) => {
    setImageErrors(prev => new Set(prev).add(name));
  };

  // Fetch testimonials from API and combine with static ones
  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await axios.get('/api/testimonials');
      
      console.log('API Response:', response.data);
      
      // Always start with static testimonials
      let allTestimonials = [...staticTestimonials];
      
      // Add dynamic testimonials from database if available
      if (response.data && response.data.success) {
        const apiTestimonials = response.data.testimonials || [];
        console.log('API Testimonials received:', apiTestimonials.length);
        
        if (apiTestimonials.length > 0) {
          // Add dynamic testimonials (image is optional - will show initials if missing)
          const dynamicTestimonials = apiTestimonials.map((testimonial: any, index: number) => {
            const testimonialData = {
              ...testimonial,
              // Only set image if it exists, otherwise initials will be shown
              image: testimonial.image || null
            };
            console.log('Adding dynamic testimonial:', testimonialData.name, 'Image:', testimonialData.image ? 'Yes' : 'No (will show initials)');
            return testimonialData;
          });
          
          // Combine static + dynamic testimonials (static first, then dynamic)
          allTestimonials = [...staticTestimonials, ...dynamicTestimonials];
          console.log('Combined testimonials:', allTestimonials.length);
        } else {
          console.log('No approved testimonials in database. Showing static testimonials only.');
        }
      }
      
      console.log('Final testimonials to display:', allTestimonials.length, '(Static:', staticTestimonials.length, '+ Dynamic:', response.data?.testimonials?.length || 0, ')');
      setTestimonials(allTestimonials);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      console.error('Error details:', error.response?.data || error.message);
      // On error, use static testimonials only
      console.log('Using static testimonials only due to error');
      setTestimonials(staticTestimonials);
    }
  }, [staticTestimonials]);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testimonialForm.name.trim() || !testimonialForm.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (testimonialForm.content.length < 20) {
      toast.error('Please share at least 20 characters about your experience');
      return;
    }

    try {
      setSubmittingTestimonial(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', testimonialForm.name);
      formData.append('role', testimonialForm.role);
      formData.append('content', testimonialForm.content);
      
      if (videoFile) {
        formData.append('video', videoFile);
      }

      const response = await axios.post('/api/testimonials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Thank you for sharing your experience!');
        setTestimonialForm({ name: '', role: '', content: '' });
        setVideoFile(null);
        // Refresh testimonials after submission
        await fetchTestimonials();
      }
    } catch (error: any) {
      console.error('Error submitting testimonial:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to submit testimonial';
      toast.error(errorMessage);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

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
    {
      title: "You feel stuck in old patterns",
      experience: "You find yourself repeating habits, addictions, or emotional loops you can't seem to break.",
      undertone: "You know something needs to change, but don't know where to start."
    },
    {
      title: "You overthink and lose direction",
      experience: "Your mind rarely switches off. You people-please, second-guess, and struggle to feel clear or grounded in your decisions.",
      undertone: "You feel mentally exhausted and unsure of your next move."
    },
    {
      title: "You want to rebuild yourself",
      experience: "You've lost confidence in who you are or who you're becoming and want to reclaim your identity.",
      undertone: "You know there's more in you."
    },
    {
      title: "You're ready to lead your life",
      experience: "You're done numbing, avoiding, or drifting. You want to feel, take ownership, and step into leadership of your own life.",
      undertone: "You're ready for real change."
    }
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

  // Get featured video testimonial for hero section
  const featuredVideoTestimonial = testimonials.find(t => t.videoUrl && t.isFeatured) || 
                                    testimonials.find(t => t.videoUrl);

  return (
    <div className="min-h-screen">
      {/* Featured Video Testimonial Section */}
      {featuredVideoTestimonial && featuredVideoTestimonial.videoUrl && (
        <section className="w-full flex justify-center bg-gradient-to-b from-gray-900 to-black py-12">
          <div className="w-full max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-2">
                Client Success Story
              </h2>
              <p className="text-gray-300 text-center mb-6">
                Hear from men who've experienced real transformation
              </p>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <video
                  src={featuredVideoTestimonial.videoUrl}
                  controls
                  className="w-full h-full object-cover bg-black"
                  preload="metadata"
                  poster={featuredVideoTestimonial.videoUrl + '.jpg'} // Cloudinary can generate thumbnails
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="text-center pt-4">
                <p className="text-white font-semibold text-lg">{featuredVideoTestimonial.name}</p>
                {featuredVideoTestimonial.role && (
                  <p className="text-gray-400 text-sm">{featuredVideoTestimonial.role}</p>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      {/* Hero Section */}
      <section className="hero-bg min-h-screen w-full flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-max relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Break Old Patterns.
                <span className="block text-yellow-300 mt-2">Build a Life on Your Terms.</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed max-w-xl">
                Coaching for men who are done repeating the same cycles and ready to take ownership, gain clarity, and move forward with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/book-call"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-center text-base sm:text-lg shadow-xl"
                >
                  Book Your Free Discovery Call
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-center text-base sm:text-lg"
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
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-md xl:max-w-xl">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=700&fit=crop"
                  alt="Life Coach"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
               
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
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
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Who I Help</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Men who are functional on the outside, but privately stuck, overwhelmed, or disconnected from themselves.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-x-8 lg:gap-y-10">
              {whoIHelp.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, borderColor: 'var(--theme-accent)' }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">{item.experience}</p>
                  <p className="text-sm text-gray-500 italic leading-relaxed">{item.undertone}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="text-center mt-12 pt-8 border-t border-gray-200 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-600 italic">
              If any of these feel familiar, this work is for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why This Works Section */}
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-max">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Why This Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              I coach you from lived experience — not theory.
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              I've been through addiction, detachment, trauma responses, and rebuilding my life from the ground up. I understand the internal battles men face because I've lived them.
            </p>
          </motion.div>

          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-lg font-semibold text-gray-900">
              My coaching blends:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12">
            {whyThisWorks.map((item, index) => (
              <motion.div
                key={item.title}
                className="card p-6 lg:p-8 bg-white shadow-md hover:shadow-xl transition-all duration-300 border-t-4"
                style={{ borderTopColor: 'var(--theme-accent)' }}
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
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-xl font-semibold text-gray-900 max-w-3xl mx-auto">
              No fluff. No vague empowerment talk. Just practical clarity and real momentum.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What You Get</h2>
          </motion.div>

          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {whatYouGet.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3, borderColor: 'var(--theme-accent)' }}
                >
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: `var(--theme-accent)` }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-700 font-medium pt-1">{item}</p>
                  </div>
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

          {/* Video Testimonials Section - Display First */}
          {testimonials.some(t => t.videoUrl) && (
            <div className="mb-16">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">Video Testimonials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {testimonials
                  .filter(t => t.videoUrl)
                  .slice(0, 4)
                  .map((testimonial, index) => (
                    <motion.div
                      key={testimonial._id || testimonial.name}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="aspect-video bg-gray-900">
                        <video
                          src={testimonial.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <div 
                            className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-semibold ${getAvatarColor(testimonial.name)}`}
                          >
                            {getInitials(testimonial.name)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <p className="text-sm text-gray-600">{testimonial.role || ''}</p>
                          </div>
                        </div>
                        {testimonial.content && (
                          <p className="text-gray-700 leading-relaxed text-sm line-clamp-3">"{testimonial.content}"</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Text Testimonials Slider */}
          <div className="relative">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">Client Reviews</h3>
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
                key={testimonial._id || testimonial.name}
                          className="card p-6 lg:p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                          whileHover={{ y: -5 }}
              >
                          <div className="flex items-center mb-4">
                  {testimonial.image && !imageErrors.has(testimonial.name) ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      onError={() => handleImageError(testimonial.name)}
                      className="w-14 h-14 rounded-full object-cover mr-4 ring-2"
                      style={{ '--tw-ring-color': 'rgba(196, 98, 45, 0.2)' } as React.CSSProperties}
                    />
                  ) : (
                    <div 
                      className={`w-14 h-14 rounded-full mr-4 ring-2 flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(testimonial.name)}`}
                      style={{ '--tw-ring-color': 'rgba(196, 98, 45, 0.2)' } as React.CSSProperties}
                    >
                      {getInitials(testimonial.name)}
                    </div>
                  )}
                  <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role || ''}</p>
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
                className="w-6 h-6 text-theme-accent group-hover:text-theme-accent-hover"
                style={{ color: 'var(--theme-accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--theme-accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--theme-accent)'; }}
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
                className="w-6 h-6 text-theme-accent group-hover:text-theme-accent-hover"
                style={{ color: 'var(--theme-accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--theme-accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--theme-accent)'; }}
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
                      ? 'w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Share Your Experience Section */}
          <motion.div
            className="max-w-3xl mx-auto mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Header Section */}
              <div 
                className="px-8 py-6 lg:px-10 lg:py-8"
                style={{ background: 'var(--theme-primary)' }}
              >
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">Share Your Experience</h3>
                </div>
                <p className="text-white/90 text-center text-sm lg:text-base">
                  Have you worked with me? I'd love to hear about your journey. Your story can help other men take that first step.
                </p>
              </div>

              {/* Form Section */}
              <div className="p-6 lg:p-10 bg-gray-50">
                <form onSubmit={handleTestimonialSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="testimonial-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="testimonial-name"
                      name="name"
                      value={testimonialForm.name}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm hover:shadow-md"
                      style={{ 
                        '--tw-ring-color': 'var(--theme-accent)',
                        '--focus-border-color': 'var(--theme-accent)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--theme-accent)';
                        e.currentTarget.style.setProperty('--tw-ring-color', 'var(--theme-accent)');
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
                      placeholder="Your name"
                      required
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
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm hover:shadow-md"
                      style={{ 
                        '--tw-ring-color': 'var(--theme-accent)',
                        '--focus-border-color': 'var(--theme-accent)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--theme-accent)';
                        e.currentTarget.style.setProperty('--tw-ring-color', 'var(--theme-accent)');
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
                      placeholder="e.g., Software Engineer, Denver"
                    />
                  </div>
                  <div>
                    <label htmlFor="testimonial-message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Experience <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="testimonial-message"
                      name="content"
                      rows={5}
                      value={testimonialForm.content}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 resize-none transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Share your story and transformation..."
                      required
                      minLength={20}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {testimonialForm.content.length}/1000 characters (minimum 20)
                    </p>
                  </div>

                  {/* Video Upload for Testimonial */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload a Video Testimonial (optional)
                    </label>
                    <VideoUpload onUpload={(file) => setVideoFile(file)} />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingTestimonial}
                    className="w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ 
                      background: 'var(--theme-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--theme-primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--theme-primary)';
                    }}
                  >
                    {submittingTestimonial ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Your Experience'
                    )}
                  </button>
                </form>
              </div>
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
              Ready to stop thinking about change and actually make it happen?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book your free discovery call now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book-call"
                className="bg-white hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
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

export default Home;
