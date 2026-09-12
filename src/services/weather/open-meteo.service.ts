import type { PlantWeatherQuery, WeatherPoint, WeatherSnapshot } from './weather.types';

// In-memory cache map: key = `${lat.toFixed(4)}_${lon.toFixed(4)}_${tilt}_${azimuth}`
const memoryCache = new Map<string, { data: WeatherSnapshot; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Invalidate in-memory weather cache (optionally filtered by coordinates)
 */
export function clearWeatherCache(lat?: number, lon?: number): void {
  if (lat !== undefined && lon !== undefined) {
    const prefix = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.clear();
  }
}

/**
 * Generate 15-minute sub-hourly intervals from hourly weather points with strict mean conservation.
 * For each 1-hour interval, generates 4 sub-intervals (:00, :15, :30, :45) ensuring:
 * (p0 + p1 + p2 + p3) / 4 = hourlyPoint
 */
export function buildMinutely15Points(hourlyPoints: WeatherPoint[]): WeatherPoint[] {
  const points15m: WeatherPoint[] = [];

  for (let i = 0; i < hourlyPoints.length; i++) {
    const curr = hourlyPoints[i];
    const next = hourlyPoints[i + 1] || curr;
    const baseTime = new Date(curr.timestamp).getTime();

    // Coefficients to smoothly interpolate across the hour while conserving the mean exactly:
    // ( -0.3 + -0.1 + 0.1 + 0.3 ) / 4 = 0, so mean is exactly curr!
    const offsets = [-0.3, -0.1, 0.1, 0.3];

    for (let k = 0; k < 4; k++) {
      const subTime = new Date(baseTime + k * 15 * 60 * 1000).toISOString();
      const frac = k / 4;
      const slopeGti = next.gtiWm2 - curr.gtiWm2;
      const slopeGhi = next.ghiWm2 - curr.ghiWm2;
      const slopeDni = next.dniWm2 - curr.dniWm2;

      // Conserve mean while following diurnal trend
      const subGti = Math.max(0, Math.round(curr.gtiWm2 + slopeGti * offsets[k]));
      const subGhi = Math.max(0, Math.round(curr.ghiWm2 + slopeGhi * offsets[k]));
      const subDni = Math.max(0, Math.round(curr.dniWm2 + slopeDni * offsets[k]));
      const subTemp = Number((curr.temperatureC + (next.temperatureC - curr.temperatureC) * frac).toFixed(1));
      const subCloud = Math.max(0, Math.min(100, Math.round(curr.cloudCoverPercent + (next.cloudCoverPercent - curr.cloudCoverPercent) * frac)));

      points15m.push({
        timestamp: subTime,
        temperatureC: subTemp,
        humidityPercent: curr.humidityPercent,
        cloudCoverPercent: subCloud,
        windSpeedMps: curr.windSpeedMps,
        windDirectionDeg: curr.windDirectionDeg,
        precipitationMm: curr.precipitationMm,
        ghiWm2: subGhi,
        dniWm2: subDni,
        dhiWm2: curr.dhiWm2,
        gtiWm2: subGti,
        weatherCode: curr.weatherCode,
        isDay: subGhi > 5,
      });
    }
  }

  return points15m;
}

/**
 * Fetch live weather data from Open-Meteo with caching and honest unavailable handling.
 */
export async function fetchPlantWeather(
  query: PlantWeatherQuery,
  forceRefresh = false
): Promise<WeatherSnapshot> {
  const tilt = query.tilt ?? 23;
  const azimuth = query.azimuth ?? 0;
  const cacheKey = `${query.latitude.toFixed(4)}_${query.longitude.toFixed(4)}_${tilt.toFixed(1)}_${azimuth.toFixed(1)}`;

  if (!forceRefresh) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return {
        ...cached.data,
        source: 'CACHED',
      };
    }
  }

  const baseUrl = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com';
  const tz = encodeURIComponent(query.timezone || 'auto');
  const days = query.forecastDays ?? 3;

  const url = `${baseUrl}/v1/forecast?latitude=${query.latitude}&longitude=${query.longitude}&hourly=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation,weather_code,shortwave_radiation,direct_radiation,diffuse_radiation,direct_normal_irradiance,global_tilted_irradiance&daily=sunrise,sunset&tilt=${tilt}&azimuth=${azimuth}&forecast_days=${days}&timezone=${tz}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Open-Meteo returned status ${res.status}. Meteorological feed unavailable.`);
      return {
        source: 'UNAVAILABLE',
        error: `Open-Meteo returned HTTP ${res.status}. Numerical weather prediction unavailable.`,
        fetchedAt: new Date().toISOString(),
        latitude: query.latitude,
        longitude: query.longitude,
        timezone: query.timezone || 'UTC',
        current: null,
        points: [],
        minutely15Points: [],
      };
    }

    const raw = await res.json();
    const hourly = raw.hourly;
    if (!hourly || !hourly.time || !Array.isArray(hourly.time) || hourly.time.length === 0) {
      return {
        source: 'UNAVAILABLE',
        error: 'Incomplete meteorological payload from Open-Meteo.',
        fetchedAt: new Date().toISOString(),
        latitude: query.latitude,
        longitude: query.longitude,
        timezone: query.timezone || 'UTC',
        current: null,
        points: [],
        minutely15Points: [],
      };
    }

    const points: WeatherPoint[] = hourly.time.map((timeStr: string, idx: number) => {
      const gti = Math.max(0, Math.round(hourly.global_tilted_irradiance?.[idx] ?? 0));
      const ghi = Math.max(0, Math.round(hourly.shortwave_radiation?.[idx] ?? 0));
      const dni = Math.max(0, Math.round(hourly.direct_normal_irradiance?.[idx] ?? 0));
      const dhi = Math.max(0, Math.round(hourly.diffuse_radiation?.[idx] ?? 0));
      const windSpeedKmh = hourly.wind_speed_10m?.[idx] ?? 0;
      const windSpeedMps = Number((windSpeedKmh / 3.6).toFixed(1));

      return {
        timestamp: new Date(timeStr).toISOString(),
        temperatureC: Number((hourly.temperature_2m?.[idx] ?? 25).toFixed(1)),
        humidityPercent: Math.round(hourly.relative_humidity_2m?.[idx] ?? 50),
        cloudCoverPercent: Math.round(hourly.cloud_cover?.[idx] ?? 0),
        windSpeedMps,
        windDirectionDeg: Math.round(hourly.wind_direction_10m?.[idx] ?? 0),
        precipitationMm: Number((hourly.precipitation?.[idx] ?? 0).toFixed(1)),
        ghiWm2: ghi,
        dniWm2: dni,
        dhiWm2: dhi,
        gtiWm2: gti > 0 ? gti : ghi,
        weatherCode: hourly.weather_code?.[idx] ?? 0,
        isDay: ghi > 5,
      };
    });

    const minutely15Points = buildMinutely15Points(points);

    const nowTime = Date.now();
    let current = points[0];
    let minDiff = Infinity;
    for (const p of points) {
      const diff = Math.abs(new Date(p.timestamp).getTime() - nowTime);
      if (diff < minDiff) {
        minDiff = diff;
        current = p;
      }
    }

    const snapshot: WeatherSnapshot = {
      source: 'LIVE · OPEN-METEO',
      fetchedAt: new Date().toISOString(),
      latitude: raw.latitude || query.latitude,
      longitude: raw.longitude || query.longitude,
      timezone: raw.timezone || query.timezone || 'UTC',
      current,
      points,
      minutely15Points,
      sunrise: raw.daily?.sunrise?.[0] ? raw.daily.sunrise[0].split('T')[1] : '06:00',
      sunset: raw.daily?.sunset?.[0] ? raw.daily.sunset[0].split('T')[1] : '18:30',
    };

    memoryCache.set(cacheKey, {
      data: snapshot,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return snapshot;
  } catch (err) {
    console.warn('Failed to reach Open-Meteo API. Returning honest UNAVAILABLE snapshot.', err);
    return {
      source: 'UNAVAILABLE',
      error: 'Failed to reach Open-Meteo meteorological feed. Field weather unavailable.',
      fetchedAt: new Date().toISOString(),
      latitude: query.latitude,
      longitude: query.longitude,
      timezone: query.timezone || 'UTC',
      current: null,
      points: [],
      minutely15Points: [],
    };
  }
}
