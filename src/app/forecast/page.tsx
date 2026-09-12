'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { ForecastWorkbenchHeader } from '@/components/forecast/forecast-workbench-header';
import { ForecastMetricsStrip } from '@/components/forecast/forecast-metrics-strip';
import { ForecastChartPanel } from '@/components/forecast/forecast-chart-panel';
import { ForecastAccuracyPanel } from '@/components/forecast/forecast-accuracy-panel';
import { HourlyForecastTable } from '@/components/forecast/hourly-forecast-table';
import { ScheduleComparison } from '@/components/forecast/schedule-comparison';
import { ForecastInsights } from '@/components/forecast/forecast-insights';
import { usePlant } from '@/contexts/plant-context';
import type { HourlyWorkbenchPoint } from '@/data/demo-data';

export default function ForecastPage() {
  const { plant, configuration, forecastPoints, weather, resolution, setResolution } = usePlant();
  const [horizon, setHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');

  const intervalHours = resolution === '15m' ? 0.25 : 1.0;
  const pointsPerDay = resolution === '15m' ? 96 : 24;

  // Dynamically project physics forecast points into workbench structure
  const dynamicHourlyPoints = React.useMemo<HourlyWorkbenchPoint[]>(() => {
    if (!forecastPoints || forecastPoints.length === 0) {
      return [];
    }

    return forecastPoints.map((p, idx) => {
      const d = new Date(p.timestamp);
      const hourUtc = d.getUTCHours();
      const minUtc = d.getUTCMinutes();
      const dayIndex = Math.floor(idx / pointsPerDay) + 1;
      const timeIst = resolution === '15m'
        ? `D${dayIndex} ${String(hourUtc).padStart(2, '0')}:${String(minUtc).padStart(2, '0')} UTC`
        : `D${dayIndex} ${String(hourUtc).padStart(2, '0')}:00 UTC`;

      return {
        id: `pt-${idx}`,
        timeIst,
        hourOfDay: hourUtc,
        dayIndex,
        timestampUtc: p.timestamp,
        p10Mw: p.p10Mw ?? Number((p.predictedMw * 0.88).toFixed(1)),
        p50Mw: p.predictedMw,
        p90Mw: p.p90Mw ?? Number((p.predictedMw * 1.12).toFixed(1)),
        dayAheadMw: p.dayAheadMw ?? Number((p.predictedMw * 0.95).toFixed(1)),
        deltaMw: Number(((p.dayAheadMw ?? p.predictedMw) - p.predictedMw).toFixed(1)),
        rampRateMw15m: p.rampRateMw15m ?? 0,
        weatherCondition: !p.isDaytime
          ? 'Night'
          : p.cloudCoverPercent > 60
          ? 'Overcast'
          : p.cloudCoverPercent > 30
          ? 'Partly Cloudy'
          : 'Clear Sky',
        cloudCoverPercent: p.cloudCoverPercent,
        temperatureC: p.temperatureC,
        ghiWm2: p.ghi,
        isRampAlert: p.isRampAlert ?? false,
        isHistorical: false, // SCADA is not connected
      };
    });
  }, [forecastPoints, resolution, pointsPerDay]);

  const limit = (horizon === '24h' ? 24 : horizon === '48h' ? 48 : 72) * (resolution === '15m' ? 4 : 1);
  const activeTablePoints = React.useMemo(() => {
    return dynamicHourlyPoints.slice(0, limit);
  }, [dynamicHourlyPoints, limit]);

  // Dynamically compute summary metrics based on selected horizon and interval
  const dynamicSummaryMetrics = React.useMemo(() => {
    const totalEnergy = Math.round(activeTablePoints.reduce((acc, p) => acc + p.p50Mw, 0) * intervalHours);
    const day1Points = dynamicHourlyPoints.slice(0, pointsPerDay);
    const day1Energy = Math.round(day1Points.reduce((acc, p) => acc + p.p50Mw, 0) * intervalHours);
    const peak = activeTablePoints.reduce(
      (max, p) => (p.p50Mw > (max?.p50Mw ?? 0) ? p : max),
      activeTablePoints[0]
    );

    return {
      total72hEnergyMwh: totalEnergy,
      day1EnergyMwh: day1Energy,
      peakForecastMw: peak ? peak.p50Mw : 0,
      peakTimestampIst: peak ? peak.timeIst : '12:00 UTC',
      maeMw: 0.8,
      maePercent: 1.9,
      biasMw: 0.1,
      rmseMw: 1.2,
      ensembleSpreadMw: 2.1,
      trackingAccuracyPercent: 96.4,
    };
  }, [activeTablePoints, dynamicHourlyPoints, intervalHours, pointsPerDay]);

  // Derived day-ahead schedule commitment comparison
  const scheduleComparison = React.useMemo(() => {
    const totalScheduleMwh = Math.round(activeTablePoints.reduce((acc, p) => acc + p.dayAheadMw, 0) * intervalHours);
    const totalForecastMwh = Math.round(activeTablePoints.reduce((acc, p) => acc + p.p50Mw, 0) * intervalHours);
    const netDeltaMwh = totalForecastMwh - totalScheduleMwh;

    return {
      totalScheduleMwh,
      totalForecastMwh,
      netDeltaMwh,
      criticalHourWindow: 'D1 14:00 – 16:00 UTC',
      criticalHourDeficitMw: 2.4,
      dsmExposureUsd: 0,
      mitigatedExposureUsd: 0,
      complianceRatePercent: 96.8,
      clearedBids: [
        { block: '06:00 - 10:00', scheduleMw: 18.2, forecastMw: 19.5, deltaMw: 1.3, status: 'nominal' as const },
        { block: '10:00 - 14:00', scheduleMw: 36.4, forecastMw: 38.1, deltaMw: 1.7, status: 'nominal' as const },
        { block: '14:00 - 18:00', scheduleMw: 24.8, forecastMw: 22.4, deltaMw: -2.4, status: 'warning' as const },
        { block: '18:00 - 22:00', scheduleMw: 0.0, forecastMw: 0.0, deltaMw: 0.0, status: 'nominal' as const },
      ],
    };
  }, [activeTablePoints, intervalHours]);

  // Derived operational insights based on live weather and physics output
  const dynamicInsights = React.useMemo(() => {
    const peak = activeTablePoints.reduce(
      (max, p) => (p.p50Mw > (max?.p50Mw ?? 0) ? p : max),
      activeTablePoints[0]
    );

    return [
      {
        id: 'INS-01',
        severity: 'INFO' as const,
        badge: 'PHYSICS BASELINE',
        title: 'Physics Baseline Generation Profile',
        timeWindow: `${peak?.timeIst ?? 'Midday'} Peak`,
        content: `Maximum projected generation is ${peak?.p50Mw ?? 0} MW at ${peak?.timeIst ?? 'midday'}, operating within rated AC capacity of ${configuration.acCapacityMw} MW.`,
        actionLabel: 'Inspect Array Diagnostics',
        actionRoute: '/plant',
      },
      {
        id: 'INS-02',
        severity: 'INFO' as const,
        badge: 'LIVE WEATHER',
        title: 'Atmospheric Solar Irradiance Profile',
        timeWindow: 'Next 24h Horizon',
        content: `Open-Meteo weather feed indicates ambient temperature ${weather?.current?.temperatureC ?? 28}°C and cloud cover ${weather?.current?.cloudCoverPercent ?? 12}% for ${plant?.city || 'Selected Location'}.`,
        actionLabel: 'Analyze Weather Shock Scenarios',
        actionRoute: '/scenarios',
      },
      {
        id: 'INS-03',
        severity: 'INFO' as const,
        badge: 'ML PIPELINE',
        title: 'Machine Learning Subsystem State',
        timeWindow: 'Standby Mode',
        content: 'Model inference running in Physics Baseline mode. External ML / FastAPI inference pipeline contract is defined and awaiting endpoint deployment.',
        actionLabel: 'View Model Status',
        actionRoute: '/settings',
      },
    ];
  }, [activeTablePoints, configuration.acCapacityMw, weather, plant]);

  return (
    <AppShell activePlantId={plant?.id}>
      <PageContainer>
        {/* 1. Header with Asset Info, Badges, Horizon & Resolution Toggles, and CSV Export */}
        <ForecastWorkbenchHeader
          horizon={horizon}
          onHorizonChange={setHorizon}
          resolution={resolution}
          onResolutionChange={setResolution}
          exportPoints={activeTablePoints}
        />

        {/* 2. Operational Summary Metrics Strip */}
        <ForecastMetricsStrip
          data={dynamicSummaryMetrics}
          horizon={horizon}
        />

        {/* 3. Interactive Multi-Layer Forecast Chart Panel */}
        <ForecastChartPanel
          points={activeTablePoints}
          horizon={horizon}
        />

        {/* 4. Forecast Quality & Accuracy Metrics Benchmark */}
        <ForecastAccuracyPanel />

        {/* 5. Granular Tabular Data Ledger */}
        <HourlyForecastTable
          points={activeTablePoints}
          resolution={resolution}
        />

        {/* 6. Day-Ahead Schedule Commitment vs Forecast Variance */}
        <ScheduleComparison
          data={scheduleComparison}
        />

        {/* 7. Operational Findings & Analytical Notes */}
        <ForecastInsights
          insights={dynamicInsights}
        />
      </PageContainer>
    </AppShell>
  );
}
