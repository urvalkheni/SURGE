import React from "react";
import { BarChart3 } from "lucide-react";

export default function ImpactCard({ totals }) {
  const energyMwh = totals?.totalEnergyMwh ? (totals.totalEnergyMwh * 0.08).toFixed(0) : "38";
  const costSavings = totals?.totalCostBenefitInr ? (totals.totalCostBenefitInr).toLocaleString() : "6,500";
  const co2Avoided = totals?.co2SavedKg ? (totals.co2SavedKg * 0.1).toFixed(0) : "24";
  const reShare = "18";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
          <BarChart3 className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-bold text-slate-800 font-sans">
          Expected Business Impact
        </h3>
      </div>

      {/* 4 Metric Tiles (2x2 or 4x1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
        {/* Metric 1 */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 text-center border border-slate-100">
          <div className="text-sm font-extrabold text-slate-900 font-sans">
            {energyMwh} MWh
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Renewable Utilized
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 text-center border border-slate-100">
          <div className="text-sm font-extrabold text-slate-900 font-sans">
            ₹ {costSavings}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Est. Cost Saving
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 text-center border border-slate-100">
          <div className="text-sm font-extrabold text-slate-900 font-sans">
            {co2Avoided} kg
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            CO₂ Avoided
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 text-center border border-slate-100">
          <div className="text-sm font-extrabold text-emerald-600 font-sans flex items-center justify-center gap-0.5">
            <span>↑</span>
            <span>{reShare}%</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Renewable Share
          </div>
        </div>
      </div>
    </div>
  );
}
