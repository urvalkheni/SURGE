import * as React from 'react';
import { Gauge, CheckCircle2, Battery, Cpu, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePlant } from '@/contexts/plant-context';
import { cn } from '@/lib/utils';

export function CurrentCondition({ className }: { className?: string }) {
  const { currentOutputMw, utilizationPercent, configuration } = usePlant();

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
          <Gauge className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Current Operating Condition
          </h3>
        </div>
        <Badge variant="nominal" className="text-[10px] font-mono px-1.5 py-0">
          HEALTHY
        </Badge>
      </div>

      {/* Main Power Meter Display */}
      <div className="p-3.5 rounded-md bg-[#FAFBF9] border border-border-subtle flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-muted">
            Estimated Active Output
          </span>
          <div className="font-mono font-bold text-2xl text-foreground tabular-nums flex items-baseline gap-1 mt-0.5">
            <span>{currentOutputMw.toFixed(1)}</span>
            <span className="text-xs font-normal text-muted">/ {configuration.acCapacityMw.toFixed(1)} MW</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase font-bold text-muted">
            Utilization
          </span>
          <div className="font-mono font-bold text-xl text-primary tabular-nums mt-0.5">
            {utilizationPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Grid, Inverter & Storage Health Grid */}
      <div className="space-y-2 text-xs font-mono">
        {/* Active Ramp Rate */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded bg-white border border-border-subtle">
          <div className="flex items-center gap-2 shrink-0">
            <Activity className="size-3.5 text-primary" />
            <span className="text-foreground-secondary">Ramp Limit:</span>
          </div>
          <span className="font-bold text-foreground tabular-nums text-right">
            {configuration.rampLimitMwPerMin.toFixed(2)} MW/min ({configuration.gridOperator})
          </span>
        </div>

        {/* Grid Interconnection Frequency */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded bg-white border border-border-subtle">
          <div className="flex items-center gap-2 shrink-0">
            <CheckCircle2 className="size-3.5 text-primary" />
            <span className="text-foreground-secondary">Interconnect:</span>
          </div>
          <span className="font-bold text-foreground tabular-nums text-right">
            {configuration.gridVoltageKv} kV · {configuration.gridNode}
          </span>
        </div>

        {/* Inverter Substation Status */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded bg-white border border-border-subtle">
          <div className="flex items-center gap-2 shrink-0">
            <Cpu className="size-3.5 text-primary" />
            <span className="text-foreground-secondary">Inverters:</span>
          </div>
          <span className="font-bold text-foreground tabular-nums text-right">
            {configuration.inverterCount} Blocks Online ({configuration.inverterEfficiencyPct}%)
          </span>
        </div>

        {/* BESS Battery Storage */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded bg-white border border-border-subtle">
          <div className="flex items-center gap-2 shrink-0">
            <Battery className="size-3.5 text-primary" />
            <span className="text-foreground-secondary">BESS Ready:</span>
          </div>
          <span className="font-bold text-primary-dark tabular-nums text-right">
            {configuration.bessEnabled
              ? `${configuration.bessSocPct.toFixed(0)}% SOC (${configuration.bessPowerMw} MW / ${configuration.bessEnergyMwh} MWh)`
              : 'Disabled (No Battery)'}
          </span>
        </div>
      </div>
    </div>
  );
}
