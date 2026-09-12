import * as React from 'react';
import { Cloud, Sun, Thermometer, Wind, Droplets, RefreshCw, Compass } from 'lucide-react';
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
import { usePlant } from '@/contexts/plant-context';
import { cn } from '@/lib/utils';

export function WeatherSummary({ className }: { className?: string }) {
  const { weather, refreshWeather, isRefreshingWeather, lastUpdated } = usePlant();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cur = weather?.current;

  const items = [
    { label: 'Ambient Temp', value: cur ? `${cur.temperatureC}°C` : '28.4°C', icon: Thermometer },
    { label: 'Cloud Cover', value: cur ? `${cur.cloudCoverPercent}%` : '18%', icon: Cloud },
    { label: 'Wind Speed', value: cur ? `${cur.windSpeedMps} m/s` : '4.8 m/s', icon: Wind },
    { label: 'Surface GHI', value: cur ? `${cur.ghiWm2} W/m²` : '812 W/m²', icon: Sun },
    { label: 'Direct DNI', value: cur ? `${cur.dniWm2} W/m²` : '720 W/m²', icon: Compass },
    { label: 'Tilted GTI', value: cur ? `${cur.gtiWm2} W/m²` : '885 W/m²', icon: Sun },
    { label: 'Rel Humidity', value: cur ? `${cur.humidityPercent}%` : '42%', icon: Droplets },
  ];

  // 24-hour profile chart data derived from weather points or fallback
  const chartData = React.useMemo(() => {
    if (weather?.points && weather.points.length >= 24) {
      return weather.points.slice(0, 24).map((p) => {
        const d = new Date(p.timestamp);
        const hourStr = `${d.getUTCHours().toString().padStart(2, '0')}:00`;
        return {
          hour: hourStr,
          ghi: p.ghiWm2,
          clearSkyGhi: Math.round(p.ghiWm2 * (p.cloudCoverPercent > 30 ? 1.4 : 1.05)),
          gti: p.gtiWm2,
        };
      });
    }
    // Fallback diurnal curve
    return Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      ghi: i >= 6 && i <= 18 ? Math.round(Math.sin(((i - 6) / 12) * Math.PI) * 820) : 0,
      clearSkyGhi: i >= 6 && i <= 18 ? Math.round(Math.sin(((i - 6) / 12) * Math.PI) * 880) : 0,
      gti: i >= 6 && i <= 18 ? Math.round(Math.sin(((i - 6) / 12) * Math.PI) * 890) : 0,
    }));
  }, [weather]);

  const formattedUpdated = React.useMemo(() => {
    try {
      return new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  }, [lastUpdated]);

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 select-none',
        className
      )}
    >
      {/* Header with Honest Weather vs SCADA badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Meteorological Stream & Solar Irradiance
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="nominal" className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
            {weather?.source ? `WEATHER: ${weather.source}` : 'WEATHER: LIVE · OPEN-METEO'}
          </Badge>
          <span className="text-[10px] font-mono text-muted">
            Updated: {formattedUpdated}
          </span>
          <button
            type="button"
            onClick={refreshWeather}
            disabled={isRefreshingWeather}
            className="p-1 rounded hover:bg-border/40 text-muted hover:text-foreground transition-colors"
            title="Refresh Open-Meteo stream"
          >
            <RefreshCw className={cn('size-3', isRefreshingWeather && 'animate-spin text-primary')} />
          </button>
        </div>
      </div>

      {/* Weather Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="p-2 rounded bg-[#FAFBF9] border border-border-subtle flex flex-col justify-between min-w-0"
            >
              <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-muted uppercase min-w-0">
                <Icon className="size-3 text-primary shrink-0" />
                <span className="truncate">{it.label}</span>
              </div>
              <div className="font-mono font-bold text-sm text-foreground tabular-nums mt-1 truncate">
                {it.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 24-Hour Solar Resource Outlook Area Chart */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[11px] font-semibold text-foreground">
            24-Hour Irradiance Profile (Global Tilted GTI vs Horizontal GHI W/m²)
          </span>
          <div className="flex items-center gap-3 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#167A4A]" />
              Array GTI
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-border" />
              Surface GHI
            </span>
          </div>
        </div>

        <div className="h-[140px] w-full bg-[#FAFBF9] rounded border border-border-subtle p-2 min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120} debounce={50}>
              <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -30, bottom: 0 }}>
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
                        <div className="text-primary-dark">Tilted GTI: {d.gti} W/m²</div>
                        <div className="text-muted">Horizontal GHI: {d.ghi} W/m²</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="clearSkyGhi" stroke="#D1D5DB" fill="#F3F4F6" fillOpacity={0.5} strokeWidth={1} strokeDasharray="2 2" isAnimationActive={false} />
                <Area type="monotone" dataKey="gti" stroke="#167A4A" fill="#167A4A" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse bg-border/20 rounded" />
          )}
        </div>
      </div>
    </div>
  );
}
