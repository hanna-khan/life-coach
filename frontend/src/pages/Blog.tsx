import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  readTime: number;
  publishedAt: string;
  slug: string;
  views: number;
}

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = ["All", "Personal Growth", "Career", "Relationships", "Health", "Mindfulness", "Success"];

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const categoryParam = selectedCategory === 'All' ? '' : selectedCategory;
        const response = await axios.get('/api/blogs', {
          params: {
            page,
            limit: 6,
            category: categoryParam
          }
        });
        
        if (response.data.success) {
          if (page === 1) {
            setBlogs(response.data.blogs);
          } else {
            setBlogs(prev => [...prev, ...response.data.blogs]);
          }
          setHasMore(response.data.pagination.current < response.data.pagination.pages);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, page]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setBlogs([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

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
            <h1 className="text-5xl font-bold mb-6">The Westbrook Letter</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Direct insights on breaking old patterns and building authentic masculinity. 
              No fluff, no BS - just real talk for men ready to change.
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
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-600"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Insights</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Direct, actionable content for men ready to break old patterns and build authentic lives.
            </p>
          </motion.div>

          {loading && blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blogs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post, index) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="block"
                >
                  <motion.article
                    className="card overflow-hidden cursor-pointer h-full flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Blog+Image';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                      <span className="mt-4 text-primary-600 font-medium hover:text-primary-700 transition-colors duration-300 inline-block">
                        Read More →
                      </span>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && blogs.length > 0 && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <button
                onClick={handleLoadMore}
                className="btn-outline"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Posts'}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding bg-primary-600">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Get The Westbrook Letter
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Weekly insights on breaking old patterns and building authentic masculinity. 
              No fluff, no BS - just real talk for men ready to change.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              />
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
