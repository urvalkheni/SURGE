'use client';

import * as React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/feedback/demo-badge';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-xs">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 focus-ring rounded-md">
            <div className="flex size-9 items-center justify-center rounded-md overflow-hidden shrink-0">
              <img src="/surge-icon.png" alt="SURGE" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              SURGE
            </span>
          </Link>
          <span className="hidden lg:inline-block ml-2 text-xs text-foreground-secondary border-l border-border pl-3 font-medium">
            Forecast the Grid. Before the Gap.
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-foreground-secondary" aria-label="Landing Navigation">
          <a href="#forecast-section" className="hover:text-foreground transition-colors focus-ring rounded-xs py-1 px-1.5">
            Forecast
          </a>
          <a href="#intelligence-flow" className="hover:text-foreground transition-colors focus-ring rounded-xs py-1 px-1.5">
            Intelligence
          </a>
          <a href="#impact-section" className="hover:text-foreground transition-colors focus-ring rounded-xs py-1 px-1.5">
            Outcomes & Impact
          </a>
          <Link href="/dashboard" className="hover:text-foreground transition-colors focus-ring rounded-xs py-1 px-1.5">
            Operations
          </Link>
        </nav>

        {/* Right Action & Telemetry Ribbon */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <DemoBadge isDemo={true} />
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <Link href="/dashboard">
            <Button size="sm" variant="primary" className="gap-1.5 font-medium min-h-[36px]">
              <span>Enter Platform</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground-secondary hover:text-foreground hover:bg-[#F3F6F3] focus-ring"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <DemoBadge isDemo={true} />
            <span className="text-[10px] font-mono text-muted">v1.0 Operational</span>
          </div>
          <nav className="flex flex-col space-y-2 text-sm font-medium text-foreground">
            <a
              href="#forecast-section"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#F3F6F3]"
            >
              Forecast Workbench
            </a>
            <a
              href="#intelligence-flow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#F3F6F3]"
            >
              Intelligence Pipeline
            </a>
            <a
              href="#impact-section"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#F3F6F3]"
            >
              Operational Outcomes
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#F3F6F3] text-primary font-semibold flex items-center justify-between"
            >
              <span>Operations Control Room</span>
              <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
