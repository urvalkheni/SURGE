'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { RiskHeader } from '@/components/risks/risk-header';
import { RiskSummaryStrip } from '@/components/risks/risk-summary-strip';
import { RiskDiagnosticInspector } from '@/components/risks/risk-diagnostic-inspector';
import { RiskLedgerTable } from '@/components/risks/risk-ledger-table';
import { RiskTimeline } from '@/components/risks/risk-timeline';
import { usePlant } from '@/contexts/plant-context';
import type { RiskLedgerEvent, RiskLedgerData } from '@/data/demo-data';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatINR } from '@/lib/formatters';

export default function RisksPage() {
  const { plant, configuration, risks, recommendations, isLoading } = usePlant();

  const [selectedSeverity, setSelectedSeverity] = React.useState('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [selectedHorizon, setSelectedHorizon] = React.useState<'24h' | '48h' | '72h'>('72h');
  const [selectedRiskId, setSelectedRiskId] = React.useState<string>('');

  // Map dynamic RiskEvent[] from PlantContext to RiskLedgerEvent[] format
  const dynamicEvents: RiskLedgerEvent[] = React.useMemo(() => {
    if (!risks || risks.length === 0) return [];

    const now = Date.now();
    const horizonHours = selectedHorizon === '24h' ? 24 : selectedHorizon === '48h' ? 48 : 72;
    const horizonCutoff = now + horizonHours * 3600 * 1000;

    return risks
      .filter((r) => new Date(r.startWindowUtc).getTime() <= horizonCutoff)
      .map((r) => {
        const severity: 'HIGH' | 'MODERATE' | 'LOW' =
          r.severity === 'critical' || r.severity === 'high' ? 'HIGH' : r.severity === 'medium' ? 'MODERATE' : 'LOW';

        let category: 'RAMP RATE' | 'OVER-GENERATION' | 'CURTAILMENT' | 'EQUIPMENT' = 'RAMP RATE';
        if (r.category === 'over_generation') category = 'OVER-GENERATION';
        else if (r.category === 'inverter_clip') category = 'EQUIPMENT';
        else if (r.category === 'under_generation') category = 'CURTAILMENT';

        const matchingRec = recommendations.find((rec) => rec.riskId === r.id || rec.id === r.suggestedActionId);
        const startTime = new Date(r.startWindowUtc);
        const endTime = new Date(r.endWindowUtc);

        const timeWindow = `${startTime.toLocaleDateString([], { weekday: 'short' })} ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const tariffConfigured = (configuration?.energyPricePerMwh ?? 0) > 0;
        const exposureInr = tariffConfigured ? Math.round((configuration.energyPricePerMwh ?? 0) * Math.abs(r.deltaMw)) : 0;
        const exposureInrFormatted = tariffConfigured ? formatINR(exposureInr) : 'Tariff Not Configured';

        return {
          id: r.id,
          severity,
          category,
          timeWindow,
          title: r.headline,
          description: r.description,
          magnitude: `${r.deltaMw > 0 ? '-' : '+'}${Math.abs(r.deltaMw)} MW${r.rampRateMwPerMin ? ` (${r.rampRateMwPerMin} MW/min ramp)` : ''}`,
          gridImpact: r.category === 'ramp_down'
            ? `Breaches plant ramp tolerance (${configuration?.rampLimitMwPerMin || 2.5} MW/min)`
            : 'Schedule deviation warning',
          actionId: matchingRec?.id || r.suggestedActionId || 'N/A',
          status: 'ACTIVE',
          leadTimeMinutes: r.leadTimeMinutes || 30,
          rootCause: r.rootCause,
          penaltyExposureUsd: exposureInr,
          penaltyExposureInr: exposureInrFormatted,
          frequencySensitivity: severity === 'HIGH' ? 'Elevated (Interconnect ramp stress)' : 'Nominal',
          causalChain: [
            {
              step: 1,
              time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              label: 'Atmospheric Transient Influx',
              detail: r.rootCause,
            },
            {
              step: 2,
              time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              label: `Generation Shift (${r.deltaMw > 0 ? '-' : '+'}${Math.abs(r.deltaMw)} MW)`,
              detail: `Inverter AC injection departs by ${Math.abs(r.deltaMw)} MW from nominal commitment profile.`,
            },
            {
              step: 3,
              time: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              label: 'Tolerance Evaluation',
              detail: r.category === 'ramp_down'
                ? `Exceeds plant ramp limit of ${configuration?.rampLimitMwPerMin || 2.5} MW/min.`
                : 'Asset operates at margin of schedule corridor.',
            },
          ],
          mitigation: {
            actionId: matchingRec?.id || 'N/A',
            label: matchingRec?.title || 'Monitor telemetry & alert grid operator',
            resultingRamp: matchingRec ? `< ${configuration?.rampLimitMwPerMin || 2.5} MW/min (Compliant)` : 'Unmitigated',
            penaltyMitigated: tariffConfigured ? `${exposureInrFormatted} protected` : 'Protected (Nominal)',
            efficacyScorePercent: matchingRec?.frequencyProtectionScore || 90,
          },
        };
      });
  }, [risks, recommendations, configuration, selectedHorizon]);

  // Sync selectedRiskId
  React.useEffect(() => {
    if (dynamicEvents.length > 0 && (!selectedRiskId || !dynamicEvents.some((e) => e.id === selectedRiskId))) {
      setSelectedRiskId(dynamicEvents[0].id);
    }
  }, [dynamicEvents, selectedRiskId]);

  // Filter events based on toolbar selections
  const filteredEvents = React.useMemo(() => {
    return dynamicEvents.filter((evt) => {
      if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) return false;
      return true;
    });
  }, [dynamicEvents, selectedSeverity, selectedCategory]);

  // Selected risk object for diagnostic inspector
  const activeSelectedRisk = React.useMemo(() => {
    return dynamicEvents.find((e) => e.id === selectedRiskId) || dynamicEvents[0] || null;
  }, [dynamicEvents, selectedRiskId]);

  // Derive dynamic summary strip metrics
  const summary: RiskLedgerData['summary'] = React.useMemo(() => {
    const activeHigh = dynamicEvents.filter((e) => e.severity === 'HIGH').length;
    const activeMod = dynamicEvents.filter((e) => e.severity === 'MODERATE').length;
    const activeLow = dynamicEvents.filter((e) => e.severity === 'LOW').length;

    const maxRampNum = risks.reduce((max, r) => Math.max(max, r.rampRateMwPerMin || 0), 0);
    const rampLimitStr = `${configuration?.rampLimitMwPerMin || 2.5} MW/min`;

    const totalExposure = dynamicEvents.reduce((sum, e) => sum + e.penaltyExposureUsd, 0);
    const totalExposureInr = (configuration?.energyPricePerMwh ?? 0) > 0
      ? formatINR(totalExposure)
      : 'Tariff Not Configured';

    const aggregateScore = Math.min(100, activeHigh * 35 + activeMod * 15 + activeLow * 5);
    const complianceStatus = activeHigh > 0 ? 'ELEVATED' : activeMod > 0 ? 'MONITORING' : 'NOMINAL';

    return {
      activeHighRisks: activeHigh,
      totalIdentified72h: dynamicEvents.length,
      maxProjectedRamp: maxRampNum > 0 ? `-${maxRampNum.toFixed(2)} MW/min` : '0.00 MW/min',
      rampThreshold: rampLimitStr,
      financialExposureUsd: totalExposure,
      financialExposureInr: totalExposureInr,
      gridComplianceStatus: complianceStatus,
      aggregateRiskScore: aggregateScore,
    };
  }, [dynamicEvents, risks, configuration]);

  // Derive chronological timeline nodes
  const timeline = React.useMemo(() => {
    return dynamicEvents.map((evt, idx) => {
      const parts = evt.timeWindow.split(' ');
      return {
        id: `node-${evt.id}-${idx}`,
        eventId: evt.id,
        dateLabel: parts[0] || 'Today',
        timeLabel: parts[1] || '12:00',
        title: evt.title,
        severity: evt.severity,
        category: evt.category,
      };
    });
  }, [dynamicEvents]);

  const handleResetFilters = () => {
    setSelectedSeverity('ALL');
    setSelectedCategory('ALL');
    setSelectedHorizon('72h');
  };

  const highCount = dynamicEvents.filter((e) => e.severity === 'HIGH').length;
  const modCount = dynamicEvents.filter((e) => e.severity === 'MODERATE').length;
  const lowCount = dynamicEvents.filter((e) => e.severity === 'LOW').length;

  return (
    <AppShell activePlantId={plant?.id || 'current'}>
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
          plantName={plant?.name}
          capacityMw={configuration?.acCapacityMw}
          location={plant ? `${plant.city}, ${plant.state}` : 'Gujarat, India'}
          rampThreshold={`${configuration?.rampLimitMwPerMin || 2.5} MW/min`}
          aggregateRiskScore={summary.aggregateRiskScore}
          activeHighCount={highCount}
          activeModerateCount={modCount}
          activeLowCount={lowCount}
        />

        {/* 2. Risk Metric Summary Strip */}
        <RiskSummaryStrip summary={summary} />

        {/* Empty State when no risks exist */}
        {dynamicEvents.length === 0 && !isLoading && (
          <Card className="border-border/80 bg-[#F9FAF8] shadow-card mb-6">
            <CardContent className="py-8 px-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-[#EBF5EE] border border-[#BCE3CA] flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      No Active Operational Risks Detected
                    </h3>
                    <p className="text-xs text-foreground-secondary">
                      Continuous deterministic physics evaluation confirms plant operates within configured tolerances.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-primary font-semibold bg-surface px-3 py-1.5 rounded-md border border-[#BCE3CA] self-start sm:self-auto">
                  <CheckCircle2 className="size-4" />
                  <span>GRID INJECTION · NOMINAL</span>
                </div>
              </div>

              {/* Operational Evaluated Checks Grid */}
              <div>
                <h4 className="text-[11px] font-mono uppercase font-bold text-muted mb-3">
                  Evaluated Grid &amp; Operational Safety Checks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Ramp Rate Compliance</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      {summary.maxProjectedRamp}
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>Within {configuration?.rampLimitMwPerMin || 2.5} MW/min limit</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Inverter Headroom</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      Rated {configuration?.acCapacityMw || 42} MW
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>Thermal clipping headroom ok</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Grid Curtailment</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      Not Required
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>Interconnect corridor clear</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">BESS Storage Posture</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      {configuration?.bessEnabled ? `${configuration.bessSocPct}% SOC` : 'No BESS Assigned'}
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>{configuration?.bessEnabled ? 'Reserve headroom ready' : 'Passive inverter control'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Deep Diagnostic Inspector for Selected Risk */}
        {activeSelectedRisk && (
          <RiskDiagnosticInspector
            selectedRisk={activeSelectedRisk}
            gridNode={configuration?.gridNode || 'GETCO-220KV'}
            rampLimit={`${configuration?.rampLimitMwPerMin || 2.5} MW/min`}
          />
        )}

        {/* 4. Interactive Master Risk Ledger Table */}
        {dynamicEvents.length > 0 && (
          <RiskLedgerTable
            events={filteredEvents}
            selectedRiskId={selectedRiskId}
            onSelectRisk={setSelectedRiskId}
          />
        )}

        {/* 5. Chronological Risk Projection Timeline */}
        {timeline.length > 0 && (
          <RiskTimeline
            timeline={timeline}
            selectedRiskId={selectedRiskId}
            onSelectRisk={setSelectedRiskId}
          />
        )}
      </PageContainer>
    </AppShell>
  );
}
