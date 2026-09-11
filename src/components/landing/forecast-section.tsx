'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart2, Cpu, CloudDrizzle, Settings2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ForecastChart } from '@/components/charts/forecast-chart';
import { WeatherContextStrip } from './weather-context-strip';
import { getAhmedabadForecastData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function ForecastSection() {
  const [horizon, setHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');

  const data = React.useMemo(() => {
    return getAhmedabadForecastData(horizon);
  }, [horizon]);

  return (
    <section id="forecast-section" className="w-full py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              PROBABILISTIC FORECAST WORKBENCH
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
              See the next 72 hours before they happen.
            </h2>
            <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed">
              RenewableIQ does not simply predict tomorrow’s generation. It models how real-time atmospheric conditions 
              interact with physical plant constraints — then quantifies the operational uncertainty around every single hour.
            </p>
          </div>

          {/* Horizon Switcher Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-surface p-1.5 rounded-lg border border-border shadow-subtle">
            <span className="text-[11px] font-mono text-muted uppercase px-2 font-semibold">
              Horizon:
            </span>
            {(['24h', '48h', '72h'] as const).map((h) => {
              const isActive = horizon === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-mono font-bold rounded-md transition-all focus-ring',
                    isActive
                      ? 'bg-primary-dark text-white shadow-subtle'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-[#F3F6F3]'
                  )}
                  aria-pressed={isActive}
                >
                  {h.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-surface">
            <CardContent className="p-4 sm:p-5">
              <div className="text-[11px] font-mono uppercase font-bold text-muted mb-1">
                Expected Energy
              </div>
              <div className="font-mono font-bold text-2xl sm:text-3xl text-foreground tabular-nums">
                {data.metrics.expectedEnergyMwh.toLocaleString()} <span className="text-sm font-normal text-foreground-secondary">MWh</span>
              </div>
              <div className="text-[11px] text-primary mt-1 font-medium">
                Integrated {horizon.toUpperCase()} generation
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardContent className="p-4 sm:p-5">
              <div className="text-[11px] font-mono uppercase font-bold text-muted mb-1">
                Peak Output
              </div>
              <div className="font-mono font-bold text-2xl sm:text-3xl text-foreground tabular-nums">
                {data.metrics.peakOutputMw.toFixed(1)} <span className="text-sm font-normal text-foreground-secondary">MW</span>
              </div>
              <div className="text-[11px] text-foreground-secondary mt-1">
                At 12:30 UTC solar noon
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardContent className="p-4 sm:p-5">
              <div className="text-[11px] font-mono uppercase font-bold text-muted mb-1">
                Forecast Uncertainty
              </div>
              <div className="font-mono font-bold text-2xl sm:text-3xl text-foreground tabular-nums">
                ±{data.metrics.uncertaintyPercent.toFixed(1)}%
              </div>
              <div className="text-[11px] text-[#C98216] mt-1 font-medium">
                p10–p90 dispersion band
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardContent className="p-4 sm:p-5">
              <div className="text-[11px] font-mono uppercase font-bold text-muted mb-1">
                Risk Events Detected
              </div>
              <div className="font-mono font-bold text-2xl sm:text-3xl text-foreground tabular-nums flex items-baseline gap-2">
                <span>{data.metrics.riskEventsCount}</span>
                <span className="text-xs font-mono font-normal text-muted">events</span>
              </div>
              <div className="text-[11px] text-danger mt-1 font-medium">
                {data.metrics.riskEventsCount > 0 ? 'Actionable mitigation required' : 'Nominal profile'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Large Forecast Visualization Panel */}
        <div className="bg-surface border border-border rounded-lg shadow-card p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-primary" />
              <span className="font-display font-bold text-base text-foreground">
                Continuous Horizon Simulation · {horizon.toUpperCase()}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Ahmedabad PV · 42 MW
              </Badge>
            </div>
            <div className="text-xs font-mono text-muted tabular-nums">
              Last synced: 2026-09-14 12:00 UTC · Next cycle in 15m
            </div>
          </div>

          {/* Recharts Canvas */}
          <ForecastChart
            points={data.points}
            nowTimestamp={data.nowTimestamp}
            horizon={horizon}
            height={380}
          />

          {/* Weather Context Telemetry Strip */}
          <WeatherContextStrip
            temperatureC={data.weatherContext.temperatureC}
            cloudCoverPercent={data.weatherContext.cloudCoverPercent}
            windSpeedMs={data.weatherContext.windSpeedMs}
            solarRadiationGhi={data.weatherContext.solarRadiationGhi}
            humidityPercent={data.weatherContext.humidityPercent}
          />
        </div>

        {/* Technical Model Explanation & Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-md border border-border bg-surface flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs font-mono">
              <CloudDrizzle className="size-4 text-primary" />
              <span>01. WEATHER INPUTS</span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Multi-model NWP blend combining GFS, ECMWF, and satellite cloud vector optical depth to predict surface GHI.
            </p>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs font-mono">
              <BarChart2 className="size-4 text-primary" />
              <span>02. HISTORICAL SCADA</span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Trained on 3+ years of string-level inverter telemetry, tracking soiling rates and tracker tilt degradation.
            </p>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs font-mono">
              <Settings2 className="size-4 text-primary" />
              <span>03. PLANT PARAMETERS</span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Simulates DC:AC clipping (1.25 ratio), cell temperature thermal derating (-0.35%/°C), and inverter availability.
            </p>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs font-mono">
              <Cpu className="size-4 text-primary" />
              <span>04. ENSEMBLE AI</span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Calibrated gradient-boosted quantile regression generating probabilistic envelopes (p10, p50, p90).
            </p>
          </div>
        </div>

        {/* Action Link to Full Forecast Workbench */}
        <div className="flex justify-center pt-2">
          <Link href="/forecast">
            <Button variant="outline" size="md" className="gap-2 font-medium">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>Open Full Forecast Workbench & Scenario Sandbox</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
