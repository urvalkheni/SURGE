import { 
  ForecastSummary, 
  ForecastPoint, 
  RiskEvent, 
  Recommendation, 
  PlantConfiguration 
} from '@/types';

/**
 * Procedural generation of a realistic 72-hour continuous solar + BESS telemetry curve.
 * Canonical plant: Ahmedabad Solar Plant (42 MW AC / 50 MW DC).
 */
function generate72HourForecastPoints(): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const baseDate = new Date('2026-09-14T00:00:00Z');

  for (let i = 0; i < 72; i++) {
    const current = new Date(baseDate.getTime() + i * 3600 * 1000);
    const hourOfDay = current.getUTCHours();
    const timestamp = current.toISOString();

    // Solar diurnal curve calculation: active 06:00 to 19:00 UTC, peak at 12:30
    let solarElevation = 0;
    if (hourOfDay >= 6 && hourOfDay <= 19) {
      solarElevation = Math.sin(((hourOfDay - 6) / 13) * Math.PI);
    }
    const isDaytime = solarElevation > 0;

    // Base theoretical irradiance
    let ghi = Math.round(solarElevation * 880);
    let cloudCover = 15 + Math.sin(i / 6) * 5; // gentle background cloudiness
    let isRampAlert = false;

    // Day 1 Convective Cloud Ramp Event (Hours 14 to 16, 14:45–15:30 IST)
    if (i >= 14 && i <= 15) {
      cloudCover = 84;
      ghi = Math.round(ghi * 0.35); // 65% drop in irradiance
      isRampAlert = true;
    }

    // Day 2 cloud passage (hours 36 to 42)
    if (i >= 36 && i <= 42) {
      cloudCover = 64 + Math.sin(i * 1.2) * 10;
      ghi = Math.round(ghi * 0.45);
      if (i === 38) isRampAlert = true;
    }

    // 42 MW rated plant capacity
    const theoreticalMw = (ghi / 1000) * 44.5;
    const predictedMw = Number(Math.max(0, theoreticalMw * (1 - (cloudCover / 100) * 0.35)).toFixed(1));

    // Historical actuals available for the first 12 hours (NOW at 12:00)
    const actualMw = i <= 12 
      ? Number(Math.max(0, predictedMw + (Math.sin(i * 1.8) * 1.2)).toFixed(1))
      : null;

    // Quantile dispersion (widens during cloud events)
    const uncertaintySpan = isDaytime ? (cloudCover > 40 ? 5.8 : 2.4) : 0;
    const p10Mw = Number(Math.max(0, predictedMw - uncertaintySpan).toFixed(1));
    const p90Mw = Number((predictedMw + uncertaintySpan * 1.1).toFixed(1));

    // Day-ahead market schedule commitment
    const dayAheadMw = Number((Math.sin(((hourOfDay - 6) / 13) * Math.PI) * 36.5).toFixed(1));

    points.push({
      timestamp,
      actualMw,
      predictedMw,
      p10Mw,
      p90Mw,
      dayAheadMw: isDaytime ? Math.max(0, dayAheadMw) : 0,
      ghi,
      cloudCoverPercent: Math.round(cloudCover),
      temperatureC: Number((24 + solarElevation * 9).toFixed(1)),
      windSpeedMs: Number((4.2 + Math.cos(i / 5) * 1.1).toFixed(1)),
      humidityPercent: Math.round(42 - solarElevation * 14),
      isDaytime,
      isRampAlert,
    });
  }

  return points;
}

export const demoForecastPoints = generate72HourForecastPoints();

export const demoForecastSummary: ForecastSummary = {
  plantId: 'ahmedabad-solar-01',
  plantName: 'Ahmedabad Solar Plant',
  totalCapacityMw: 42.0,
  currentOutputMw: 32.8,
  capacityFactorPercent: 78.1,
  horizon: '72h',
  expectedEnergyMwh: 812.0,
  expectedEnergyDeltaPercent: 3.2,
  peakGenerationMw: 38.4,
  peakTimestamp: '2026-09-14T07:15:00Z',
  mapePercent: 3.38,
  rmseMw: 1.84,
  activeRiskCount: 1,
  lastSyncTimestamp: '2026-09-14T12:00:00Z',
  points: demoForecastPoints,
};

export const demoRisks: RiskEvent[] = [
  {
    id: 'RSK-2026-0841',
    category: 'ramp_down',
    severity: 'critical',
    headline: 'Convective Cloud Ramp Event (Ramp Rate Breach)',
    description: 'Rapid convective cloud cluster with 84% optical depth causes -8.7 MW drop in 15 min (-0.62 MW/min vs -0.40 limit), violating CERC Regulation 5.2.',
    startWindowUtc: '2026-09-14T09:15:00Z',
    endWindowUtc: '2026-09-14T10:00:00Z',
    leadTimeMinutes: 15,
    deltaMw: -8.7,
    rampRateMwPerMin: -0.62,
    confidenceScorePercent: 91.0,
    rootCause: 'Localized convective cloud cluster (optical depth tau=4.8) attenuating DNI by 75% (840 to 210 W/m²).',
    status: 'active',
    suggestedActionId: 'REC-4011',
  },
  {
    id: 'RSK-2026-0842',
    category: 'over_generation',
    severity: 'medium',
    headline: 'Over-Generation Schedule Deviation Window',
    description: 'Clear sky irradiance spike on Day 2 exceeds Day-Ahead schedule by +4.2 MW, exposing plant to negative deviation settlement.',
    startWindowUtc: '2026-09-15T06:00:00Z',
    endWindowUtc: '2026-09-15T07:30:00Z',
    leadTimeMinutes: 1260,
    deltaMw: 4.2,
    rampRateMwPerMin: 0.28,
    confidenceScorePercent: 88.5,
    rootCause: 'Exceptional atmospheric clarity combined with cool ambient breeze elevating PV module efficiency.',
    status: 'acknowledged',
    suggestedActionId: 'REC-4012',
  },
  {
    id: 'RSK-2026-0843',
    category: 'ramp_down',
    severity: 'medium',
    headline: 'GETCO Substation Voltage & Ramp Sensitivity',
    description: 'Regional grid line maintenance at Sarkhej node restricts dynamic ramp acceptance tolerance to -0.35 MW/min.',
    startWindowUtc: '2026-09-15T10:30:00Z',
    endWindowUtc: '2026-09-15T12:00:00Z',
    leadTimeMinutes: 1500,
    deltaMw: -3.5,
    confidenceScorePercent: 84.0,
    rootCause: 'Substation busbar impedance elevation during planned transformer tap-changer testing.',
    status: 'active',
    suggestedActionId: 'REC-4013',
  },
  {
    id: 'RSK-2026-0844',
    category: 'inverter_clip',
    severity: 'low',
    headline: 'Inverter Group C Elevated Thermal Index',
    description: 'Ambient temperature projected at 38°C with light wind may induce minor thermal derating (0.8 MW) during peak hour on Day 3.',
    startWindowUtc: '2026-09-16T07:30:00Z',
    endWindowUtc: '2026-09-16T09:30:00Z',
    leadTimeMinutes: 2900,
    deltaMw: -0.8,
    confidenceScorePercent: 78.0,
    rootCause: 'Heatwave conditions with module temperatures reaching 58°C.',
    status: 'acknowledged',
  },
];

export const demoRecommendations: Recommendation[] = [
  {
    id: 'REC-4011',
    riskId: 'RSK-2026-0841',
    title: 'Pre-Discharge BESS to Counter Convective Cloud Ramp',
    type: 'bess_discharge',
    priority: 'urgent',
    riskSummary: '8.7 MW generation drop between 14:45 and 15:30 IST breaches CERC ramp limits (-0.62 MW/min vs -0.40 limit).',
    rootCause: 'Localized convective cloud cluster attenuating DNI by 75% (840 W/m² to 210 W/m²).',
    prescribedAction: 'Dispatch BESS Inverter Units 1 & 2 to discharge 19.0 MW starting at 14:40 IST (5 min lead time), ramping down to 8.0 MW by 15:15 IST.',
    expectedImpact: 'Smooths interconnect ramp rate to -0.18 MW/min; avoids estimated $14,900 in DSM penalties.',
    estimatedSavingsUsd: 14900,
    frequencyProtectionScore: 98,
    isAutomatedEligible: true,
    dispatchPlan: {
      id: 'ACT-901',
      recommendationId: 'REC-4011',
      type: 'bess_discharge',
      targetAsset: 'BESS Inverter Units 1 & 2',
      setpointMw: 19.0,
      startTimeUtc: '2026-09-14T09:10:00Z',
      durationMinutes: 45,
      status: 'pending',
    },
  },
];

export const demoPlant: PlantConfiguration = {
  id: 'ahmedabad-solar-01',
  name: 'Ahmedabad Solar Plant',
  type: 'hybrid_bess',
  locationName: 'Gujarat, India (23.0225° N, 72.5714° E)',
  latitude: 23.0225,
  longitude: 72.5714,
  gridNodeId: 'GETCO-SARKHEJ-220KV',
  interconnectionLimitMw: 42.0,
  dcCapacityMw: 50.0,
  acCapacityMw: 42.0,
  tiltDegrees: 23,
  azimuthDegrees: 180,
  trackingType: 'single_axis',
  inverters: [
    {
      id: 'INV-01-42',
      manufacturer: 'Sungrow Power',
      model: 'SG3125HV-30 Central Inverter Group',
      ratedAcMw: 42.0,
      dcAcRatio: 1.19,
      efficiencyPercent: 98.8,
      status: 'online',
    },
  ],
  bess: {
    nameplateCapacityMwh: 40.0,
    maxDischargeRateMw: 20.0,
    maxChargeRateMw: 20.0,
    roundTripEfficiencyPercent: 88.5,
    currentSocPercent: 74.0,
    minSocPercent: 10.0,
    maxSocPercent: 95.0,
    state: 'idle',
  },
  tariffs: {
    ppaRateUsdMwh: 42.0,
    imbalancePenaltyRateUsdMwh: 140.0,
    peakWindowStartHour: 14,
    peakWindowEndHour: 18,
  },
};

/**
 * Procedural generation of deterministic 72-hour forecast dataset for:
 * Ahmedabad Solar Plant (42 MW AC / 50 MW DC).
 * Diurnal solar profile, historical actuals up to hour 12 ("NOW" at 12:00 UTC),
 * ensemble predicted curve, p10/p90 confidence boundaries, and meteorological context.
 */
function generateAhmedabad72HourPoints(): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const baseDate = new Date('2026-09-14T00:00:00Z');

  for (let i = 0; i < 72; i++) {
    const current = new Date(baseDate.getTime() + i * 3600 * 1000);
    const hourOfDay = current.getUTCHours();
    const timestamp = current.toISOString();

    // Diurnal solar elevation: active 06:00 to 19:00 UTC, peak at 12:30
    let solarElevation = 0;
    if (hourOfDay >= 6 && hourOfDay <= 19) {
      solarElevation = Math.sin(((hourOfDay - 6) / 13) * Math.PI);
    }
    const isDaytime = solarElevation > 0;

    // Atmospheric & irradiance simulation
    let ghi = Math.round(solarElevation * 880);
    let cloudCover = 15 + Math.sin(i / 6) * 5; // background baseline
    let isRampAlert = false;

    // Day 2 cloud passage (hours 36 to 42)
    if (i >= 36 && i <= 42) {
      cloudCover = 64 + Math.sin(i * 1.2) * 10;
      ghi = Math.round(ghi * 0.45); // 55% irradiance depression
      if (i === 38) isRampAlert = true;
    }

    // 42 MW rated plant capacity
    const theoreticalMw = (ghi / 1000) * 44.5;
    const predictedMw = Number(Math.max(0, theoreticalMw * (1 - (cloudCover / 100) * 0.35)).toFixed(1));

    // Historical actuals available up to Hour 12 (NOW)
    const actualMw = i <= 12
      ? Number(Math.max(0, predictedMw + (Math.sin(i * 1.8) * 1.2)).toFixed(1))
      : null;

    // Asymmetric quantile confidence bounds (tighter in clear sky, wider during cloud events)
    const uncertaintySpan = isDaytime ? (cloudCover > 40 ? 5.8 : 2.4) : 0;
    const p10Mw = Number(Math.max(0, predictedMw - uncertaintySpan).toFixed(1));
    const p90Mw = Number((predictedMw + uncertaintySpan * 1.1).toFixed(1));

    const dayAheadMw = Number((Math.sin(((hourOfDay - 6) / 13) * Math.PI) * 36.5).toFixed(1));

    points.push({
      timestamp,
      actualMw,
      predictedMw,
      p10Mw,
      p90Mw,
      dayAheadMw: isDaytime ? Math.max(0, dayAheadMw) : 0,
      ghi,
      cloudCoverPercent: Math.round(cloudCover),
      temperatureC: Number((24 + solarElevation * 9).toFixed(1)),
      windSpeedMs: Number((4.2 + Math.cos(i / 5) * 1.1).toFixed(1)),
      humidityPercent: Math.round(42 - solarElevation * 14),
      isDaytime,
      isRampAlert,
    });
  }

  return points;
}

export const ahmedabadForecastPoints: ForecastPoint[] = generateAhmedabad72HourPoints();

export interface ForecastMetrics {
  horizon: '24h' | '48h' | '72h';
  expectedEnergyMwh: number;
  peakOutputMw: number;
  uncertaintyPercent: number;
  riskEventsCount: number;
  modelConfidencePercent: number;
}

export const ahmedabadForecastMetrics: Record<'24h' | '48h' | '72h', ForecastMetrics> = {
  '24h': {
    horizon: '24h',
    expectedEnergyMwh: 614,
    peakOutputMw: 38.6,
    uncertaintyPercent: 6.4,
    riskEventsCount: 1,
    modelConfidencePercent: 96.1,
  },
  '48h': {
    horizon: '48h',
    expectedEnergyMwh: 1228,
    peakOutputMw: 38.6,
    uncertaintyPercent: 7.2,
    riskEventsCount: 1,
    modelConfidencePercent: 95.2,
  },
  '72h': {
    horizon: '72h',
    expectedEnergyMwh: 1842,
    peakOutputMw: 38.6,
    uncertaintyPercent: 7.8,
    riskEventsCount: 2,
    modelConfidencePercent: 94.2,
  },
};

export function getAhmedabadForecastData(horizon: '24h' | '48h' | '72h' = '72h') {
  const count = horizon === '24h' ? 24 : horizon === '48h' ? 48 : 72;
  return {
    plantName: 'Ahmedabad Solar Plant',
    capacityMw: 42.0,
    status: 'FORECAST STABLE',
    nowTimestamp: '2026-09-14T12:00:00Z',
    nowIndex: 12,
    points: ahmedabadForecastPoints.slice(0, count),
    metrics: ahmedabadForecastMetrics[horizon],
    weatherContext: {
      temperatureC: 31,
      cloudCoverPercent: 18,
      windSpeedMs: 4.8,
      solarRadiationGhi: 812,
      humidityPercent: 42,
    },
  };
}

export interface DashboardData {
  plant: {
    id: string;
    name: string;
    acCapacityMw: number;
    dcCapacityMw: number;
    location: string;
    gridNode: string;
    operatorStatus: string;
    scadaStatus: string;
    scadaLatencyMs: number;
    lastUpdatedUtc: string;
    lastUpdatedLocal: string;
  };
  currentTelemetry: {
    outputMw: number;
    capacityMw: number;
    utilizationPercent: number;
    rampRateMwPerMin: number;
    gridFrequencyHz: number;
    gridToleranceStatus: string;
    inverterOnlineCount: number;
    inverterTotalCount: number;
    inverterEfficiencyPercent: number;
    bessAvailable: boolean;
    bessSocPercent: number;
    bessDischargeCapacityMw: number;
  };
  kpis: {
    currentOutputMw: number;
    utilizationPercent: number;
    todayExpectedEnergyMwh: number;
    energyDeltaPercent: number;
    forecastConfidencePercent: number;
    forecastRmseMw: number;
    currentRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    currentRiskScore: number;
    nextRiskEventTime: string;
    nextRiskEventType: string;
  };
  riskStatus: {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score: number;
    headline: string;
    drivers: { label: string; impact: number }[];
    nextEvent: {
      type: string;
      window: string;
      potentialDropMw: number;
      expectedRampMwPerMin: number;
      toleranceRampMwPerMin: number;
      severity: 'LOW' | 'MODERATE' | 'HIGH';
    };
    timeline: { time: string; level: 'LOW' | 'MODERATE' | 'HIGH'; active?: boolean }[];
  };
  activeRecommendation: {
    id: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    riskSummary: string;
    rootCause: string;
    action: string;
    targetAsset: string;
    setpointMw: number;
    responseWindowMinutes: number;
    expectedImpact: string;
    estimatedSavingsUsd: number;
    confidencePercent: number;
    status: string;
  };
  weather: {
    temperatureC: number;
    cloudCoverPercent: number;
    windSpeedMs: number;
    solarRadiationGhi: number;
    humidityPercent: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    source: string;
    resourceOutlook24h: { hour: string; clearSkyGhi: number; forecastGhi: number }[];
  };
  outlookTable: {
    time: string;
    forecastMw: number;
    utilizationPercent: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    action: string;
    confidencePercent: number;
  }[];
  impact: {
    projectedEnergyMwh: number;
    avoidedCurtailmentMwh: number;
    potentialImbalanceExposureUsd: number;
    expectedMitigationUsd: number;
    gridCompliancePercent: number;
    carbonAvoidedTonnes: number;
    source: string;
  };
}

export const dashboardData: DashboardData = {
  plant: {
    id: 'ahmedabad-solar-01',
    name: 'Ahmedabad Solar Plant',
    acCapacityMw: 42.0,
    dcCapacityMw: 50.0,
    location: 'Gujarat, India (23.0225° N, 72.5714° E)',
    gridNode: 'GETCO-SARKHEJ-220KV',
    operatorStatus: 'OPERATIONAL',
    scadaStatus: 'SIMULATED',
    scadaLatencyMs: 18,
    lastUpdatedUtc: '12:00 UTC',
    lastUpdatedLocal: '17:30 IST',
  },
  currentTelemetry: {
    outputMw: 32.8,
    capacityMw: 42.0,
    utilizationPercent: 78.1,
    rampRateMwPerMin: -0.12,
    gridFrequencyHz: 50.02,
    gridToleranceStatus: 'Within Tolerance',
    inverterOnlineCount: 42,
    inverterTotalCount: 42,
    inverterEfficiencyPercent: 98.8,
    bessAvailable: true,
    bessSocPercent: 74.0,
    bessDischargeCapacityMw: 20.0,
  },
  kpis: {
    currentOutputMw: 32.8,
    utilizationPercent: 78.1,
    todayExpectedEnergyMwh: 812,
    energyDeltaPercent: 3.2,
    forecastConfidencePercent: 92.4,
    forecastRmseMw: 1.8,
    currentRiskLevel: 'MODERATE',
    currentRiskScore: 62,
    nextRiskEventTime: '14:45 IST',
    nextRiskEventType: 'Cloud Ramp Cliff',
  },
  riskStatus: {
    level: 'MODERATE',
    score: 62,
    headline: 'Convective cloud front approaching from West at 26 km/h',
    drivers: [
      { label: 'Cloud cover increase', impact: 28 },
      { label: 'Generation ramp rate', impact: 21 },
      { label: 'Forecast quantile dispersion', impact: 13 },
    ],
    nextEvent: {
      type: 'Cloud ramp',
      window: '14:45–15:30 IST',
      potentialDropMw: -8.7,
      expectedRampMwPerMin: -0.62,
      toleranceRampMwPerMin: -0.40,
      severity: 'HIGH',
    },
    timeline: [
      { time: '12:00', level: 'LOW', active: false },
      { time: '14:30', level: 'MODERATE', active: false },
      { time: '14:45', level: 'HIGH', active: true },
      { time: '15:30', level: 'MODERATE', active: false },
      { time: '17:00', level: 'LOW', active: false },
    ],
  },
  activeRecommendation: {
    id: 'REC-4011',
    priority: 'HIGH',
    riskSummary: 'Generation ramp expected 14:45–15:30 IST',
    rootCause: 'Cloud attenuation dropping GHI from 812 W/m² to 290 W/m²',
    action: 'Prepare BESS discharge schedule',
    targetAsset: 'BESS-Substation-01 (Units 1 & 2)',
    setpointMw: 19.0,
    responseWindowMinutes: 15,
    expectedImpact: 'Ramp compliance preserved · $14,900 penalty avoided',
    estimatedSavingsUsd: 14900,
    confidencePercent: 91.0,
    status: 'SIMULATED RECOMMENDATION',
  },
  weather: {
    temperatureC: 31,
    cloudCoverPercent: 18,
    windSpeedMs: 4.8,
    solarRadiationGhi: 812,
    humidityPercent: 42,
    confidence: 'HIGH',
    source: 'SIMULATED WEATHER DATA',
    resourceOutlook24h: [
      { hour: '06:00', clearSkyGhi: 110, forecastGhi: 98 },
      { hour: '08:00', clearSkyGhi: 420, forecastGhi: 390 },
      { hour: '10:00', clearSkyGhi: 740, forecastGhi: 680 },
      { hour: '12:00', clearSkyGhi: 960, forecastGhi: 812 },
      { hour: '14:00', clearSkyGhi: 850, forecastGhi: 580 }, // cloud front dip
      { hour: '16:00', clearSkyGhi: 540, forecastGhi: 480 },
      { hour: '18:00', clearSkyGhi: 190, forecastGhi: 170 },
      { hour: '20:00', clearSkyGhi: 0, forecastGhi: 0 },
    ],
  },
  outlookTable: [
    {
      time: '12 Sep 12:00 IST',
      forecastMw: 32.8,
      utilizationPercent: 78,
      riskLevel: 'LOW',
      action: 'None',
      confidencePercent: 94,
    },
    {
      time: '12 Sep 14:45 IST',
      forecastMw: 28.6,
      utilizationPercent: 68,
      riskLevel: 'HIGH',
      action: 'BESS 19MW',
      confidencePercent: 91,
    },
    {
      time: '12 Sep 18:00 IST',
      forecastMw: 16.2,
      utilizationPercent: 38,
      riskLevel: 'LOW',
      action: 'None',
      confidencePercent: 95,
    },
    {
      time: '13 Sep 08:00 IST',
      forecastMw: 24.5,
      utilizationPercent: 58,
      riskLevel: 'LOW',
      action: 'None',
      confidencePercent: 92,
    },
    {
      time: '13 Sep 12:00 IST',
      forecastMw: 34.2,
      utilizationPercent: 81,
      riskLevel: 'MODERATE',
      action: 'Monitor',
      confidencePercent: 90,
    },
    {
      time: '14 Sep 12:00 IST',
      forecastMw: 38.6,
      utilizationPercent: 92,
      riskLevel: 'LOW',
      action: 'None',
      confidencePercent: 93,
    },
  ],
  impact: {
    projectedEnergyMwh: 812,
    avoidedCurtailmentMwh: 23,
    potentialImbalanceExposureUsd: 18400,
    expectedMitigationUsd: 14900,
    gridCompliancePercent: 98.4,
    carbonAvoidedTonnes: 9.8,
    source: 'SIMULATED IMPACT',
  },
};

// ============================================================================
// PHASE 6: DEEP-DIVE OPERATIONAL INTELLIGENCE DATA FIXTURES
// ============================================================================

export interface HourlyWorkbenchPoint {
  id: string;
  timeIst: string;
  hourOfDay: number;
  dayIndex: number;
  timestampUtc: string;
  p10Mw: number;
  p50Mw: number;
  p90Mw: number;
  dayAheadMw: number;
  deltaMw: number;
  rampRateMw15m: number;
  weatherCondition: string;
  cloudCoverPercent: number;
  temperatureC: number;
  ghiWm2: number;
  isRampAlert: boolean;
  isHistorical: boolean;
}

function generateWorkbenchHourlyPoints(): HourlyWorkbenchPoint[] {
  const points: HourlyWorkbenchPoint[] = [];
  const baseDate = new Date('2026-09-14T00:00:00Z');

  for (let i = 0; i < 72; i++) {
    const current = new Date(baseDate.getTime() + i * 3600 * 1000);
    const dayIndex = Math.floor(i / 24) + 1;
    const hourUtc = current.getUTCHours();
    // Indian Standard Time: UTC + 5:30 (approximate for hour display)
    const hourIst = (hourUtc + 5) % 24;
    const formattedHour = `${String(hourIst).padStart(2, '0')}:30 IST`;
    const timeIst = `D${dayIndex} ${formattedHour}`;
    const timestampUtc = current.toISOString();

    let solarElevation = 0;
    if (hourUtc >= 6 && hourUtc <= 19) {
      solarElevation = Math.sin(((hourUtc - 6) / 13) * Math.PI);
    }
    const isDaytime = solarElevation > 0;

    let ghi = Math.round(solarElevation * 880);
    let cloudCover = 15 + Math.sin(i / 6) * 5;
    let isRampAlert = false;
    let weatherCondition = isDaytime ? 'Clear Sky' : 'Night';

    // Day 1 Convective Cloud Ramp Event (Hours 14 to 16, around 14:45–15:30 IST)
    if (i >= 14 && i <= 15) {
      cloudCover = 84;
      ghi = Math.round(ghi * 0.35);
      isRampAlert = true;
      weatherCondition = 'Convective Cloud Alert';
    } else if (i >= 36 && i <= 40) {
      cloudCover = 64;
      ghi = Math.round(ghi * 0.5);
      weatherCondition = 'Scattered Cirrus';
    } else if (isDaytime && cloudCover > 20) {
      weatherCondition = 'Partly Cloudy';
    }

    const theoreticalMw = (ghi / 1000) * 44.5;
    const p50Mw = Number(Math.max(0, theoreticalMw * (1 - (cloudCover / 100) * 0.35)).toFixed(1));
    const dayAheadMw = Number((isDaytime ? Math.sin(((hourUtc - 6) / 13) * Math.PI) * 36.5 : 0).toFixed(1));
    const uncertaintySpan = isDaytime ? (cloudCover > 40 ? 5.8 : 2.4) : 0;
    const p10Mw = Number(Math.max(0, p50Mw - uncertaintySpan).toFixed(1));
    const p90Mw = Number((p50Mw + uncertaintySpan * 1.1).toFixed(1));
    const deltaMw = Number((p50Mw - dayAheadMw).toFixed(1));
    const rampRateMw15m = isRampAlert ? -9.3 : Number(((p50Mw - (points[i - 1]?.p50Mw || 0)) / 4).toFixed(2));
    const isHistorical = i <= 12;

    points.push({
      id: `pt-${i}`,
      timeIst,
      hourOfDay: hourIst,
      dayIndex,
      timestampUtc,
      p10Mw,
      p50Mw,
      p90Mw,
      dayAheadMw,
      deltaMw,
      rampRateMw15m,
      weatherCondition,
      cloudCoverPercent: Math.round(cloudCover),
      temperatureC: Number((24 + solarElevation * 9).toFixed(1)),
      ghiWm2: ghi,
      isRampAlert,
      isHistorical,
    });
  }

  return points;
}

function generateWorkbench15MinPoints(): HourlyWorkbenchPoint[] {
  const points: HourlyWorkbenchPoint[] = [];
  const baseDate = new Date('2026-09-14T00:00:00Z');

  for (let i = 0; i < 96; i++) {
    const current = new Date(baseDate.getTime() + i * 15 * 60 * 1000);
    const hourFraction = i / 4;
    const hourUtc = Math.floor(hourFraction);
    const minute = (i % 4) * 15;
    const hourIst = (hourUtc + 5) % 24;
    const formattedTime = `${String(hourIst).padStart(2, '0')}:${String(minute).padStart(2, '0')} IST`;
    const timeIst = `D1 ${formattedTime}`;
    const timestampUtc = current.toISOString();

    let solarElevation = 0;
    if (hourFraction >= 6 && hourFraction <= 19) {
      solarElevation = Math.sin(((hourFraction - 6) / 13) * Math.PI);
    }
    const isDaytime = solarElevation > 0;

    let ghi = Math.round(solarElevation * 880);
    let cloudCover = 15;
    let isRampAlert = false;
    let weatherCondition = isDaytime ? 'Clear Sky' : 'Night';

    // Rapid cloud drop at 14:45–15:30 IST (i = 59 to 62)
    if (i >= 58 && i <= 62) {
      cloudCover = 84;
      ghi = Math.round(ghi * 0.32);
      isRampAlert = true;
      weatherCondition = 'Convective Cloud Alert';
    }

    const theoreticalMw = (ghi / 1000) * 44.5;
    const p50Mw = Number(Math.max(0, theoreticalMw * (1 - (cloudCover / 100) * 0.35)).toFixed(1));
    const dayAheadMw = Number((isDaytime ? Math.sin(((hourFraction - 6) / 13) * Math.PI) * 36.5 : 0).toFixed(1));
    const uncertaintySpan = isDaytime ? (cloudCover > 40 ? 5.8 : 2.4) : 0;
    const p10Mw = Number(Math.max(0, p50Mw - uncertaintySpan).toFixed(1));
    const p90Mw = Number((p50Mw + uncertaintySpan * 1.1).toFixed(1));
    const deltaMw = Number((p50Mw - dayAheadMw).toFixed(1));
    const rampRateMw15m = isRampAlert ? -9.3 : Number(((p50Mw - (points[i - 1]?.p50Mw || 0))).toFixed(2));
    const isHistorical = i <= 48; // first 12 hours (12:00)

    points.push({
      id: `pt15-${i}`,
      timeIst,
      hourOfDay: hourIst,
      dayIndex: 1,
      timestampUtc,
      p10Mw,
      p50Mw,
      p90Mw,
      dayAheadMw,
      deltaMw,
      rampRateMw15m,
      weatherCondition,
      cloudCoverPercent: Math.round(cloudCover),
      temperatureC: Number((24 + solarElevation * 9).toFixed(1)),
      ghiWm2: ghi,
      isRampAlert,
      isHistorical,
    });
  }

  return points;
}

export function exportForecastCsv(points: HourlyWorkbenchPoint[]): void {
  if (typeof window === 'undefined') return;

  const headers = [
    'Time (IST)',
    'Timestamp (UTC)',
    'P10 Forecast (MW)',
    'P50 Forecast (MW)',
    'P90 Forecast (MW)',
    'Day-Ahead Schedule (MW)',
    'Delta vs Schedule (MW)',
    'Ramp Rate (MW/15m)',
    'Weather Condition',
    'Cloud Cover (%)',
    'GHI (W/m2)',
    'Temperature (C)',
    'Ramp Alert',
  ];

  const rows = points.map((p) => [
    `"${p.timeIst}"`,
    `"${p.timestampUtc}"`,
    p.p10Mw.toFixed(1),
    p.p50Mw.toFixed(1),
    p.p90Mw.toFixed(1),
    p.dayAheadMw.toFixed(1),
    p.deltaMw.toFixed(1),
    p.rampRateMw15m.toFixed(2),
    `"${p.weatherCondition}"`,
    p.cloudCoverPercent,
    p.ghiWm2,
    p.temperatureC.toFixed(1),
    p.isRampAlert ? 'YES' : 'NO',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `renewableiq-forecast-ahmedabad-42mw-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ForecastWorkbenchData {
  plant: {
    name: string;
    capacityAcMw: number;
    capacityDcMw: number;
    gridNode: string;
    scadaStatus: string;
    modelArchitecture: string;
    lastModelRun: string;
  };
  summaryMetrics: {
    peakForecastMw: number;
    peakTimestampIst: string;
    day1EnergyMwh: number;
    total72hEnergyMwh: number;
    maeMw: number;
    maePercent: number;
    biasMw: number;
    ensembleSpreadMw: number;
  };
  accuracyMetrics: {
    maeMw: number;
    rmseMw: number;
    skillScorePercent: number;
    rampCaptureRatePercent: number;
    modelRun: string;
    constituents: Array<{
      name: string;
      weightPercent: number;
      skillScore: string;
      resolution: string;
    }>;
  };
  scheduleComparison: {
    totalScheduleMwh: number;
    totalForecastMwh: number;
    netDeltaMwh: number;
    criticalHourWindow: string;
    criticalHourDeficitMw: number;
    dsmExposureUsd: number;
    mitigatedExposureUsd: number;
    complianceRatePercent: number;
  };
  insights: Array<{
    id: string;
    severity: 'CRITICAL' | 'MODERATE' | 'INFO';
    badge: string;
    title: string;
    timeWindow: string;
    content: string;
    actionLabel: string;
    actionRoute: string;
  }>;
  hourlyPoints: HourlyWorkbenchPoint[];
  fifteenMinPoints: HourlyWorkbenchPoint[];
}

export const forecastWorkbenchData: ForecastWorkbenchData = {
  plant: {
    name: 'Ahmedabad Solar Plant',
    capacityAcMw: 42.0,
    capacityDcMw: 50.0,
    gridNode: 'GETCO-SARKHEJ-220KV',
    scadaStatus: 'SCADA SIMULATED · 18ms',
    modelArchitecture: 'Ensemble GBDT + Physics NWP v3.2',
    lastModelRun: '11:45 IST (15m cycle)',
  },
  summaryMetrics: {
    peakForecastMw: 38.4,
    peakTimestampIst: '12:45 IST',
    day1EnergyMwh: 284,
    total72hEnergyMwh: 812,
    maeMw: 1.42,
    maePercent: 3.38,
    biasMw: 0.18,
    ensembleSpreadMw: 3.2,
  },
  accuracyMetrics: {
    maeMw: 1.42,
    rmseMw: 1.84,
    skillScorePercent: 28.4,
    rampCaptureRatePercent: 94.2,
    modelRun: 'v3.2 Ensemble (ECMWF 00Z + GFS 06Z + Local WRF + SCADA Kalman)',
    constituents: [
      { name: 'ECMWF 00Z High-Res NWP', weightPercent: 35, skillScore: '+29.1%', resolution: '9 km' },
      { name: 'Local WRF-Solar In-House', weightPercent: 25, skillScore: '+31.8%', resolution: '3 km' },
      { name: 'GFS 06Z Boundary Telemetry', weightPercent: 25, skillScore: '+24.6%', resolution: '13 km' },
      { name: 'SCADA In-Situ Kalman Filter', weightPercent: 15, skillScore: '+34.2%', resolution: 'In-Situ' },
    ],
  },
  scheduleComparison: {
    totalScheduleMwh: 794,
    totalForecastMwh: 812,
    netDeltaMwh: 18,
    criticalHourWindow: '14:45–15:30 IST',
    criticalHourDeficitMw: -8.7,
    dsmExposureUsd: 18400,
    mitigatedExposureUsd: 3500,
    complianceRatePercent: 98.4,
  },
  insights: [
    {
      id: 'ins-01',
      severity: 'CRITICAL',
      badge: 'Steep Ramp Alert',
      title: 'Convective Cloud Ramp Event (Day 1, 14:45–15:30 IST)',
      timeWindow: '14:45–15:30 IST',
      content:
        'Ensemble models converge on rapid cloud optical depth increase (tau=4.8) at 14:45 IST. Forecast ramp rate of -0.62 MW/min breaches statutory CERC limit (-0.40 MW/min). Immediate BESS ramp-smoothing pre-dispatch (19.0 MW) recommended to avoid ₹1,24,000 / $18,400 DSM penalties.',
      actionLabel: 'Inspect Prescriptions →',
      actionRoute: '/recommendations',
    },
    {
      id: 'ins-02',
      severity: 'MODERATE',
      badge: 'Schedule Deviation',
      title: 'Over-Generation Schedule Surplus (Day 2, 11:30–13:00 IST)',
      timeWindow: 'Tomorrow 11:30–13:00 IST',
      content:
        'Favorable irradiance and cool wind elevate PV yield by +4.2 MW above cleared Day-Ahead schedule. Opportunity for controlled battery charging (10.0 MW) to absorb surplus, protect interconnect headroom, and capture peak evening arbitrage.',
      actionLabel: 'View Schedule Comparison →',
      actionRoute: '#schedule-comparison',
    },
    {
      id: 'ins-03',
      severity: 'INFO',
      badge: 'High Confidence',
      title: 'Low Uncertainty Regime (Day 3, Atmospheric Stability)',
      timeWindow: 'Day 3 06:00–18:00 IST',
      content:
        'Atmospheric stability index >0.92 with tight P10–P90 corridor width (±1.8 MW). High scheduling confidence across all daytime blocks with zero predicted curtailment risk and minimal deviation exposure.',
      actionLabel: 'View Plant Reserves →',
      actionRoute: '/plant',
    },
  ],
  hourlyPoints: generateWorkbenchHourlyPoints(),
  fifteenMinPoints: generateWorkbench15MinPoints(),
};

// ----------------------------------------------------------------------------
// RISK LEDGER DATA CONTRACTS & FIXTURES
// ----------------------------------------------------------------------------

export interface RiskCausalStep {
  step: number;
  time: string;
  label: string;
  detail: string;
}

export interface RiskLedgerEvent {
  id: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  category: 'RAMP RATE' | 'OVER-GENERATION' | 'CURTAILMENT' | 'EQUIPMENT';
  timeWindow: string;
  title: string;
  description: string;
  magnitude: string;
  gridImpact: string;
  actionId: string;
  status: 'ACTIVE' | 'MONITORING' | 'MITIGATED' | 'DISMISSED';
  leadTimeMinutes: number;
  rootCause?: string;
  opticalDepthTau?: number;
  dniCollapse?: string;
  penaltyExposureUsd: number;
  penaltyExposureInr: string;
  frequencySensitivity: string;
  causalChain: RiskCausalStep[];
  mitigation: {
    actionId: string;
    label: string;
    resultingRamp: string;
    penaltyMitigated: string;
    efficacyScorePercent: number;
  };
}

export interface RiskLedgerData {
  plant: string;
  summary: {
    activeHighRisks: number;
    totalIdentified72h: number;
    maxProjectedRamp: string;
    rampThreshold: string;
    financialExposureUsd: number;
    financialExposureInr: string;
    gridComplianceStatus: string;
    aggregateRiskScore: number;
  };
  events: RiskLedgerEvent[];
  timeline: Array<{
    id: string;
    eventId: string;
    dateLabel: string;
    timeLabel: string;
    title: string;
    severity: 'HIGH' | 'MODERATE' | 'LOW';
    category: string;
  }>;
}

export const riskLedgerData: RiskLedgerData = {
  plant: 'Ahmedabad Solar Plant · 42 MW',
  summary: {
    activeHighRisks: 1,
    totalIdentified72h: 4,
    maxProjectedRamp: '-0.62 MW/min',
    rampThreshold: '-0.40 MW/min',
    financialExposureUsd: 18400,
    financialExposureInr: '₹1,24,000',
    gridComplianceStatus: 'ELEVATED (Hour 15)',
    aggregateRiskScore: 62,
  },
  events: [
    {
      id: 'RSK-2026-0841',
      severity: 'HIGH',
      category: 'RAMP RATE',
      timeWindow: 'Today 14:45–15:30 IST',
      title: 'Convective Cloud Ramp Event (Ramp Rate Breach)',
      description: 'Steep negative generation ramp exceeding CERC balancing tolerance due to rapid optical depth spike.',
      magnitude: '-8.7 MW drop in 15 min (-0.62 MW/min ramp)',
      gridImpact: 'Violation of CERC Ramp Compliance Limit (Regulation 5.2, max -0.40 MW/min)',
      actionId: 'REC-4011',
      status: 'ACTIVE',
      leadTimeMinutes: 15,
      rootCause: 'Rapid convective cloud cluster with 84% optical depth (tau=4.8) attenuating DNI from 840 to 210 W/m².',
      opticalDepthTau: 4.8,
      dniCollapse: '840 W/m² → 210 W/m² (-75%)',
      penaltyExposureUsd: 18400,
      penaltyExposureInr: '₹1,24,000',
      frequencySensitivity: 'High (50.02 Hz → 49.88 Hz local drop if unmitigated)',
      causalChain: [
        { step: 1, time: '14:20 IST', label: 'Atmospheric Convective Cell Formation', detail: 'Local WRF and Doppler radar detect fast-moving cumulus congestus cell at 26 km/h from West.' },
        { step: 2, time: '14:45 IST', label: 'DNI Collapse (-75%)', detail: 'Cloud optical depth rises from tau=0.2 to tau=4.8. Solar irradiance plunges from 840 to 210 W/m².' },
        { step: 3, time: '14:45–15:30 IST', label: 'Generation Drop (-8.7 MW)', detail: 'Inverter AC output falls from 32.8 MW to 24.1 MW in under 15 minutes.' },
        { step: 4, time: '14:55 IST', label: 'Ramp Limit Violation (-0.62 MW/min)', detail: 'Observed ramp of -0.62 MW/min breaches statutory CERC ceiling of -0.40 MW/min.' },
        { step: 5, time: '15:30 IST', label: 'DSM Penalty Incurred ($18,400)', detail: 'Unserved energy and frequency bias penalties assessed by Gujarat SLDC.' },
      ],
      mitigation: {
        actionId: 'REC-4011',
        label: 'Pre-discharge BESS at 19.0 MW starting 14:40 IST',
        resultingRamp: '-0.18 MW/min (Compliant)',
        penaltyMitigated: '$14,900 (81% eliminated)',
        efficacyScorePercent: 94,
      },
    },
    {
      id: 'RSK-2026-0842',
      severity: 'MODERATE',
      category: 'OVER-GENERATION',
      timeWindow: 'Tomorrow 11:30–13:00 IST',
      title: 'Over-Generation Schedule Deviation Window',
      description: 'Unscheduled excess generation (+4.2 MW above cleared bid) triggering negative DSM charges.',
      magnitude: '+4.2 MW sustained over-generation for 90 min',
      gridImpact: 'SLDC schedule mismatch; potential zero-rate energy export',
      actionId: 'REC-4012',
      status: 'MONITORING',
      leadTimeMinutes: 1260,
      rootCause: 'Cool ambient wind (+1.8 m/s) and exceptional atmospheric clarity elevating PV panel efficiency by +4.2%.',
      opticalDepthTau: 0.08,
      dniCollapse: 'None (GHI +65 W/m² above nominal)',
      penaltyExposureUsd: 3200,
      penaltyExposureInr: '₹26,000',
      frequencySensitivity: 'Low (nominal busbar injection)',
      causalChain: [
        { step: 1, time: '09:00 IST', label: 'Cool Ambient Westerly Inflow', detail: 'Wind speed picks up to 5.4 m/s keeping module temperatures below 42°C.' },
        { step: 2, time: '11:30 IST', label: 'Clear Sky Peak Irradiance', detail: 'Clear optical atmosphere boosts cell conversion efficiency by +4.2%.' },
        { step: 3, time: '12:00 IST', label: 'Schedule Breach (+4.2 MW)', detail: 'Generation hits 38.6 MW against Day-Ahead schedule of 34.4 MW.' },
        { step: 4, time: '13:00 IST', label: 'Negative Settlement Risk', detail: 'Gujarat SLDC applies zero-rate tariff on surplus energy beyond tolerance.' },
      ],
      mitigation: {
        actionId: 'REC-4012',
        label: 'Schedule BESS charge cycle at 10.0 MW to absorb surplus',
        resultingRamp: '+0.05 MW/min (Compliant)',
        penaltyMitigated: '$3,200 (100% eliminated)',
        efficacyScorePercent: 98,
      },
    },
    {
      id: 'RSK-2026-0843',
      severity: 'MODERATE',
      category: 'CURTAILMENT',
      timeWindow: 'Tomorrow 16:00–17:30 IST',
      title: 'GETCO Substation Voltage & Ramp Sensitivity',
      description: 'Regional grid line maintenance at Sarkhej node restricts dynamic ramp acceptance tolerance to -0.35 MW/min.',
      magnitude: 'Dynamic ramp ceiling curtailed from -0.40 to -0.30 MW/min',
      gridImpact: 'Tightened curtailment margin for afternoon export',
      actionId: 'REC-4013',
      status: 'MONITORING',
      leadTimeMinutes: 1500,
      rootCause: 'GETCO 220kV Sarkhej substation secondary busbar isolation for transformer tap-changer testing.',
      opticalDepthTau: 0.15,
      dniCollapse: 'Nominal sunset taper',
      penaltyExposureUsd: 4800,
      penaltyExposureInr: '₹39,000',
      frequencySensitivity: 'Moderate (grid stiffness reduced by 12%)',
      causalChain: [
        { step: 1, time: '15:00 IST', label: 'Planned Tap-Changer Testing', detail: 'GETCO 220kV Sarkhej substation isolates secondary busbar for maintenance.' },
        { step: 2, time: '16:00 IST', label: 'Impedance Elevation', detail: 'Thevenin grid impedance increases, lowering dynamic voltage stability threshold.' },
        { step: 3, time: '16:30 IST', label: 'Ramp Tolerance Compression', detail: 'Permitted plant ramp down constricted to -0.30 MW/min.' },
        { step: 4, time: '17:30 IST', label: 'Curtailment Directive Exposure', detail: 'SLDC issues automatic governor droop advisory to regional plants.' },
      ],
      mitigation: {
        actionId: 'REC-4013',
        label: 'Modulate inverter reactive power injection (Q=0.98 cap)',
        resultingRamp: '-0.22 MW/min (Compliant)',
        penaltyMitigated: '$4,800',
        efficacyScorePercent: 91,
      },
    },
    {
      id: 'RSK-2026-0844',
      severity: 'LOW',
      category: 'EQUIPMENT',
      timeWindow: 'Day 3 13:00–15:00 IST',
      title: 'Inverter Group C Elevated Thermal Index',
      description: 'Ambient temperatures reaching 38°C induce minor 0.8 MW thermal derating across Inverter Bank 3.',
      magnitude: '-0.8 MW derating across Inverter Bank 3',
      gridImpact: 'Minor capacity curtailment, within operating reserves',
      actionId: 'REC-4014',
      status: 'MITIGATED',
      leadTimeMinutes: 2900,
      rootCause: 'Heatwave conditions pushing ambient temperature to 38°C and inverter IGBT heatsink to 88°C.',
      opticalDepthTau: 0.05,
      dniCollapse: 'None',
      penaltyExposureUsd: 950,
      penaltyExposureInr: '₹7,800',
      frequencySensitivity: 'Negligible',
      causalChain: [
        { step: 1, time: '12:30 IST', label: 'Ambient Temperature 38°C', detail: 'Array ambient temperature peaks with light wind <2 m/s.' },
        { step: 2, time: '13:00 IST', label: 'IGBT Junction Temp 88°C', detail: 'Internal inverter heatsink temperature nears 90°C thermal protection trip.' },
        { step: 3, time: '14:00 IST', label: 'Autonomous Derate (0.8 MW)', detail: 'Firmware steps power output down 0.8 MW to safeguard power electronics.' },
      ],
      mitigation: {
        actionId: 'REC-4014',
        label: 'Autonomous auxiliary HVAC stage 2 activation',
        resultingRamp: '0.00 MW/min',
        penaltyMitigated: '$950',
        efficacyScorePercent: 99,
      },
    },
  ],
  timeline: [
    { id: 'tm-1', eventId: 'RSK-2026-0841', dateLabel: 'Day 1', timeLabel: '14:45 IST', title: 'Convective Cloud Ramp Event', severity: 'HIGH', category: 'RAMP RATE' },
    { id: 'tm-2', eventId: 'RSK-2026-0842', dateLabel: 'Day 2', timeLabel: '11:30 IST', title: 'Over-Generation Schedule Surplus', severity: 'MODERATE', category: 'OVER-GEN' },
    { id: 'tm-3', eventId: 'RSK-2026-0843', dateLabel: 'Day 2', timeLabel: '16:00 IST', title: 'GETCO Substation Voltage Constraint', severity: 'MODERATE', category: 'CURTAIL' },
    { id: 'tm-4', eventId: 'RSK-2026-0844', dateLabel: 'Day 3', timeLabel: '13:00 IST', title: 'Inverter Thermal Derating', severity: 'LOW', category: 'EQUIPMENT' },
  ],
};

// ----------------------------------------------------------------------------
// RECOMMENDATION DATA CONTRACTS & FIXTURES
// ----------------------------------------------------------------------------

export interface RecommendationAlternative {
  id: string;
  title: string;
  action: string;
  compliancePercent: number;
  financialEffect: string;
  tradeoffs: string;
  isRecommended: boolean;
  badge: 'RECOMMENDED' | 'SUB-OPTIMAL' | 'NON-COMPLIANT' | 'HIGH COST';
}

export interface ExecutionStep {
  step: number;
  timeIst: string;
  title: string;
  detail: string;
  status: 'COMPLETED' | 'READY' | 'PENDING';
}

export interface RecommendationData {
  plant: string;
  activePrescriptionsCount: {
    immediate: number;
    scheduled: number;
    advisory: number;
  };
  mode: string;
  safetyInterlock: string;
  primary: {
    id: string;
    title: string;
    targetRiskId: string;
    targetWindow: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    causalArchitecture: {
      trigger: string;
      rootCause: string;
      prescribedAction: string;
      netEffect: string;
      financialImpact: string;
      confidencePercent: number;
    };
    parameters: {
      targetAsset: string;
      setpointMw: number;
      currentSocPercent: number;
      minSocThresholdPercent: number;
      expectedSocDepletionPercent: number;
      postDispatchSocPercent: number;
      armingLeadTimeMinutes: number;
      dispatchDurationMinutes: number;
    };
    executionSteps: ExecutionStep[];
    alternatives: RecommendationAlternative[];
  };
  sandboxModel: {
    nominalDropMw: number;
    cercRampLimit: number;
    baselineRamp: number;
    maxBatteryPowerMw: number;
  };
}

export const recommendationData: RecommendationData = {
  plant: 'Ahmedabad Solar Plant · 42 MW',
  activePrescriptionsCount: {
    immediate: 1,
    scheduled: 1,
    advisory: 2,
  },
  mode: 'OPERATOR-IN-THE-LOOP (Semi-Automated with Human Confirmation)',
  safetyInterlock: 'SCADA Write-Back SIMULATED · Hard limits enforced',
  primary: {
    id: 'REC-4011',
    title: 'Pre-Discharge BESS to Counter Convective Cloud Ramp',
    targetRiskId: 'RSK-2026-0841',
    targetWindow: '14:45–15:30 IST (Lead time: 15 min remaining)',
    priority: 'HIGH',
    causalArchitecture: {
      trigger: 'Forecast ramp rate -0.62 MW/min exceeds CERC limit (-0.40 MW/min)',
      rootCause: 'Localized convective cloud band attenuating DNI by 75% (840 to 210 W/m²)',
      prescribedAction: 'Dispatch BESS Inverter Units 1 & 2 to discharge 19.0 MW at 14:40 IST (5 min prior to ramp onset), ramping down to 8.0 MW by 15:15 IST',
      netEffect: 'Interconnect ramp rate smoothed to -0.18 MW/min; plant output maintained within schedule tolerance band (±5%)',
      financialImpact: 'Avoids estimated ₹1,24,000 / $14,900 in DSM deviation penalties and unserved energy fees',
      confidencePercent: 91,
    },
    parameters: {
      targetAsset: 'BESS Inverter Units 1 & 2 (Sungrow SC5000UD-MV · 20 MW / 40 MWh)',
      setpointMw: 19.0,
      currentSocPercent: 74.0,
      minSocThresholdPercent: 20.0,
      expectedSocDepletionPercent: 12.4,
      postDispatchSocPercent: 61.6,
      armingLeadTimeMinutes: 5,
      dispatchDurationMinutes: 45,
    },
    executionSteps: [
      { step: 1, timeIst: '14:30 IST', title: 'Verify BESS SOC ≥ 65%', detail: 'Telemetry confirms battery at 74.0% SOC (29.6 MWh stored energy). System health green.', status: 'COMPLETED' },
      { step: 2, timeIst: '14:35 IST', title: 'Issue Pre-Dispatch Arming Command', detail: 'Arm PCS bi-directional inverters into Fast Frequency / Ramp-Smoothing mode.', status: 'READY' },
      { step: 3, timeIst: '14:40 IST', title: 'Initiate 19.0 MW Ramp Discharge', detail: 'Pre-discharge ramps up 5 minutes prior to optical cloud impact to stabilize busbar.', status: 'PENDING' },
      { step: 4, timeIst: '14:45–15:15 IST', title: 'Active Closed-Loop Smoothing', detail: 'SCADA AGC dynamically modulates BESS output between 12 MW and 19 MW matching cloud optical variations.', status: 'PENDING' },
      { step: 5, timeIst: '15:30 IST', title: 'Return BESS to Standby / Recharge', detail: 'Cloud front clears; ramp rate stabilizes to nominal; BESS returns to standby state.', status: 'PENDING' },
    ],
    alternatives: [
      {
        id: 'opt-a',
        title: 'Option A (Recommended): BESS Ramp Smoothing',
        action: 'Discharge 19.0 MW from battery storage during cloud transit (14:40–15:30 IST)',
        compliancePercent: 98.4,
        financialEffect: '+$14,900 net saved',
        tradeoffs: '1.2% battery cycle throughput, zero ungenerated solar loss',
        isRecommended: true,
        badge: 'RECOMMENDED',
      },
      {
        id: 'opt-b',
        title: 'Option B: Inverter Pre-Curtailment',
        action: 'Pre-emptively curtail solar inverters to 24 MW at 14:30 IST before cloud arrival',
        compliancePercent: 100.0,
        financialEffect: '-$6,800 lost energy revenue',
        tradeoffs: 'Guarantees compliance but discards 8.8 MWh of clean generation',
        isRecommended: false,
        badge: 'SUB-OPTIMAL',
      },
      {
        id: 'opt-c',
        title: 'Option C: Grid Penalty Acceptance (Do Nothing)',
        action: 'Maintain current setpoints and let PV generation drop naturally',
        compliancePercent: 42.0,
        financialEffect: '-$18,400 DSM penalty',
        tradeoffs: 'Violation of CERC Regulation 5.2; SLDC curtailment warning flag',
        isRecommended: false,
        badge: 'NON-COMPLIANT',
      },
      {
        id: 'opt-d',
        title: 'Option D: Bilateral Spot Market Purchase',
        action: 'Procure 9 MW emergency replacement power from Indian Energy Exchange (IEX)',
        compliancePercent: 92.0,
        financialEffect: '-$12,200 spot procurement cost',
        tradeoffs: 'Requires 45 min market clearance gate; high market price risk',
        isRecommended: false,
        badge: 'HIGH COST',
      },
    ],
  },
  sandboxModel: {
    nominalDropMw: 8.7,
    cercRampLimit: -0.40,
    baselineRamp: -0.62,
    maxBatteryPowerMw: 20.0,
  },
};

// ----------------------------------------------------------------------------
// ACTION HISTORY & AUDIT LOG DATA
// ----------------------------------------------------------------------------

export interface ActionHistoryLog {
  id: string;
  timestamp: string;
  recId: string;
  action: string;
  targetAsset: string;
  operator: string;
  status: 'SIMULATED EXECUTED' | 'COMPLETED' | 'MANUAL OVERRIDE';
  complianceResult: string;
}

export const actionHistoryData: ActionHistoryLog[] = [
  {
    id: 'LOG-309',
    timestamp: '11:15 IST Today',
    recId: 'REC-4009',
    action: 'Inverter Power Factor Trim (0.98 Inductive)',
    targetAsset: 'Inverter Substation Bank A',
    operator: 'OPERATOR-04 (SIM)',
    status: 'SIMULATED EXECUTED',
    complianceResult: 'Reactive Power Balance Preserved (0 Var Violation)',
  },
  {
    id: 'LOG-308',
    timestamp: '08:30 IST Today',
    recId: 'REC-4008',
    action: 'Pre-Morning BESS Top-Off (4.2 MW Charge)',
    targetAsset: 'BESS-Substation-01',
    operator: 'AUTONOMOUS / SUPERVISED',
    status: 'COMPLETED',
    complianceResult: 'Target SOC 74.0% achieved prior to peak generation',
  },
  {
    id: 'LOG-307',
    timestamp: '17:45 IST Yesterday',
    recId: 'REC-4005',
    action: 'Evening Ramp Deceleration (BESS 12 MW Discharge)',
    targetAsset: 'BESS Inverter Units 1 & 2',
    operator: 'OPERATOR-02 (SIM)',
    status: 'COMPLETED',
    complianceResult: 'Zero Grid Deviation Settlement across sunset transition',
  },
  {
    id: 'LOG-306',
    timestamp: '13:10 IST Yesterday',
    recId: 'REC-4003',
    action: 'Inverter Bank 2 Auxiliary Thermal Fan Boost',
    targetAsset: 'Central Inverter Group B',
    operator: 'OPERATOR-04 (SIM)',
    status: 'COMPLETED',
    complianceResult: 'Prevented 1.2 MW thermal clipping derating',
  },
  {
    id: 'LOG-305',
    timestamp: '09:00 IST Yesterday',
    recId: 'REC-4001',
    action: 'Morning Schedule Bid Trim (-1.5 MW adjustment)',
    targetAsset: 'SLDC Gujarat Scheduling Portal',
    operator: 'MANUAL OVERRIDE',
    status: 'MANUAL OVERRIDE',
    complianceResult: 'Corrected for morning river fog attenuation',
  },
];



