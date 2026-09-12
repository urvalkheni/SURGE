import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlant } from '@/contexts/plant-context';
import { cn } from '@/lib/utils';

export function RiskSummary({ className }: { className?: string }) {
  const { risks, configuration } = usePlant();

  const activeRisk = risks && risks.length > 0 ? risks[0] : null;

  const level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = activeRisk
    ? activeRisk.severity === 'critical'
      ? 'CRITICAL'
      : activeRisk.severity === 'high'
      ? 'HIGH'
      : activeRisk.severity === 'medium'
      ? 'MODERATE'
      : 'LOW'
    : 'LOW';

  const score = activeRisk
    ? activeRisk.severity === 'critical'
      ? 88
      : activeRisk.severity === 'high'
      ? 74
      : activeRisk.severity === 'medium'
      ? 52
      : 24
    : 5;

  const nextEventType = activeRisk ? activeRisk.category.replace('_', ' ').toUpperCase() : 'NOMINAL';
  const nextEventWindow = activeRisk ? `T-${activeRisk.leadTimeMinutes}m` : 'Clear';
  const nextEventDrop = activeRisk ? `${Math.abs(activeRisk.deltaMw).toFixed(1)} MW` : '0.0 MW';
  const headline = activeRisk ? activeRisk.headline : 'Nominal grid injection stability';
  const rampTolerance = configuration?.rampLimitMwPerMin ?? 2.5;
  const expectedRamp = activeRisk?.rampRateMwPerMin ? activeRisk.rampRateMwPerMin.toFixed(2) : '0.00';

  const getSeverityBadge = (lvl: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') => {
    switch (lvl) {
      case 'LOW':
        return <Badge variant="nominal" className="text-[9px] px-1 py-0">LOW</Badge>;
      case 'MODERATE':
        return <Badge variant="warning" className="text-[9px] px-1 py-0">MODERATE</Badge>;
      case 'HIGH':
      case 'CRITICAL':
        return <Badge variant="critical" className="text-[9px] px-1 py-0">HIGH</Badge>;
    }
  };

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 select-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-warning" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Operational Risk Radar
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {getSeverityBadge(level)}
          <span className="text-xs font-mono font-bold text-foreground tabular-nums">
            {score}/100
          </span>
        </div>
      </div>

      {/* Impending Event Alert Banner */}
      {activeRisk ? (
        <div className="p-3 rounded-md bg-[#FDF6EC] border border-[#F5D6A4] space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-1 font-mono">
            <span className="font-bold text-[#8C570A]">
              Next: {nextEventType} ({nextEventWindow})
            </span>
            <span className="text-danger font-bold tabular-nums">
              {nextEventDrop}
            </span>
          </div>
          <p className="text-[11px] text-[#8C570A] leading-relaxed">
            {headline}. Projected ramp rate of {expectedRamp} MW/min (Tolerance: {rampTolerance} MW/min).
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-md bg-[#EBF5EE] border border-[#BCE3CA] space-y-1 text-xs text-[#0D4F32]">
          <div className="font-bold font-mono text-xs flex items-center justify-between">
            <span>GRID RAMP STATUS: STABLE</span>
            <span>0 ACTIVE ALERTS</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Generation profile operates within configured {rampTolerance} MW/min ramp tolerances across the active horizon.
          </p>
        </div>
      )}

      {/* Risk Drivers Breakdown */}
      <div className="space-y-1.5 text-xs font-mono">
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
          Primary Risk Drivers
        </span>
        <div className="space-y-1">
          {activeRisk ? (
            <div className="flex items-center justify-between p-1.5 rounded bg-[#FAFBF9] border border-border-subtle">
              <span className="text-foreground-secondary text-[11px]">{activeRisk.rootCause}</span>
              <span className="font-bold text-[#C98216] tabular-nums">+{activeRisk.deltaMw} MW</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-1.5 rounded bg-[#FAFBF9] border border-border-subtle">
              <span className="text-foreground-secondary text-[11px]">Atmospheric solar radiation nominal</span>
              <span className="font-bold text-primary tabular-nums">NOMINAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-muted">Deterministic Physics Radar</span>
        <Link href="/risks">
          <Button variant="ghost" size="sm" className="gap-1 font-medium text-warning-dark hover:text-danger h-7 px-2">
            <span>View Risk Analysis</span>
            <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
