import React, { useState } from "react";
import { 
  Sun, 
  Cloud, 
  Wind, 
  Thermometer, 
  Compass, 
  Gauge, 
  CloudRain, 
  Zap, 
  Eye, 
  Radio, 
  DollarSign, 
  AlertTriangle,
  TrendingDown,
  Layers,
  MapPin
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Weather() {
  const { forecastData, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, isDispatcher, isPlantEngineer, isTradingAnalyst, isRemcOfficer } = useAuth();

  const [selectedCorridor, setSelectedCorridor] = useState("ALL");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {isDispatcher && "REGIONAL GRID TRANSMISSION WEATHER CORRIDORS"}
              {isPlantEngineer && "SITE MICRO-METEOROLOGY & IRRADIANCE TELEMETRY"}
              {isTradingAnalyst && "WEATHER IMPACT ON ENERGY PRICING & DEMAND"}
              {isRemcOfficer && "MULTI-REGION WEATHER RADAR & RAMP TRAJECTORY"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live Satellite Sync
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
            {isDispatcher && "Atmospheric Drivers Across Power Flow Corridors"}
            {isPlantEngineer && `Local Site Meteorology: ${assignedPlant.name}`}
            {isTradingAnalyst && "Meteorological Price Elasticity & Demand Shocks"}
            {isRemcOfficer && "Regional Cloud Fronts & Atmospheric Ramp Forecasting"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {isDispatcher && "Explaining why generation rises or falls across high-voltage transmission interconnects."}
            {isPlantEngineer && "Component-level solar irradiance components (GHI/DNI/DHI), module cell temperatures, and anemometer telemetry."}
            {isTradingAnalyst && "Correlating cloud cover and temperature spikes with spot market clearing prices and commercial risk."}
            {isRemcOfficer && "Tracking weather radar fronts across Gujarat, Rajasthan, and Karnataka to buffer renewable ramps."}
          </p>
        </div>
      </div>

      {/* Role-Specific Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {isDispatcher && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Corridor Insolation</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">820 W/m²</div>
              <span className="text-[10px] text-emerald-600">Peak daylight across state</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Wind Corridor Velocity</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">8.4 m/s</div>
              <span className="text-[10px] text-slate-500">Kutch 100m AGL</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Approaching Front</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">Scattered Cirrus</div>
              <span className="text-[10px] text-slate-500">Passing in 2.5 hrs</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Grid Curtailment Risk</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">LOW (0%)</div>
              <span className="text-[10px] text-emerald-600">Stable transmission ambient</span>
            </div>
          </>
        )}

        {isPlantEngineer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Global Horiz. Irradiance</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">820.0 <span className="text-xs text-slate-500">W/m²</span></div>
              <span className="text-[10px] text-slate-500">DNI: 740 | DHI: 120 W/m²</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">PV Module Cell Temp</span>
              <div className="text-lg font-bold text-rose-600 mt-0.5">54.2°C</div>
              <span className="text-[10px] text-amber-600">-11.1% Thermal Derating</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Soiling Index</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">97.9%</div>
              <span className="text-[10px] text-amber-600">-2.1% Particulate derate</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Anemometer Wind (10m)</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">4.2 m/s</div>
              <span className="text-[10px] text-emerald-600">Safe for tracking (&lt; 15 m/s)</span>
            </div>
          </>
        )}

        {isTradingAnalyst && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Heatwave Cooling Index</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">+3.8°C High</div>
              <span className="text-[10px] text-rose-600">Drives +450 MW AC demand</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Cloud Volatility Risk</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">18% Chance</div>
              <span className="text-[10px] text-slate-500">Low price volatility expected</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Expected Clearing Price</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">₹4.85 <span className="text-xs text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-slate-500">Stable solar midday</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Weather DSM Beta</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">0.12</div>
              <span className="text-[10px] text-emerald-600">Low commercial sensitivity</span>
            </div>
          </>
        )}

        {isRemcOfficer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Regional Cloud Coverage</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">12% Average</div>
              <span className="text-[10px] text-emerald-600">Clear across all 6 parks</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Wind Front Velocity</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">8.4 m/s</div>
              <span className="text-[10px] text-slate-500">Kutch corridor nominal</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Sunset Ramp Trigger</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">18:24 IST</div>
              <span className="text-[10px] text-amber-600">-135 MW/hr anticipated</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Atmospheric Pressure</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">1012 hPa</div>
              <span className="text-[10px] text-emerald-600">No cyclonic depression</span>
            </div>
          </>
        )}
      </div>

      {/* Main Meteorological Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Meteorology */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {isPlantEngineer ? `Solar Array Micro-Climate (${assignedPlant.name})` : "Solar Atmospheric Drivers"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Irradiance decomposition, diffuse fraction & thermal derate</p>
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
                <span className="text-slate-700">Total Cloud Cover & Opacity</span>
              </div>
              <span className="font-bold text-emerald-700">12% (Clear Skies)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span className="text-slate-700">Module Cell Temperature vs Ambient</span>
              </div>
              <span className="font-bold text-amber-700">54.2°C / 36.8°C (-11.1% Derate)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-slate-700">Diffuse Horizontal Irradiance (DHI)</span>
              </div>
              <span className="font-bold text-blue-700">120.5 W/m² (14.7% Diffuse)</span>
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
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {isPlantEngineer ? `Boundary Layer Anemometry (${assignedPlant.name})` : "Wind Boundary Layer Drivers"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">100m hub-height aerodynamics & shear coefficient</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">Hub-Height Wind Speed (100m AGL)</span>
              </div>
              <span className="font-bold text-blue-700">8.4 m/s (Rated: 11.5 m/s)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">Wind Direction & Nacelle Yaw</span>
              </div>
              <span className="font-bold text-slate-800">242° (SW Monsoon Vector)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700">Atmospheric Air Density (ρ)</span>
              </div>
              <span className="font-bold text-emerald-700">1.18 kg/m³ (Density correction active)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-slate-700">Wind Shear Power-Law Alpha (α)</span>
              </div>
              <span className="font-bold text-purple-700">0.142 (Moderate Shear)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
