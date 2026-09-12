import React from "react";
import { Sun, Cloud, Wind, Thermometer, Compass, Gauge } from "lucide-react";

export default function Weather() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">METEOROLOGICAL EXPLAINABILITY</span>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono">Weather Intelligence & Atmospheric Drivers</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Atmospheric factors explaining why generation rises or falls across monitored renewable zones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Meteorology */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">Solar Atmospheric Drivers</h3>
              <p className="text-xs text-slate-500 font-mono">Irradiance decomposition & thermal derate</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700">Global Horizontal Irradiance (GHI)</span>
              </div>
              <span className="font-bold text-amber-700">820.0 W/m² (Peak)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">Total Cloud Cover</span>
              </div>
              <span className="font-bold text-emerald-700">12% (Clear Skies)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span className="text-slate-700">Module Cell Temperature</span>
              </div>
              <span className="font-bold text-amber-700">54.2°C (-11.1% Derate)</span>
            </div>
          </div>
        </div>

        {/* Wind Meteorology */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">Wind Boundary Layer Drivers</h3>
              <p className="text-xs text-slate-500 font-mono">100m hub-height aerodynamics</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">Hub-Height Wind Speed (100m)</span>
              </div>
              <span className="font-bold text-blue-700">8.4 m/s (Nominal)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">Wind Direction</span>
              </div>
              <span className="font-bold text-slate-800">242° (SW Monsoon Vector)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700">Atmospheric Air Density (ρ)</span>
              </div>
              <span className="font-bold text-emerald-700">1.18 kg/m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
