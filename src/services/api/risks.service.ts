/**
 * Risk Service — Decoupled API & Deterministic Demo Provider
 */

import { apiClient, ApiError } from './client';
import { 
  RiskRequest, 
  RiskResponse, 
  ServiceResult 
} from './types';
import { riskLedgerData } from '@/data/demo-data';

export class RisksService {
  /**
   * Fetches the active risk ledger and event telemetry.
   * If external ML backend is configured and responsive, returns live risk data.
   * Otherwise, returns canonical deterministic Ahmedabad Solar Plant risk scenario.
   */
  public async getRisks(
    request: RiskRequest = {
      plant_id: 'ahmedabad-solar-01',
      horizon_hours: 72,
    }
  ): Promise<ServiceResult<RiskResponse>> {
    const startTime = Date.now();

    if (apiClient.isConfigured()) {
      try {
        const response = await apiClient.post<RiskResponse>(
          '/api/v1/risks',
          request,
          4000
        );

        return {
          data: response,
          source: 'api',
          statusTag: 'LIVE',
          latencyMs: Date.now() - startTime,
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof ApiError ? err.message : 'API connection failed';
        return {
          data: this.getDeterministicDemoResponse(request),
          source: 'demo',
          statusTag: 'DEMO FALLBACK',
          latencyMs: Date.now() - startTime,
          error: errorMessage,
        };
      }
    }

    return {
      data: this.getDeterministicDemoResponse(request),
      source: 'demo',
      statusTag: 'DEMO DATA',
      latencyMs: 18,
    };
  }

  public getDeterministicDemoResponse(request: Partial<RiskRequest> = {}): RiskResponse {
    return {
      plant_id: request.plant_id || 'ahmedabad-solar-01',
      active_risk_count: riskLedgerData.summary.activeHighRisks,
      total_events: riskLedgerData.summary.totalIdentified72h,
      composite_risk_score: riskLedgerData.summary.aggregateRiskScore,
      max_projected_ramp: riskLedgerData.summary.maxProjectedRamp,
      identified_at: new Date('2026-09-14T11:45:00Z').toISOString(),
      risks: riskLedgerData.events.map((ev) => ({
        id: ev.id,
        category: ev.category,
        severity: ev.severity,
        headline: ev.title,
        description: ev.description,
        time_window: ev.timeWindow,
        lead_time_minutes: ev.leadTimeMinutes,
        magnitude: ev.magnitude,
        grid_impact: ev.gridImpact,
        action_id: ev.actionId,
        status: ev.status,
        root_cause: ev.rootCause,
        penalty_exposure_inr: ev.penaltyExposureInr,
      })),
    };
  }
}

export const risksService = new RisksService();
