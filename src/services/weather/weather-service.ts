import { WeatherCondition } from '@/types';
import { demoForecastPoints } from '@/data/demo-data';
import { apiClient, ApiError } from '../api/client';

export interface IWeatherService {
  getCurrentWeather(plantId: string): Promise<WeatherCondition>;
}

export class WeatherService implements IWeatherService {
  async getCurrentWeather(plantId: string): Promise<WeatherCondition> {
    if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
      return this.getDemoWeather();
    }

    try {
      const data = await apiClient.get<WeatherCondition>(
        `/api/v1/weather?plantId=${encodeURIComponent(plantId)}`,
        3000
      );
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.warn(`[WeatherService] Backend call failed (${error.message}), using demo weather`);
      }
      return this.getDemoWeather();
    }
  }

  private getDemoWeather(): WeatherCondition {
    const activePoint = demoForecastPoints[12] || demoForecastPoints[0];
    return {
      timestamp: activePoint.timestamp,
      ghi: activePoint.ghi,
      dni: Math.round(activePoint.ghi * 0.85),
      dhi: Math.round(activePoint.ghi * 0.15),
      cloudCoverPercent: activePoint.cloudCoverPercent,
      cloudType: activePoint.cloudCoverPercent > 60 ? 'Cumulonimbus' : 'Cirrus',
      temperatureC: activePoint.temperatureC,
      dewPointC: 14.2,
      relativeHumidity: 38,
      windSpeedMs: activePoint.windSpeedMs,
      windDirectionDeg: 315,
      surfacePressureHpa: 1014.2,
      visibilityKm: 18.5,
    };
  }
}

export const weatherService = new WeatherService();
