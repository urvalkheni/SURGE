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
import { forecastWorkbenchData } from '@/data/demo-data';

export default function ForecastPage() {
  const [horizon, setHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');
  const [resolution, setResolution] = React.useState<'15m' | '1h'>('1h');

  // Select points based on temporal resolution
  const activeTablePoints = resolution === '15m' 
    ? forecastWorkbenchData.fifteenMinPoints 
    : forecastWorkbenchData.hourlyPoints;

  return (
    <AppShell activePlantId="ahmedabad-solar-01">
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
          data={forecastWorkbenchData.summaryMetrics}
          horizon={horizon}
        />

        {/* 3. Interactive Multi-Layer Forecast Chart Panel */}
        <ForecastChartPanel
          points={forecastWorkbenchData.hourlyPoints}
          horizon={horizon}
        />

        {/* 4. Forecast Quality & Accuracy Metrics Benchmark */}
        <ForecastAccuracyPanel
          data={forecastWorkbenchData.accuracyMetrics}
        />

        {/* 5. Granular Tabular Data Ledger */}
        <HourlyForecastTable
          points={activeTablePoints}
          resolution={resolution}
        />

        {/* 6. Day-Ahead Schedule Commitment vs Forecast Variance */}
        <ScheduleComparison
          data={forecastWorkbenchData.scheduleComparison}
        />

        {/* 7. Operational Findings & AI Analytical Notes */}
        <ForecastInsights
          insights={forecastWorkbenchData.insights}
        />
      </PageContainer>
    </AppShell>
  );
}
