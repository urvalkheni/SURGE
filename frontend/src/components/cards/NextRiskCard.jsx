import React from "react";
import { AlertTriangle, ShieldCheck, Zap, Factory, TrendingDown, Coins, Radio } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

export default function NextRiskCard({ risk }) {
  const { activeRoleId, roleConfig } = useAuth();
  const { assignedPlant } = useApp();

  // Role 2: Plant Operations Engineer
  if (activeRoleId === 'plant_operations_engineer') {
    const plantName = assignedPlant?.name || "Sanand Solar PV Cluster";
    return (
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <Factory className="w-3.5 h-3.5" />
            <span>PLANT ASSET RISK</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-100/90 text-amber-800 border border-amber-200">
            16:30 – 18:30 IST
          </span>
        </div>

        <div className="my-2">
          <div className="text-xs font-semibold text-slate-700">Expected Plant Underproduction</div>
          <div className="text-3xl font-extrabold text-amber-700 font-sans tracking-tight mt-0.5">
            -18.6 MW
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-amber-200/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Confidence</span>
            <strong className="text-slate-800 font-semibold">High (91%)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Likely Range</span>
            <strong className="text-slate-800 font-semibold">14 – 22.5 MW</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Impact</span>
            <strong className="text-amber-800 font-semibold">Site Yield Loss</strong>
          </div>
        </div>

        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/90 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
          <span className="shrink-0">⚠️</span>
          <span className="truncate">Cloud cover expected after 16:30; module temp clipping at 48.6°C.</span>
        </div>
      </div>
    );
  }

  // Role 3: Energy Trading Analyst
  if (activeRoleId === 'energy_trading_analyst') {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wide">
            <Coins className="w-3.5 h-3.5" />
            <span>COMMERCIAL RISK & OPPORTUNITY</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
            18:00 – 20:00 IST
          </span>
        </div>

        <div className="my-2">
          <div className="text-xs font-semibold text-slate-700">Evening Clearing Price Spike</div>
          <div className="text-3xl font-extrabold text-emerald-700 font-sans tracking-tight mt-0.5">
            ₹6.8 <span className="text-sm font-normal text-slate-500">/kWh</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-emerald-200/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Midday Solar</span>
            <strong className="text-slate-800 font-semibold">₹3.1/kWh (12:00)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Arbitrage Spread</span>
            <strong className="text-emerald-700 font-semibold">+₹3.7/kWh</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Net Gain</span>
            <strong className="text-emerald-800 font-semibold">₹1.29 lakh</strong>
          </div>
        </div>

        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/90 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
          <span className="shrink-0 text-emerald-600">🔋</span>
          <span className="truncate">Charge BESS at 12:00 (₹3.1/kWh) → Discharge 18:00 (₹6.8/kWh).</span>
        </div>
      </div>
    );
  }

  // Role 4: REMC Desk Officer
  if (activeRoleId === 'remc_desk_officer') {
    return (
      <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs uppercase tracking-wide">
            <Radio className="w-3.5 h-3.5" />
            <span>REGIONAL RAMP WARNING</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-100/90 text-purple-800 border border-purple-200">
            17:45 – 19:00 IST
          </span>
        </div>

        <div className="my-2">
          <div className="text-xs font-semibold text-slate-700">Expected Regional Ramp Drop</div>
          <div className="text-3xl font-extrabold text-purple-800 font-sans tracking-tight mt-0.5">
            -135 MW <span className="text-sm font-normal text-slate-500">/ 60 min</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-purple-200/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Confidence</span>
            <strong className="text-slate-800 font-semibold">82% (High)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Current Gen</span>
            <strong className="text-slate-800 font-semibold">640 MW Wind</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">At 18:00</span>
            <strong className="text-purple-800 font-semibold">505 MW</strong>
          </div>
        </div>

        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/90 border border-purple-200 text-[11px] text-purple-900 flex items-center gap-2">
          <span className="shrink-0 text-amber-500">⚡</span>
          <span className="truncate">Kutch + Jaisalmer wind ramp-down. Notify SLDC Dispatcher.</span>
        </div>
      </div>
    );
  }

  // Role 1: Chief Grid Dispatcher (Default)
  const timeWindow = "18:00 – 22:00 IST";
  const deficitVal = "182.0";
  const likelyRange = "155 – 210 MW";
  const causeText = "Demand = 620 MW | RE = 485 MW | Net Deficit = -135 MW. BESS available = 90 MW. Remaining backup = 45 MW.";

  return (
    <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>UPCOMING GRID RISK</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-100/90 text-rose-700 border border-rose-200">
          {timeWindow}
        </span>
      </div>

      {/* Main Stat */}
      <div className="my-2">
        <div className="text-xs font-semibold text-slate-700">Expected Renewable Deficit</div>
        <div className="text-3xl font-extrabold text-rose-600 font-sans tracking-tight mt-0.5">
          -{deficitVal} MW
        </div>
      </div>

      {/* 3 Metric Columns */}
      <div className="grid grid-cols-3 gap-2 py-2 border-y border-rose-200/60 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">Confidence</span>
          <strong className="text-slate-800 font-semibold">High (94.2%)</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">Likely Range</span>
          <strong className="text-slate-800 font-semibold">{likelyRange}</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">Impact</span>
          <strong className="text-slate-800 font-semibold">Moderate – High</strong>
        </div>
      </div>

      {/* Bottom Alert Strip */}
      <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/80 border border-rose-200/60 text-[11px] text-rose-800 flex items-center gap-2">
        <span className="shrink-0 text-amber-500">⚠️</span>
        <span className="truncate">{causeText}</span>
      </div>
    </div>
  );
}
