import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { hexToRgba } from '../../utils/themeColors.ts';
import { getLogoPath } from '../../utils/themeHelpers.ts';
import ThemeSelector from '../UI/ThemeSelector.tsx';
// import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { themeColors, currentTheme } = useTheme();
  const location = useLocation();

  // Check if running in developer mode
  // @ts-ignore
  const IS_DEVELOPER = process.env.REACT_APP_IS_DEVELOPER === 'true';

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
            <img 
              src={getLogoPath(currentTheme)} 
              alt="Life Coach Logo" 
              className="h-10 w-auto object-contain"
            />
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
                    isActive(item.path) ? 'active' : 'text-gray-700'
                  }`}
                  style={isActive(item.path) ? { color: 'var(--theme-accent)' } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.color = 'var(--theme-accent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  <span className="relative z-10">{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Settings & Auth Buttons */}
          <motion.div 
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Theme Selector */}
            <ThemeSelector />
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
                    className="text-gray-700 font-medium transition-all duration-300 px-3 py-2 rounded-lg"
                    style={{ 
                      color: 'var(--theme-text)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--theme-accent)';
                      e.currentTarget.style.backgroundColor = hexToRgba(themeColors.accent, 0.1);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.backgroundColor = '';
                    }}
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
                      className="text-gray-700 font-medium transition-all duration-300 px-3 py-2 rounded-lg"
                      style={{ 
                        color: 'var(--theme-text)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-accent)';
                        e.currentTarget.style.backgroundColor = 'rgba(var(--theme-accent-rgb, 196, 98, 45), 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.backgroundColor = '';
                      }}
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
                  Welcome, <span className="font-semibold" style={{ color: 'var(--theme-accent)' }}>{user?.name || 'User'}</span>
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
                <Link
                  to="/login"
                  className="text-gray-700 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:text-theme-accent hover:bg-opacity-10"
                  style={{ 
                    color: 'var(--theme-text)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-accent)';
                    e.currentTarget.style.backgroundColor = hexToRgba(themeColors.accent, 0.1);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-text)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary text-sm py-2 px-4 transition-all duration-200  hover:shadow-md"
                >
                  Sign Up
                </Link>
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
                    className="font-medium transition-all duration-300 px-3 py-2 rounded-lg"
                    style={isActive(item.path) ? {
                      color: 'var(--theme-accent)',
                      backgroundColor: hexToRgba(themeColors.accent, 0.1)
                    } : {
                      color: 'var(--theme-text)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.color = 'var(--theme-accent)';
                        e.currentTarget.style.backgroundColor = hexToRgba(themeColors.accent, 0.1);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.backgroundColor = '';
                      }
                    }}
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
                {/* Theme Selector for Mobile */}
                <div className="mb-4 px-3">
                  <ThemeSelector />
                </div>
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
                            className="text-gray-700 font-medium transition-all duration-300 px-3 py-2 rounded-lg"
                            style={{ 
                              color: 'var(--theme-text)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--theme-accent)';
                              e.currentTarget.style.backgroundColor = 'rgba(var(--theme-accent-rgb, 196, 98, 45), 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.backgroundColor = '';
                            }}
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
                          className="text-gray-700 font-medium transition-all duration-300 px-3 py-2 rounded-lg"
                          style={{ 
                            color: 'var(--theme-text)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--theme-accent)';
                            e.currentTarget.style.backgroundColor = 'rgba(var(--theme-accent-rgb, 196, 98, 45), 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
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
                    <Link
                      to="/login"
                      className="text-gray-700 font-medium transition-colors duration-200 px-3 py-2 rounded-lg"
                      style={{ 
                        color: 'var(--theme-text)',
                      }}
                      // onMouseEnter={(e) => {
                      //   e.currentTarget.style.color = 'var(--theme-accent)';
                      //   e.currentTarget.style.backgroundColor = hexToRgba(themeColors.accent, 0.1);
                      // }}
                      // onMouseLeave={(e) => {
                      //   e.currentTarget.style.color = 'var(--theme-text)';
                      //   e.currentTarget.style.backgroundColor = 'transparent';
                      // }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-sm py-2 px-4 text-center transition-all duration-200 hover:opacity-90 hover:shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
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
