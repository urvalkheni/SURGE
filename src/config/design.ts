import { tokens } from './tokens';

/**
 * Design Specifications & Chart Presets
 */
export const designConfig = {
  fonts: {
    display: 'var(--font-display), Manrope, sans-serif',
    sans: 'var(--font-sans), Inter, sans-serif',
  },

  charts: {
    heights: {
      hero: 420,
      dashboard: 380,
      workbench: 480,
      compact: 240,
      weatherOverlay: 160,
    },
    colors: tokens.colors.chart,
    gridStroke: tokens.colors.borderSubtle,
    fontFamily: 'var(--font-sans), Inter, sans-serif',
    fontSize: 12,
  },

  breakpoints: {
    sm: 390,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1440,
  },
} as const;
