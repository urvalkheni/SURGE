/**
 * What-If Predictive Simulation Contracts
 */

export interface ScenarioParameters {
  irradianceMultiplier: number;    // 0.5 to 1.5 (default 1.0)
  cloudCoverShiftPercent: number;  // -50 to +50 delta
  inverterAvailabilityPercent: number; // 50 to 100%
  bessInitialSocPercent: number;   // 0 to 100%
  clearingPriceInrMwh?: number;    // ₹/MWh for economic impact calculation
  clearingPriceUsdMwh?: number;    // Legacy fallback
}

export interface ScenarioResultPoint {
  timestamp: string;
  baselineMw: number;
  simulatedMw: number;
  deltaMw: number;
}

export interface ScenarioResult {
  id: string;
  parameters: ScenarioParameters;
  netEnergyDeltaMwh: number;
  financialExposureInr: number;
  financialExposureUsd?: number;
  rampStressIndex: number; // 0 - 100
  adjustedRecommendation: string;
  points: ScenarioResultPoint[];
}
