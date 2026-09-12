import * as React from 'react';
import Link from 'next/link';
import { Zap, ShieldAlert, BarChart2, Activity, BatteryCharging, Sliders, Cpu, Settings } from 'lucide-react';
import { LandingHeader } from '@/components/landing/landing-header';
import { HeroSection } from '@/components/landing/hero-section';
import { IntelligenceFlow } from '@/components/landing/intelligence-flow';
import { OperationalScrollStory } from '@/components/landing/scroll/operational-scroll-story';
import { ForecastSection } from '@/components/landing/forecast-section';
import { FinalCta } from '@/components/landing/final-cta';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const routeCards = [
    {
      title: 'Operations Overview',
      description: 'Single-pane situational awareness & fleet KPIs',
      href: '/dashboard',
      icon: BarChart2,
      tag: 'CONTROL ROOM',
    },
    {
      title: 'Forecast (72h)',
      description: 'Quantile time-series & weather layers',
      href: '/forecast',
      icon: Activity,
      tag: 'ANALYTICAL',
    },
    {
      title: 'Risk Intelligence',
      description: 'Ramp detection & anomaly ledger',
      href: '/risks',
      icon: ShieldAlert,
      tag: 'DETECTION',
    },
    {
      title: 'Action Recommendations',
      description: 'Prescriptive BESS mitigation actions',
      href: '/recommendations',
      icon: BatteryCharging,
      tag: 'DISPATCH',
    },
    {
      title: 'Scenario Sandbox',
      description: 'What-if stress testing & simulation',
      href: '/scenarios',
      icon: Sliders,
      tag: 'SIMULATION',
    },
    {
      title: 'Plant Digital Twin',
      description: 'Inverter & string-level hardware specs',
      href: '/plant',
      icon: Cpu,
      tag: 'ASSETS',
    },
    {
      title: 'Platform Settings',
      description: 'SCADA bus & ramp threshold calibration',
      href: '/settings',
      icon: Settings,
      tag: 'SYSTEM',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-tint selection:text-primary-dark">
      {/* Engineered Technical Landing Header */}
      <LandingHeader />

      {/* Main Landing Experience */}
      <main id="main-content" className="flex-1">
        {/* SECTION 01: Hero & 72h Visualizer */}
        <HeroSection />

        {/* SECTION 02: Operational Intelligence Pipeline */}
        <IntelligenceFlow />

        {/* SECTION 03: Operational Intelligence Scroll Story (Weather -> Forecast -> Risk -> Action -> Impact) */}
        <OperationalScrollStory />

        {/* SECTION 04: Interactive 72-Hour Forecast Workbench & Scenario Testing */}
        <ForecastSection />

        {/* SECTION 05: Final Technical Call to Action */}
        <FinalCta />

        {/* Operational Route Navigation Directory */}
        <section className="w-full py-12 sm:py-16 border-t border-border bg-[#F5F7F5]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                  Platform Operational Surfaces
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Access live SCADA feeds, risk ledgers, and dispatch sandboxes across the platform.
                </p>
              </div>
              <Badge variant="outline" className="self-start sm:self-auto text-[11px] font-mono">
                7 Operational Shells Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {routeCards.map((rc) => {
                const Icon = rc.icon;
                return (
                  <Link key={rc.href} href={rc.href} className="group focus-ring rounded-lg">
                    <Card className="h-full bg-surface border-border transition-all group-hover:border-primary/50 group-hover:shadow-elevated">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Icon className="size-4 text-primary" />
                          <span className="text-[9px] font-mono text-muted uppercase font-bold tracking-wider">
                            {rc.tag}
                          </span>
                        </div>
                        <CardTitle className="text-sm mt-2">{rc.title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-1">{rc.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="text-xs font-mono text-primary font-medium group-hover:underline">
                          {rc.href} →
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Production Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-sm bg-primary-dark text-white">
                <Zap className="size-3.5" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-foreground">
                RenewableIQ
              </span>
              <span className="text-xs text-muted font-mono ml-2">v1.0.0-prod</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-foreground-secondary font-medium">
              <a href="#forecast-section" className="hover:text-foreground">Forecast Workbench</a>
              <a href="#intelligence-flow" className="hover:text-foreground">Intelligence Flow</a>
              <a href="#impact-section" className="hover:text-foreground">Economic Impact</a>
              <Link href="/login" className="hover:text-foreground">Control Room</Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted font-mono">
            <div>
              © 2026 RenewableIQ Systems Inc. All simulation values generated deterministically for evaluation.
            </div>
            <div className="flex items-center gap-4 text-[11px] tabular-nums">
              <span>SCADA PROTOCOL: IEC 61850</span>
              <span>·</span>
              <span>GRID COMPLIANCE: CAISO / PJM / CERC</span>
              <span>·</span>
              <span>ACCESSIBILITY: WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
