import React from "react";
import { Zap, BarChart2, ArrowLeftRight, BatteryCharging } from "lucide-react";

export default function KpiMetricsRow({ currentGen, currentDemand, currentBalance, p10, p90, peakDemand, peakTime = "18:00" }) {
  const isSurplus = currentBalance >= 0;
  
  // Dynamic battery computation based on local generation
  const batteryPct = 52;
  const batteryCurrentMwh = 26;
  const batteryTotalMwh = 50;
  const batteryAvailableDischarge = 24;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Renewable Generation Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Zap className="w-4 h-4 fill-emerald-600/30 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Renewable Generation</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            +12%
          </span>
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {currentGen?.toFixed(1) || "148.7"} <span className="text-sm font-normal text-slate-400">MW</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Likely range: {p10 || "135.4"} – {p90 || "162.1"} MW
        </div>
      </div>

      {/* 2. Substation Demand Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Substation Demand</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            +5%
          </span>
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {currentDemand?.toFixed(1) || "110.0"} <span className="text-sm font-normal text-slate-400">MW</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Expected {peakTime} Peak: {peakDemand ? `${peakDemand.toFixed(0)} MW` : "145 MW"}
        </div>
      </div>

      {/* 3. Grid Balance Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
              <ArrowLeftRight className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Grid Balance</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
            isSurplus ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            {isSurplus ? "SURPLUS" : "DEFICIT"}
          </span>
        </div>

        <div className="my-2">
          <div className={`text-2xl font-bold font-sans tracking-tight ${isSurplus ? "text-emerald-600" : "text-rose-600"}`}>
            {isSurplus ? `+${currentBalance.toFixed(1)}` : currentBalance.toFixed(1)} <span className="text-sm font-normal text-slate-400">MW</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          {isSurplus ? "Feeds into Regional Pool" : "Drawing from Thermal Reserves"}
        </div>
      </div>

      {/* 4. Battery Status Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Battery Status</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono text-right leading-tight">
            Available for Discharge:<br />
            <strong className="text-emerald-700 font-semibold">{batteryAvailableDischarge} MWh</strong>
          </span>
        </div>

        <div className="my-1.5">
          <div className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {batteryPct}%
          </div>
        </div>

        <div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${batteryPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 text-right">
            {batteryCurrentMwh} MWh / {batteryTotalMwh} MWh
          </div>
        </div>
      </div>
    </div>
  );
}
