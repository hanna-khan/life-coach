/**
 * Helper function to get theme CSS variable value
 */
export const getThemeColor = (colorName: 'primary' | 'accent' | 'text' | 'background' | 'secondary') => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  switch (colorName) {
    case 'primary':
      return computedStyle.getPropertyValue('--theme-primary').trim();
    case 'accent':
      return computedStyle.getPropertyValue('--theme-accent').trim();
    case 'text':
      return computedStyle.getPropertyValue('--theme-text').trim();
    case 'background':
      return computedStyle.getPropertyValue('--theme-background').trim();
    case 'secondary':
      return computedStyle.getPropertyValue('--theme-secondary').trim();
    default:
      return '';
  }
};

/**
 * Helper to create inline style with theme colors
 */
export const themeStyle = (property: 'color' | 'backgroundColor' | 'borderColor', colorName: 'primary' | 'accent' | 'text' | 'background' | 'secondary') => {
  return {
    [property]: `var(--theme-${colorName})`
  };
};

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert hex color to RGBA string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : '';
}

/**
 * Get logo path - always returns lwm-logo.png regardless of theme
 */
export function getLogoPath(theme?: string): string {
  // Always use lwm-logo.png for all themes
  return '/lwm-logo.png';
}
