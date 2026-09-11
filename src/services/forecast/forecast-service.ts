import { ForecastSummary, ForecastHorizon } from '@/types';
import { demoForecastSummary } from '@/data/demo-data';
import { apiClient, ApiError } from '../api/client';

export interface IForecastService {
  getForecast(plantId: string, horizon?: ForecastHorizon): Promise<ForecastSummary>;
}

export class ForecastService implements IForecastService {
  async getForecast(plantId: string, horizon: ForecastHorizon = '72h'): Promise<ForecastSummary> {
    // If explicit demo mode is forced, return deterministic mock data
    if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
      return { ...demoForecastSummary, horizon };
    }

    try {
      const data = await apiClient.get<ForecastSummary>(
        `/api/v1/forecast?plantId=${encodeURIComponent(plantId)}&horizon=${horizon}`,
        3000
      );
      return data;
    } catch (error) {
      // Graceful fallback to deterministic demo dataset
      if (error instanceof ApiError) {
        console.warn(`[ForecastService] Backend call failed (${error.message}), using demo dataset`);
      }
      return { ...demoForecastSummary, horizon };
    }
  }
}

export const forecastService = new ForecastService();
