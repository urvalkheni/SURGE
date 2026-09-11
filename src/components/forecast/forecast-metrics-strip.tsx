import * as React from 'react';
import { Zap, Calendar, TrendingUp, Target, Scale, Gauge } from 'lucide-react';
import { ForecastWorkbenchData } from '@/data/demo-data';

export interface ForecastMetricsStripProps {
  data: ForecastWorkbenchData['summaryMetrics'];
  horizon: '24h' | '48h' | '72h';
}

export function ForecastMetricsStrip({ data, horizon }: ForecastMetricsStripProps) {
  const energyDisplay =
    horizon === '24h' ? '284 MWh' : horizon === '48h' ? '548 MWh' : `${data.total72hEnergyMwh} MWh`;

  const horizonLabel =
    horizon === '24h' ? 'Next 24 Hours' : horizon === '48h' ? 'Next 48 Hours' : 'Next 72 Hours';

  const metrics = [
    {
      id: 'peak',
      label: 'Peak Forecast',
      value: `${data.peakForecastMw} MW`,
      subtext: `At ${data.peakTimestampIst}`,
      icon: Zap,
      accent: 'text-primary',
      bgAccent: 'bg-[#EBF5EE]',
    },
    {
      id: 'day1',
      label: 'Day-1 Energy',
      value: `${data.day1EnergyMwh} MWh`,
      subtext: 'Base daylight curve',
      icon: Calendar,
      accent: 'text-primary-dark',
      bgAccent: 'bg-[#EBF5EE]',
    },
    {
      id: 'total',
      label: `${horizon.toUpperCase()} Total Generation`,
      value: energyDisplay,
      subtext: horizonLabel,
      icon: TrendingUp,
      accent: 'text-primary',
      bgAccent: 'bg-[#EBF5EE]',
    },
    {
      id: 'mae',
      label: 'Mean Absolute Error',
      value: `${data.maeMw} MW`,
      subtext: `${data.maePercent}% of plant rating`,
      icon: Target,
      accent: 'text-foreground',
      bgAccent: 'bg-[#F2F4F2]',
    },
    {
      id: 'bias',
      label: 'Forecast Bias',
      value: `+${data.biasMw} MW`,
      subtext: 'Slight over-forecast bias',
      icon: Scale,
      accent: 'text-foreground',
      bgAccent: 'bg-[#F2F4F2]',
    },
    {
      id: 'spread',
      label: 'Ensemble Spread',
      value: `±${data.ensembleSpreadMw} MW`,
      subtext: 'P10–P90 corridor width',
      icon: Gauge,
      accent: 'text-primary-dark',
      bgAccent: 'bg-[#EBF5EE]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="rounded-lg border border-border bg-surface p-3.5 shadow-xs transition-shadow hover:shadow-subtle flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary line-clamp-1">
                {m.label}
              </span>
              <div className={`size-6 rounded-md ${m.bgAccent} flex items-center justify-center shrink-0`}>
                <Icon className={`size-3.5 ${m.accent}`} />
              </div>
            </div>

            <div>
              <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums">
                {m.value}
              </div>
              <div className="text-[11px] text-muted mt-0.5 font-medium truncate">
                {m.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
