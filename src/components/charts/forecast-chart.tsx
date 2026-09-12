'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { ForecastPoint } from '@/types';
import { cn } from '@/lib/utils';

export interface ForecastChartProps {
  points: ForecastPoint[];
  nowTimestamp?: string;
  showConfidence?: boolean;
  height?: number | string;
  className?: string;
  horizon?: '24h' | '48h' | '72h';
  capacityMw?: number;
}

interface ChartDataPoint {
  rawTimestamp: string;
  timeLabel: string;
  fullDateLabel: string;
  actualMw: number | null;
  predictedMw: number;
  p10Mw: number;
  p90Mw: number;
  confidenceRange: [number, number];
  ghi: number;
  cloudCoverPercent: number;
  temperatureC: number;
  isDaytime: boolean;
  isRampAlert?: boolean;
}

export function ForecastChart({
  points,
  nowTimestamp = '2026-09-14T12:00:00Z',
  showConfidence = true,
  height = 360,
  className,
  horizon = '72h',
  capacityMw = 42.0,
}: ForecastChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const yDomainMax = React.useMemo(() => {
    const cap = capacityMw || 42.0;
    return Math.max(Math.ceil((cap * 1.1) / 10) * 10, 10);
  }, [capacityMw]);

  const yTicks = React.useMemo(() => {
    const step = yDomainMax <= 20 ? 5 : yDomainMax <= 60 ? 10 : 25;
    const ticks: number[] = [];
    for (let val = 0; val <= yDomainMax; val += step) {
      ticks.push(val);
    }
    return ticks;
  }, [yDomainMax]);

  // Format data for Recharts
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    return points.map((p, idx) => {
      const date = new Date(p.timestamp);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const dayIndex = Math.floor(idx / 24) + 1;
      
      const timeLabel = horizon === '24h' 
        ? `${hours}:00` 
        : `D${dayIndex} ${hours}:00`;

      const fullDateLabel = date.toLocaleString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' UTC';

      return {
        rawTimestamp: p.timestamp,
        timeLabel,
        fullDateLabel,
        actualMw: p.actualMw,
        predictedMw: p.predictedMw,
        p10Mw: p.p10Mw,
        p90Mw: p.p90Mw,
        confidenceRange: [p.p10Mw, p.p90Mw],
        ghi: p.ghi,
        cloudCoverPercent: p.cloudCoverPercent,
        temperatureC: p.temperatureC,
        isDaytime: p.isDaytime,
        isRampAlert: p.isRampAlert,
      };
    });
  }, [points, horizon]);

  // Identify "NOW" x-coordinate label strictly matching canonical current output
  const nowPoint = React.useMemo(() => {
    if (nowTimestamp) {
      const match = chartData.find((d) => d.rawTimestamp === nowTimestamp);
      if (match) return match;
    }
    const nowMs = Date.now();
    let closest = chartData[0];
    let minDiff = Infinity;
    chartData.forEach((d) => {
      const diff = Math.abs(new Date(d.rawTimestamp).getTime() - nowMs);
      if (diff < minDiff) {
        minDiff = diff;
        closest = d;
      }
    });
    return closest || chartData[0];
  }, [chartData, nowTimestamp]);

  // Identify night spans for subtle background shading
  const nightSpans = React.useMemo(() => {
    const spans: { start: string; end: string }[] = [];
    let currentStart: string | null = null;

    chartData.forEach((d, idx) => {
      if (!d.isDaytime) {
        if (!currentStart) currentStart = d.timeLabel;
      } else {
        if (currentStart) {
          spans.push({ start: currentStart, end: chartData[idx - 1]?.timeLabel || d.timeLabel });
          currentStart = null;
        }
      }
    });

    if (currentStart && chartData.length > 0) {
      spans.push({ start: currentStart, end: chartData[chartData.length - 1].timeLabel });
    }

    return spans;
  }, [chartData]);

  // Dynamic X-axis interval based on horizon and viewport
  const xAxisInterval = React.useMemo(() => {
    if (horizon === '24h') return 2; // Every 3 hours
    if (horizon === '48h') return 5; // Every 6 hours
    return 7; // Every 8 hours for 72h
  }, [horizon]);

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center bg-surface rounded-lg border border-border animate-pulse p-6',
          className
        )}
        style={{ height }}
      >
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Initializing Recharts Canvas...
        </span>
      </div>
    );
  }

  return (
    <div className={cn('w-full relative select-none flex flex-col', className)} style={{ height }}>
      {/* Legend & Telemetry Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 px-1 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-b-2 border-dashed border-[#167A4A]" />
            <span className="font-semibold text-primary-dark text-[11px]">Physics Baseline (Estimated PV Output)</span>
          </div>
          {showConfidence && (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-4 bg-[#167A4A]/15 rounded-xs border border-[#167A4A]/30" />
              <span className="text-foreground-secondary text-[11px]">Uncertainty Band (p10–p90)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted font-mono tabular-nums">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-border-subtle" />
            Shaded = Night
          </span>
          <span className="text-foreground-secondary font-medium">Cap: {capacityMw.toFixed(1)} MW</span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full flex-1 min-h-[220px] min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220} debounce={50}>
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E3E8E3"
                strokeOpacity={0.8}
              />

              {/* Night Shading Bands */}
              {nightSpans.map((span, idx) => (
                <ReferenceArea
                  key={`night-${idx}`}
                  x1={span.start}
                  x2={span.end}
                  fill="#17211B"
                  fillOpacity={0.035}
                />
              ))}

              {/* Grid Interconnect Capacity Limit Line */}
              <ReferenceLine
                y={capacityMw}
                stroke="#66736A"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `${capacityMw} MW RATED`,
                  position: 'insideTopRight',
                  fill: '#66736A',
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* NOW Vertical Reference Line */}
              {nowPoint && (
                <ReferenceLine
                  x={nowPoint.timeLabel}
                  stroke="#E05252"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{
                    value: `NOW · ${nowPoint.predictedMw.toFixed(1)} MW`,
                    position: 'insideTopLeft',
                    fill: '#E05252',
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                />
              )}

              <XAxis
                dataKey="timeLabel"
                interval={xAxisInterval}
                tickLine={false}
                axisLine={{ stroke: '#E3E8E3' }}
                tick={{ fill: '#66736A', fontSize: 10, fontFamily: 'monospace' }}
              />

              <YAxis
                domain={[0, yDomainMax]}
                ticks={yTicks}
                tickLine={false}
                axisLine={{ stroke: '#E3E8E3' }}
                tick={{ fill: '#66736A', fontSize: 10, fontFamily: 'monospace' }}
                unit=" MW"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* 80% Confidence Interval Band (p10–p90) */}
              {showConfidence && (
                <Area
                  type="monotone"
                  dataKey="confidenceRange"
                  stroke="none"
                  fill="#167A4A"
                  fillOpacity={0.12}
                  isAnimationActive={false}
                />
              )}

              {/* Physics Baseline / Model Prediction (p50) */}
              <Line
                type="monotone"
                dataKey="predictedMw"
                stroke="#167A4A"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 4, fill: '#167A4A', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full min-h-[220px] animate-pulse bg-[#FAFBF9] rounded border border-border-subtle" />
        )}
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    dataKey: string;
    value: number | [number, number] | null;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-surface/95 backdrop-blur-xs border border-border shadow-modal rounded-md p-3 text-xs min-w-[210px] space-y-2 z-50">
      <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
        <span className="font-mono font-semibold text-foreground text-[11px]">
          {data.fullDateLabel}
        </span>
        <span className="px-1.5 py-0.5 rounded-2xs text-[9px] font-bold uppercase tracking-wider bg-primary-tint text-primary-dark">
          PHYSICS BASELINE
        </span>
      </div>

      <div className="space-y-1.5 font-mono tabular-nums">
        <div className="flex items-center justify-between text-primary-dark font-semibold">
          <span className="text-[11px]">Estimated Output:</span>
          <span className="text-xs">{data.predictedMw.toFixed(1)} MW</span>
        </div>

        <div className="flex items-center justify-between text-foreground-secondary">
          <span className="text-[11px]">Uncertainty (p10–p90):</span>
          <span className="text-[11px]">
            {data.p10Mw.toFixed(1)} – {data.p90Mw.toFixed(1)} MW
          </span>
        </div>

        <div className="border-t border-border-subtle pt-1.5 mt-1 grid grid-cols-2 gap-x-2 text-[10px] text-muted">
          <div>
            <span>Cloud: </span>
            <span className="font-semibold text-foreground">{data.cloudCoverPercent}%</span>
          </div>
          <div>
            <span>GHI: </span>
            <span className="font-semibold text-foreground">{data.ghi} W/m²</span>
          </div>
          <div>
            <span>Temp: </span>
            <span className="font-semibold text-foreground">{data.temperatureC}°C</span>
          </div>
          <div>
            <span>Solar: </span>
            <span className="font-semibold text-foreground">{data.isDaytime ? 'Day' : 'Night'}</span>
          </div>
        </div>

        {data.isRampAlert && (
          <div className="mt-1 px-1.5 py-0.5 rounded-2xs bg-[#FDF6EC] border border-[#F5D6A4] text-[#8C570A] text-[10px] font-medium flex items-center justify-between">
            <span>Ramp Hazard Detected</span>
            <span>Δ &gt; 35%</span>
          </div>
        )}
      </div>
    </div>
  );
}
