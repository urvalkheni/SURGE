'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CloudSun, TrendingUp, AlertTriangle, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherIntelligence } from '@/components/landing/weather-intelligence';
import { ForecastTransition } from '@/components/landing/forecast-transition';
import { RiskIntelligence } from '@/components/landing/risk-intelligence';
import { ActionIntelligence } from '@/components/landing/action-intelligence';
import { ImpactIntelligence } from '@/components/landing/impact-intelligence';
import { ForecastChart } from '@/components/charts/forecast-chart';
import { getAhmedabadForecastData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

interface StepDefinition {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  question: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  routeHref: string;
  routeLabel: string;
}

const narrativeSteps: StepDefinition[] = [
  {
    id: 'weather',
    stepNumber: '01',
    title: 'WEATHER',
    subtitle: 'Atmospheric Physics',
    question: 'What is happening in the atmosphere?',
    description:
      'Renewable generation begins in the sky. RenewableIQ continuously ingests numerical weather prediction models (GFS/ECMWF), satellite cloud-vector motion, and ambient temperature gradients to calculate effective surface photon flux before it strikes the solar array.',
    icon: CloudSun,
    tag: 'INPUT INGESTION',
    routeHref: '/forecast',
    routeLabel: 'Explore Weather Telemetry',
  },
  {
    id: 'forecast',
    stepNumber: '02',
    title: 'FORECAST',
    subtitle: 'Probabilistic AI',
    question: 'What will the plant produce?',
    description:
      'Weather conditions are mapped through plant-specific physical constraints — including inverter saturation limits (DC:AC 1.25), tracker tilt mechanics, and thermal derating coefficients — outputting calibrated p10, p50, and p90 generation envelopes across 72 hours.',
    icon: TrendingUp,
    tag: 'PREDICTIVE ENVELOPE',
    routeHref: '/forecast',
    routeLabel: 'Explore 72h Forecast',
  },
  {
    id: 'risk',
    stepNumber: '03',
    title: 'RISK',
    subtitle: 'Ramp Detection',
    question: 'Where could reality diverge from expectation?',
    description:
      'A forecast curve alone cannot prevent grid instability. RenewableIQ runs real-time gradient scanning to detect rapid generation cliffs, thermal inverter deratings, and interconnection tolerance breaches hours before they hit transmission nodes.',
    icon: AlertTriangle,
    tag: 'ANOMALY DETECTION',
    routeHref: '/risks',
    routeLabel: 'View Active Risk Ledger',
  },
  {
    id: 'action',
    stepNumber: '04',
    title: 'ACTION',
    subtitle: 'Prescriptive Dispatch',
    question: 'What should the operator do?',
    description:
      'Instead of passive alert fatigue, RenewableIQ synthesizes actionable dispatch recommendations. Impending generation cliffs automatically trigger co-located BESS battery pre-charging and controlled ramp discharge schedules.',
    icon: BatteryCharging,
    tag: 'DISPATCH ORCHESTRATION',
    routeHref: '/recommendations',
    routeLabel: 'Explore Recommendations',
  },
  {
    id: 'impact',
    stepNumber: '05',
    title: 'IMPACT',
    subtitle: 'Commercial Outcome',
    question: 'What does that decision achieve?',
    description:
      'Closing the loop between environmental uncertainty and battery dispatch preserves interconnection agreements, stabilizes grid frequency, and eliminates costly balancing settlement penalties ($18,400 per major event).',
    icon: CheckCircle2,
    tag: 'MEASURED VALUE',
    routeHref: '/dashboard',
    routeLabel: 'Open Operations Control Room',
  },
];

export function OperationalScrollStory() {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Deterministic 72h data for Step 2 forecast visualization
  const forecastData = React.useMemo(() => getAhmedabadForecastData('48h'), []);

  // Coordinated scroll spy on desktop
  React.useEffect(() => {
    if (shouldReduceMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress within container
      const totalHeight = rect.height - windowHeight;
      if (totalHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
      const stepIndex = Math.min(narrativeSteps.length - 1, Math.floor(progress * narrativeSteps.length));
      setActiveStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldReduceMotion]);

  const currentStep = narrativeSteps[activeStep];

  return (
    <section
      ref={containerRef}
      className="relative w-full border-b border-border bg-[#F7F8F5]"
      aria-label="Operational Intelligence Narrative"
    >
      {/* DESKTOP PINNED STORYTELLING CONTAINER (lg:block, min-h-[300vh] for scroll travel) */}
      <div className="hidden lg:block relative h-[320vh]">
        <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center max-w-[1440px] mx-auto px-6 xl:px-8">
          <div className="w-full grid grid-cols-12 gap-8 items-center py-6">
            {/* Left Narrative Column (5 cols) */}
            <div className="col-span-5 flex flex-col justify-between space-y-6 bg-surface/80 backdrop-blur-xs border border-border p-6 rounded-lg shadow-card">
              {/* Step Ribbon & Progress Controls */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-primary bg-primary-tint px-2 py-0.5 rounded-xs">
                    {currentStep.stepNumber} / 05
                  </span>
                  <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">
                    {currentStep.tag}
                  </span>
                </div>

                {/* Direct Step Indicator Buttons */}
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Narrative Steps">
                  {narrativeSteps.map((step, idx) => (
                    <button
                      key={step.id}
                      type="button"
                      role="tab"
                      aria-selected={activeStep === idx}
                      onClick={() => setActiveStep(idx)}
                      className={cn(
                        'size-6 rounded-xs text-[10px] font-mono font-bold transition-all focus-ring',
                        activeStep === idx
                          ? 'bg-primary-dark text-white shadow-subtle'
                          : 'bg-[#F4F6F4] text-muted hover:text-foreground hover:bg-[#EAEFEA]'
                      )}
                    >
                      {step.stepNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="space-y-3 min-h-[220px]">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                  {currentStep.title} · {currentStep.subtitle}
                </div>

                <h3 className="font-display font-bold text-2xl text-foreground tracking-tight leading-snug">
                  &ldquo;{currentStep.question}&rdquo;
                </h3>

                <p className="text-sm text-foreground-secondary leading-relaxed pt-1">
                  {currentStep.description}
                </p>
              </div>

              {/* Stage Route Action Button */}
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <Link href={currentStep.routeHref}>
                  <Button variant="primary" size="sm" className="gap-2 font-medium">
                    <span>{currentStep.routeLabel}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>

                <span className="text-[10px] font-mono text-muted">
                  Scroll or click 01–05 to step
                </span>
              </div>
            </div>

            {/* Right Analytical Visualization Column (7 cols) */}
            <div className="col-span-7 w-full overflow-hidden">
              <div className="transition-all duration-300 ease-out">
                {activeStep === 0 && (
                  <div className="animate-in fade-in-50 duration-300">
                    <WeatherIntelligence />
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <div className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-primary">
                            STAGE 02 · 48H PROBABILISTIC FORECAST
                          </span>
                          <h4 className="font-display font-bold text-base text-foreground">
                            Ahmedabad Solar Array · 42 MW
                          </h4>
                        </div>
                        <Badge variant="nominal" className="text-[10px] font-mono">
                          P10/P50/P90 CALIBRATED
                        </Badge>
                      </div>

                      {/* Event Annotations Ribbon */}
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-muted bg-[#FAFBF9] p-2 rounded-xs border border-border-subtle">
                        <div>10:00 · Solar ramp starts</div>
                        <div>12:30 · 38.6 MW Solar peak</div>
                        <div>15:00 · Cloud front alert</div>
                        <div>18:30 · Diurnal sunset</div>
                      </div>

                      <ForecastChart
                        points={forecastData.points}
                        nowTimestamp={forecastData.nowTimestamp}
                        horizon="48h"
                        height={260}
                      />
                    </div>
                    <ForecastTransition />
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="animate-in fade-in-50 duration-300">
                    <RiskIntelligence />
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="animate-in fade-in-50 duration-300">
                    <ActionIntelligence />
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="animate-in fade-in-50 duration-300">
                    <ImpactIntelligence />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE & REDUCED MOTION UNPINNED PROGRESSION (< 1024px) */}
      <div className="lg:hidden max-w-[1440px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="border-b border-border pb-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
            OPERATIONAL NARRATIVE
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight mt-1">
            Weather to Decision: 5-Stage Closed Loop
          </h2>
        </div>

        {/* Step 01: Weather */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-primary bg-primary-tint px-2 py-0.5 rounded-xs">
              01
            </span>
            <h3 className="font-display font-bold text-lg text-foreground">
              Weather: Atmospheric Physics
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {narrativeSteps[0].description}
          </p>
          <WeatherIntelligence />
        </div>

        {/* Step 02: Forecast */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-primary bg-primary-tint px-2 py-0.5 rounded-xs">
              02
            </span>
            <h3 className="font-display font-bold text-lg text-foreground">
              Forecast: Probabilistic AI Engine
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {narrativeSteps[1].description}
          </p>
          <ForecastTransition />
        </div>

        {/* Step 03: Risk */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-danger bg-[#FDF2F2] text-danger px-2 py-0.5 rounded-xs">
              03
            </span>
            <h3 className="font-display font-bold text-lg text-foreground">
              Risk: Anomaly & Ramp Detection
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {narrativeSteps[2].description}
          </p>
          <RiskIntelligence />
        </div>

        {/* Step 04: Action */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-primary bg-primary-tint px-2 py-0.5 rounded-xs">
              04
            </span>
            <h3 className="font-display font-bold text-lg text-foreground">
              Action: Prescriptive BESS Dispatch
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {narrativeSteps[3].description}
          </p>
          <ActionIntelligence />
        </div>

        {/* Step 05: Impact */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-primary bg-primary-tint px-2 py-0.5 rounded-xs">
              05
            </span>
            <h3 className="font-display font-bold text-lg text-foreground">
              Impact: Commercial & Grid Stability
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {narrativeSteps[4].description}
          </p>
          <ImpactIntelligence />
        </div>
      </div>
    </section>
  );
}
