import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getActivePlantForUser } from '@/services/plant/plant.service';
import { fetchPlantWeather, clearWeatherCache, buildMinutely15Points } from '@/services/weather/open-meteo.service';
import {
  calculatePhysicsSolarEstimate,
  aggregate15mToHourly,
  calculateForecastEnergyMwh,
} from '@/services/physics';
import { evaluatePlantRisks } from '@/services/risk';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { plant, configuration } = await getActivePlantForUser(userId);

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const resolution = searchParams.get('resolution') === '15m' ? '15m' : '1h';

    // Fetch live weather from Open-Meteo using plant parameters
    const weather = await fetchPlantWeather(
      {
        latitude: plant.latitude,
        longitude: plant.longitude,
        timezone: plant.timezone,
        tilt: configuration.panelTiltDeg,
        azimuth: configuration.panelAzimuthDeg,
        forecastDays: 3,
      },
      forceRefresh
    );

    // Compute both 15-minute (288 pts) and 1-hour (72 pts) physics forecasts
    const minutely15Points =
      weather.minutely15Points && weather.minutely15Points.length > 0
        ? weather.minutely15Points
        : buildMinutely15Points(weather.points);

    const forecastPoints15m = calculatePhysicsSolarEstimate(minutely15Points, configuration);
    const forecastPoints1h = aggregate15mToHourly(forecastPoints15m);

    // Active forecast points based on requested resolution
    const forecastPoints = resolution === '15m' ? forecastPoints15m : forecastPoints1h;

    // Calculate energy with exact mathematical conservation
    const expectedEnergyMwh = calculateForecastEnergyMwh(forecastPoints1h, 1.0);

    // Resolve canonical current point strictly closest to the current UTC timestamp
    const nowMs = Date.now();
    let currentPoint = forecastPoints[0] || null;
    if (forecastPoints.length > 0) {
      let minDiff = Math.abs(new Date(forecastPoints[0].timestamp).getTime() - nowMs);
      for (let i = 1; i < forecastPoints.length; i++) {
        const diff = Math.abs(new Date(forecastPoints[i].timestamp).getTime() - nowMs);
        if (diff < minDiff) {
          minDiff = diff;
          currentPoint = forecastPoints[i];
        }
      }
    }

    const currentOutputMw = currentPoint?.predictedMw ?? 0;
    const utilizationPercent = Number(
      Math.min(100, Math.max(0, (currentOutputMw / (configuration.acCapacityMw || 42.0)) * 100)).toFixed(1)
    );

    // Evaluate rule-based risks and recommendations
    const { risks, recommendations } = evaluatePlantRisks({
      currentOutputMw,
      acCapacityMw: configuration.acCapacityMw,
      rampLimitMwPerMin: configuration.rampLimitMwPerMin,
      bessEnabled: configuration.bessEnabled,
      bessPowerMw: configuration.bessPowerMw,
      bessEnergyMwh: configuration.bessEnergyMwh,
      bessSocPct: configuration.bessSocPct,
      forecastPoints,
    });

    return NextResponse.json({
      plant,
      configuration,
      weather,
      forecastPoints,
      forecastPoints1h,
      forecastPoints15m,
      expectedEnergyMwh,
      risks,
      recommendations,
      currentPointTimestamp: currentPoint?.timestamp ?? new Date().toISOString(),
      currentOutputMw,
      utilizationPercent,
      resolution,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching current plant intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to resolve current plant telemetry.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plant } = await getActivePlantForUser(userId);
    if (!plant || plant.isDemo) {
      return NextResponse.json(
        { error: 'Demo plant configurations cannot be modified directly. Please onboard your own plant.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      city,
      state,
      latitude,
      longitude,
      acCapacityMw,
      dcCapacityMw,
      panelTiltDeg,
      panelAzimuthDeg,
      inverterEfficiencyPct,
      bessEnabled,
      bessPowerMw,
      bessEnergyMwh,
      rampLimitMwPerMin,
      energyPricePerMwh,
    } = body;

    const { db } = await import('@/lib/db');

    // Invalidate weather cache for this plant since location or orientation is updating
    clearWeatherCache(plant.latitude, plant.longitude);

    // Update plant record if name/location changed
    let updatedPlant = plant;
    if (name || city || state || latitude || longitude) {
      updatedPlant = await db.plant.update({
        where: { id: plant.id },
        data: {
          ...(name ? { name } : {}),
          ...(city ? { city } : {}),
          ...(state ? { state } : {}),
          ...(latitude ? { latitude: Number(latitude) } : {}),
          ...(longitude ? { longitude: Number(longitude) } : {}),
        },
      });
    }

    // Update plant configuration
    const updatedConfig = await db.plantConfiguration.update({
      where: { plantId: plant.id },
      data: {
        ...(acCapacityMw !== undefined ? { acCapacityMw: Number(acCapacityMw) } : {}),
        ...(dcCapacityMw !== undefined ? { dcCapacityMw: Number(dcCapacityMw) } : {}),
        ...(panelTiltDeg !== undefined ? { panelTiltDeg: Number(panelTiltDeg) } : {}),
        ...(panelAzimuthDeg !== undefined ? { panelAzimuthDeg: Number(panelAzimuthDeg) } : {}),
        ...(inverterEfficiencyPct !== undefined ? { inverterEfficiencyPct: Number(inverterEfficiencyPct) } : {}),
        ...(bessEnabled !== undefined ? { bessEnabled: Boolean(bessEnabled) } : {}),
        ...(bessPowerMw !== undefined ? { bessPowerMw: Number(bessPowerMw) } : {}),
        ...(bessEnergyMwh !== undefined ? { bessEnergyMwh: Number(bessEnergyMwh) } : {}),
        ...(rampLimitMwPerMin !== undefined ? { rampLimitMwPerMin: Number(rampLimitMwPerMin) } : {}),
        ...(energyPricePerMwh !== undefined ? { energyPricePerMwh: Number(energyPricePerMwh) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      plant: updatedPlant,
      configuration: updatedConfig,
      message: 'Plant configuration updated successfully.',
    });
  } catch (error) {
    console.error('Error updating plant configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update plant configuration.' },
      { status: 500 }
    );
  }
}
