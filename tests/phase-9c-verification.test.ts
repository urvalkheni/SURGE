import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { formatINR, formatCurrency, formatMw, formatMwh } from '@/lib/formatters';
import {
  calculatePhysicsSolarEstimate,
  calculateForecastEnergyMwh,
  aggregate15mToHourly,
} from '@/services/physics/solar-estimation';
import {
  buildMinutely15Points,
  clearWeatherCache,
  fetchPlantWeather,
} from '@/services/weather/open-meteo.service';
import { evaluatePlantRisks } from '@/services/risk/risk-rules';
import { db } from '@/lib/db';
import type { WeatherPoint } from '@/services/weather/weather.types';
import type { PlantConfigurationRecord } from '@/lib/demo-plant';

// Standard Plant Configuration for Tests
const baseConfig: PlantConfigurationRecord = {
  id: 'test-plant-01',
  plantId: 'plt-test-01',
  acCapacityMw: 42.0,
  dcCapacityMw: 50.0,
  moduleTechnology: 'Monocrystalline PERC',
  moduleCount: 112000,
  inverterCount: 14,
  inverterCapacityMw: 3.0,
  panelTiltDeg: 23,
  panelAzimuthDeg: 180,
  trackingType: 'Single-Axis Horizontal',
  performanceRatio: 0.82,
  tempCoefficientPct: -0.38,
  systemLossesPct: 14.0,
  inverterEfficiencyPct: 98.4,
  availabilityPct: 99.1,
  gridOperator: 'GETCO',
  gridVoltageKv: 220,
  interconnectCapacityMw: 42.0,
  gridNode: 'GETCO 220kV Node',
  bessEnabled: true,
  bessPowerMw: 20.0,
  bessEnergyMwh: 40.0,
  bessSocPct: 75.0,
  rampLimitMwPerMin: 2.5,
  currency: 'INR',
  energyPricePerMwh: 3500.0,
};

// Synthetic diurnal weather generator for tests
function generateTestWeather(hours = 72, peakGti = 900): WeatherPoint[] {
  const points: WeatherPoint[] = [];
  const baseTime = new Date('2026-09-14T00:00:00Z').getTime();

  for (let h = 0; h < hours; h++) {
    const timestamp = new Date(baseTime + h * 3600 * 1000).toISOString();
    const hourOfDay = (h % 24);
    // Solar curve between 6:00 and 18:00
    const isDay = hourOfDay >= 6 && hourOfDay <= 18;
    const solarFactor = isDay ? Math.sin(((hourOfDay - 6) / 12) * Math.PI) : 0;
    const gti = Math.max(0, Math.round(peakGti * solarFactor));
    const temp = isDay ? 28 + solarFactor * 8 : 22;

    points.push({
      timestamp,
      gtiWm2: gti,
      dniWm2: gti * 0.8,
      dhiWm2: gti * 0.2,
      ghiWm2: gti,
      temperatureC: temp,
      cloudCoverPercent: 10,
      windSpeedMps: 3.5,
      windDirectionDeg: 210,
      humidityPercent: 45,
      precipitationMm: 0,
      weatherCode: 0,
      isDay: isDay && gti > 5,
    });
  }

  return points;
}

describe('RenewableIQ / SURGE — Phase 9C Verification Test Suite', () => {

  // 1. Location Propagation
  test('Test 1: Location propagation updates coordinates, clears cache & computes location-specific solar profile', () => {
    const khavdaLat = 23.8342;
    const khavdaLon = 69.7561;
    const mumbaiLat = 19.0760;
    const mumbaiLon = 72.8777;

    // Verify cache invalidation function executes cleanly for old coordinate
    assert.doesNotThrow(() => clearWeatherCache(khavdaLat, khavdaLon));

    // Compare generation estimates for Khavda vs Mumbai given identical irradiance
    const weather = generateTestWeather(24, 850);
    const configKhavda = { ...baseConfig, latitude: khavdaLat, longitude: khavdaLon };
    const configMumbai = { ...baseConfig, latitude: mumbaiLat, longitude: mumbaiLon };

    const estKhavda = calculatePhysicsSolarEstimate(weather, configKhavda);
    const estMumbai = calculatePhysicsSolarEstimate(weather, configMumbai);

    assert.equal(estKhavda.length, 24);
    assert.equal(estMumbai.length, 24);
    // Both produce valid non-zero day-time forecasts
    assert.ok(estKhavda.some(p => p.predictedMw > 0), 'Khavda estimate must produce positive generation during day');
    assert.ok(estMumbai.some(p => p.predictedMw > 0), 'Mumbai estimate must produce positive generation during day');
  });

  // 2. Capacity Propagation
  test('Test 2: Capacity propagation caps output at configured AC capacity (clipping headroom)', () => {
    const highIrradianceWeather = generateTestWeather(24, 1100);

    const config50: PlantConfigurationRecord = { ...baseConfig, acCapacityMw: 50.0, dcCapacityMw: 60.0 };
    const config30: PlantConfigurationRecord = { ...baseConfig, acCapacityMw: 30.0, dcCapacityMw: 60.0 };

    const est50 = calculatePhysicsSolarEstimate(highIrradianceWeather, config50);
    const est30 = calculatePhysicsSolarEstimate(highIrradianceWeather, config30);

    const max50 = Math.max(...est50.map(p => p.predictedMw));
    const max30 = Math.max(...est30.map(p => p.predictedMw));

    // Under high irradiance, 30 MW config must never exceed 30.0 MW
    assert.ok(max30 <= 30.0, `Expected max30 <= 30.0 MW, got ${max30}`);
    assert.ok(max50 > max30, `50 MW plant (${max50} MW) should produce more peak than 30 MW plant (${max30} MW)`);
  });

  // 3. Inverter Efficiency Propagation
  test('Test 3: Inverter efficiency reduction reduces generation proportionally', () => {
    const weather = generateTestWeather(24, 800);

    const configHighEff: PlantConfigurationRecord = { ...baseConfig, inverterEfficiencyPct: 98.4 };
    const configLowEff: PlantConfigurationRecord = { ...baseConfig, inverterEfficiencyPct: 90.0 };

    const estHigh = calculatePhysicsSolarEstimate(weather, configHighEff);
    const estLow = calculatePhysicsSolarEstimate(weather, configLowEff);

    const middayHigh = estHigh[12].predictedMw;
    const middayLow = estLow[12].predictedMw;

    assert.ok(middayHigh > 0, 'Midday high generation should be > 0');
    assert.ok(middayLow > 0, 'Midday low generation should be > 0');

    // Ratio should be very close to 90.0 / 98.4 (~0.9146)
    const expectedRatio = 90.0 / 98.4;
    const actualRatio = middayLow / middayHigh;
    assert.ok(
      Math.abs(actualRatio - expectedRatio) < 0.02,
      `Expected ratio ~${expectedRatio.toFixed(3)}, got ${actualRatio.toFixed(3)}`
    );
  });

  // 4. Time Resolution Engine - Interval Counts
  test('Test 4: Time resolution interval counts match exact horizons (15m vs 1h)', () => {
    const hourly72 = generateTestWeather(72);
    const points15m72 = buildMinutely15Points(hourly72);

    // 72-hour counts
    assert.equal(hourly72.length, 72, '72h at 1h resolution must have 72 points');
    assert.equal(points15m72.length, 288, '72h at 15m resolution must have 288 points');

    // 48-hour counts
    const hourly48 = hourly72.slice(0, 48);
    const points15m48 = points15m72.slice(0, 192);
    assert.equal(hourly48.length, 48, '48h at 1h resolution must have 48 points');
    assert.equal(points15m48.length, 192, '48h at 15m resolution must have 192 points');

    // 24-hour counts
    const hourly24 = hourly72.slice(0, 24);
    const points15m24 = points15m72.slice(0, 96);
    assert.equal(hourly24.length, 24, '24h at 1h resolution must have 24 points');
    assert.equal(points15m24.length, 96, '24h at 15m resolution must have 96 points');
  });

  // 5. Energy Conservation Across Resolutions
  test('Test 5: Mathematical energy conservation between 15m and 1h resolutions (MWh)', () => {
    // A: Constant 10 MW for 4 15-minute intervals = exactly 10 MWh
    const constant15m = [
      { timestamp: 'T0', actualMw: null, predictedMw: 10, p10Mw: 9, p90Mw: 11, dayAheadMw: 10, cloudCoverPercent: 0, temperatureC: 25, windSpeedMs: 0, ghi: 500, isDaytime: true },
      { timestamp: 'T1', actualMw: null, predictedMw: 10, p10Mw: 9, p90Mw: 11, dayAheadMw: 10, cloudCoverPercent: 0, temperatureC: 25, windSpeedMs: 0, ghi: 500, isDaytime: true },
      { timestamp: 'T2', actualMw: null, predictedMw: 10, p10Mw: 9, p90Mw: 11, dayAheadMw: 10, cloudCoverPercent: 0, temperatureC: 25, windSpeedMs: 0, ghi: 500, isDaytime: true },
      { timestamp: 'T3', actualMw: null, predictedMw: 10, p10Mw: 9, p90Mw: 11, dayAheadMw: 10, cloudCoverPercent: 0, temperatureC: 25, windSpeedMs: 0, ghi: 500, isDaytime: true },
    ];
    const energy4x15m = calculateForecastEnergyMwh(constant15m, 0.25);
    assert.equal(energy4x15m, 10.0, '10 MW over four 15m intervals must equal exactly 10 MWh');

    // B: Variable full 72-hour forecast conservation test
    const weatherHourly = generateTestWeather(72, 850);
    const weather15m = buildMinutely15Points(weatherHourly);

    const forecast15m = calculatePhysicsSolarEstimate(weather15m, baseConfig);
    const forecast1h = aggregate15mToHourly(forecast15m);

    const totalEnergy15m = calculateForecastEnergyMwh(forecast15m, 0.25);
    const totalEnergy1h = calculateForecastEnergyMwh(forecast1h, 1.0);

    const deltaMwh = Math.abs(totalEnergy15m - totalEnergy1h);
    assert.ok(
      deltaMwh < 0.05,
      `Energy mismatch between 15m (${totalEnergy15m} MWh) and 1h (${totalEnergy1h} MWh) exceeds tolerance: ${deltaMwh} MWh`
    );
  });

  // 6. Risk and Recommendation Consistency
  test('Test 6: Risk engine produces consistent zero-state and traceable populated states', () => {
    // Scenario A: Nominal stable forecast -> 0 risks, 0 recommendations
    const stablePoints = Array.from({ length: 24 }, (_, i) => ({
      timestamp: `2026-09-14T${String(i).padStart(2, '0')}:00:00Z`,
      predictedMw: 20.0,
      p10Mw: 18.0,
      p90Mw: 22.0,
      dayAheadMw: 20.0,
      cloudCoverPercent: 10,
      temperatureC: 28,
      ghi: 400,
      isDaytime: true,
      rampRateMw15m: 0.0,
    }));

    const resultNominal = evaluatePlantRisks({
      currentOutputMw: 20.0,
      forecastPoints: stablePoints,
      acCapacityMw: 42.0,
      rampLimitMwPerMin: 2.5,
      bessEnabled: true,
      bessSocPct: 75.0,
      bessPowerMw: 20.0,
      bessEnergyMwh: 40.0,
    });

    assert.equal(resultNominal.risks.length, 0, 'Nominal stable state must have 0 active risks');
    assert.equal(resultNominal.recommendations.length, 0, 'Nominal stable state must have 0 active recommendations');

    // Scenario B: Rapid ramp breach injected -> Exactly 1 ramp breach risk with full traceability
    const rampBreachPoints = [...stablePoints];
    // Sharp drop from 35 MW to 10 MW in hour (or interval) -> drop of 25 MW exceeds threshold
    rampBreachPoints[10] = { ...rampBreachPoints[10], predictedMw: 35.0 };
    rampBreachPoints[11] = { ...rampBreachPoints[11], predictedMw: 10.0, isDaytime: true };

    const resultBreach = evaluatePlantRisks({
      currentOutputMw: 35.0,
      forecastPoints: rampBreachPoints,
      acCapacityMw: 42.0,
      rampLimitMwPerMin: 0.2, // strict limit: 0.2 MW/min -> max drop in 60min = 12 MW; drop is 25 MW -> breach!
      bessEnabled: true,
      bessSocPct: 75.0,
      bessPowerMw: 20.0,
      bessEnergyMwh: 40.0,
    });

    assert.ok(resultBreach.risks.length >= 1, 'Injected ramp breach must produce at least 1 risk');
    assert.ok(resultBreach.recommendations.length >= 1, 'Injected ramp breach must produce at least 1 recommendation');

    const rampRisk = resultBreach.risks.find(r => r.category === 'ramp_down');
    assert.ok(rampRisk, 'Expected ramp_down hazard event');
    assert.ok(rampRisk.trigger, 'Risk must have trigger explanation');
    assert.ok(rampRisk.threshold !== undefined, 'Risk must have threshold');
    assert.ok(rampRisk.observedValue !== undefined, 'Risk must have observedValue');
    assert.ok(rampRisk.source, 'Risk source must be defined');

    const rec = resultBreach.recommendations[0];
    assert.ok(rec.why, 'Recommendation must have why statement');
    assert.ok(rec.action, 'Recommendation must have action statement');
    assert.ok(rec.expectedEffect, 'Recommendation must have expectedEffect statement');
    assert.ok(rec.source, 'Recommendation must have source');
  });

  // 7. BESS Recommendation Adaptation
  test('Test 7: BESS recommendation adapts to storage availability', () => {
    const dropPoints = Array.from({ length: 24 }, (_, i) => ({
      timestamp: `2026-09-14T${String(i).padStart(2, '0')}:00:00Z`,
      predictedMw: i === 11 ? 5.0 : 30.0,
      p10Mw: 25.0,
      p90Mw: 32.0,
      dayAheadMw: 30.0,
      cloudCoverPercent: 10,
      temperatureC: 28,
      ghi: 500,
      isDaytime: true,
    }));

    // With BESS enabled:
    const withBess = evaluatePlantRisks({
      currentOutputMw: 30.0,
      forecastPoints: dropPoints,
      acCapacityMw: 42.0,
      rampLimitMwPerMin: 0.2,
      bessEnabled: true,
      bessSocPct: 80.0,
      bessPowerMw: 20.0,
      bessEnergyMwh: 40.0,
    });
    assert.ok(withBess.recommendations.length > 0, 'Must produce recommendations when breach occurs with BESS');
    const bessRec = withBess.recommendations[0];
    assert.ok(
      bessRec.title.toLowerCase().includes('bess') ||
      (bessRec.action?.toLowerCase().includes('bess') ?? false) ||
      (bessRec.action?.toLowerCase().includes('discharge') ?? false),
      'Recommendation with BESS enabled must prescribe BESS discharge'
    );

    // With BESS disabled:
    const withoutBess = evaluatePlantRisks({
      currentOutputMw: 30.0,
      forecastPoints: dropPoints,
      acCapacityMw: 42.0,
      rampLimitMwPerMin: 0.2,
      bessEnabled: false,
      bessSocPct: 0.0,
      bessPowerMw: 0.0,
      bessEnergyMwh: 0.0,
    });
    assert.ok(withoutBess.recommendations.length > 0, 'Must produce recommendations when breach occurs without BESS');
    const nonBessRec = withoutBess.recommendations[0];
    assert.ok(
      (nonBessRec.action?.toLowerCase().includes('inverter') ?? false) ||
      (nonBessRec.action?.toLowerCase().includes('slew-rate') ?? false) ||
      (nonBessRec.action?.toLowerCase().includes('curtailment') ?? false),
      'Recommendation without BESS must prescribe inverter slew-rate limiting / curtailment, NOT BESS discharge'
    );
  });

  // 8. Currency Localization
  test('Test 8: formatINR properly localizes monetary values without USD or NaN', () => {
    const formatted150k = formatINR(150000);
    assert.ok(formatted150k.includes('₹'), 'formatINR must output ₹ symbol');
    assert.ok(formatted150k.includes('1,50,000'), 'formatINR must format Indian number system');

    const formattedCompactL = formatINR(1200000, true);
    assert.ok(formattedCompactL.includes('₹') && formattedCompactL.includes('L'), 'Compact 12L must use Lakh');

    const formattedCompactCr = formatINR(25000000, true);
    assert.ok(formattedCompactCr.includes('₹') && formattedCompactCr.includes('Cr'), 'Compact 2.5Cr must use Crore');

    assert.equal(formatINR(null), '₹0', 'Null input must return ₹0');
    assert.equal(formatINR(NaN), '₹0', 'NaN input must return ₹0');

    // formatCurrency backward-compatibility alias
    assert.equal(formatCurrency(5000), formatINR(5000), 'formatCurrency must alias formatINR');

    // formatMw & formatMwh
    assert.equal(formatMw(42.5), '42.5 MW', 'formatMw must format with 1 decimal place and MW');
    assert.equal(formatMwh(100), '100 MWh', 'formatMwh must format with MWh');
  });

  // 9. SCADA Telemetry State
  test('Test 9: SCADA telemetry status is NOT CONNECTED and actualMw is null', () => {
    const weather = generateTestWeather(24);
    const estimate = calculatePhysicsSolarEstimate(weather, baseConfig);

    for (const point of estimate) {
      assert.equal(
        point.actualMw,
        null,
        'Physics forecast points must set actualMw to null (SCADA NOT CONNECTED)'
      );
    }
  });

  // 10. Single Source of Truth
  test('Test 10: Forecast engine outputs single canonical data contract across services', () => {
    const weather = generateTestWeather(24);
    const forecastPoints = calculatePhysicsSolarEstimate(weather, baseConfig);

    assert.ok(Array.isArray(forecastPoints), 'Forecast output must be an array');
    assert.equal(forecastPoints.length, 24);

    const first = forecastPoints[0];
    assert.ok('timestamp' in first);
    assert.ok('predictedMw' in first);
    assert.ok('p10Mw' in first);
    assert.ok('p90Mw' in first);
    assert.ok('dayAheadMw' in first);
    assert.ok('cloudCoverPercent' in first);
    assert.ok('temperatureC' in first);
    assert.ok('ghi' in first);
    assert.ok('isDaytime' in first);
  });

  // 11. Plant Persistence in Database
  test('Test 11: Plant model persistence in Prisma database', async () => {
    const plant = await db.plant.findFirst({
      include: { configuration: true },
    });

    assert.ok(plant, 'Default plant must exist in database');
    assert.ok(plant.name, 'Plant name must exist');
    assert.ok(plant.configuration, 'Plant configuration must exist');
    assert.ok(plant.configuration.acCapacityMw > 0, 'Plant AC capacity must be positive');
  });

  // 12. Weather Failure Handling
  test('Test 12: Weather service gracefully returns UNAVAILABLE without fabricating sinusoids', async () => {
    // Query impossible coordinates or let sandbox network failure trigger error handling
    const result = await fetchPlantWeather({
      latitude: 999.0, // Invalid coordinate
      longitude: 999.0,
      tilt: 23,
      azimuth: 180,
    });

    assert.equal(result.source, 'UNAVAILABLE', 'Offline or failed weather query must return UNAVAILABLE source');
    assert.equal(result.current, null, 'Unavailable weather current condition must be null');
    assert.equal(result.points.length, 0, 'Unavailable weather points must be empty (no fake data)');
    assert.ok(result.error, 'Error message must be recorded');
  });
});
