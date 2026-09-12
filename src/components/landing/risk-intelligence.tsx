'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Deterministic 6-hour window around the cloud ramp event (12:00 to 18:00)
const riskCurveData = [
  { time: '12:00', baselineMw: 38.4, realizedMw: 38.4, state: 'nominal' },
  { time: '13:00', baselineMw: 38.0, realizedMw: 37.8, state: 'nominal' },
  { time: '14:00', baselineMw: 35.5, realizedMw: 35.0, state: 'nominal' },
  { time: '15:00', baselineMw: 32.0, realizedMw: 24.5, state: 'ramp_begin' }, // Cloud front advances
  { time: '15:45', baselineMw: 28.5, realizedMw: 14.8, state: 'cliff_peak' }, // 50%+ cliff
  { time: '16:30', baselineMw: 24.0, realizedMw: 16.0, state: 'recovering' },
  { time: '17:15', baselineMw: 18.0, realizedMw: 16.5, state: 'recovering' },
  { time: '18:00', baselineMw: 10.0, realizedMw: 9.8, state: 'sunset' },
];

export function RiskIntelligence() {
  const [mounted, setMounted] = React.useState(false);
  const [showEvent, setShowEvent] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full bg-surface border border-border rounded-lg shadow-card p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
              <ShieldAlert className="size-3 text-danger" />
              STAGE 03 · OPERATIONAL RISK DETECTION
            </span>
            <Badge variant="critical" className="text-[10px] font-mono uppercase px-2 py-0">
              HIGH RAMP CLIFF
            </Badge>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
            Automated Detection of Generation Cliffs & Ramp Deviations
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant={showEvent ? 'outline' : 'primary'}
            onClick={() => setShowEvent(!showEvent)}
            className="text-xs font-mono h-8"
          >
            {showEvent ? 'Reset Baseline' : 'Simulate Cloud Hazard'}
          </Button>
        </div>
      </div>

      {/* Scenario Operational Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border-subtle bg-[#FAFBF9] shadow-none">
          <CardContent className="p-3">
            <div className="text-[10px] font-mono font-semibold text-muted uppercase">Expected Baseline</div>
            <div className="font-mono font-bold text-lg sm:text-xl text-foreground tabular-nums mt-0.5">
              38.4 MW
            </div>
            <div className="text-[10px] text-foreground-secondary truncate mt-0.5">
              Pre-event nominal schedule
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F5D6A4] bg-[#FDF6EC] shadow-none">
          <CardContent className="p-3">
            <div className="text-[10px] font-mono font-semibold text-[#8C570A] uppercase">Detected Ramp Cliff</div>
            <div className="font-mono font-bold text-lg sm:text-xl text-[#C98216] tabular-nums mt-0.5 flex items-baseline gap-1">
              <span>-19.2 MW</span>
              <span className="text-xs font-normal text-[#8C570A]">(-50%)</span>
            </div>
            <div className="text-[10px] text-[#8C570A] truncate mt-0.5">
              Cliff window: 45 minutes
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F8B4B4] bg-[#FDF2F2] shadow-none">
          <CardContent className="p-3">
            <div className="text-[10px] font-mono font-semibold text-danger uppercase">Ramp Rate Violation</div>
            <div className="font-mono font-bold text-lg sm:text-xl text-danger tabular-nums mt-0.5">
              -0.85 MW/min
            </div>
            <div className="text-[10px] text-danger truncate mt-0.5">
              Limit: -0.40 MW/min (Breached)
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-[#FAFBF9] shadow-none">
          <CardContent className="p-3">
            <div className="text-[10px] font-mono font-semibold text-muted uppercase">Event Lead Time</div>
            <div className="font-mono font-bold text-lg sm:text-xl text-foreground tabular-nums mt-0.5 flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              <span>240 min</span>
            </div>
            <div className="text-[10px] text-foreground-secondary truncate mt-0.5">
              4h advance dispatch notice
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Baseline vs Realized Deviation with Ramp Hazard Highlight */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono font-semibold text-foreground text-[11px] uppercase tracking-wider">
            Expected Schedule vs. Cloud-Induced Cliff (MW)
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-border" />
              <span className="text-muted">Nominal Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-danger" />
              <span className="text-danger font-semibold">Attenuated Generation Cliff</span>
            </div>
          </div>
        </div>

        <div className="h-[220px] w-full bg-[#FCFDFC] rounded-md border border-border-subtle p-2 min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200} debounce={50}>
              <ComposedChart data={riskCurveData} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E3" strokeOpacity={0.7} />
                <XAxis dataKey="time" tickLine={false} axisLine={{ stroke: '#E3E8E3' }} tick={{ fill: '#66736A', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 45]} ticks={[0, 10, 20, 30, 40]} tickLine={false} axisLine={{ stroke: '#E3E8E3' }} tick={{ fill: '#66736A', fontSize: 10, fontFamily: 'monospace' }} unit=" MW" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const delta = d.realizedMw - d.baselineMw;
                    return (
                      <div className="bg-surface border border-border shadow-md rounded p-2 text-xs font-mono tabular-nums space-y-1">
                        <div className="font-bold text-foreground">{d.time} UTC</div>
                        <div className="text-muted">Baseline: {d.baselineMw.toFixed(1)} MW</div>
                        <div className={delta < -5 ? 'text-danger font-semibold' : 'text-foreground font-semibold'}>
                          Actual: {d.realizedMw.toFixed(1)} MW ({delta.toFixed(1)} MW)
                        </div>
                        {delta < -10 && (
                          <div className="text-[10px] text-danger font-bold uppercase">
                            ⚠ Interconnect Tolerance Breached
                          </div>
                        )}
                      </div>
                    );
                  }}
                />

                {/* Cloud Front Shading Area */}
                {showEvent && (
                  <ReferenceArea
                    x1="15:00"
                    x2="16:30"
                    fill="#C94A4A"
                    fillOpacity={0.08}
                  />
                )}

                {/* Warning Line at 15:00 */}
                {showEvent && (
                  <ReferenceLine
                    x="15:00"
                    stroke="#C94A4A"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    label={{
                      value: 'RAMP CLIFF (-19.2 MW)',
                      position: 'insideTopLeft',
                      fill: '#C94A4A',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  />
                )}

                {/* Baseline Line */}
                <Line
                  type="monotone"
                  dataKey="baselineMw"
                  stroke="#A6B3A6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />

                {/* Realized/Hazard Curve */}
                <Line
                  type="monotone"
                  dataKey={showEvent ? 'realizedMw' : 'baselineMw'}
                  stroke={showEvent ? '#C94A4A' : '#167A4A'}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: showEvent ? '#C94A4A' : '#167A4A' }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-muted">
              Loading risk simulation canvas...
            </div>
          )}
        </div>
      </div>

      {/* Root Cause & Route Connection */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground-secondary max-w-xl">
          <AlertTriangle className="size-4 text-warning shrink-0" />
          <span>
            Dense convective cloud front advancing at 28 km/h drops GHI from 880 to 195 W/m². Without automated mitigation, this cliff incurs severe balancing penalties.
          </span>
        </div>

        <Link href="/risks" className="self-end sm:self-auto shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-danger hover:text-danger hover:bg-[#FDF2F2]">
            <span>Explore Risk Ledger</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
