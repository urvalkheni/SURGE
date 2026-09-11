/**
 * Reusable Motion Presets
 * Calibrated against the design system duration tokens and editorial cubic-bezier easing.
 * Strictly uses modern motion/react.
 */

import type { Variants } from 'motion/react';

export const easeEditorial = [0.16, 1, 0.3, 1] as const;
export const easeSharp = [0.4, 0, 0.2, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: easeEditorial },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easeSharp },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeEditorial },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: easeSharp },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.22, ease: easeEditorial },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: easeSharp },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};
