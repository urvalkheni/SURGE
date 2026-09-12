/**
 * dynamicRiskEngine.js
 * Synthesizes dynamic, location-specific grid operational alerts and 
 * AI dispatch recommendations from live/modeled forecast schedules.
 */

export function getDynamicDeficitAnalysis(
  schedule, 
  areaName = "Zone", 
  solarPark = "Solar Array", 
  windPark = "Wind Farm", 
  gridOp = "Substation",
  deficitThreshold = 15.0
) {
  if (!schedule || schedule.length === 0) {
    return {
      hasDeficit: false,
      worstBalance: 0,
      deficitMagnitude: "0.0",
      windowStr: "ALL CLEAR",
      peakRiskTime: "None",
      periodLabel: "Balanced",
      severity: "LOW",
      title: `Optimal Grid Balance for ${areaName}`,
      causeSummary: "Renewable generation matches local demand across all 24 hours without deficit.",
      worstPoint: { total_renewable_mw: 50.0, grid_demand_mw: 40.0, grid_balance_mw: 10.0 }
    };
  }

  const thresh = Number(deficitThreshold) || 15.0;
  const deficitHours = schedule.filter(s => (s.grid_balance_mw < -thresh) || s.system_status === "DEFICIT");

  if (deficitHours.length === 0) {
    return {
      hasDeficit: false,
      worstBalance: 0,
      deficitMagnitude: "0.0",
      windowStr: "ALL CLEAR",
      peakRiskTime: "None",
      periodLabel: "Balanced",
      severity: "LOW",
      title: `Optimal Grid Balance for ${areaName}`,
      causeSummary: `${solarPark} and ${windPark} supply sufficient clean power to cover ${gridOp} demand throughout the day.`,
      worstPoint: schedule[0] || { total_renewable_mw: 50.0, grid_demand_mw: 40.0, grid_balance_mw: 10.0 }
    };
  }

  // Identify the worst deficit point
  const worstPoint = deficitHours.reduce((min, s) => s.grid_balance_mw < min.grid_balance_mw ? s : min, deficitHours[0]);
  const worstHourPart = (worstPoint.timestamp.split(" ")[1] || "18:00").substring(0, 5);
  const worstHourInt = parseInt(worstHourPart.split(":")[0], 10);

  // Group contiguous block around the peak deficit
  const block = deficitHours.filter(s => {
    const h = parseInt((s.timestamp.split(" ")[1] || "00:00").split(":")[0], 10);
    return Math.abs(h - worstHourInt) <= 2;
  });

  const startHourStr = (block[0]?.timestamp.split(" ")[1] || `${Math.max(0, worstHourInt - 1)}:00`).substring(0, 5);
  const endHourStr = (block[block.length - 1]?.timestamp.split(" ")[1] || `${Math.min(23, worstHourInt + 2)}:00`).substring(0, 5);

  const isMorning = worstHourInt < 12;
  const isAfternoon = worstHourInt >= 12 && worstHourInt < 17;
  const periodLabel = isMorning ? "Morning Peak" : (isAfternoon ? "Midday Peak" : "Evening Peak");
  const windowStr = `${startHourStr} – ${endHourStr} IST`;
  const peakRiskTime = `${worstHourPart} IST`;

  const magnitude = Math.abs(worstPoint.grid_balance_mw).toFixed(1);
  const isCritical = worstPoint.grid_balance_mw < -30.0;

  const cause = isMorning
    ? `Solar irradiance is low or zero in the early morning while ${gridOp} morning commuter, commercial, and agricultural load peaks at ${worstPoint.grid_demand_mw.toFixed(1)} MW.`
    : (worstHourInt >= 17
        ? `${solarPark} solar generation decays to 0 W/m² at sunset while ${gridOp} domestic lighting and municipal load ramps up to ${worstPoint.grid_demand_mw.toFixed(1)} MW.`
        : `${gridOp} local industrial peak load outpaces instantaneous renewable output by ${magnitude} MW.`);

  return {
    hasDeficit: true,
    worstBalance: worstPoint.grid_balance_mw,
    deficitMagnitude: magnitude,
    windowStr,
    startHourStr,
    endHourStr,
    peakRiskTime,
    periodLabel,
    severity: isCritical ? "HIGH" : "MODERATE",
    title: `${periodLabel} Renewable Deficit Predicted for ${areaName}`,
    causeSummary: cause,
    worstPoint
  };
}

export function generateDynamicAlerts(forecastData, deficitThreshold = 15.0) {
  if (!forecastData || !forecastData.hourly_schedule) return [];

  const schedule = forecastData.hourly_schedule;
  const solarPark = forecastData.solar_park || "Solar PV Array";
  const windPark = forecastData.wind_park || "Wind Farm Cluster";
  const gridOp = forecastData.grid_operator || "Regional Grid Substation";
  const areaName = forecastData.selected_area || "Zone";

  const alerts = [];
  let alertId = 1;

  // 1. Dynamic Deficit Alert
  const deficitAnalysis = getDynamicDeficitAnalysis(schedule, areaName, solarPark, windPark, gridOp, deficitThreshold);
  if (deficitAnalysis.hasDeficit) {
    const p50 = deficitAnalysis.worstPoint.total_renewable_mw;
    const p10 = (p50 * 0.88).toFixed(1);
    const p90 = (p50 * 1.12).toFixed(1);

    alerts.push({
      id: alertId++,
      severity: deficitAnalysis.severity === "HIGH" ? "CRITICAL" : "WARNING",
      title: deficitAnalysis.title,
      timeWindow: `Today ${deficitAnalysis.windowStr}`,
      uncertainty: `P10: ${p10} MW – P90: ${p90} MW`,
      cause: deficitAnalysis.causeSummary,
      recommendation: `Discharge Battery Storage (BESS) at ${deficitAnalysis.deficitMagnitude} MW or activate local spinning reserve during ${deficitAnalysis.windowStr} to avoid CERC DSM penalty.`,
      status: "Active"
    });
  }

  // 2. Dynamic Solar Surplus Alert
  const surplusHours = schedule.filter(s => s.system_status === "SURPLUS" || s.grid_balance_mw > 15.0);
  if (surplusHours.length > 0) {
    const peakSurplus = surplusHours.reduce((max, s) => s.grid_balance_mw > max.grid_balance_mw ? s : max, surplusHours[0]);
    const surplusHourStr = (peakSurplus.timestamp.split(" ")[1] || "12:00").substring(0, 5);
    const surpStart = (surplusHours[0]?.timestamp.split(" ")[1] || "11:30").substring(0, 5);
    const surpEnd = (surplusHours[surplusHours.length - 1]?.timestamp.split(" ")[1] || "14:30").substring(0, 5);

    const p50 = peakSurplus.total_renewable_mw;
    const p10 = (p50 * 0.92).toFixed(1);
    const p90 = (p50 * 1.08).toFixed(1);

    alerts.push({
      id: alertId++,
      severity: "WARNING",
      title: `Generation Surplus & Grid Curtailment Risk for ${areaName}`,
      timeWindow: `Today ${surpStart} – ${surpEnd} IST`,
      uncertainty: `P10: ${p10} MW – P90: ${p90} MW`,
      cause: `${solarPark} generation peaks at ${peakSurplus.solar_generation_mw.toFixed(1)} MW under high irradiance, exceeding ${gridOp} local baseline load by +${peakSurplus.grid_balance_mw.toFixed(1)} MW.`,
      recommendation: `Initiate +${peakSurplus.grid_balance_mw.toFixed(1)} MW BESS battery charging between ${surpStart} and ${surpEnd} to absorb excess clean energy and prevent feeder trip.`,
      status: "Active"
    });
  }

  // 3. Wind Dynamic Atmospheric Status
  const avgWind = schedule.reduce((sum, s) => sum + (s.wind_generation_mw || 0), 0) / schedule.length;
  if (avgWind > 25.0) {
    alerts.push({
      id: alertId++,
      severity: "INFO",
      title: `High Wind Resource Inflow Active for ${windPark}`,
      timeWindow: "Active 24h Horizon",
      uncertainty: `P10: ${(avgWind * 0.85).toFixed(1)} MW – P90: ${(avgWind * 1.15).toFixed(1)} MW`,
      cause: `Strong sustained coastal/gap wind velocities (${avgWind.toFixed(1)} MW avg) support night-time grid stability and offset evening deficits.`,
      recommendation: `Maintain steady interconnect injection with ${gridOp}; monitor high-velocity turbine pitch control.`,
      status: "Active"
    });
  } else {
    alerts.push({
      id: alertId++,
      severity: "INFO",
      title: `Low Wind Velocity Stagnation for ${windPark}`,
      timeWindow: "Active Horizon",
      uncertainty: `P10: ${(avgWind * 0.7).toFixed(1)} MW – P90: ${(avgWind * 1.3).toFixed(1)} MW`,
      cause: `Rotor velocities subdued (${avgWind.toFixed(1)} MW avg) across ${windPark}, placing primary dispatch reliance on solar and storage.`,
      recommendation: `Rely on midday solar storage absorption; schedule routine rotor pitch inspection.`,
      status: "Resolved"
    });
  }

  return alerts;
}

export function generateDynamicRecommendations(forecastData, deficitThreshold = 15.0) {
  if (!forecastData || !forecastData.hourly_schedule) return [];

  const schedule = forecastData.hourly_schedule;
  const solarPark = forecastData.solar_park || "Solar PV Array";
  const windPark = forecastData.wind_park || "Wind Farm Cluster";
  const gridOp = forecastData.grid_operator || "Regional Grid Substation";
  const areaName = forecastData.selected_area || "Zone";
  const stateName = forecastData.selected_state || "Region";

  const recommendations = [];

  // 1. Midday Battery Absorption
  const surplusHours = schedule.filter(s => s.grid_balance_mw > 10.0);
  const peakSurplus = surplusHours.length > 0
    ? surplusHours.reduce((max, s) => s.grid_balance_mw > max.grid_balance_mw ? s : max, surplusHours[0])
    : { grid_balance_mw: 20.0, solar_generation_mw: 65.0, grid_demand_mw: 45.0, timestamp: "2026-09-12 12:00" };

  const surpStart = (surplusHours[0]?.timestamp.split(" ")[1] || "11:30").substring(0, 5);
  const surpEnd = (surplusHours[surplusHours.length - 1]?.timestamp.split(" ")[1] || "14:30").substring(0, 5);

  const absorbMw = Number(peakSurplus.grid_balance_mw.toFixed(1));
  const absorbMwh = Number((absorbMw * 2.5).toFixed(1));
  const absorbSavings = Math.round(absorbMwh * 4200);
  const absorbCo2 = Number((absorbMwh * 820).toFixed(1));

  recommendations.push({
    id: `rec-absorb-${areaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    actionText: `🔋 Charge Battery Energy Storage (BESS) at +${absorbMw} MW (Absorption Phase)`,
    timeWindow: `${surpStart} – ${surpEnd} IST (Solar Peak Window)`,
    reasons: [
      `${solarPark} generation reaches peak output (+${peakSurplus.solar_generation_mw.toFixed(1)} MW) while ${gridOp} local demand is ${peakSurplus.grid_demand_mw.toFixed(1)} MW.`,
      `Prevents ${absorbMw} MW renewable power curtailment instructions issued by ${stateName.split('-')[0].trim()} SLDC.`,
      `Stores clean energy locally to shave the impending deficit, saving an estimated ₹${absorbSavings.toLocaleString('en-IN')}.`
    ],
    energyMwh: absorbMwh,
    costSavingsInr: absorbSavings,
    co2AvoidedKg: absorbCo2
  });

  // 2. Deficit Peak Shaving
  const deficitAnalysis = getDynamicDeficitAnalysis(schedule, areaName, solarPark, windPark, gridOp, deficitThreshold);
  if (deficitAnalysis.hasDeficit) {
    const dischargeMw = Number(deficitAnalysis.deficitMagnitude);
    const dischargeMwh = Number((dischargeMw * 2.5).toFixed(1));
    const dischargeSavings = Math.round(dischargeMwh * 5400);
    const dischargeCo2 = Number((dischargeMwh * 850).toFixed(1));

    recommendations.push({
      id: `rec-discharge-${areaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      actionText: `⚡ Discharge Battery Energy Storage (BESS) at -${dischargeMw} MW (Peak Shaving)`,
      timeWindow: `${deficitAnalysis.windowStr} (${deficitAnalysis.periodLabel})`,
      reasons: [
        `Generation drops below substation demand, reaching a peak shortfall of -${dischargeMw} MW at ${deficitAnalysis.peakRiskTime}.`,
        `${gridOp} load peaks at ${deficitAnalysis.worstPoint.grid_demand_mw.toFixed(1)} MW while ${windPark} delivers ${deficitAnalysis.worstPoint.total_renewable_mw.toFixed(1)} MW.`,
        `Discharging stored clean power offsets expensive spot-market drawl and prevents CERC DSM deviation penalties.`
      ],
      energyMwh: dischargeMwh,
      costSavingsInr: dischargeSavings,
      co2AvoidedKg: dischargeCo2
    });
  }

  return recommendations;
}
