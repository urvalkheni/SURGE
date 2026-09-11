import { apiClient } from './client';
import type { LocationSearchResult, WeatherData } from './types';

/** Open-Meteo is intentionally reached only through FastAPI. */
export const locationService = {
  search: (query: string) => apiClient.get<LocationSearchResult[]>(`/api/v1/location/search?q=${encodeURIComponent(query)}`),
  weather: (latitude: number, longitude: number, horizonHours = 24) =>
    apiClient.get<WeatherData>(`/api/v1/weather?latitude=${latitude}&longitude=${longitude}&horizon_hours=${horizonHours}`),
};
