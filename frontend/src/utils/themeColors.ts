/**
 * Convert hex color to rgba string
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get theme accent color with opacity
 */
export const getThemeAccentWithOpacity = (opacity: number = 0.1): string => {
  const root = document.documentElement;
  const accentColor = getComputedStyle(root).getPropertyValue('--theme-accent').trim();
  return hexToRgba(accentColor, opacity);
};

