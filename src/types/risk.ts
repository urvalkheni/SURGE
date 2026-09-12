/**
 * Anomaly & Grid Risk Intelligence Contracts
 */

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory =
  | 'ramp_down'          // Generation falling faster than interconnect ramp tolerance
  | 'ramp_up'            // Sudden generation spike risking overvoltage
  | 'under_generation'   // Realized generation tracking below day-ahead commitment
  | 'over_generation'    // Generation exceeding commitment risking curtailment
  | 'weather_extreme'    // Hail, high-heat derating, or severe gust
  | 'inverter_clip';     // DC array power exceeding AC inverter threshold

export interface RiskEvent {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  headline: string;
  description: string;
  startWindowUtc: string;
  endWindowUtc: string;
  leadTimeMinutes: number;
  deltaMw: number;
  rampRateMwPerMin?: number;
  confidenceScorePercent: number;
  rootCause: string;
  status: 'active' | 'acknowledged' | 'mitigated' | 'dismissed';
  suggestedActionId?: string;

  // Traceability properties
  trigger?: string;
  threshold?: number;
  observedValue?: number;
  unit?: string;
  source?: string;
}
