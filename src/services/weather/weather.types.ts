/**
 * Normalized Weather Data Types for Open-Meteo Integration
 */

export interface WeatherPoint {
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  cloudCoverPercent: number;
  windSpeedMps: number;
  windDirectionDeg: number;
  precipitationMm: number;
  ghiWm2: number;
  dniWm2: number;
  dhiWm2: number;
  gtiWm2: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherSnapshot {
  source: 'LIVE · OPEN-METEO' | 'CACHED' | 'UNAVAILABLE';
  error?: string;
  fetchedAt: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: WeatherPoint | null;
  points: WeatherPoint[];
  minutely15Points?: WeatherPoint[];
  sunrise?: string;
  sunset?: string;
}

export interface PlantWeatherQuery {
  latitude: number;
  longitude: number;
  timezone?: string;
  tilt?: number;
  azimuth?: number;
  forecastDays?: number;
}
