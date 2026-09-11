import * as React from 'react';
import { Clock, Zap, Target, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ForecastKpiStripProps {
  horizon?: '24h' | '48h' | '72h';
  capacityMw?: number;
  uncertaintyPercent?: number;
  confidencePercent?: number;
  className?: string;
}

export function ForecastKpiStrip({
  horizon = '72h',
  capacityMw = 42.0,
  uncertaintyPercent = 7.8,
  confidencePercent = 94.2,
  className,
}: ForecastKpiStripProps) {
  const kpis = [
    {
      label: 'Forecast Horizon',
      value: horizon.toUpperCase(),
      subtext: 'Forward lookahead',
      icon: Clock,
    },
    {
      label: 'Plant Capacity',
      value: `${capacityMw.toFixed(1)} MW`,
      subtext: 'Nameplate solar rating',
      icon: Zap,
    },
    {
      label: 'Forecast Uncertainty',
      value: `±${uncertaintyPercent.toFixed(1)}%`,
      subtext: 'Quantile dispersion',
      icon: Target,
    },
    {
      label: 'Model Confidence',
      value: `${confidencePercent.toFixed(1)}%`,
      subtext: 'Historical validation',
      icon: Gauge,
    },
  ];

  return (
    <div className={cn('w-full border-t border-border bg-[#FAFBF9] p-3 sm:p-4 rounded-b-lg', className)}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="flex flex-col space-y-0.5">
              <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase font-bold tracking-wider">
                <Icon className="size-3 text-primary" />
                <span>{kpi.label}</span>
              </div>
              <div className="font-mono font-semibold text-foreground text-sm sm:text-base tabular-nums">
                {kpi.value}
              </div>
              <div className="text-[10px] text-foreground-secondary truncate">
                {kpi.subtext}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-muted">
        <span className="flex items-center gap-1 font-mono">
          <span className="size-1.5 rounded-full bg-primary" />
          SIMULATED FORECAST · DETERMINISTIC DEMO TELEMETRY
        </span>
        <span className="font-mono tabular-nums">
          Ref: ENSEMBLE-NWP-V3
        </span>
      </div>
    </div>
  );
}
