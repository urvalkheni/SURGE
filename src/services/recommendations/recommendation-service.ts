import { Recommendation, DispatchAction } from '@/types';
import { demoRecommendations } from '@/data/demo-data';
import { apiClient, ApiError } from '../api/client';

export interface IRecommendationService {
  getRecommendations(plantId: string): Promise<Recommendation[]>;
  dispatchAction(actionId: string): Promise<DispatchAction>;
}

export class RecommendationService implements IRecommendationService {
  private localRecommendations: Recommendation[] = [...demoRecommendations];

  async getRecommendations(plantId: string): Promise<Recommendation[]> {
    if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
      return this.localRecommendations;
    }

    try {
      const data = await apiClient.get<Recommendation[]>(
        `/api/v1/recommendations?plantId=${encodeURIComponent(plantId)}`,
        3000
      );
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.warn(`[RecommendationService] Backend call failed (${error.message}), using demo recs`);
      }
      return this.localRecommendations;
    }
  }

  async dispatchAction(actionId: string): Promise<DispatchAction> {
    try {
      return await apiClient.post<DispatchAction>(`/api/v1/dispatch/${actionId}`, {});
    } catch {
      // Local demo simulated dispatch
      const rec = this.localRecommendations.find((r) => r.dispatchPlan.id === actionId);
      if (rec) {
        rec.dispatchPlan.status = 'dispatched';
        rec.dispatchPlan.dispatchedAt = new Date().toISOString();
        rec.dispatchPlan.scadaConfirmationId = `SCADA-BUS-${Math.floor(100000 + Math.random() * 900000)}`;
        return { ...rec.dispatchPlan };
      }
      throw new Error(`Dispatch action ${actionId} not found`);
    }
  }
}

export const recommendationService = new RecommendationService();
