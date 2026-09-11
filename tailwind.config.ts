import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        // Engineered Canvas & Surfaces
        background: '#F7F8F5',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
        },

        // High-Contrast Technical Typography
        foreground: {
          DEFAULT: '#17211B',
          secondary: '#66736A',
          muted: '#8B968F',
        },

        // Hairline Borders
        border: {
          DEFAULT: '#E3E8E3',
          subtle: '#EDF1ED',
        },

        // Primary Brand Foliage
        primary: {
          DEFAULT: '#167A4A',
          foreground: '#FFFFFF',
          dark: '#0D4F32',
          tint: '#E8F5ED',
        },

        // Semantic Grid Status
        success: {
          DEFAULT: '#167A4A',
          tint: '#E8F5ED',
        },
        warning: {
          DEFAULT: '#C98216',
          dark: '#8C570A',
          tint: '#FDF6EC',
        },
        danger: {
          DEFAULT: '#C94A4A',
          dark: '#9B2C2C',
          tint: '#FDF2F2',
        },
        info: {
          DEFAULT: '#3978A8',
          dark: '#1E4E73',
          tint: '#EFF6FB',
        },

        // Energy Visualization Series
        chart: {
          actual: '#0D4F32',
          predicted: '#167A4A',
          baseline: '#8B968F',
          ghi: '#C98216',
          cloudCover: '#3978A8',
        },
      },

      fontFamily: {
        display: ['var(--font-display)', 'Manrope', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },

      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },

      boxShadow: {
        subtle: '0 1px 2px 0 rgba(23, 33, 27, 0.04)',
        card: '0 1px 3px 0 rgba(23, 33, 27, 0.05), 0 1px 2px -1px rgba(23, 33, 27, 0.03)',
        elevated: '0 4px 6px -1px rgba(23, 33, 27, 0.06), 0 2px 4px -2px rgba(23, 33, 27, 0.04)',
        modal: '0 12px 24px -4px rgba(23, 33, 27, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
