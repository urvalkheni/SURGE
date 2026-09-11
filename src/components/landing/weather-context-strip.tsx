import * as React from 'react';
import { Thermometer, Cloud, Wind, Sun, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WeatherContextStripProps {
  temperatureC?: number;
  cloudCoverPercent?: number;
  windSpeedMs?: number;
  solarRadiationGhi?: number;
  humidityPercent?: number;
  className?: string;
}

export function WeatherContextStrip({
  temperatureC = 31,
  cloudCoverPercent = 18,
  windSpeedMs = 4.8,
  solarRadiationGhi = 812,
  humidityPercent = 42,
  className,
}: WeatherContextStripProps) {
  const items = [
    {
      label: 'Ambient Temp',
      value: `${temperatureC}°C`,
      icon: Thermometer,
    },
    {
      label: 'Cloud Cover',
      value: `${cloudCoverPercent}%`,
      icon: Cloud,
    },
    {
      label: 'Wind Speed',
      value: `${windSpeedMs} m/s`,
      icon: Wind,
    },
    {
      label: 'Solar Radiation',
      value: `${solarRadiationGhi} W/m²`,
      icon: Sun,
    },
    {
      label: 'Relative Humidity',
      value: `${humidityPercent}%`,
      icon: Droplets,
    },
  ];

  return (
    <div
      className={cn(
        'w-full bg-[#F8FAF8] border border-border rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs select-none',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
          WEATHER TELEMETRY:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:gap-8 font-mono tabular-nums">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <Icon className="size-3.5 text-primary" />
              <div className="flex items-center gap-1.5">
                <span className="text-foreground-secondary text-[11px]">{item.label}:</span>
                <span className="font-semibold text-foreground text-xs">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
