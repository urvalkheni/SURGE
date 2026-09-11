import { RiskEvent } from '@/types';
import { demoRisks } from '@/data/demo-data';
import { apiClient, ApiError } from '../api/client';

export interface IRiskService {
  getRisks(plantId: string): Promise<RiskEvent[]>;
  acknowledgeRisk(riskId: string): Promise<RiskEvent>;
}

export class RiskService implements IRiskService {
  private localRisks: RiskEvent[] = [...demoRisks];

  async getRisks(plantId: string): Promise<RiskEvent[]> {
    if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
      return this.localRisks;
    }

    try {
      const data = await apiClient.get<RiskEvent[]>(
        `/api/v1/risks?plantId=${encodeURIComponent(plantId)}`,
        3000
      );
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.warn(`[RiskService] Backend call failed (${error.message}), using demo risks`);
      }
      return this.localRisks;
    }
  }

  async acknowledgeRisk(riskId: string): Promise<RiskEvent> {
    try {
      return await apiClient.post<RiskEvent>(`/api/v1/risks/${riskId}/acknowledge`, {});
    } catch {
      // Local demo acknowledgment
      const risk = this.localRisks.find((r) => r.id === riskId);
      if (risk) {
        risk.status = 'acknowledged';
        return { ...risk };
      }
      throw new Error(`Risk with ID ${riskId} not found`);
    }
  }
}

export const riskService = new RiskService();
