/**
 * Canonical Ahmedabad Solar Plant Demo Configuration
 * Used for demo operator sessions and guest review flows.
 */

export interface PlantRecord {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isDemo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlantConfigurationRecord {
  id?: string;
  plantId: string;
  acCapacityMw: number;
  dcCapacityMw: number;
  moduleTechnology: string;
  moduleCount: number;
  inverterCount: number;
  inverterCapacityMw: number;
  panelTiltDeg: number;
  panelAzimuthDeg: number;
  trackingType: string;
  performanceRatio: number;
  tempCoefficientPct: number;
  systemLossesPct: number;
  inverterEfficiencyPct: number;
  availabilityPct: number;
  gridOperator: string;
  gridVoltageKv: number;
  interconnectCapacityMw: number;
  gridNode: string;
  bessEnabled: boolean;
  bessPowerMw: number;
  bessEnergyMwh: number;
  bessSocPct: number;
  rampLimitMwPerMin: number;
  currency: string;
  energyPricePerMwh: number;
}

export const DEMO_PLANT: PlantRecord = {
  id: 'plt-ahmedabad-demo',
  ownerId: 'usr-surge-op-01',
  name: 'Ahmedabad Solar Plant',
  type: 'SOLAR',
  country: 'India',
  state: 'Gujarat',
  city: 'Ahmedabad',
  latitude: 23.0225,
  longitude: 72.5714,
  timezone: 'Asia/Kolkata',
  isDemo: true,
};

export const DEMO_PLANT_CONFIG: PlantConfigurationRecord = {
  plantId: 'plt-ahmedabad-demo',
  acCapacityMw: 42.0,
  dcCapacityMw: 50.0,
  moduleTechnology: 'Monocrystalline PERC',
  moduleCount: 125000,
  inverterCount: 24,
  inverterCapacityMw: 1.75,
  panelTiltDeg: 23.0,
  panelAzimuthDeg: 0.0,
  trackingType: 'Fixed Tilt',
  performanceRatio: 0.82,
  tempCoefficientPct: -0.35,
  systemLossesPct: 14.0,
  inverterEfficiencyPct: 98.4,
  availabilityPct: 99.1,
  gridOperator: 'GETCO',
  gridVoltageKv: 220.0,
  interconnectCapacityMw: 50.0,
  gridNode: 'IN-GJ-CHOR-01',
  bessEnabled: true,
  bessPowerMw: 20.0,
  bessEnergyMwh: 40.0,
  bessSocPct: 68.0,
  rampLimitMwPerMin: 2.5,
  currency: 'INR',
  energyPricePerMwh: 3200.0,
};
