import React from "react";
import { Sun, Wind, MapPin, Building2, Zap, Cpu, Compass } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Plants() {
  const { forecastData, selectedState, selectedCity, selectedArea } = useApp();

  const solarPark = forecastData?.solar_park || "Solar Park";
  const windPark = forecastData?.wind_park || "Wind Park";
  const stateLabel = forecastData?.selected_state || "Active Region";
  const gridOp = forecastData?.grid_operator || "State Load Despatch Centre (SLDC)";
  const coords = forecastData?.coordinates || { latitude: 23.83, longitude: 69.83 };

  const horizon = forecastData?.forecast_horizon_hours || 72;
  const solarMwh = forecastData?.solar_energy_mwh || 1240.5;
  const windMwh = forecastData?.wind_energy_mwh || 890.2;

  const solarCuf = ((solarMwh / (100 * horizon)) * 100).toFixed(2);
  const windCuf = ((windMwh / (100 * horizon)) * 100).toFixed(2);

  const plants = [
    {
      name: solarPark,
      type: "Solar PV (Bifacial Monocrystalline Fixed-Tilt)",
      capacity: "100 MW AC (125 MWp DC)",
      location: `${stateLabel} (${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E)`,
      grid: gridOp,
      cuf: `${solarCuf}% Predicted CUF`,
      energy: `${solarMwh.toLocaleString()} MWh`,
      specs: [
        { label: "Surface Tilt", val: "22° Fixed / Azimuth 180°" },
        { label: "DC-AC Ratio", val: "1.25x Over-paneled" },
        { label: "Grid DISCOM", val: gridOp.split("/")[0].trim() },
        { label: "Inference Model", val: "XGBoost + Solar Position (pvlib)" }
      ],
      icon: Sun,
      color: "text-amber-600",
      border: "border-amber-200",
      bg: "bg-amber-50"
    },
    {
      name: windPark,
      type: "Utility Wind Farm (2.0 MW x 50 Units)",
      capacity: "100 MW Total Nameplate",
      location: `${stateLabel} (${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E)`,
      grid: gridOp,
      cuf: `${windCuf}% Predicted CUF`,
      energy: `${windMwh.toLocaleString()} MWh`,
      specs: [
        { label: "Hub Height", val: "100m AGL (Air Density Adj)" },
        { label: "Cut-in / Rated", val: "3.0 m/s / 11.5 m/s" },
        { label: "Grid DISCOM", val: gridOp.split("/")[0].trim() },
        { label: "Inference Model", val: "XGBoost Wind Regressor" }
      ],
      icon: Wind,
      color: "text-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">PHYSICAL ASSET TOPOLOGY</span>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono">Monitored Generation Assets</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Detailed technical specifications, coordinates, and predicted Capacity Utilization Factors (CUF).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plants.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${p.bg} ${p.border} ${p.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-mono">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{p.type}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {p.capacity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">COORDINATES</span>
                  <div className="font-semibold text-slate-700 mt-0.5 truncate">{p.location}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">GRID POOL</span>
                  <div className="font-semibold text-blue-700 mt-0.5 truncate">{p.grid}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">PREDICTED CUF</span>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">{p.cuf}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">TOTAL FORECAST ENERGY</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{p.energy}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {p.specs.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{s.label}</span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate block">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
