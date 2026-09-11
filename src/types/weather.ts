/**
 * Meteorological Telemetry Contracts
 */

export interface WeatherCondition {
  timestamp: string;
  ghi: number;               // Global Horizontal Irradiance (W/m²)
  dni: number;               // Direct Normal Irradiance (W/m²)
  dhi: number;               // Diffuse Horizontal Irradiance (W/m²)
  cloudCoverPercent: number; // Cloud fraction (0 - 100%)
  cloudType: string;         // Cirrus, Stratus, Cumulonimbus, Clear
  temperatureC: number;      // Air temperature (°C)
  dewPointC: number;         // Dew point (°C)
  relativeHumidity: number;  // 0 - 100%
  windSpeedMs: number;       // Velocity (m/s)
  windDirectionDeg: number;  // Azimuth (0 - 360°)
  surfacePressureHpa: number;// Barometric pressure (hPa)
  visibilityKm: number;      // Visual range (km)
}
