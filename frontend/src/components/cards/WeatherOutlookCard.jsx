import React from "react";
import { Sun, CloudSun, Wind } from "lucide-react";

export default function WeatherOutlookCard({ weather }) {
  const temp = weather?.temperature_c || 31;
  const irradiance = weather?.solar_irradiance_wm2 || 820;
  const cloud = weather?.cloud_cover_pct || 12;
  const wind = weather?.wind_speed_ms || 6.2;
  const condition = weather?.condition || "Clear Sky";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <Sun className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold text-slate-800 font-sans">
          Weather Outlook
        </h3>
      </div>

      {/* Main Temperature & Weather Metrics Grid */}
      <div className="flex items-center justify-between gap-4 py-1">
        {/* Left: Big Temp & Condition */}
        <div className="flex items-center gap-3">
          <Sun className="w-10 h-10 text-amber-500 fill-amber-400/80 shrink-0" />
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-sans">
              {temp}°C
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {condition}
            </div>
          </div>
        </div>

        {/* Right: 3 Grid Telemetry Items */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Solar Irradiance</span>
            <strong className="text-xs text-slate-800 font-mono font-semibold">{irradiance} W/m²</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Cloud Cover</span>
            <strong className="text-xs text-slate-800 font-mono font-semibold">{cloud}%</strong>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] text-slate-400 font-mono block">Wind Speed</span>
            <strong className="text-xs text-slate-800 font-mono font-semibold">{wind} m/s</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
