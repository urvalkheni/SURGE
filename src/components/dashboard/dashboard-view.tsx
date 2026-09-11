'use client';

import * as React from 'react';
import { DashboardHeader } from './dashboard-header';
import { DashboardKpiStrip } from './dashboard-kpi-strip';
import { GenerationOverview } from './generation-overview';
import { CurrentCondition } from './current-condition';
import { RiskSummary } from './risk-summary';
import { RecommendationCard } from './recommendation-card';
import { WeatherSummary } from './weather-summary';
import { OutlookTable } from './outlook-table';
import { ImpactSummary } from './impact-summary';

export function DashboardView() {
  const [horizon, setHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');

  return (
    <div className="w-full space-y-6">
      {/* 1. Operational Command Center Header */}
      <DashboardHeader
        horizon={horizon}
        onHorizonChange={setHorizon}
        className="rounded-lg shadow-card border"
      />

      {/* 2. Primary 5-KPI Command Ribbon */}
      <DashboardKpiStrip />

      {/* 3. Master Operational Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on lg): 72-Hour Generation Forecast Panel */}
        <div className="lg:col-span-8 w-full">
          <GenerationOverview
            horizon={horizon}
            onHorizonChange={setHorizon}
          />
        </div>

        {/* Right Column (4 cols on lg): Real-Time Asset Condition & Risk Radar */}
        <div className="lg:col-span-4 w-full space-y-6">
          <CurrentCondition />
          <RiskSummary />
        </div>
      </div>

      {/* 4. Priority Prescriptive Action Recommendation Card */}
      <RecommendationCard />

      {/* 5. Meteorological Intelligence & 72-Hour Operational Outlook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 w-full">
          <WeatherSummary />
        </div>
        <div className="lg:col-span-7 w-full">
          <OutlookTable />
        </div>
      </div>

      {/* 6. Economic & Grid Compliance Impact Summary */}
      <ImpactSummary />
    </div>
  );
}
