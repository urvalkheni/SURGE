import { apiClient } from './client';
import type { Plant, PlantInput } from './types';

/** Plant API boundary. Authorization is enforced by FastAPI/Supabase, never the UI. */
export const plantsService = {
  list: () => apiClient.get<Plant[]>('/api/v1/plants'),
  get: (plantId: string) => apiClient.get<Plant>(`/api/v1/plants/${plantId}`),
  create: (plant: PlantInput) => apiClient.post<Plant, PlantInput>('/api/v1/plants', plant),
  update: (plantId: string, changes: Partial<Omit<PlantInput, 'organization_id' | 'energy_type'>>) =>
    apiClient.patch<Plant, Partial<Omit<PlantInput, 'organization_id' | 'energy_type'>>>(`/api/v1/plants/${plantId}`, changes),
};
