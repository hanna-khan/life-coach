import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme, themes, ThemeOption } from '../../contexts/ThemeContext.tsx';
import { fadeInUp, staggerContainer } from '../../utils/animations.ts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ThemeSettings: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(currentTheme);
  const [savedTheme, setSavedTheme] = useState<ThemeOption>(currentTheme); // Track the saved theme from backend

  const themeOptions = [
    {
      id: 'original' as ThemeOption,
      name: 'Grounded Blue + Aubergine',
      description: 'Deep navy base with dark purple accents - authoritative & disciplined',
      colors: themes.original,
    },
    {
      id: 'option1' as ThemeOption,
      name: 'Charcoal + Burnt Rust',
      description: 'Grounded, masculine, action-oriented',
      colors: themes.option1,
    },
    {
      id: 'option2' as ThemeOption,
      name: 'Deep Navy + Muted Olive',
      description: 'Calm, stable, disciplined',
      colors: themes.option2,
    },
    {
      id: 'option3' as ThemeOption,
      name: 'Charcoal + Oxblood',
      description: 'Strong, serious, direct',
      colors: themes.option3,
    },
    {
      id: 'option4' as ThemeOption,
      name: 'Deep Blue + Slate',
      description: 'Professional, structured, minimal',
      colors: themes.option4,
    },
    {
      id: 'option5' as ThemeOption,
      name: 'Navy + Charcoal',
      description: 'Classic, authoritative, grounded',
      colors: themes.option5,
    },
    {
      id: 'option6' as ThemeOption,
      name: 'Steel Blue + Dark Purple',
      description: 'Sophisticated, muted, disciplined',
      colors: themes.option6,
    },
    {
      id: 'option7' as ThemeOption,
      name: 'Deep Teal + Bronze',
      description: 'Elegant, refined, sophisticated luxury',
      colors: themes.option7,
    },
    {
      id: 'option8' as ThemeOption,
      name: 'Royal Blue + Charcoal',
      description: 'Professional, strong, authoritative',
      colors: themes.option8,
    },
    {
      id: 'option9' as ThemeOption,
      name: 'Dark Slate + Burnt Orange',
      description: 'Bold, confident, modern attitude',
      colors: themes.option9,
    },
    {
      id: 'option10' as ThemeOption,
      name: 'Navy + Copper',
      description: 'Sophisticated warmth, refined elegance',
      colors: themes.option10,
    },
    {
      id: 'option11' as ThemeOption,
      name: 'Charcoal + Deep Red',
      description: 'Powerful, elegant, commanding presence',
      colors: themes.option11,
    },
    {
      id: 'option12' as ThemeOption,
      name: 'Midnight + Gold',
      description: 'Luxury premium, sophisticated elegance',
      colors: themes.option12,
    },
  ];

  useEffect(() => {
    fetchCurrentTheme();
  }, []);

  const fetchCurrentTheme = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/theme`, {
        headers: { 'x-auth-token': token }
      });
      const backendTheme = response.data.selectedTheme;
      setSelectedTheme(backendTheme);
      setSavedTheme(backendTheme); // Track the saved theme
      setTheme(backendTheme); // Apply it to the site
    } catch (error: any) {
      console.error('Error fetching theme:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch theme');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URL}/admin/theme`,
        { selectedTheme },
        { headers: { 'x-auth-token': token } }
      );
      
      // Update the saved theme tracker
      setSavedTheme(selectedTheme);
      
      // Update the theme in the context (applies to entire site)
      setTheme(selectedTheme);
      
      toast.success('Theme updated successfully! All users will see the new theme.');
    } catch (error: any) {
      console.error('Error saving theme:', error);
      toast.error(error.response?.data?.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewTheme = (themeId: ThemeOption) => {
    setSelectedTheme(themeId);
    // Temporarily apply the theme for preview
    setTheme(themeId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Theme Settings</h1>
              <p className="mt-2 text-gray-600">
                Customize the appearance of your website for all users
              </p>
            </div>
            <motion.button
              onClick={handleSaveTheme}
              disabled={saving || selectedTheme === savedTheme}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                saving || selectedTheme === savedTheme
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              whileHover={{ scale: (saving || selectedTheme === savedTheme) ? 1 : 1.02 }}
              whileTap={{ scale: (saving || selectedTheme === savedTheme) ? 1 : 0.98 }}
            >
              {saving ? 'Saving...' : selectedTheme === savedTheme ? 'Saved ✓' : 'Save Theme'}
            </motion.button>
          </div>
        </motion.div>

        {/* Saved vs Preview Notice */}
        {selectedTheme !== savedTheme && (
          <motion.div 
            variants={fadeInUp} 
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-yellow-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Preview Mode</h3>
                <p className="text-sm text-yellow-800">
                  You're previewing a theme. Click "Save Theme" to apply it to all users.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Saved Theme */}
        <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedTheme === savedTheme ? 'Current Active Theme' : 'Currently Saved Theme'}
          </h2>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-green-500">
            <div className="flex space-x-2">
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: themes[savedTheme].primary }}
                title="Primary"
              />
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: themes[savedTheme].accent }}
                title="Accent"
              />
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: themes[savedTheme].secondary }}
                title="Secondary"
              />
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: themes[savedTheme].background }}
                title="Background"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {themeOptions.find(t => t.id === savedTheme)?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {themeOptions.find(t => t.id === savedTheme)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Theme Options */}
        <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Themes</h2>
          <p className="text-sm text-gray-600 mb-6">
            Click on any theme to preview it. Changes will only be visible to you until you save.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => handlePreviewTheme(option.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === option.id
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{option.name}</h4>
                    {selectedTheme === option.id && (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {savedTheme === option.id && selectedTheme !== option.id && (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{option.description}</p>
                  
                  {/* Color Preview */}
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: option.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: option.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: option.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: option.colors.background }}
                      title="Background"
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Information */}
        <motion.div variants={fadeInUp} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">How Theme Management Works</h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Click any theme to preview it instantly (visible only to you)</li>
                <li>• The theme you select will be applied to all users on the website after saving</li>
                <li>• Changes take effect immediately after clicking "Save Theme"</li>
                <li>• Users will see the new theme when they refresh or visit the site</li>
                <li>• Users cannot change themes individually - only admins can manage the site theme</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeSettings;
