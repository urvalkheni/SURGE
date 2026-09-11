/**
 * Forecast Service — Decoupled API & Deterministic Demo Provider
 */

import { apiClient, ApiError } from './client';
import { 
  ForecastRequest, 
  ForecastResponse, 
  ServiceResult 
} from './types';
import { 
  forecastWorkbenchData 
} from '@/data/demo-data';


export class ForecastService {
  /**
   * Fetches the 72-hour forecast dataset.
   * If external ML backend is configured and responsive, returns live inference data.
   * Otherwise, seamlessly returns canonical deterministic Ahmedabad Solar Plant demo data.
   */
  public async getForecast(
    request: ForecastRequest = {
      plant_id: 'ahmedabad-solar-01',
      horizon_hours: 72,
      resolution: '15m',
    }
  ): Promise<ServiceResult<ForecastResponse>> {
    const startTime = Date.now();

    // 1. If API is configured, attempt backend request
    if (apiClient.isConfigured()) {
      try {
        const response = await apiClient.post<ForecastResponse>(
          '/api/v1/forecast',
          request,
          4000 // 4s timeout
        );

        return {
          data: response,
          source: 'api',
          statusTag: 'LIVE',
          latencyMs: Date.now() - startTime,
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof ApiError ? err.message : 'API connection failed';
        // Graceful fallback to deterministic demo data with error diagnostics
        return {
          data: this.getDeterministicDemoResponse(request),
          source: 'demo',
          statusTag: 'DEMO FALLBACK',
          latencyMs: Date.now() - startTime,
          error: errorMessage,
        };
      }
    }

    // 2. Default mode: Deterministic demo provider
    return {
      data: this.getDeterministicDemoResponse(request),
      source: 'demo',
      statusTag: 'DEMO DATA',
      latencyMs: 18, // canonical SCADA simulation latency
    };
  }

  /**
   * Constructs a typed ForecastResponse using the canonical deterministic demo dataset.
   */
  public getDeterministicDemoResponse(request: Partial<ForecastRequest> = {}): ForecastResponse {
    const horizon = request.horizon_hours || 72;
    const is15m = request.resolution === '15m';
    const sourcePoints = is15m ? forecastWorkbenchData.fifteenMinPoints : forecastWorkbenchData.hourlyPoints;

    const pointsSlice = horizon === 24 
      ? sourcePoints.slice(0, is15m ? 96 : 24) 
      : horizon === 48 
        ? sourcePoints.slice(0, is15m ? 192 : 48) 
        : sourcePoints;

    return {
      plant_id: request.plant_id || 'ahmedabad-solar-01',
      model: 'Ensemble GBDT + Physics NWP v3.2',
      generated_at: new Date('2026-09-14T11:45:00Z').toISOString(),
      horizon_hours: horizon,
      resolution: request.resolution || '15m',
      forecast: pointsSlice.map((pt) => ({
        timestamp: pt.timestampUtc,
        actual_mw: pt.isHistorical ? pt.p50Mw : null,
        predicted_mw: pt.p50Mw,
        p10_mw: pt.p10Mw,
        p90_mw: pt.p90Mw,
        day_ahead_mw: pt.dayAheadMw,
        ghi: pt.ghiWm2,
        cloud_cover_percent: pt.cloudCoverPercent,
        temperature_c: pt.temperatureC,
        ramp_rate_mw_per_min: pt.rampRateMw15m / 15,
        is_ramp_alert: pt.isRampAlert,
      })),
      metrics: {
        mae_mw: forecastWorkbenchData.accuracyMetrics.maeMw,
        rmse_mw: forecastWorkbenchData.accuracyMetrics.rmseMw,
        skill_score_percent: forecastWorkbenchData.accuracyMetrics.skillScorePercent,
        ramp_capture_rate_percent: forecastWorkbenchData.accuracyMetrics.rampCaptureRatePercent,
        bias_mw: forecastWorkbenchData.summaryMetrics.biasMw,
      },
      confidence: 91.0,
    };
  }
}

export const forecastService = new ForecastService();
