import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import SystemOutlookHero from "../components/command/SystemOutlookHero";
import NextRiskCard from "../components/cards/NextRiskCard";
import KpiMetricsRow from "../components/cards/KpiMetricsRow";
import GenerationDemandChart from "../components/charts/GenerationDemandChart";
import Next12HoursTimeline from "../components/command/Next12HoursTimeline";
import WeatherOutlookCard from "../components/cards/WeatherOutlookCard";
import RecommendationCard from "../components/cards/RecommendationCard";
import ImpactCard from "../components/cards/ImpactCard";
import DispatchActionModal from "../components/command/DispatchActionModal";
import { Loader2 } from "lucide-react";
import { getDynamicDeficitAnalysis } from "../utils/dynamicRiskEngine";

export default function CommandCenter() {
  const { forecastData, loading, selectedState, selectedCity, selectedArea } = useApp();

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

  // Primary AI Operations Advisory
  const recommendation = {
    id: `rec-${selectedState}-${selectedCity}-${selectedArea}`,
    actionText: `🔋 Charge battery during solar peak (+20 MW)`,
    timeWindow: "12:00 – 14:30 IST",
    reasons: [
      `${solarPark} generation reaches peak output (+28% above baseline).`,
      `Prevents renewable power curtailment instructions issued by ${gridOp}.`,
      `Stores clean energy locally to shave the ${deficitAnalysis.hasDeficit ? `${deficitAnalysis.periodLabel.toLowerCase()} ${areaName} deficit (-${deficitAnalysis.deficitMagnitude} MW)` : `${areaName} peak load ramp`}.`
    ],
    energyMwh: Number((forecastData.solar_energy_mwh * 0.08).toFixed(1)),
    costSavingsInr: Math.round(forecastData.solar_energy_mwh * 450),
    co2AvoidedKg: Number((forecastData.solar_energy_mwh * 0.85).toFixed(1))
  };

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

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchInitialAction, setDispatchInitialAction] = useState(null);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* ROW 1: Hero Card (Left ~65%) + Upcoming Risk Card (Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <SystemOutlookHero 
            onInvestigateRisk={() => {
              setDispatchInitialAction({
                type: 'BESS_DISCHARGE',
                mw: Math.min(80, Math.round(Math.abs(Number(deficitAnalysis.deficitMagnitude) || 33.4))),
                rationale: `Mitigate predicted ${deficitAnalysis.periodLabel || 'evening'} deficit shortfall of -${deficitAnalysis.deficitMagnitude || '33.4'} MW`
              });
              setIsDispatchModalOpen(true);
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

      {/* ROW 2: 4 Key Metric KPI Cards */}
      <KpiMetricsRow 
        currentGen={currentGen}
        currentDemand={currentDemand}
        currentBalance={currentBalance}
        p10={p10}
        p90={p90}
        peakDemand={deficitAnalysis.worstPoint?.grid_demand_mw}
        peakTime={deficitAnalysis.peakRiskTime}
      />

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
              setDispatchInitialAction({
                type: 'BESS_CHARGE',
                mw: 20.0,
                rationale: 'Absorb solar generation surplus during peak irradiance window'
              });
              setIsDispatchModalOpen(true);
            }}
          />
        </div>
        <div className="md:col-span-4">
          <ImpactCard totals={totals} />
        </div>
      </div>

      {/* Dispatch Action Modal */}
      <DispatchActionModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        initialAction={dispatchInitialAction}
      />
    </div>
  );
}
