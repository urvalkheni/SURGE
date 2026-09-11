'use client';

import * as React from 'react';
import { Sun, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ForecastChart } from '@/components/charts/forecast-chart';
import { ForecastKpiStrip } from '@/components/landing/forecast-kpi-strip';
import { getAhmedabadForecastData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function HeroForecastVisualizer({ className }: { className?: string }) {
  const [horizon, setHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');

  const data = React.useMemo(() => {
    return getAhmedabadForecastData(horizon);
  }, [horizon]);

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card overflow-hidden flex flex-col',
        className
      )}
    >
      {/* Panel Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Sun className="size-3 text-primary" />
              SOLAR GENERATION FORECAST
            </span>
            <Badge variant="nominal" className="text-[10px] px-1.5 py-0">
              <CheckCircle2 className="size-2.5 mr-1" />
              {data.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">
              {data.plantName}
            </h3>
            <span className="text-xs font-mono text-muted">·</span>
            <span className="text-xs font-mono font-semibold text-primary-dark tabular-nums">
              {data.capacityMw.toFixed(1)} MW
            </span>
          </div>
        </div>

        {/* Segmented Horizon Switcher Controls */}
        <div className="flex items-center gap-1 bg-[#F4F6F4] p-1 rounded-md border border-border-subtle self-start sm:self-auto">
          {(['24h', '48h', '72h'] as const).map((h) => {
            const isActive = horizon === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={cn(
                  'px-3 py-1 text-xs font-mono font-semibold rounded-sm transition-all focus-ring',
                  isActive
                    ? 'bg-surface text-primary-dark shadow-subtle'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-white/50'
                )}
                aria-pressed={isActive}
              >
                {h.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytical Chart Canvas Container */}
      <div className="p-3 sm:p-5 flex-1 bg-white">
        <ForecastChart
          points={data.points}
          nowTimestamp={data.nowTimestamp}
          horizon={horizon}
          height={320}
        />
      </div>

      {/* Integrated High-Density Operational KPI Strip */}
      <ForecastKpiStrip
        horizon={horizon}
        capacityMw={data.capacityMw}
        uncertaintyPercent={data.metrics.uncertaintyPercent}
        confidencePercent={data.metrics.modelConfidencePercent}
      />
    </div>
  );
}
