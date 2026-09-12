import React from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, Sparkles, Shield, Factory, Coins, Radio, Zap, Activity } from "lucide-react";
import { getDynamicDeficitAnalysis } from "../../utils/dynamicRiskEngine";

export default function SystemOutlookHero({ onInvestigateRisk, onViewOutlook, onActionClick }) {
  const { forecastData, selectedArea, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, canControl } = useAuth();

  const schedule = forecastData?.hourly_schedule || [];
  const solarPark = forecastData?.solar_park || "Solar PV Array";
  const windPark = forecastData?.wind_park || "Wind Farm Cluster";
  const gridOp = forecastData?.grid_operator || "Regional Grid Substation";
  const areaName = forecastData?.selected_area || selectedArea || "Zone";

  // Dynamic Deficit Window & Magnitude Analysis
  const deficitAnalysis = getDynamicDeficitAnalysis(schedule, areaName, solarPark, windPark, gridOp);

  // Content tailored to the 4 roles
  let roleBadge = "GRID COMMAND CENTER";
  let statusBadge = "STABLE NOW";
  let statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let headline = "Stable now. Prepare for evening renewable deficit.";
  let subtitle = "Renewable generation is expected to decrease in the evening while demand increases. Take action early to ensure reliable supply.";
  let primaryBtnText = "View 24H Forecast";
  let secondaryBtnText = "Investigate Risk";

  if (activeRoleId === 'plant_operations_engineer') {
    const plantName = assignedPlant?.name || "Sanand Solar PV Cluster";
    roleBadge = "PLANT OPERATIONS CENTER";
    statusBadge = "ASSET LEVEL";
    statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    headline = `${plantName}: Actual 128.8 MW vs Expected 140 MW`;
    subtitle = "Inverter availability at 96.4% (38/40 blocks online). Localized cloud cover expected after 16:30 (-18.6 MW underproduction predicted).";
    primaryBtnText = "Inspect Plant Forecast";
    secondaryBtnText = "View Inverter Health";
  } else if (activeRoleId === 'energy_trading_analyst') {
    roleBadge = "ENERGY TRADING INTELLIGENCE";
    statusBadge = "COMMERCIAL DESK";
    statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    headline = "BESS Arbitrage Window: Midday ₹3.1/kWh vs Evening ₹6.8/kWh";
    subtitle = "Scheduled energy of 1,960 MWh contracted. +180 MWh tradable surplus on RTM with ₹1.29 lakh expected net arbitrage profit.";
    primaryBtnText = "Analyze Market Curves";
    secondaryBtnText = "Simulate Trading Strategy";
  } else if (activeRoleId === 'remc_desk_officer') {
    roleBadge = "REMC RENEWABLE MONITORING CENTER";
    statusBadge = "18 PLANTS MONITORED";
    statusBadgeColor = "bg-purple-50 text-purple-700 border-purple-200";
    headline = "Regional Pooling: 1.60 GW Real-Time RE · -135 MW Ramp Alert";
    subtitle = "Statewide pool schedule deviation is -120 MW. Rapid wind ramp-down forecast for Kutch & Jaisalmer corridors within 60 minutes.";
    primaryBtnText = "Multi-Plant Ledger";
    secondaryBtnText = "Notify Grid Dispatcher";
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      {/* Background Scenic Photo on the Right */}
      <div className="absolute right-0 top-0 bottom-0 w-[50%] pointer-events-none hidden md:block overflow-hidden">
        <img 
          src="/hero-solar-photo.png" 
          alt="Renewable generation infrastructure" 
          className="w-full h-full object-cover object-right opacity-90"
        />
        <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-white via-white/80 to-transparent" />
      </div>

      {/* Main Left Content */}
      <div className="relative z-10 max-w-xl space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wide uppercase">
            {roleBadge}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadgeColor}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {statusBadge}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Scope: {roleConfig?.dataScope || "GRID"}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
          {headline}
        </h2>

        {/* Subtitle description */}
        <p className="text-xs text-slate-500 leading-relaxed max-w-md">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onViewOutlook?.()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>{primaryBtnText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onInvestigateRisk?.()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-500 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-slate-700" />
            </div>
            <span>{secondaryBtnText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
