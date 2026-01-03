import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeOption = 'option1' | 'option2' | 'option3' | 'option4' | 'option5' | 'option6' | 'option7' | 'option8' | 'option9' | 'option10' | 'option11' | 'option12' | 'original';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  background: string;
  secondary: string;
  accent: string;
  accentHover: string;
  text: string;
}

export const themes: Record<ThemeOption, ThemeColors> = {
  option1: {
    // Charcoal + Burnt Rust
    primary: '#1F1F1F', // Charcoal
    primaryHover: '#2F2F2F',
    background: '#F5F4F2', // Off-White
    secondary: '#8A8A8A', // Warm Grey
    accent: '#C4622D', // Burnt Rust
    accentHover: '#B5521D',
    text: '#1F1F1F',
  },
  option2: {
    // Deep Navy + Muted Olive
    primary: '#1E2A36', // Deep Navy
    primaryHover: '#2A3A4A',
    background: '#F3F3EF', // Soft Stone
    secondary: '#7A7F85', // Cool Grey
    accent: '#6B7A4F', // Muted Olive
    accentHover: '#5B6A3F',
    text: '#1E2A36',
  },
  option3: {
    // Charcoal + Oxblood
    primary: '#181818', // Near-Black Charcoal
    primaryHover: '#282828',
    background: '#F6F5F3', // Warm Off-White
    secondary: '#8C8C8C', // Mid Grey
    accent: '#7A1E24', // Oxblood
    accentHover: '#6A0E14',
    text: '#181818',
  },
  original: {
    // Grounded Blue + Purple Theme (More Masculine & Authoritative)
    primary: '#1e3a8a', // Deep Navy Blue (dominant base/structural)
    primaryHover: '#1e40af', // Slightly lighter navy
    background: '#f8f9fa', // Soft neutral background
    secondary: '#2d3748', // Charcoal gray for grounding
    accent: '#4a2c5a', // Dark desaturated purple (ink/aubergine, not violet)
    accentHover: '#3d2a4d', // Darker aubergine
    text: '#1a202c', // Near-black for strong contrast
  },
  option4: {
    // Deep Blue + Slate
    primary: '#1e293b', // Slate-800
    primaryHover: '#334155', // Slate-700
    background: '#f1f5f9', // Slate-50
    secondary: '#475569', // Slate-600
    accent: '#0f172a', // Slate-900 (near-black)
    accentHover: '#1e293b',
    text: '#0f172a',
  },
  option5: {
    // Navy + Charcoal
    primary: '#1e3a8a', // Navy
    primaryHover: '#1e40af',
    background: '#fafafa', // Neutral white
    secondary: '#374151', // Gray-700
    accent: '#111827', // Gray-900 (charcoal)
    accentHover: '#1f2937',
    text: '#111827',
  },
  option6: {
    // Steel Blue + Dark Purple
    primary: '#334155', // Slate-700
    primaryHover: '#475569',
    background: '#f8fafc', // Slate-50
    secondary: '#64748b', // Slate-500
    accent: '#3d2a4d', // Dark aubergine
    accentHover: '#2d1f3a',
    text: '#0f172a',
  },
  option7: {
    // Deep Teal + Bronze (Elegant, Refined)
    primary: '#0f4c75', // Deep teal
    primaryHover: '#1a5a8a',
    background: '#f8f9fa', // Soft white
    secondary: '#2d3748', // Charcoal
    accent: '#c9a961', // Bronze gold
    accentHover: '#b8964a',
    text: '#1a202c',
  },
  option8: {
    // Royal Blue + Charcoal (Professional, Strong)
    primary: '#1e3a8a', // Royal blue
    primaryHover: '#2563eb',
    background: '#ffffff', // Pure white
    secondary: '#374151', // Charcoal gray
    accent: '#1f2937', // Near-black
    accentHover: '#111827',
    text: '#111827',
  },
  option9: {
    // Dark Slate + Burnt Orange (Bold, Confident)
    primary: '#1e293b', // Dark slate
    primaryHover: '#334155',
    background: '#fafafa', // Off-white
    secondary: '#475569', // Medium slate
    accent: '#ea580c', // Burnt orange
    accentHover: '#c2410c',
    text: '#0f172a',
  },
  option10: {
    // Navy + Copper (Sophisticated, Warm)
    primary: '#1e40af', // Navy blue
    primaryHover: '#2563eb',
    background: '#f9fafb', // Light gray
    secondary: '#4b5563', // Gray-600
    accent: '#b45309', // Copper
    accentHover: '#92400e',
    text: '#111827',
  },
  option11: {
    // Charcoal + Deep Red (Powerful, Elegant)
    primary: '#111827', // Charcoal
    primaryHover: '#1f2937',
    background: '#ffffff', // White
    secondary: '#4b5563', // Gray-600
    accent: '#991b1b', // Deep red
    accentHover: '#7f1d1d',
    text: '#111827',
  },
  option12: {
    // Midnight + Gold Accent (Luxury, Premium)
    primary: '#0f172a', // Midnight
    primaryHover: '#1e293b',
    background: '#f8fafc', // Slate-50
    secondary: '#334155', // Slate-700
    accent: '#f59e0b', // Amber gold
    accentHover: '#d97706',
    text: '#0f172a',
  },
};

interface ThemeContextType {
  currentTheme: ThemeOption;
  themeColors: ThemeColors;
  setTheme: (theme: ThemeOption) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeOption>(() => {
    // Load theme from localStorage or default to original
    const saved = localStorage.getItem('theme') as ThemeOption;
    return saved && ['option1', 'option2', 'option3', 'option4', 'option5', 'option6', 'option7', 'option8', 'option9', 'option10', 'option11', 'option12', 'original'].includes(saved) ? saved : 'original';
  });

  const themeColors = themes[currentTheme];

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', themeColors.primary);
    root.style.setProperty('--theme-primary-hover', themeColors.primaryHover);
    root.style.setProperty('--theme-background', themeColors.background);
    root.style.setProperty('--theme-secondary', themeColors.secondary);
    root.style.setProperty('--theme-accent', themeColors.accent);
    root.style.setProperty('--theme-accent-hover', themeColors.accentHover);
    root.style.setProperty('--theme-text', themeColors.text);
    
    // Charcoal/near-black for grounding (using secondary or text color)
    root.style.setProperty('--theme-charcoal', themeColors.secondary);
    
    // Convert accent color to RGB for rgba() usage
    const accentRgb = hexToRgb(themeColors.accent);
    if (accentRgb) {
      root.style.setProperty('--theme-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    }
    
    // Also set background color
    document.body.style.backgroundColor = themeColors.background;
  }, [themeColors]);

  const setTheme = (theme: ThemeOption) => {
    setCurrentThemeState(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeColors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

