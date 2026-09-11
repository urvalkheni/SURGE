/**
 * RenewableIQ Design Tokens
 * Master source of truth for design tokens across the application.
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces
    background: '#F7F8F5',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Typography
    foreground: '#17211B',
    foregroundSecondary: '#66736A',
    muted: '#8B968F',

    // Structural Borders
    border: '#E3E8E3',
    borderSubtle: '#EDF1ED',

    // Primary Brand
    primary: '#167A4A',
    primaryForeground: '#FFFFFF',
    primaryDark: '#0D4F32',
    primaryTint: '#E8F5ED',

    // Semantic States
    success: '#167A4A',
    successTint: '#E8F5ED',
    warning: '#C98216',
    warningTint: '#FDF6EC',
    danger: '#C94A4A',
    dangerTint: '#FDF2F2',
    info: '#3978A8',
    infoTint: '#EFF6FB',

    // Chart Lines & Areas
    chart: {
      actual: '#0D4F32',
      predicted: '#167A4A',
      confidenceBand: 'rgba(22, 122, 74, 0.08)',
      baseline: '#8B968F',
      ghi: '#C98216',
      cloudCover: '#3978A8',
      rampAlertZone: 'rgba(201, 74, 74, 0.12)',
    },
  },

  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    subtle: '0 1px 2px 0 rgba(23, 33, 27, 0.04)',
    card: '0 1px 3px 0 rgba(23, 33, 27, 0.05), 0 1px 2px -1px rgba(23, 33, 27, 0.03)',
    elevated: '0 4px 6px -1px rgba(23, 33, 27, 0.06), 0 2px 4px -2px rgba(23, 33, 27, 0.04)',
    modal: '0 12px 24px -4px rgba(23, 33, 27, 0.10)',
  },

  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 20,
    sticky: 30,
    banner: 40,
    overlay: 50,
    modal: 60,
    popover: 70,
    toast: 80,
    tooltip: 90,
  },

  motion: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '250ms',
      slow: '450ms',
      dramatic: '750ms',
    },
    easing: {
      editorial: [0.16, 1, 0.3, 1], // easeOutEditorial
      smooth: [0.65, 0, 0.35, 1],    // easeInOutSmooth
      sharp: [0.4, 0, 0.2, 1],       // easeOutSharp
    },
  },

  containers: {
    max: '1440px',
  },
} as const;

export type DesignTokens = typeof tokens;
