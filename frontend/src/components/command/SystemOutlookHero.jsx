import React from "react";
import { useApp } from "../../context/AppContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { getDynamicDeficitAnalysis } from "../../utils/dynamicRiskEngine";

export default function SystemOutlookHero({ onInvestigateRisk, onViewOutlook }) {
  const { forecastData, selectedArea } = useApp();

  const schedule = forecastData?.hourly_schedule || [];
  const solarPark = forecastData?.solar_park || "Solar PV Array";
  const windPark = forecastData?.wind_park || "Wind Farm Cluster";
  const gridOp = forecastData?.grid_operator || "Regional Grid Substation";
  const areaName = forecastData?.selected_area || selectedArea || "Zone";

  // Dynamic Deficit Window & Magnitude Analysis
  const deficitAnalysis = getDynamicDeficitAnalysis(schedule, areaName, solarPark, windPark, gridOp);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      {/* Background Scenic Photo on the Right */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none hidden md:block overflow-hidden">
        <img 
          src="/hero-solar-photo.png" 
          alt="Solar farm and wind turbines" 
          className="w-full h-full object-cover object-right"
        />
        {/* Soft linear gradient fade on the left edge so text is 100% crisp and readable */}
        <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-white via-white/70 to-transparent" />
      </div>

      {/* Main Left Content */}
      <div className="relative z-10 max-w-xl space-y-3">
        {/* Top Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 font-sans tracking-wide uppercase">
            SYSTEM OUTLOOK
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            STABLE NOW
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
          {deficitAnalysis.hasDeficit ? (
            <span>Stable now. Prepare for evening renewable deficit.</span>
          ) : (
            <span>Optimal balance. Clean generation matches demand across 24h.</span>
          )}
        </h2>

        {/* Subtitle description */}
        <p className="text-xs text-slate-500 leading-relaxed max-w-md">
          Renewable generation is expected to decrease in the evening while demand increases. Take action early to ensure reliable supply.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => onViewOutlook?.()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>View 24H Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onInvestigateRisk?.()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-500 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-slate-700" />
            </div>
            <span>Investigate Risk</span>
          </button>
        </div>
      </div>
    </div>
  );
}
