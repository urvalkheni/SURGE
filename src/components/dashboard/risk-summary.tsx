import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function RiskSummary({ className }: { className?: string }) {
  const { riskStatus } = dashboardData;

  const getSeverityBadge = (level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') => {
    switch (level) {
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
          {getSeverityBadge(riskStatus.level)}
          <span className="text-xs font-mono font-bold text-foreground tabular-nums">
            {riskStatus.score}/100
          </span>
        </div>
      </div>

      {/* Impending Event Alert Banner */}
      <div className="p-3 rounded-md bg-[#FDF6EC] border border-[#F5D6A4] space-y-1.5 text-xs">
        <div className="flex items-center justify-between font-mono">
          <span className="font-bold text-[#8C570A]">
            Next: {riskStatus.nextEvent.type} ({riskStatus.nextEvent.window})
          </span>
          <span className="text-danger font-bold tabular-nums">
            {riskStatus.nextEvent.potentialDropMw} MW
          </span>
        </div>
        <p className="text-[11px] text-[#8C570A] leading-relaxed">
          {riskStatus.headline}. Projected ramp rate of {riskStatus.nextEvent.expectedRampMwPerMin} MW/min exceeds the {riskStatus.nextEvent.toleranceRampMwPerMin} MW/min limit.
        </p>
      </div>

      {/* Risk Drivers Breakdown */}
      <div className="space-y-1.5 text-xs font-mono">
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
          Primary Risk Drivers
        </span>
        <div className="space-y-1">
          {riskStatus.drivers.map((driver) => (
            <div
              key={driver.label}
              className="flex items-center justify-between p-1.5 rounded bg-[#FAFBF9] border border-border-subtle"
            >
              <span className="text-foreground-secondary text-[11px]">{driver.label}</span>
              <span className="font-bold text-[#C98216] tabular-nums">+{driver.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Chronological Risk Timeline */}
      <div className="space-y-1.5 text-xs font-mono">
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
          Risk Horizon Timeline
        </span>
        <div className="grid grid-cols-5 gap-1 text-center">
          {riskStatus.timeline.map((item) => (
            <div
              key={item.time}
              className={cn(
                'p-1.5 rounded-xs border text-[10px]',
                item.level === 'HIGH'
                  ? 'border-danger/40 bg-[#FDF2F2] text-danger font-bold'
                  : item.level === 'MODERATE'
                  ? 'border-[#F5D6A4] bg-[#FDF6EC] text-[#8C570A] font-semibold'
                  : 'border-border-subtle bg-[#FAFBF9] text-muted'
              )}
            >
              <div>{item.time}</div>
              <div className="text-[9px] mt-0.5">{item.level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-muted">IEC 61850 Alert Bus</span>
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
