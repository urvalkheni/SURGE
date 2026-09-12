'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Activity, BarChart3 } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroForecastVisualizer } from './hero-forecast-visualizer';

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative w-full pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Background Subtle Grid Accent */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#E3E8E315_1px,transparent_1px),linear-gradient(to_bottom,#E3E8E315_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Content Column (5 cols on lg) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex flex-col space-y-6"
          >
            {/* Small Eyebrow */}
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5 border-primary/30 text-primary-dark bg-primary-tint/40">
                <Activity className="size-3 mr-1 text-primary animate-pulse" />
                RENEWABLE ENERGY INTELLIGENCE
              </Badge>
            </motion.div>

            {/* Large Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-[1.12]"
            >
              Forecast renewable generation.{' '}
              <span className="text-primary-dark block sm:inline">
                Act before the grid reacts.
              </span>
            </motion.h1>

            {/* Supporting Paragraph */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-xl"
            >
              RenewableIQ combines weather intelligence, historical generation, and plant parameters 
              to forecast renewable output up to 72 hours ahead — then translates uncertainty into operational action.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <a href="#forecast-section">
                <Button size="lg" variant="primary" className="gap-2 font-medium min-h-[44px]">
                  <span>Explore the Forecast</span>
                  <ArrowRight className="size-4" />
                </Button>
              </a>

              <Link href="/login">
                <Button size="lg" variant="secondary" className="gap-2 font-medium min-h-[44px]">
                  <BarChart3 className="size-4 text-foreground-secondary" />
                  <span>Control Room Access</span>
                </Button>
              </Link>
            </motion.div>

            {/* Institutional Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-border-subtle grid grid-cols-3 gap-4 text-left"
            >
              <div>
                <div className="font-mono font-bold text-sm text-foreground tabular-nums">72h</div>
                <div className="text-[11px] text-muted leading-tight">Forecast Horizon</div>
              </div>
              <div>
                <div className="font-mono font-bold text-sm text-foreground tabular-nums">Sub-hourly</div>
                <div className="text-[11px] text-muted leading-tight">Telemetry Sync</div>
              </div>
              <div>
                <div className="font-mono font-bold text-sm text-foreground tabular-nums flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>100%</span>
                </div>
                <div className="text-[11px] text-muted leading-tight">Deterministic Sim</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Visualization Column (7 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-7 w-full"
          >
            <HeroForecastVisualizer />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
