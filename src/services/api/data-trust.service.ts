import { apiClient } from './client';
import type { DataTrustResult } from './types';

export const dataTrustService = {
  get: (plantId?: string) => apiClient.get<DataTrustResult>(`/api/v1/data-trust${plantId ? `?plant_id=${plantId}` : ''}`),
};
