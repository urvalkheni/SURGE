'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Cpu, Activity } from 'lucide-react';
import { exportForecastCsv, HourlyWorkbenchPoint } from '@/data/demo-data';

import { usePlant } from '@/contexts/plant-context';

export interface ForecastWorkbenchHeaderProps {
  horizon: '24h' | '48h' | '72h';
  onHorizonChange: (h: '24h' | '48h' | '72h') => void;
  resolution: '15m' | '1h';
  onResolutionChange: (r: '15m' | '1h') => void;
  exportPoints: HourlyWorkbenchPoint[];
}

export function ForecastWorkbenchHeader({
  horizon,
  onHorizonChange,
  resolution,
  onResolutionChange,
  exportPoints,
}: ForecastWorkbenchHeaderProps) {
  const { plant, configuration } = usePlant();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportForecastCsv(exportPoints, {
        plantName: plant?.name || 'Renewable Plant',
        resolution,
        horizon,
        weatherSource: 'OPEN_METEO_LIVE',
        forecastSource: 'PHYSICS_BASELINE',
      });
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  const plantName = plant?.name || 'Ahmedabad Solar Plant';
  const acCap = configuration?.acCapacityMw ?? 42.0;
  const dcCap = configuration?.dcCapacityMw ?? 50.0;
  const gridNode = configuration?.gridOperator 
    ? `${configuration.gridOperator} ${configuration.gridVoltageKv}kV Node` 
    : 'GETCO 220kV Node';

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 mb-6">
      {/* Top row: Identity, Badges, SCADA Heartbeat */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              ANALYTICAL WORKBENCH
            </span>
            <span className="text-muted">·</span>
            <Badge variant="nominal" className="text-[11px] font-mono uppercase">
              OPERATIONAL
            </Badge>
            <span className="text-muted">·</span>
            <div
              className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary font-medium bg-[#F3F4F6] px-2 py-0.5 rounded-sm border border-border"
              title="Live plant SCADA telemetry is not connected"
            >
              <span className="size-2 rounded-full bg-muted-foreground/50" />
              <Activity className="size-3 text-muted-foreground" />
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground-secondary">
                SCADA: NOT CONNECTED
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            72-Hour Forecast Workbench
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            {plantName} · {acCap.toFixed(1)} MW AC / {dcCap.toFixed(1)} MW DC · {gridNode} · Continuous Physics Baseline
          </p>
        </div>

        {/* Model telemetry tag & Export CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-subtle bg-[#F7F9F6] text-xs font-mono text-foreground-secondary">
            <Cpu className="size-3.5 text-primary" />
            <span>PHYSICS BASELINE</span>
            <span className="text-muted">|</span>
            <span className="text-amber-700 font-semibold">ML: NOT CONNECTED</span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-1.5 h-9 font-medium text-xs border-border bg-surface hover:bg-[#EEF2EE]"
          >
            <Download className="size-3.5 text-primary" />
            <span>{isExporting ? 'Generating...' : 'Export Forecast CSV'}</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: Interactive Horizon & Resolution controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Horizon Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground-secondary">Forecast Horizon:</span>
          <div className="inline-flex rounded-md bg-[#EEF2EE] p-1 border border-border-subtle" role="tablist" aria-label="Forecast Horizon">
            {(['24h', '48h', '72h'] as const).map((h) => {
              const active = horizon === h;
              return (
                <button
                  key={h}
                  onClick={() => onHorizonChange(h)}
                  role="tab"
                  aria-selected={active}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-sm transition-all cursor-pointer ${
                    active
                      ? 'bg-surface text-foreground font-bold shadow-subtle'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  {h.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground-secondary">Time Resolution:</span>
          <div className="inline-flex rounded-md bg-[#EEF2EE] p-1 border border-border-subtle" role="tablist" aria-label="Temporal Resolution">
            {(['15m', '1h'] as const).map((r) => {
              const active = resolution === r;
              return (
                <button
                  key={r}
                  onClick={() => onResolutionChange(r)}
                  role="tab"
                  aria-selected={active}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-sm transition-all cursor-pointer ${
                    active
                      ? 'bg-surface text-foreground font-bold shadow-subtle'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  {r === '15m' ? '15 Min (High-Res)' : '1 Hour (Standard)'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
