/**
 * Core Energy & Time-Series Forecasting Data Contracts
 */

export type ForecastHorizon = '24h' | '48h' | '72h';

export interface ConfidenceQuantile {
  p10: number; // 10th percentile (lower bound of generation)
  p50: number; // Median expected generation
  p90: number; // 90th percentile (upper bound of generation)
}

export interface ForecastPoint {
  timestamp: string;          // ISO 8601 UTC string (e.g. 2026-09-14T18:00:00Z)
  actualMw: number | null;    // Realized generation telemetry (null for future points)
  predictedMw: number;        // Ensemble model predicted output (MW)
  p10Mw: number;              // Quantile lower boundary (MW)
  p90Mw: number;              // Quantile upper boundary (MW)
  dayAheadMw: number;         // Scheduled day-ahead market commitment (MW)
  ghi: number;                // Global Horizontal Irradiance (W/m²)
  cloudCoverPercent: number;  // Fractional cloud cover (0 to 100%)
  temperatureC: number;       // Ambient array temperature (°C)
  windSpeedMs: number;        // Wind speed at hub/array height (m/s)
  isDaytime: boolean;         // Daytime flag for background solar shading
  isRampAlert?: boolean;      // Rapid ramp delta threshold exceeded
  rampRateMw15m?: number;    // Projected ramp delta (MW per interval)
  humidityPercent?: number;   // Relative humidity (%)
  source?: 'physics' | 'ml';  // Forecast computation origin
  modelStatus?: 'connected' | 'not_connected'; // ML integration status
}

export interface ForecastSummary {
  plantId: string;
  plantName: string;
  totalCapacityMw: number;
  currentOutputMw: number;
  capacityFactorPercent: number;
  horizon: ForecastHorizon;
  expectedEnergyMwh: number;
  expectedEnergyDeltaPercent: number;
  peakGenerationMw: number;
  peakTimestamp: string;
  mapePercent: number;        // Mean Absolute Percentage Error
  rmseMw: number;             // Root Mean Square Error
  activeRiskCount: number;
  lastSyncTimestamp: string;
  points: ForecastPoint[];
}

export interface EconomicImpact {
  avoidedPenaltiesUsd: number;
  projectedImbalancePenaltyUsd: number;
  marketClearingPriceUsdMwh: number;
  bessArbitrageRevenueUsd: number;
}

export interface EnvironmentalImpact {
  carbonDisplacedMt: number;
  equivalentHomesPowered: number;
  cleanEnergySharePercent: number;
}
