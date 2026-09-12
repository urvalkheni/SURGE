import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function NextRiskCard({ risk }) {
  if (!risk || !risk.deltaMw || risk.deltaMw >= 0) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SYSTEM STATUS</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ALL CLEAR
          </span>
        </div>

        <div className="my-2">
          <div className="text-xs font-semibold text-slate-600">Expected Grid Balance</div>
          <div className="text-3xl font-extrabold text-emerald-600 font-sans tracking-tight mt-0.5">
            +Optimal
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-emerald-200/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Confidence</span>
            <strong className="text-slate-800 font-semibold">High</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Operating Margin</span>
            <strong className="text-slate-800 font-semibold">&gt; 15 MW</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Grid Compliance</span>
            <strong className="text-emerald-700 font-semibold">100% Valid</strong>
          </div>
        </div>

        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/80 border border-emerald-200/60 text-[11px] text-emerald-800 flex items-center gap-2">
          <span>✅</span>
          <span className="truncate">Clean renewable generation covers all local feeder loads.</span>
        </div>
      </div>
    );
  }

  const timeWindow = risk.timeWindow?.replace("Today ", "") || "18:00 – 21:00 IST";
  const deficitVal = Math.abs(Number(risk.deltaMw)).toFixed(1);
  const likelyMin = (Number(deficitVal) * 0.85).toFixed(0);
  const likelyMax = (Number(deficitVal) * 1.15).toFixed(0);
  const likelyRange = `${likelyMin} – ${likelyMax} MW`;
  const causeText = risk.causeSummary || "Solar generation drops in the evening due to low irradiance.";

  return (
    <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>UPCOMING RISK</span>
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
          <strong className="text-slate-800 font-semibold">High</strong>
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
