import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, DollarSign, Activity, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function ImpactSummary({ className }: { className?: string }) {
  const { impact } = dashboardData;

  const metrics = [
    {
      label: "Today's Yield",
      value: `${impact.projectedEnergyMwh} MWh`,
      sub: 'Projected dispatch',
      icon: Zap,
    },
    {
      label: 'Avoided Curtailment',
      value: `${impact.avoidedCurtailmentMwh} MWh`,
      sub: 'BESS absorption',
      icon: Activity,
    },
    {
      label: 'Imbalance Exposure',
      value: `$${impact.potentialImbalanceExposureUsd.toLocaleString()}`,
      sub: 'Unmitigated risk',
      icon: DollarSign,
    },
    {
      label: 'Expected Savings',
      value: `$${impact.expectedMitigationUsd.toLocaleString()}`,
      sub: 'Via proactive dispatch',
      icon: ShieldCheck,
    },
    {
      label: 'Grid Compliance',
      value: `${impact.gridCompliancePercent}%`,
      sub: 'Tolerance score',
      icon: ShieldCheck,
    },
    {
      label: 'CO₂ Displaced',
      value: `~${impact.carbonAvoidedTonnes} t`,
      sub: 'Emissions offset',
      icon: Zap,
    },
  ];

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 select-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Projected Economic & Grid Compliance Impact
          </h3>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto text-[9px] font-mono text-muted">
          {impact.source}
        </Badge>
      </div>

      {/* 6 Key Impact Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-3 rounded bg-[#FAFBF9] border border-border-subtle flex flex-col justify-between space-y-1"
            >
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-muted uppercase">
                <Icon className="size-3 text-primary" />
                <span className="truncate">{m.label}</span>
              </div>
              <div className="font-mono font-bold text-base text-foreground tabular-nums">
                {m.value}
              </div>
              <div className="text-[10px] text-foreground-secondary truncate font-mono">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimers & Action */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>SIMULATED IMPACT · Values are model calculations based on GETCO 220kV tariff schedule.</span>
        </div>

        <Link href="/recommendations" className="self-end sm:self-auto shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark h-8">
            <span>View Prescriptive Actions</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
