'use client';

import * as React from 'react';
import { Cloud, Sun, Thermometer, Wind, Droplets } from 'lucide-react';
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
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function WeatherSummary({ className }: { className?: string }) {
  const { weather } = dashboardData;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    { label: 'Ambient Temp', value: `${weather.temperatureC}°C`, icon: Thermometer },
    { label: 'Cloud Cover', value: `${weather.cloudCoverPercent}%`, icon: Cloud },
    { label: 'Wind Speed', value: `${weather.windSpeedMs} m/s`, icon: Wind },
    { label: 'Surface GHI', value: `${weather.solarRadiationGhi} W/m²`, icon: Sun },
    { label: 'Rel Humidity', value: `${weather.humidityPercent}%`, icon: Droplets },
  ];

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 select-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Meteorological Telemetry & Solar Outlook
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="nominal" className="text-[9px] font-mono px-1 py-0">
            CONFIDENCE: {weather.confidence}
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 text-muted">
            {weather.source}
          </Badge>
        </div>
      </div>

      {/* 5 Weather Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="p-2.5 rounded bg-[#FAFBF9] border border-border-subtle flex flex-col justify-between"
            >
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-muted uppercase">
                <Icon className="size-3 text-primary" />
                <span className="truncate">{it.label}</span>
              </div>
              <div className="font-mono font-bold text-base text-foreground tabular-nums mt-1">
                {it.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 24-Hour Solar Resource Outlook Area Chart */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] font-semibold text-foreground">
            24-Hour Irradiance Profile (Clear-Sky vs Realized GHI W/m²)
          </span>
          <div className="flex items-center gap-3 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#167A4A]" />
              Forecast
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-border" />
              Clear-Sky
            </span>
          </div>
        </div>

        <div className="h-[140px] w-full bg-[#FAFBF9] rounded border border-border-subtle p-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather.resourceOutlook24h} margin={{ top: 6, right: 8, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E3" strokeOpacity={0.7} />
                <XAxis dataKey="hour" tickLine={false} axisLine={{ stroke: '#E3E8E3' }} tick={{ fill: '#66736A', fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 1000]} tickLine={false} axisLine={{ stroke: '#E3E8E3' }} tick={{ fill: '#66736A', fontSize: 9, fontFamily: 'monospace' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-surface border border-border shadow-md rounded p-1.5 text-[10px] font-mono tabular-nums space-y-0.5">
                        <div className="font-bold text-foreground">{d.hour} UTC</div>
                        <div className="text-primary font-semibold">Forecast: {d.forecastGhi} W/m²</div>
                        <div className="text-muted">Clear-Sky: {d.clearSkyGhi} W/m²</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="clearSkyGhi" stroke="#C4CDC4" fill="#EAEFEA" fillOpacity={0.3} strokeWidth={1} isAnimationActive={false} />
                <Area type="monotone" dataKey="forecastGhi" stroke="#167A4A" fill="#167A4A" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] font-mono text-muted">
              Loading weather outlook...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
