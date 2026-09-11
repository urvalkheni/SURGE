/**
 * Recommendations Service — Decoupled API & Deterministic Demo Provider
 */

import { apiClient, ApiError } from './client';
import { 
  RecommendationRequest, 
  RecommendationResponse, 
  ServiceResult 
} from './types';
import { recommendationData } from '@/data/demo-data';

export class RecommendationsService {
  /**
   * Fetches actionable battery dispatch and curtailment recommendations.
   * If external ML backend is configured and responsive, returns live prescriptions.
   * Otherwise, returns canonical deterministic REC-4011 Ahmedabad Solar Plant scenario.
   */
  public async getRecommendations(
    request: RecommendationRequest = {
      plant_id: 'ahmedabad-solar-01',
    }
  ): Promise<ServiceResult<RecommendationResponse>> {
    const startTime = Date.now();

    if (apiClient.isConfigured()) {
      try {
        const response = await apiClient.post<RecommendationResponse>(
          '/api/v1/recommendations',
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

  public getDeterministicDemoResponse(request: Partial<RecommendationRequest> = {}): RecommendationResponse {
    const primary = recommendationData.primary;

    return {
      plant_id: request.plant_id || 'ahmedabad-solar-01',
      generated_at: new Date('2026-09-14T11:45:00Z').toISOString(),
      recommendations: [
        {
          id: primary.id,
          target_risk_id: primary.targetRiskId,
          priority: primary.priority,
          title: primary.title,
          prescribed_action: primary.causalArchitecture.prescribedAction,
          target_asset: primary.parameters.targetAsset,
          setpoint_mw: primary.parameters.setpointMw,
          target_window: primary.targetWindow,
          dispatch_duration_minutes: primary.parameters.dispatchDurationMinutes,
          net_effect: primary.causalArchitecture.netEffect,
          confidence_percent: primary.causalArchitecture.confidencePercent,
          financial_impact: primary.causalArchitecture.financialImpact,
          status: 'pending',
        },
      ],
    };
  }
}

export const recommendationsService = new RecommendationsService();
