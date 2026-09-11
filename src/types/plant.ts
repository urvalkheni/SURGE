/**
 * Renewable Plant Configuration & Digital Twin Contracts
 */

export interface InverterBankSpec {
  id: string;
  manufacturer: string;
  model: string;
  ratedAcMw: number;
  dcAcRatio: number;
  efficiencyPercent: number;
  status: 'online' | 'derated' | 'fault' | 'offline';
}

export interface BessSpec {
  nameplateCapacityMwh: number;
  maxDischargeRateMw: number;
  maxChargeRateMw: number;
  roundTripEfficiencyPercent: number;
  currentSocPercent: number;
  minSocPercent: number;
  maxSocPercent: number;
  state: 'idle' | 'charging' | 'discharging';
}

export interface TariffStructure {
  ppaRateUsdMwh: number;
  imbalancePenaltyRateUsdMwh: number;
  peakWindowStartHour: number; // e.g. 16 (16:00)
  peakWindowEndHour: number;   // e.g. 21 (21:00)
}

export interface PlantConfiguration {
  id: string;
  name: string;
  type: 'solar_pv' | 'wind' | 'hybrid_bess';
  locationName: string;
  latitude: number;
  longitude: number;
  gridNodeId: string;
  interconnectionLimitMw: number;
  
  // Technical Specifications
  dcCapacityMw: number;
  acCapacityMw: number;
  inverters: InverterBankSpec[];
  bess?: BessSpec;
  tariffs: TariffStructure;
  
  // Environmental & Geometry
  tiltDegrees: number;
  azimuthDegrees: number;
  trackingType: 'fixed' | 'single_axis' | 'dual_axis';
}
