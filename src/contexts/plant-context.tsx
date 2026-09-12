'use client';

import * as React from 'react';
import { DEMO_PLANT, DEMO_PLANT_CONFIG, PlantRecord, PlantConfigurationRecord } from '@/lib/demo-plant';
import type { WeatherSnapshot } from '@/services/weather/weather.types';
import type { ForecastPoint, RiskEvent, Recommendation } from '@/types';
interface PlantContextType {
  plant: PlantRecord;
  configuration: PlantConfigurationRecord;
  weather: WeatherSnapshot | null;
  forecastPoints: ForecastPoint[];
  forecastPoints1h: ForecastPoint[];
  forecastPoints15m: ForecastPoint[];
  expectedEnergyMwh: number;
  risks: RiskEvent[];
  recommendations: Recommendation[];
  riskCount: number;
  recommendationCount: number;
  currentPointTimestamp: string;
  currentOutputMw: number;
  utilizationPercent: number;
  resolution: '15m' | '1h';
  setResolution: (res: '15m' | '1h') => void;
  isLoading: boolean;
  isRefreshingWeather: boolean;
  weatherUnavailable: boolean;
  weatherError: string | null;
  lastUpdated: string;
  refreshWeather: () => Promise<void>;
  refreshPlant: () => Promise<void>;
}

const PlantContext = React.createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plant, setPlant] = React.useState<PlantRecord>(DEMO_PLANT);
  const [configuration, setConfiguration] = React.useState<PlantConfigurationRecord>(DEMO_PLANT_CONFIG);
  const [weather, setWeather] = React.useState<WeatherSnapshot | null>(null);
  const [forecastPoints1h, setForecastPoints1h] = React.useState<ForecastPoint[]>([]);
  const [forecastPoints15m, setForecastPoints15m] = React.useState<ForecastPoint[]>([]);
  const [resolution, setResolution] = React.useState<'15m' | '1h'>('1h');
  const [expectedEnergyMwh, setExpectedEnergyMwh] = React.useState(0);
  const [risks, setRisks] = React.useState<RiskEvent[]>([]);
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [currentPointTimestamp, setCurrentPointTimestamp] = React.useState<string>(new Date().toISOString());
  const [currentOutputMw, setCurrentOutputMw] = React.useState(0.0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshingWeather, setIsRefreshingWeather] = React.useState(false);
  const [weatherError, setWeatherError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>(new Date().toISOString());

  const fetchPlantData = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshingWeather(true);
    try {
      const res = await fetch(`/api/plants/current${refresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.plant) setPlant(data.plant);
        if (data.configuration) setConfiguration(data.configuration);
        if (data.weather) {
          setWeather(data.weather);
          if (data.weather.source === 'UNAVAILABLE') {
            setWeatherError(data.weather.error || 'Open-Meteo weather service unavailable.');
          } else {
            setWeatherError(null);
          }
        }
        if (Array.isArray(data.forecastPoints1h)) {
          setForecastPoints1h(data.forecastPoints1h);
        }
        if (Array.isArray(data.forecastPoints15m)) {
          setForecastPoints15m(data.forecastPoints15m);
        }
        if (typeof data.expectedEnergyMwh === 'number') {
          setExpectedEnergyMwh(data.expectedEnergyMwh);
        }
        if (Array.isArray(data.risks)) setRisks(data.risks);
        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        }
        if (data.currentPointTimestamp) {
          setCurrentPointTimestamp(data.currentPointTimestamp);
        }
        if (typeof data.currentOutputMw === 'number') {
          setCurrentOutputMw(data.currentOutputMw);
        }
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
      }
    } catch (err) {
      console.warn('Could not retrieve live plant data from API.', err);
      setWeatherError('Failed to contact plant data API.');
    } finally {
      setIsLoading(false);
      setIsRefreshingWeather(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPlantData();
  }, [fetchPlantData]);

  const activeForecastPoints = React.useMemo(() => {
    if (resolution === '15m' && forecastPoints15m.length > 0) {
      return forecastPoints15m;
    }
    return forecastPoints1h;
  }, [resolution, forecastPoints15m, forecastPoints1h]);

  const utilizationPercent = React.useMemo(() => {
    const acCap = configuration.acCapacityMw || 42.0;
    return Number(Math.min(100, Math.max(0, (currentOutputMw / acCap) * 100)).toFixed(1));
  }, [currentOutputMw, configuration.acCapacityMw]);

  const refreshWeather = React.useCallback(async () => {
    await fetchPlantData(true);
  }, [fetchPlantData]);

  const weatherUnavailable = !weather || weather.source === 'UNAVAILABLE' || weather.points.length === 0;

  return (
    <PlantContext.Provider
      value={{
        plant,
        configuration,
        weather,
        forecastPoints: activeForecastPoints,
        forecastPoints1h,
        forecastPoints15m,
        expectedEnergyMwh,
        risks,
        recommendations,
        riskCount: risks.length,
        recommendationCount: recommendations.length,
        currentPointTimestamp,
        currentOutputMw,
        utilizationPercent,
        resolution,
        setResolution,
        isLoading,
        isRefreshingWeather,
        weatherUnavailable,
        weatherError,
        lastUpdated,
        refreshWeather,
        refreshPlant: fetchPlantData,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export function usePlant() {
  const context = React.useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
}
