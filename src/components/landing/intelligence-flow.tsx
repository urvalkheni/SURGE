import * as React from 'react';
import { CloudSun, TrendingUp, AlertTriangle, BatteryCharging, CheckCircle2, ChevronRight, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const flowSteps = [
  {
    step: '01',
    title: 'WEATHER',
    subtitle: 'NWP Intelligence',
    description: 'Understand incoming atmospheric conditions, cloud optical depth, and irradiance fluctuations.',
    icon: CloudSun,
    badge: 'Inputs',
  },
  {
    step: '02',
    title: 'FORECAST',
    subtitle: 'Probabilistic AI',
    description: 'Predict renewable generation with calibrated p10–p90 quantiles across 24h, 48h, and 72h horizons.',
    icon: TrendingUp,
    badge: 'Models',
  },
  {
    step: '03',
    title: 'RISK',
    subtitle: 'Anomaly Detection',
    description: 'Identify impending ramp cliffs, thermal clipping, and transmission interconnect capacity breaches.',
    icon: AlertTriangle,
    badge: 'Detection',
  },
  {
    step: '04',
    title: 'ACTION',
    subtitle: 'Prescriptive Dispatch',
    description: 'Recommend autonomous BESS charging/discharging, curtailment, or reserve commitment schedules.',
    icon: BatteryCharging,
    badge: 'Mitigation',
  },
  {
    step: '05',
    title: 'IMPACT',
    subtitle: 'Commercial Outcome',
    description: 'Reduce imbalance penalty exposure, avoid curtailment loss, and stabilize grid frequency.',
    icon: CheckCircle2,
    badge: 'Value',
  },
];

export function IntelligenceFlow() {
  return (
    <section id="intelligence-flow" className="w-full py-16 sm:py-20 border-y border-border bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              CLOSED-LOOP CONTROL PIPELINE
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
              From weather uncertainty to operational certainty.
            </h2>
            <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed">
              RenewableIQ transforms noisy meteorological forecasts into automated dispatch instructions, 
              closing the gap between physical generation and grid dispatch economics.
            </p>
          </div>

          <Badge variant="outline" className="self-start md:self-auto text-xs font-mono">
            5-Stage Analytical Pipeline
          </Badge>
        </div>

        {/* 5-Step Horizontal Grid (Desktop) / Vertical Stack (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-4 relative">
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === flowSteps.length - 1;

            return (
              <div key={step.step} className="relative flex flex-col">
                <Card className="h-full border-border bg-[#FCFDFC] hover:border-primary/40 hover:bg-white transition-all shadow-none">
                  <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-4">
                    {/* Top Step Header */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono font-bold text-xs text-primary bg-primary-tint px-2 py-0.5 rounded-xs">
                          {step.step}
                        </span>
                        <span className="text-[10px] font-mono text-muted uppercase">
                          {step.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-sm bg-[#F4F6F4] text-foreground">
                          <Icon className="size-4 text-primary-dark" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm tracking-tight text-foreground">
                            {step.title}
                          </h3>
                          <div className="text-[10px] text-muted font-medium">
                            {step.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Flow Indicator Arrows */}
                {!isLast && (
                  <>
                    {/* Desktop Right Chevron */}
                    <div
                      className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 size-5 items-center justify-center rounded-full bg-surface border border-border text-muted"
                      aria-hidden="true"
                    >
                      <ChevronRight className="size-3" />
                    </div>

                    {/* Mobile Down Arrow */}
                    <div
                      className="md:hidden flex justify-center py-1 text-muted"
                      aria-hidden="true"
                    >
                      <ArrowDown className="size-3.5" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
