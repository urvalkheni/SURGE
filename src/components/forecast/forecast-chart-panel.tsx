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
import { HourlyWorkbenchPoint } from '@/data/demo-data';
import { cn } from '@/lib/utils';
import { Layers, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export interface ForecastChartPanelProps {
  points: HourlyWorkbenchPoint[];
  horizon: '24h' | '48h' | '72h';
  className?: string;
}

interface ChartDataPoint {
  rawTimestamp: string;
  timeLabel: string;
  fullDateLabel: string;
  actualMw: number | null;
  p50Mw: number;
  p10Mw: number;
  p90Mw: number;
  confidenceRange: [number, number];
  dayAheadMw: number;
  deltaMw: number;
  cloudCoverPercent: number;
  ghiWm2: number;
  temperatureC: number;
  isRampAlert: boolean;
  isNight: boolean;
}

export function ForecastChartPanel({ points, horizon, className }: ForecastChartPanelProps) {
  const [mounted, setMounted] = React.useState(false);

  // Layer toggles
  const [showP50, setShowP50] = React.useState(true);
  const [showConfidence, setShowConfidence] = React.useState(true);
  const [showSchedule, setShowSchedule] = React.useState(true);
  const [showActuals, setShowActuals] = React.useState(true);
  const [showCapacity, setShowCapacity] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Filter points based on horizon
  const horizonPoints = React.useMemo(() => {
    const limit = horizon === '24h' ? 24 : horizon === '48h' ? 48 : 72;
    return points.slice(0, limit);
  }, [points, horizon]);

  // Format data for Recharts
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    return horizonPoints.map((p) => {
      const isNight = p.weatherCondition === 'Night' || p.ghiWm2 === 0;

      return {
        rawTimestamp: p.timestampUtc,
        timeLabel: p.timeIst,
        fullDateLabel: `${p.timeIst} (${p.weatherCondition})`,
        actualMw: p.isHistorical ? p.p50Mw : null,
        p50Mw: p.p50Mw,
        p10Mw: p.p10Mw,
        p90Mw: p.p90Mw,
        confidenceRange: [p.p10Mw, p.p90Mw],
        dayAheadMw: p.dayAheadMw,
        deltaMw: p.deltaMw,
        cloudCoverPercent: p.cloudCoverPercent,
        ghiWm2: p.ghiWm2,
        temperatureC: p.temperatureC,
        isRampAlert: p.isRampAlert,
        isNight,
      };
    });
  }, [horizonPoints]);

  // Identify "NOW" x coordinate label (around 12:00 / index 12)
  const nowPoint = chartData[12] || chartData[0];

  // Dynamic X-axis interval based on horizon
  const xAxisInterval = React.useMemo(() => {
    if (horizon === '24h') return 2; // Every 3 hours
    if (horizon === '48h') return 4; // Every 5 hours
    return 6; // Every 7 hours
  }, [horizon]);

  if (!mounted) {
    return (
      <div className={cn('w-full rounded-lg border border-border bg-surface p-6 min-h-[460px] animate-pulse', className)}>
        <div className="h-6 w-48 bg-border rounded-sm mb-4" />
        <div className="h-[380px] w-full bg-[#F4F6F4] rounded-md flex items-center justify-center text-xs font-mono text-muted">
          Initializing Analytical Recharts Workbench...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card mb-6', className)}>
      {/* Header with Title and Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h2 className="font-display font-semibold text-base text-foreground">
              Multi-Layer Generation & Uncertainty Visualizer
            </h2>
          </div>
          <p className="text-xs text-foreground-secondary mt-0.5">
            P50 Median Forecast vs P10–P90 Uncertainty Corridor vs Day-Ahead Schedule
          </p>
        </div>

        {/* Interactive Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowP50(!showP50)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-medium border transition-colors cursor-pointer',
              showP50
                ? 'bg-[#EBF5EE] text-[#0D4F32] border-[#BCE3CA]'
                : 'bg-transparent text-muted border-border hover:border-foreground/30'
            )}
            title="Toggle P50 Ensemble Forecast Line"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span>P50 Forecast</span>
            {showP50 ? <Eye className="size-3 ml-0.5" /> : <EyeOff className="size-3 ml-0.5 text-muted" />}
          </button>

          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-medium border transition-colors cursor-pointer',
              showConfidence
                ? 'bg-[#EBF5EE] text-[#0D4F32] border-[#BCE3CA]'
                : 'bg-transparent text-muted border-border hover:border-foreground/30'
            )}
            title="Toggle P10–P90 Confidence Corridor Shading"
          >
            <span className="size-2 rounded-xs bg-primary/40" />
            <span>P10–P90 Corridor</span>
            {showConfidence ? <Eye className="size-3 ml-0.5" /> : <EyeOff className="size-3 ml-0.5 text-muted" />}
          </button>

          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-medium border transition-colors cursor-pointer',
              showSchedule
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                : 'bg-transparent text-muted border-border hover:border-foreground/30'
            )}
            title="Toggle Day-Ahead Schedule Commitment"
          >
            <span className="h-0.5 w-2.5 border-b-2 border-dashed border-warning" />
            <span>Schedule</span>
            {showSchedule ? <Eye className="size-3 ml-0.5" /> : <EyeOff className="size-3 ml-0.5 text-muted" />}
          </button>

          <button
            onClick={() => setShowActuals(!showActuals)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-medium border transition-colors cursor-pointer',
              showActuals
                ? 'bg-[#F2F4F2] text-foreground border-border'
                : 'bg-transparent text-muted border-border hover:border-foreground/30'
            )}
            title="Toggle Realized SCADA Telemetry"
          >
            <span className="size-2 rounded-full bg-[#0D4F32]" />
            <span>Actuals (≤NOW)</span>
            {showActuals ? <Eye className="size-3 ml-0.5" /> : <EyeOff className="size-3 ml-0.5 text-muted" />}
          </button>

          <button
            onClick={() => setShowCapacity(!showCapacity)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-medium border transition-colors cursor-pointer',
              showCapacity
                ? 'bg-[#F2F4F2] text-foreground border-border'
                : 'bg-transparent text-muted border-border hover:border-foreground/30'
            )}
            title="Toggle 42 MW Nameplate Capacity Line"
          >
            <span className="h-0.5 w-2.5 border-b-2 border-dotted border-muted" />
            <span>Cap (42 MW)</span>
            {showCapacity ? <Eye className="size-3 ml-0.5" /> : <EyeOff className="size-3 ml-0.5 text-muted" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[400px] select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E3" strokeOpacity={0.8} />

            <XAxis
              dataKey="timeLabel"
              interval={xAxisInterval}
              tickLine={false}
              axisLine={{ stroke: '#E3E8E3' }}
              tick={{ fill: '#66736A', fontSize: 11, fontFamily: 'monospace' }}
            />

            <YAxis
              domain={[0, 46]}
              ticks={[0, 10, 20, 30, 40]}
              tickLine={false}
              axisLine={{ stroke: '#E3E8E3' }}
              tick={{ fill: '#66736A', fontSize: 11, fontFamily: 'monospace' }}
              unit=" MW"
            />

            <Tooltip content={<WorkbenchTooltip />} cursor={{ stroke: '#66736A', strokeWidth: 1, strokeDasharray: '2 2' }} />

            {/* Capacity Reference Line */}
            {showCapacity && (
              <ReferenceLine
                y={42}
                stroke="#66736A"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: '42.0 MW NAMEPLATE CAP',
                  position: 'insideTopRight',
                  fill: '#66736A',
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* NOW Reference Line */}
            {nowPoint && (
              <ReferenceLine
                x={nowPoint.timeLabel}
                stroke="#17211B"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: 'NOW (12:00)',
                  position: 'insideTopLeft',
                  fill: '#17211B',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* Highlighted Convective Cloud Ramp Alert Zone (Day 1 14:45–15:30) */}
            {chartData[14] && chartData[15] && (
              <ReferenceArea
                x1={chartData[14].timeLabel}
                x2={chartData[15].timeLabel}
                fill="#DC2626"
                fillOpacity={0.08}
                stroke="#DC2626"
                strokeDasharray="2 2"
              />
            )}

            {/* P10–P90 Confidence Envelope */}
            {showConfidence && (
              <Area
                type="monotone"
                dataKey="confidenceRange"
                stroke="none"
                fill="#167A4A"
                fillOpacity={0.14}
                isAnimationActive={false}
              />
            )}

            {/* Day-Ahead Schedule Commitment Line */}
            {showSchedule && (
              <Line
                type="monotone"
                dataKey="dayAheadMw"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}

            {/* P50 AI Predicted Line */}
            {showP50 && (
              <Line
                type="monotone"
                dataKey="p50Mw"
                stroke="#167A4A"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#167A4A', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}

            {/* Realized Historical Actuals Line */}
            {showActuals && (
              <Line
                type="monotone"
                dataKey="actualMw"
                stroke="#0D4F32"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#0D4F32', stroke: '#FFFFFF', strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend and Alert Indicator */}
      <div className="border-t border-border-subtle pt-3 mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-secondary">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-0.5 w-3.5 bg-[#0D4F32]" />
            Actual Generation (MW)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-0.5 w-3.5 bg-[#167A4A]" />
            P50 Median Forecast (MW)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-0.5 w-3.5 border-b-2 border-dashed border-[#D97706]" />
            Day-Ahead Schedule (MW)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-3.5 bg-[#167A4A]/20 border border-[#167A4A]/40" />
            P10–P90 Corridor
          </span>
        </div>

        <div className="flex items-center gap-2 text-danger-dark font-mono text-[11px] bg-danger-tint/30 px-2 py-0.5 rounded-sm border border-danger/20">
          <AlertTriangle className="size-3 text-danger" />
          <span>Ramp Event Alert: D1 14:45–15:30 IST (-8.7 MW Drop)</span>
        </div>
      </div>
    </div>
  );
}

interface WorkbenchTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    dataKey: string;
    value: number | [number, number] | null;
  }>;
}

function WorkbenchTooltip({ active, payload }: WorkbenchTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const deltaPositive = data.deltaMw >= 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-lg text-xs min-w-[240px] pointer-events-none">
      <div className="flex items-center justify-between border-b border-border-subtle pb-1.5 mb-2 font-mono">
        <span className="font-bold text-foreground">{data.timeLabel}</span>
        {data.isRampAlert && (
          <span className="px-1.5 py-0.5 bg-danger-tint text-danger-dark font-bold text-[10px] rounded-xs">
            RAMP ALERT
          </span>
        )}
      </div>

      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex justify-between items-center text-[#167A4A] font-semibold">
          <span>P50 Forecast:</span>
          <span className="tabular-nums">{data.p50Mw.toFixed(1)} MW</span>
        </div>

        <div className="flex justify-between items-center text-foreground-secondary">
          <span>P10 – P90 Interval:</span>
          <span className="tabular-nums">
            {data.p10Mw.toFixed(1)} – {data.p90Mw.toFixed(1)} MW
          </span>
        </div>

        <div className="flex justify-between items-center text-[#92400E]">
          <span>Day-Ahead Schedule:</span>
          <span className="tabular-nums">{data.dayAheadMw.toFixed(1)} MW</span>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-border-subtle">
          <span className="text-foreground-secondary">Schedule Delta:</span>
          <span className={cn('tabular-nums font-bold', deltaPositive ? 'text-primary' : 'text-danger')}>
            {deltaPositive ? `+${data.deltaMw.toFixed(1)}` : data.deltaMw.toFixed(1)} MW
          </span>
        </div>

        <div className="pt-1.5 mt-1 border-t border-border-subtle text-muted text-[10px] flex justify-between">
          <span>GHI: {data.ghiWm2} W/m²</span>
          <span>Cloud: {data.cloudCoverPercent}%</span>
          <span>Temp: {data.temperatureC}°C</span>
        </div>
      </div>
    </div>
  );
}
