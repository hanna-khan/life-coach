import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, themes, ThemeOption } from '../../contexts/ThemeContext.tsx';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const themeOptions = [
    {
      id: 'original' as ThemeOption,
      name: 'Original (Blue + Purple)',
      description: 'Classic blue and purple gradient theme',
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
  ];

  const currentThemeData = themeOptions.find(opt => opt.id === currentTheme);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Theme Settings"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Theme Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a color palette</p>
              </div>

              <div className="p-4 space-y-3 ">
                {themeOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => {
                      setTheme(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      currentTheme === option.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{option.name}</h4>
                          {currentTheme === option.id && (
                            <svg
                              className="w-5 h-5 text-gray-900"
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
                        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                        
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
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Theme preference is saved automatically
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;

