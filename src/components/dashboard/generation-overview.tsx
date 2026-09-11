'use client';

import * as React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ForecastChart } from '@/components/charts/forecast-chart';
import { getAhmedabadForecastData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export interface GenerationOverviewProps {
  horizon: '24h' | '48h' | '72h';
  onHorizonChange?: (horizon: '24h' | '48h' | '72h') => void;
  className?: string;
}

export function GenerationOverview({
  horizon,
  onHorizonChange,
  className,
}: GenerationOverviewProps) {
  const data = React.useMemo(() => {
    return getAhmedabadForecastData(horizon);
  }, [horizon]);

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 sm:p-6 space-y-4 flex flex-col justify-between',
        className
      )}
    >
      {/* Panel Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <TrendingUp className="size-3 text-primary" />
              GENERATION DISPATCH RADAR
            </span>
            <Badge variant="nominal" className="text-[10px] font-mono px-1.5 py-0">
              {horizon.toUpperCase()} ACTIVE
            </Badge>
          </div>
          <h2 className="font-display font-bold text-lg text-foreground tracking-tight">
            72-Hour Continuous Generation Forecast & Realized SCADA
          </h2>
        </div>

        {/* Local Horizon Controls if not controlled externally */}
        {onHorizonChange && (
          <div className="flex items-center gap-1 bg-[#F4F6F4] p-1 rounded-md border border-border-subtle self-start sm:self-auto">
            {(['24h', '48h', '72h'] as const).map((h) => {
              const isActive = horizon === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => onHorizonChange(h)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-mono font-bold rounded-sm transition-all focus-ring',
                    isActive
                      ? 'bg-surface text-primary-dark shadow-subtle'
                      : 'text-foreground-secondary hover:text-foreground'
                  )}
                  aria-pressed={isActive}
                >
                  {h.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Analytical Chart Canvas */}
      <div className="w-full">
        <ForecastChart
          points={data.points}
          nowTimestamp={data.nowTimestamp}
          horizon={horizon}
          height={340}
        />
      </div>

      {/* Footer Metrics & Deep-Link */}
      <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono tabular-nums">
        <div className="flex flex-wrap items-center gap-4 text-foreground-secondary">
          <span>Expected Yield: <strong className="text-foreground">{data.metrics.expectedEnergyMwh} MWh</strong></span>
          <span>·</span>
          <span>Peak: <strong className="text-foreground">{data.metrics.peakOutputMw} MW</strong></span>
          <span>·</span>
          <span>Uncertainty: <strong className="text-[#C98216]">±{data.metrics.uncertaintyPercent}%</strong></span>
        </div>

        <Link href="/forecast" className="self-end sm:self-auto">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark h-8">
            <SlidersHorizontal className="size-3.5" />
            <span>Open Forecast Workbench</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
