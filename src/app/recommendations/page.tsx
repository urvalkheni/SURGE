'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { RecommendationsHeader } from '@/components/recommendations/recommendations-header';
import { PrimaryRecommendationPanel } from '@/components/recommendations/primary-recommendation-panel';
import { ActionTimelineCard } from '@/components/recommendations/action-timeline-card';
import { AlternativeActionsTable } from '@/components/recommendations/alternative-actions-table';
import { OperatorOverrideSandbox } from '@/components/recommendations/operator-override-sandbox';
import { ActionHistoryLogPanel } from '@/components/recommendations/action-history-log';
import { recommendationData, actionHistoryData } from '@/data/demo-data';

export default function RecommendationsPage() {
  const [setpointMw, setSetpointMw] = React.useState(19.0);

  const handleScrollToSandbox = () => {
    const el = document.getElementById('setpoint-sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppShell activePlantId="ahmedabad-solar-01">
      <PageContainer>
        {/* 1. Header with Plant, Badges, Active Prescriptions, and SCADA Heartbeat */}
        <RecommendationsHeader data={recommendationData} />

        {/* 2. Hero Action Prescription Card (REC-4011) */}
        <PrimaryRecommendationPanel
          recommendation={recommendationData.primary}
          overrideSetpointMw={setpointMw}
          onModifyClick={handleScrollToSandbox}
        />

        {/* 3. Action Execution Procedure Roadmap (5 Steps) */}
        <ActionTimelineCard steps={recommendationData.primary.executionSteps} />

        {/* 4. Alternative Operational Strategies Trade-off Matrix */}
        <AlternativeActionsTable alternatives={recommendationData.primary.alternatives} />

        {/* 5. Interactive Operator Setpoint Override Sandbox */}
        <OperatorOverrideSandbox
          setpointMw={setpointMw}
          onSetpointChange={setSetpointMw}
          onResetDefault={() => setSetpointMw(19.0)}
        />

        {/* 6. Recent Operational Decisions Audit Log */}
        <ActionHistoryLogPanel logs={actionHistoryData} />
      </PageContainer>
    </AppShell>
  );
}
