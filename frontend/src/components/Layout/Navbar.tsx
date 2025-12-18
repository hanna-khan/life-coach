import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
// import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Check if running in developer mode
  const IS_DEVELOPER = (process.env as any).REACT_APP_IS_DEVELOPER === 'true';

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Resources', path: '/resources' },
    { name: 'Book Call', path: '/book-call' },
    { name: 'Contact', path: '/contact' },
    {name: 'Admin', path: '/admin'}
  ];

  // Add Admin link in developer mode
  if (IS_DEVELOPER) {
    navItems.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <motion.nav 
      className="bg-white shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-max">
        <div className="flex justify-between items-center py-4 mx-2">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">LC</span>
            </div>
            {/* <span className="text-2xl font-bold text-gradient">Lukewestbrookmanhattan</span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`navbar-link font-medium transition-all duration-300 relative group ${
                    isActive(item.path)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <motion.div
                    className="absolute inset-0 bg-primary-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Auth Buttons */}
          <motion.div 
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {IS_DEVELOPER ? (
              <div className="flex items-center space-x-4">
                <motion.span 
                  className="text-green-600 font-medium"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🔧 Developer Mode
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50"
                  >
                    Admin Panel
                  </Link>
                </motion.div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50"
                    >
                      Admin
                    </Link>
                  </motion.div>
                )}
                <motion.span 
                  className="text-gray-700 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Welcome, <span className="text-primary-600 font-semibold">{user?.name || 'User'}</span>
                </motion.span>
                <motion.button
                  onClick={logout}
                  className="btn-outline text-sm py-2 px-4"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </motion.svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex flex-col space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                      isActive(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                className="pt-4 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {IS_DEVELOPER ? (
                  <div className="flex flex-col space-y-2">
                    <motion.span 
                      className="text-green-600 font-medium"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      🔧 Developer Mode
                    </motion.span>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    </motion.div>
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    {isAdmin && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to="/admin"
                          className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      </motion.div>
                    )}
                    <motion.span 
                      className="text-gray-700 px-3 py-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Welcome, {user?.name || 'User'}
                    </motion.span>
                    <motion.button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="btn-outline text-sm py-2 px-4 w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Logout
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/login"
                        className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/register"
                        className="btn-primary text-sm py-2 px-4 text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
