export * from '@/types/risk';
export * from '@/types/recommendations';

export interface RuleEvaluationInput {
  currentOutputMw: number;
  acCapacityMw: number;
  rampLimitMwPerMin: number;
  bessEnabled: boolean;
  bessPowerMw: number;
  bessEnergyMwh: number;
  bessSocPct: number;
  forecastPoints: Array<{
    timestamp: string;
    predictedMw: number;
    dayAheadMw: number;
    cloudCoverPercent: number;
    isDaytime: boolean;
    temperatureC: number;
    ghi?: number;
  }>;
}
