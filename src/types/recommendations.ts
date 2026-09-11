/**
 * Prescriptive Action & Recommendation Contracts
 */

export type ActionType =
  | 'bess_discharge'
  | 'bess_charge'
  | 'schedule_rebid'
  | 'curtailment_prevention'
  | 'inverter_curtail'
  | 'reactive_support';

export interface DispatchAction {
  id: string;
  recommendationId: string;
  type: ActionType;
  targetAsset: string;             // e.g. "BESS Unit 1 & Unit 2"
  setpointMw: number;              // Target output / charge rate (MW)
  startTimeUtc: string;
  durationMinutes: number;
  status: 'pending' | 'dispatched' | 'completed' | 'failed';
  dispatchedAt?: string;
  scadaConfirmationId?: string;
}

export interface Recommendation {
  id: string;
  riskId: string;
  title: string;
  type: ActionType;
  priority: 'urgent' | 'standard' | 'routine';
  
  // Strict 4-part mental model:
  // Risk -> Root Cause -> Prescribed Action -> Expected Impact
  riskSummary: string;
  rootCause: string;
  prescribedAction: string;
  expectedImpact: string;

  estimatedSavingsUsd: number;
  frequencyProtectionScore: number; // 0 - 100
  dispatchPlan: DispatchAction;
  isAutomatedEligible: boolean;
}
