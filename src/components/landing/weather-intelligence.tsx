'use client';

import * as React from 'react';
import Link from 'next/link';
import { Cloud, Sun, Thermometer, Wind, Droplets, ArrowRight, Activity, Gauge } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Deterministic diurnal irradiance profile comparing theoretical clear-sky GHI vs 18% attenuated GHI
const weatherCurveData = [
  { hour: '06:00', clearSkyGhi: 120, realizedGhi: 102, cloudCover: 15 },
  { hour: '08:00', clearSkyGhi: 450, realizedGhi: 388, cloudCover: 16 },
  { hour: '10:00', clearSkyGhi: 780, realizedGhi: 672, cloudCover: 17 },
  { hour: '12:00', clearSkyGhi: 960, realizedGhi: 812, cloudCover: 18 }, // Current time marker
  { hour: '14:00', clearSkyGhi: 860, realizedGhi: 720, cloudCover: 19 },
  { hour: '16:00', clearSkyGhi: 560, realizedGhi: 465, cloudCover: 20 },
  { hour: '18:00', clearSkyGhi: 210, realizedGhi: 172, cloudCover: 18 },
  { hour: '20:00', clearSkyGhi: 0, realizedGhi: 0, cloudCover: 15 },
];

export function WeatherIntelligence() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = [
    { label: 'Ambient Temp', value: '31°C', sub: 'Sensor array mean', icon: Thermometer },
    { label: 'Cloud Cover', value: '18%', sub: 'Optical depth 0.22', icon: Cloud },
    { label: 'Wind Speed', value: '4.8 m/s', sub: 'Convective cooling', icon: Wind },
    { label: 'Surface GHI', value: '812 W/m²', sub: 'Effective irradiance', icon: Sun },
    { label: 'Humidity', value: '42%', sub: 'Atmospheric moisture', icon: Droplets },
  ];

  return (
    <div className="w-full bg-surface border border-border rounded-lg shadow-card p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Activity className="size-3" />
              STAGE 01 · ATMOSPHERIC TELEMETRY
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              NWP / SATELLITE
            </Badge>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
            Atmospheric Irradiance & Boundary Layer Dynamics
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted tabular-nums self-start sm:self-auto">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span>Sync: 12:00 UTC · ECMWF / GFS Blend</span>
        </div>
      </div>

      {/* 5 Core Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-border-subtle bg-[#FAFBF9] shadow-none">
              <CardContent className="p-3">
                <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-muted uppercase tracking-wider mb-1">
                  <Icon className="size-3 text-primary" />
                  <span className="truncate">{m.label}</span>
                </div>
                <div className="font-mono font-bold text-lg sm:text-xl text-foreground tabular-nums">
                  {m.value}
                </div>
                <div className="text-[10px] text-foreground-secondary truncate mt-0.5">
                  {m.sub}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Solar Radiation vs Cloud Cover Attenuation Chart */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono font-semibold text-foreground text-[11px] uppercase tracking-wider">
            Clear-Sky Theoretical vs. Realized Surface GHI (W/m²)
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#167A4A]" />
              <span className="text-foreground-secondary">Realized GHI (812 W/m²)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-border" />
              <span className="text-muted">Clear-Sky Theoretical (960 W/m²)</span>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full bg-[#FCFDFC] rounded-md border border-border-subtle p-2 min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180} debounce={50}>
              <AreaChart data={weatherCurveData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E3" strokeOpacity={0.7} />
                <XAxis dataKey="hour" tickLine={false} axisLine={{ stroke: '#E3E8E3' }} tick={{ fill: '#66736A', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 1000]} tickLine={false} axisLine={{ stroke: '#E3E8E3' }} tick={{ fill: '#66736A', fontSize: 10, fontFamily: 'monospace' }} unit=" W" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-surface border border-border shadow-md rounded p-2 text-xs font-mono tabular-nums space-y-1">
                        <div className="font-bold text-foreground">{d.hour} UTC</div>
                        <div className="text-primary font-semibold">Realized GHI: {d.realizedGhi} W/m²</div>
                        <div className="text-muted">Theoretical Clear-Sky: {d.clearSkyGhi} W/m²</div>
                        <div className="text-foreground-secondary">Cloud Attenuation: {d.cloudCover}%</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="clearSkyGhi" stroke="#C4CDC4" fill="#EAEFEA" fillOpacity={0.4} strokeWidth={1.5} isAnimationActive={false} />
                <Area type="monotone" dataKey="realizedGhi" stroke="#167A4A" fill="#167A4A" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-muted">
              Loading weather telemetry canvas...
            </div>
          )}
        </div>
      </div>

      {/* Causality Note & Action */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground-secondary max-w-xl">
          <Gauge className="size-4 text-primary shrink-0" />
          <span>
            Atmospheric optical depth directly attenuates incoming photon flux. RenewableIQ computes panel-level GHI to feed the predictive forecast engine.
          </span>
        </div>

        <Link href="/forecast" className="self-end sm:self-auto shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark">
            <span>Forecast Telemetry</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
