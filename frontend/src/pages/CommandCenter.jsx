import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import SystemOutlookHero from "../components/command/SystemOutlookHero";
import NextRiskCard from "../components/cards/NextRiskCard";
import RoleKpiStrip from "../components/cards/RoleKpiStrip";
import GenerationDemandChart from "../components/charts/GenerationDemandChart";
import Next12HoursTimeline from "../components/command/Next12HoursTimeline";
import WeatherOutlookCard from "../components/cards/WeatherOutlookCard";
import RecommendationCard from "../components/cards/RecommendationCard";
import ImpactCard from "../components/cards/ImpactCard";
import DispatchActionModal from "../components/command/DispatchActionModal";
import PlantTechnicalWidget from "../components/dashboard/PlantTechnicalWidget";
import TradingIntelligenceWidget from "../components/dashboard/TradingIntelligenceWidget";
import RemcMultiPlantTable from "../components/dashboard/RemcMultiPlantTable";
import { 
  Loader2, 
  Zap, 
  Search, 
  BatteryCharging, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet, 
  TrendingUp, 
  CloudSun, 
  Radio, 
  SlidersHorizontal,
  Factory,
  Download,
  AlertTriangle
} from "lucide-react";
import { getDynamicDeficitAnalysis } from "../utils/dynamicRiskEngine";

export default function CommandCenter() {
  const navigate = useNavigate();
  const { forecastData, loading, selectedState, selectedCity, selectedArea, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, canControl, hasPermission } = useAuth();

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchInitialAction, setDispatchInitialAction] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const showNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  if (loading || !forecastData) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-sans tracking-wide text-slate-500">
          Syncing telemetry & running XGBoost inference for {(selectedArea || selectedCity || selectedState).toUpperCase()}...
        </p>
      </div>
    );
  }

  const schedule = forecastData.hourly_schedule || [];
  const solarPark = forecastData.solar_park || "Solar PV Array";
  const windPark = forecastData.wind_park || "Wind Farm Cluster";
  const gridOp = forecastData.grid_operator || "Regional Grid Substation";
  const areaName = forecastData.selected_area || selectedArea || "Zone";
  
  // Representative active point
  const currentPoint = schedule.find(s => s.solar_generation_mw > 30.0) || schedule[8] || schedule[0] || {};
  const currentGen = currentPoint.total_renewable_mw ?? 148.7;
  const currentDemand = currentPoint.grid_demand_mw ?? 110.0;
  const currentBalance = currentPoint.grid_balance_mw ?? (currentGen - currentDemand);
  const p10 = (currentGen * 0.91).toFixed(1);
  const p90 = (currentGen * 1.09).toFixed(1);

  // Derive Dynamic Deficit Analysis
  const deficitAnalysis = getDynamicDeficitAnalysis(schedule, areaName, solarPark, windPark, gridOp);

  const nextRisk = deficitAnalysis.hasDeficit ? {
    severity: deficitAnalysis.severity,
    timeWindow: `Today ${deficitAnalysis.windowStr}`,
    title: deficitAnalysis.title,
    forecastMw: deficitAnalysis.worstPoint.total_renewable_mw,
    demandMw: deficitAnalysis.worstPoint.grid_demand_mw,
    deltaMw: deficitAnalysis.worstPoint.grid_balance_mw,
    causeSummary: deficitAnalysis.causeSummary
  } : null;

  // Role-Specific AI Recommendation
  let recommendation = {
    id: `rec-${selectedState}-${selectedCity}-${selectedArea}`,
    actionText: `🔋 Charge battery during solar peak (+20 MW)`,
    timeWindow: "12:00 – 14:30 IST",
    reasons: [
      `${solarPark} generation reaches peak output (+28% above baseline).`,
      `Prevents renewable power curtailment instructions issued by ${gridOp}.`,
      `Stores clean energy locally to shave the evening deficit (-${deficitAnalysis.deficitMagnitude} MW).`
    ],
    energyMwh: Number((forecastData.solar_energy_mwh * 0.08).toFixed(1)),
    costSavingsInr: Math.round(forecastData.solar_energy_mwh * 450),
    co2AvoidedKg: Number((forecastData.solar_energy_mwh * 0.85).toFixed(1))
  };

  if (activeRoleId === 'plant_operations_engineer') {
    recommendation = {
      id: `rec-plant-${assignedPlant?.id || 'sanand'}`,
      actionText: `🔧 Inspect Inverter Combiner Box INV-07 & Clean Array`,
      timeWindow: "Today 16:30 IST",
      reasons: [
        `Inverter Block INV-07 operating at 48.6°C module temp, causing -11.2 MW technical deviation.`,
        `Upcoming cloud cover past 16:30 will reduce GHI from 820 W/m² to 210 W/m².`,
        `Auto-tilt compensation and soiling removal will recover ~4.8 MW generation yield.`
      ],
      energyMwh: 18.5,
      costSavingsInr: 32000,
      co2AvoidedKg: 780.0
    };
  } else if (activeRoleId === 'energy_trading_analyst') {
    recommendation = {
      id: `rec-trading-spread`,
      actionText: `📈 Charge 35 MWh BESS at ₹3.1/kWh → Discharge at ₹6.8/kWh`,
      timeWindow: "12:00 – 14:00 (Charge) & 18:30 – 20:30 (Discharge)",
      reasons: [
        `Day-Ahead Clearing Price is ₹3.10/kWh during solar midday peak (12:00–14:00).`,
        `Evening peak demand at 19:00 spikes exchange clearing price to ₹6.80/kWh.`,
        `Net price spread of +₹3.70/kWh yields ₹1,29,500 estimated net arbitrage profit.`
      ],
      energyMwh: 35.0,
      costSavingsInr: 129500,
      co2AvoidedKg: 950.0
    };
  } else if (activeRoleId === 'remc_desk_officer') {
    recommendation = {
      id: `rec-remc-ramp`,
      actionText: `⚡ Issue Regional Ramp Alert to SLDC Dispatcher (-135 MW)`,
      timeWindow: "17:45 – 19:00 IST",
      reasons: [
        `Kutch Wind Corridor + Jaisalmer Wind output forecast to drop by -135 MW within 60 minutes.`,
        `Compounding solar sunset ramp-down (-220 MW/h) creates critical regional net ramp pressure.`,
        `Request SLDC to prepare 90 MW BESS fast-response discharge and 45 MW thermal spinning reserve.`
      ],
      energyMwh: 135.0,
      costSavingsInr: 185000,
      co2AvoidedKg: 2400.0
    };
  }

  const totals = {
    totalEnergyMwh: forecastData.total_energy_mwh,
    totalCostBenefitInr: Math.round(forecastData.total_energy_mwh * 420),
    curtailmentAvoidedMw: 20.0,
    co2SavedKg: Number((forecastData.total_energy_mwh * 0.82).toFixed(1))
  };

  const weatherData = forecastData.weather_current || {
    temperature_c: 31,
    solar_irradiance_wm2: 820,
    cloud_cover_pct: 12,
    wind_speed_ms: 6.2,
    condition: "Clear Sky"
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Toast notification for operator actions */}
      {actionNotice && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-mono animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Allowed Actions Bar according to role */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-xs font-bold text-slate-900 font-sans">
            {roleConfig?.name}: Allowed Operational Actions
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            ({roleConfig?.primaryQuestion})
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {Object.values(roleConfig?.moduleAccess || {}).filter(a => a !== 'HIDDEN').length} Active Modules
          </span>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeRoleId === 'chief_grid_dispatcher' && (
            <>
              <button
                onClick={() => {
                  setDispatchInitialAction({
                    type: 'BESS_DISCHARGE',
                    mw: 90.0,
                    rationale: 'Chief Dispatcher approval: dispatch BESS to mitigate evening deficit (-182 MW)'
                  });
                  setIsDispatchModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>Approve BESS Dispatch (90 MW)</span>
              </button>

              <button
                onClick={() => {
                  setDispatchInitialAction({
                    type: 'THERMAL_PEAKER',
                    mw: 45.0,
                    rationale: 'Chief Dispatcher reserve call: synchronize 45 MW thermal peaker'
                  });
                  setIsDispatchModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Schedule Backup (45 MW)</span>
              </button>

              <button
                onClick={() => showNotification("Alert acknowledged: SLDC log entry recorded.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Acknowledge Alert</span>
              </button>

              <button
                onClick={() => navigate("/plants")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <Factory className="w-3.5 h-3.5 text-slate-500" />
                <span>View Affected Plants</span>
              </button>
            </>
          )}

          {activeRoleId === 'plant_operations_engineer' && (
            <>
              <button
                onClick={() => navigate("/alerts")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Investigate Plant Alert</span>
              </button>

              <button
                onClick={() => showNotification("Plant alert acknowledged for Sanand Sector 4.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Acknowledge Assigned Alert</span>
              </button>

              <button
                onClick={() => navigate("/weather")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <CloudSun className="w-3.5 h-3.5 text-blue-600" />
                <span>Inspect Weather Impact</span>
              </button>

              <button
                onClick={() => showNotification("Maintenance ticket created for Inverter Combiner Box INV-07.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <Factory className="w-3.5 h-3.5 text-amber-600" />
                <span>Log Maintenance Ticket</span>
              </button>
            </>
          )}

          {activeRoleId === 'energy_trading_analyst' && (
            <>
              <button
                onClick={() => navigate("/forecast")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Analyze Market Opportunity</span>
              </button>

              <button
                onClick={() => navigate("/recommendations")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Generate Trading Strategy</span>
              </button>

              <button
                onClick={() => showNotification("DAM & RTM generation schedule exported as CSV.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Schedule</span>
              </button>

              <button
                onClick={() => navigate("/battery")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate BESS Arbitrage</span>
              </button>
            </>
          )}

          {activeRoleId === 'remc_desk_officer' && (
            <>
              <button
                onClick={() => showNotification("Dispatcher notified: SLDC control room flagged with -135 MW ramp warning.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Coordinate With Dispatcher</span>
              </button>

              <button
                onClick={() => showNotification("Regional monitoring alert acknowledged across 18 plants.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Acknowledge Regional Alert</span>
              </button>

              <button
                onClick={() => navigate("/plants")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <Factory className="w-3.5 h-3.5 text-slate-500" />
                <span>Inspect Plant Forecasts</span>
              </button>

              <button
                onClick={() => showNotification("REMC Statewide Daily Log exported.")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span>Export REMC Log</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ROW 1: Hero Card (Left ~65%) + Upcoming Risk Card (Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <SystemOutlookHero 
            onInvestigateRisk={() => {
              if (canControl()) {
                setDispatchInitialAction({
                  type: 'BESS_DISCHARGE',
                  mw: 90.0,
                  rationale: `Mitigate predicted evening deficit shortfall of -182 MW`
                });
                setIsDispatchModalOpen(true);
              } else {
                navigate("/alerts");
              }
            }}
            onViewOutlook={() => {
              const el = document.getElementById("forecast-chart-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
        <div className="lg:col-span-4">
          <NextRiskCard risk={nextRisk} />
        </div>
      </div>

      {/* ROW 2: Role-Tailored KPI Metrics Row */}
      <RoleKpiStrip 
        currentGen={currentGen}
        currentDemand={currentDemand}
        currentBalance={currentBalance}
        p10={p10}
        p90={p90}
        peakDemand={deficitAnalysis.worstPoint?.grid_demand_mw}
        peakTime={deficitAnalysis.peakRiskTime}
      />

      {/* Role-Specific Specialist Module Section */}
      {activeRoleId === 'plant_operations_engineer' && (
        <PlantTechnicalWidget />
      )}

      {activeRoleId === 'energy_trading_analyst' && (
        <TradingIntelligenceWidget />
      )}

      {activeRoleId === 'remc_desk_officer' && (
        <RemcMultiPlantTable />
      )}

      {/* ROW 3: Generation vs Demand Forecast (Left ~68%) + Next 12 Hours Timeline (Right ~32%) */}
      <div id="forecast-chart-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <GenerationDemandChart 
            schedule={schedule}
            deficitWindowStr={deficitAnalysis.windowStr}
          />
        </div>
        <div className="lg:col-span-4">
          <Next12HoursTimeline 
            schedule={schedule}
            onViewAll={() => {
              const el = document.getElementById("forecast-chart-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </div>

      {/* ROW 4: Weather Outlook (~28%) + AI Operations Advisory (~42%) + Expected Business Impact (~30%) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-3">
          <WeatherOutlookCard weather={weatherData} />
        </div>
        <div className="md:col-span-5">
          <RecommendationCard 
            recommendation={recommendation}
            onViewDetails={() => {
              const el = document.getElementById("forecast-chart-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            onApprove={() => {
              if (canControl()) {
                setDispatchInitialAction({
                  type: 'BESS_CHARGE',
                  mw: 20.0,
                  rationale: 'Absorb solar generation surplus during peak irradiance window'
                });
                setIsDispatchModalOpen(true);
              } else {
                showNotification(`Action verified by ${roleConfig.name}. Log recorded.`);
              }
            }}
          />
        </div>
        <div className="md:col-span-4">
          <ImpactCard totals={totals} />
        </div>
      </div>

      {/* Dispatch Action Modal (Available only to roles with CONTROL permission) */}
      <DispatchActionModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        initialAction={dispatchInitialAction}
      />
    </div>
  );
}
