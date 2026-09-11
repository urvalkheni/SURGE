'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { RiskHeader } from '@/components/risks/risk-header';
import { RiskSummaryStrip } from '@/components/risks/risk-summary-strip';
import { RiskDiagnosticInspector } from '@/components/risks/risk-diagnostic-inspector';
import { RiskLedgerTable } from '@/components/risks/risk-ledger-table';
import { RiskTimeline } from '@/components/risks/risk-timeline';
import { riskLedgerData } from '@/data/demo-data';

export default function RisksPage() {
  const [selectedSeverity, setSelectedSeverity] = React.useState('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [selectedHorizon, setSelectedHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');
  const [selectedRiskId, setSelectedRiskId] = React.useState('RSK-2026-0841');

  // Filter events based on toolbar selections
  const filteredEvents = React.useMemo(() => {
    return riskLedgerData.events.filter((evt) => {
      if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedSeverity, selectedCategory]);

  // Selected risk object for diagnostic inspector
  const activeSelectedRisk = React.useMemo(() => {
    return riskLedgerData.events.find((e) => e.id === selectedRiskId) || riskLedgerData.events[0];
  }, [selectedRiskId]);

  const handleResetFilters = () => {
    setSelectedSeverity('ALL');
    setSelectedCategory('ALL');
    setSelectedHorizon('72h');
  };

  return (
    <AppShell activePlantId="ahmedabad-solar-01">
      <PageContainer>
        {/* 1. Risk Header with Plant, Badges, and Filter Toolbar */}
        <RiskHeader
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedHorizon={selectedHorizon}
          onHorizonChange={setSelectedHorizon}
          onResetFilters={handleResetFilters}
        />

        {/* 2. Risk Metric Summary Strip */}
        <RiskSummaryStrip summary={riskLedgerData.summary} />

        {/* 3. Deep Diagnostic Inspector for Selected Risk */}
        <RiskDiagnosticInspector selectedRisk={activeSelectedRisk} />

        {/* 4. Interactive Master Risk Ledger Table */}
        <RiskLedgerTable
          events={filteredEvents}
          selectedRiskId={selectedRiskId}
          onSelectRisk={setSelectedRiskId}
        />

        {/* 5. Chronological Risk Projection Timeline */}
        <RiskTimeline
          timeline={riskLedgerData.timeline}
          selectedRiskId={selectedRiskId}
          onSelectRisk={setSelectedRiskId}
        />
      </PageContainer>
    </AppShell>
  );
}
