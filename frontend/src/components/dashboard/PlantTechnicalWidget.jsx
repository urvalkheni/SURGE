import React from "react";
import { Sun, Wind, Thermometer, CloudSun, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function PlantTechnicalWidget() {
  const { assignedPlant } = useApp();
  const plant = assignedPlant || {
    name: "Sanand Solar PV Cluster",
    type: "Solar PV",
    capacityMw: 250,
    actualMw: 128.8,
    forecastMw: 140.0,
    deviationMw: -11.2,
    availabilityPct: 96.4,
    prPct: 79.8,
  };

  const isSolar = plant.type.includes("Solar");

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-700 font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
            TECHNICAL TELEMETRY & STRING SCADA
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1">
            {plant.name} Technical Operating Environment
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Scope: Assigned Asset ({plant.capacityMw} MW)
        </span>
      </div>

      {isSolar ? (
        /* Solar Specific Detailed Technical Parameters */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>GHI IRRADIANCE</span>
            </div>
            <div className="text-base font-bold text-slate-900">820 W/m²</div>
            <div className="text-[10px] text-emerald-600 font-sans">Clear Beam</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <CloudSun className="w-3 h-3 text-blue-500" />
              <span>CLOUD COVER</span>
            </div>
            <div className="text-base font-bold text-slate-900">28%</div>
            <div className="text-[10px] text-amber-600 font-sans">Scattered clouds</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-500" />
              <span>MODULE TEMP</span>
            </div>
            <div className="text-base font-bold text-rose-600">48.6°C</div>
            <div className="text-[10px] text-rose-500 font-sans">-0.35%/°C loss</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-500" />
              <span>INVERTER CLIPPING</span>
            </div>
            <div className="text-base font-bold text-emerald-600">0.0 MW</div>
            <div className="text-[10px] text-slate-500 font-sans">No DC saturation</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-500" />
              <span>SUNRISE / SUNSET</span>
            </div>
            <div className="text-base font-bold text-slate-900">06:12 / 18:34</div>
            <div className="text-[10px] text-slate-500 font-sans">12h 22m window</div>
          </div>
        </div>
      ) : (
        /* Wind Specific Detailed Technical Parameters */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Wind className="w-3 h-3 text-blue-500" />
              <span>100M WIND SPEED</span>
            </div>
            <div className="text-base font-bold text-slate-900">8.4 m/s</div>
            <div className="text-[10px] text-emerald-600 font-sans">Optimal rated power</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-500" />
              <span>WIND DIRECTION</span>
            </div>
            <div className="text-base font-bold text-slate-900">245° (WSW)</div>
            <div className="text-[10px] text-slate-500 font-sans">Yaw aligned &lt;2°</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-slate-500" />
              <span>AIR DENSITY</span>
            </div>
            <div className="text-base font-bold text-slate-900">1.215 kg/m³</div>
            <div className="text-[10px] text-slate-500 font-sans">ISA standard</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>TURBINE STATUS</span>
            </div>
            <div className="text-base font-bold text-emerald-600">Rated Region</div>
            <div className="text-[10px] text-slate-500 font-sans">Cut-in: 3.0 / Out: 25.0</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-500" />
              <span>AVAILABILITY</span>
            </div>
            <div className="text-base font-bold text-blue-600">97.1%</div>
            <div className="text-[10px] text-slate-500 font-sans">136/140 Turbines</div>
          </div>
        </div>
      )}
    </div>
  );
}
