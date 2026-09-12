import type { WeatherPoint } from '@/services/weather/weather.types';
import type { PlantConfigurationRecord } from '@/lib/demo-plant';
import type { ForecastPoint } from '@/types';

/**
 * Physics-Based Solar Generation Estimation Engine
 * Uses fundamental photovoltaic equations with temperature derating and inverter clipping.
 * Strictly labeled: PHYSICS BASELINE (Not AI / ML).
 */
export function calculatePhysicsSolarEstimate(
  weatherPoints: WeatherPoint[],
  config: PlantConfigurationRecord
): ForecastPoint[] {
  const points: ForecastPoint[] = [];

  for (let i = 0; i < weatherPoints.length; i++) {
    const wp = weatherPoints[i];
    const gti = wp.gtiWm2;
    const tempC = wp.temperatureC;

    let predictedMw = 0;
    let p10Mw = 0;
    let p90Mw = 0;
    let isRampAlert = false;

    if (gti > 5 && wp.isDay) {
      // 1. Module Cell Temperature Approximation (NOCT model)
      const cellTempC = tempC + 0.03125 * gti;

      // 2. Temperature Derating Factor: F_temp = 1 + (gamma / 100) * (T_cell - 25)
      const gamma = config.tempCoefficientPct ?? -0.35; // e.g. -0.35%/C
      const tempDeratingFactor = Math.max(0.7, Math.min(1.05, 1 + (gamma / 100) * (cellTempC - 25)));

      // 3. DC Power Generation (MW): (GTI / 1000) * DC_Cap * PR * Availability * F_temp
      const pr = config.performanceRatio ?? 0.82;
      const availability = (config.availabilityPct ?? 99.1) / 100;
      const dcCap = config.dcCapacityMw ?? 50.0;
      const dcGenerationMw = (gti / 1000) * dcCap * pr * availability * tempDeratingFactor;

      // 4. System Losses & Inverter Conversion
      const systemLosses = (config.systemLossesPct ?? 14.0) / 100;
      const inverterEff = (config.inverterEfficiencyPct ?? 98.4) / 100;
      const acOutputUnclipped = dcGenerationMw * (1 - systemLosses) * inverterEff;

      // 5. Hard AC Capacity Inverter Clipping
      const acCapacity = config.acCapacityMw ?? 42.0;
      predictedMw = Number(Math.min(acCapacity, Math.max(0, acOutputUnclipped)).toFixed(1));

      // 6. Realistic physics variance bounds based on cloud cover uncertainty
      const cloudFactor = wp.cloudCoverPercent / 100;
      const uncertaintyBand = predictedMw * (0.05 + cloudFactor * 0.22);
      p10Mw = Number(Math.max(0, predictedMw - uncertaintyBand).toFixed(1));
      p90Mw = Number(Math.min(acCapacity, predictedMw + uncertaintyBand).toFixed(1));
    }

    // 7. Check Ramp Rate Threshold using interval duration in minutes
    if (i > 0) {
      const prev = points[i - 1];
      const deltaMw = Math.abs(predictedMw - prev.predictedMw);
      const dtMin = Math.max(
        1,
        (new Date(wp.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (60 * 1000)
      );
      const rampRateMwPerMin = deltaMw / dtMin;
      const configuredLimit = config.rampLimitMwPerMin || 2.5;

      if (rampRateMwPerMin > configuredLimit) {
        isRampAlert = true;
      }
    }

    // SCADA telemetry is strictly null until physical inverter integration
    const actualMw: number | null = null;

    points.push({
      timestamp: wp.timestamp,
      actualMw,
      predictedMw,
      p10Mw,
      p90Mw,
      dayAheadMw: Number((predictedMw * 0.96).toFixed(1)),
      ghi: wp.ghiWm2,
      cloudCoverPercent: wp.cloudCoverPercent,
      temperatureC: wp.temperatureC,
      windSpeedMs: wp.windSpeedMps,
      isDaytime: wp.isDay,
      isRampAlert,
      humidityPercent: wp.humidityPercent,
      source: 'physics',
      modelStatus: 'not_connected',
    });
  }

  return points;
}

/**
 * Calculates energy in MWh with strict interval duration multiplier
 * 15-min interval: energy = power * 0.25
 * 1-hr interval: energy = power * 1.0
 */
export function calculateForecastEnergyMwh(
  points: ForecastPoint[],
  intervalHours?: number
): number {
  if (!points || points.length === 0) return 0;
  
  let dt = intervalHours;
  if (dt === undefined) {
    if (points.length >= 2) {
      const diffMs = Math.abs(new Date(points[1].timestamp).getTime() - new Date(points[0].timestamp).getTime());
      dt = diffMs / (3600 * 1000);
    } else {
      dt = 1.0;
    }
  }

  const sum = points.reduce((acc, p) => acc + (p.predictedMw || 0) * dt, 0);
  return Math.round(sum);
}

/**
 * Downsamples 15-minute forecast points to 1-hour intervals while guaranteeing exact energy conservation.
 * (P_0 + P_15 + P_30 + P_45) / 4 = Hourly P
 */
export function aggregate15mToHourly(points15m: ForecastPoint[]): ForecastPoint[] {
  const hourly: ForecastPoint[] = [];
  for (let i = 0; i < points15m.length; i += 4) {
    const chunk = points15m.slice(i, i + 4);
    if (chunk.length === 0) break;
    const avgPredicted = chunk.reduce((sum, p) => sum + p.predictedMw, 0) / chunk.length;
    const avgP10 = chunk.reduce((sum, p) => sum + (p.p10Mw ?? p.predictedMw), 0) / chunk.length;
    const avgP90 = chunk.reduce((sum, p) => sum + (p.p90Mw ?? p.predictedMw), 0) / chunk.length;
    const avgDayAhead = chunk.reduce((sum, p) => sum + (p.dayAheadMw ?? p.predictedMw), 0) / chunk.length;
    const anyRamp = chunk.some((p) => p.isRampAlert);

    hourly.push({
      ...chunk[0],
      predictedMw: Number(avgPredicted.toFixed(1)),
      p10Mw: Number(avgP10.toFixed(1)),
      p90Mw: Number(avgP90.toFixed(1)),
      dayAheadMw: Number(avgDayAhead.toFixed(1)),
      isRampAlert: anyRamp,
    });
  }
  return hourly;
}
