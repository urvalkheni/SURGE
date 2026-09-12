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
import { usePlant } from '@/contexts/plant-context';
import type { RecommendationData, ExecutionStep, RecommendationAlternative, ActionHistoryLog } from '@/data/demo-data';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatINR } from '@/lib/formatters';

export default function RecommendationsPage() {
  const { plant, configuration, recommendations, risks, isLoading } = usePlant();

  const isBessActive = Boolean(configuration?.bessEnabled && (configuration?.bessPowerMw ?? 0) > 0);
  const defaultSetpoint = isBessActive
    ? recommendations[0]?.dispatchPlan?.setpointMw ?? Number(((configuration?.bessPowerMw ?? 20) * 0.9).toFixed(1))
    : 0;

  const [setpointMw, setSetpointMw] = React.useState(defaultSetpoint);

  React.useEffect(() => {
    setSetpointMw(defaultSetpoint);
  }, [defaultSetpoint]);

  const handleScrollToSandbox = () => {
    const el = document.getElementById('setpoint-sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Derive dynamic RecommendationData
  const dynamicData: RecommendationData | null = React.useMemo(() => {
    if (!recommendations || recommendations.length === 0) return null;

    const primaryRec = recommendations[0];
    const relatedRisk = risks.find((r) => r.id === primaryRec.riskId || r.suggestedActionId === primaryRec.id);
    const dropMw = relatedRisk ? Math.abs(relatedRisk.deltaMw) : 8.5;

    const dispatchTime = primaryRec.dispatchPlan?.startTimeUtc
      ? new Date(primaryRec.dispatchPlan.startTimeUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '14:40';

    const maxBatteryMw = configuration?.bessPowerMw ?? 20.0;
    const maxBatteryMwh = configuration?.bessEnergyMwh ?? 40.0;
    const currentSoc = configuration?.bessSocPct ?? 68.0;
    const durationMin = primaryRec.dispatchPlan?.durationMinutes ?? 45;
    const energyUsedMwh = (setpointMw * (durationMin / 60));
    const socDepletion = Number(((energyUsedMwh / Math.max(1, maxBatteryMwh)) * 100).toFixed(1));
    const postSoc = Number(Math.max(0, currentSoc - socDepletion).toFixed(1));

    const tariffConfigured = (configuration?.energyPricePerMwh ?? 0) > 0;
    const financialText = tariffConfigured
      ? `Mitigates estimated ${formatINR(setpointMw * (configuration?.energyPricePerMwh ?? 0))} in schedule imbalance`
      : 'Maintains schedule tolerance band (Tariff unconfigured)';

    const bessSteps: ExecutionStep[] = [
      {
        step: 1,
        timeIst: `${dispatchTime} (-10m)`,
        title: `Verify BESS SOC ≥ 25%`,
        detail: `Telemetry confirms battery at ${currentSoc}% SOC (${((currentSoc / 100) * maxBatteryMwh).toFixed(1)} MWh stored energy). State: Standby.`,
        status: 'COMPLETED',
      },
      {
        step: 2,
        timeIst: `${dispatchTime} (-5m)`,
        title: 'Issue Pre-Dispatch Arming Signal',
        detail: 'Arm PCS bi-directional inverters into Fast Ramp-Smoothing response mode.',
        status: 'READY',
      },
      {
        step: 3,
        timeIst: `${dispatchTime}`,
        title: `Initiate ${setpointMw.toFixed(1)} MW Smoothing Discharge`,
        detail: `Pre-discharge ramps up synchronized with cloud transient advance to stabilize interconnect busbar.`,
        status: 'PENDING',
      },
      {
        step: 4,
        timeIst: `${dispatchTime} (+15m)`,
        title: 'Active Closed-Loop Smoothing',
        detail: `Controller dynamically modulates BESS injection matching observed solar irradiance drop.`,
        status: 'PENDING',
      },
      {
        step: 5,
        timeIst: `${dispatchTime} (+${durationMin}m)`,
        title: 'Return BESS to Standby',
        detail: `Solar irradiance recovers; ramp gradient stabilizes within tolerance; BESS returns to standby state.`,
        status: 'PENDING',
      },
    ];

    const nonBessSteps: ExecutionStep[] = [
      {
        step: 1,
        timeIst: `${dispatchTime} (-10m)`,
        title: 'Verify Inverter Communications & Substation Telemetry',
        detail: 'Check telemetry link across inverter group controllers. Health status nominal.',
        status: 'COMPLETED',
      },
      {
        step: 2,
        timeIst: `${dispatchTime} (-5m)`,
        title: 'Issue Inverter Ramp Slew-Rate Limiting Signal',
        detail: 'Set active power change gradient to nominal ramp limit to prevent steep drop slope.',
        status: 'READY',
      },
      {
        step: 3,
        timeIst: `${dispatchTime}`,
        title: 'Transmit Grid Dispatch Coordinator Advisory',
        detail: 'Alert regional control center regarding incoming irradiance transient.',
        status: 'PENDING',
      },
      {
        step: 4,
        timeIst: `${dispatchTime} (+30m)`,
        title: 'Monitor Atmospheric Clearance',
        detail: 'Track solar radiation recovery via onsite pyranometer sensors.',
        status: 'PENDING',
      },
      {
        step: 5,
        timeIst: `${dispatchTime} (+60m)`,
        title: 'Restore Nominal Inverter Tracking',
        detail: 'Resume full MPPT maximum power point tracking.',
        status: 'PENDING',
      },
    ];

    const bessAlternatives: RecommendationAlternative[] = [
      {
        id: 'opt-a',
        title: 'Option A (Recommended): BESS Ramp Smoothing',
        action: `Discharge ${setpointMw.toFixed(1)} MW from battery storage during transient (${dispatchTime})`,
        compliancePercent: 98.0,
        financialEffect: tariffConfigured ? 'Net schedule protection' : 'Schedule preserved',
        tradeoffs: `${socDepletion}% battery throughput; preserves clean generation`,
        isRecommended: true,
        badge: 'RECOMMENDED',
      },
      {
        id: 'opt-b',
        title: 'Option B: Inverter Pre-Curtailment',
        action: 'Pre-emptively derate solar inverters prior to cloud arrival',
        compliancePercent: 95.0,
        financialEffect: 'Discards clean generation',
        tradeoffs: 'Guarantees compliance slope but sacrifices unrecovered solar MWh',
        isRecommended: false,
        badge: 'SUB-OPTIMAL',
      },
      {
        id: 'opt-c',
        title: 'Option C: Unbuffered Schedule Deficit (Do Nothing)',
        action: 'Maintain current setpoints and let generation track cloud shading naturally',
        compliancePercent: 40.0,
        financialEffect: 'Schedule departure',
        tradeoffs: 'Violates ramp rate tolerance; requires grid coordinator intervention',
        isRecommended: false,
        badge: 'NON-COMPLIANT',
      },
    ];

    const nonBessAlternatives: RecommendationAlternative[] = [
      {
        id: 'opt-a',
        title: 'Option A (Recommended): Inverter Slew-Rate Limiting',
        action: 'Throttle inverter active power change gradient to match grid ramp tolerance',
        compliancePercent: 88.0,
        financialEffect: 'Zero storage capex',
        tradeoffs: 'Minor energy spill; smooths interconnect slope',
        isRecommended: true,
        badge: 'RECOMMENDED',
      },
      {
        id: 'opt-b',
        title: 'Option B: Immediate Grid Coordinator Notice',
        action: 'Send urgent deviation notification to system operator for spinning reserve call',
        compliancePercent: 75.0,
        financialEffect: 'Possible balancing charges',
        tradeoffs: 'Rely on regional grid reserves to absorb ramp deficit',
        isRecommended: false,
        badge: 'SUB-OPTIMAL',
      },
      {
        id: 'opt-c',
        title: 'Option C: Do Nothing (Allow Ramp Rate Departure)',
        action: 'Take no automated action; let inverter output collapse with cloud front',
        compliancePercent: 35.0,
        financialEffect: 'Schedule departure',
        tradeoffs: 'Uncontrolled ramp-down rate at interconnect busbar',
        isRecommended: false,
        badge: 'NON-COMPLIANT',
      },
    ];

    return {
      plant: `${plant?.name || 'Ahmedabad Solar Plant'} · ${configuration?.acCapacityMw || 42} MW`,
      activePrescriptionsCount: {
        immediate: recommendations.filter((r) => r.priority === 'urgent').length,
        scheduled: recommendations.filter((r) => r.priority === 'standard').length,
        advisory: recommendations.filter((r) => r.priority === 'routine').length,
      },
      mode: 'OPERATOR-IN-THE-LOOP (Supervised Dispatch)',
      safetyInterlock: 'SCADA Write-Back: Not Connected (Read-Only Safety)',
      primary: {
        id: primaryRec.id,
        title: primaryRec.title,
        targetRiskId: primaryRec.riskId,
        targetWindow: `${dispatchTime} (${durationMin} min window)`,
        priority: primaryRec.priority === 'urgent' ? 'HIGH' : 'MEDIUM',
        causalArchitecture: {
          trigger: primaryRec.riskSummary,
          rootCause: primaryRec.rootCause,
          prescribedAction: primaryRec.prescribedAction,
          netEffect: primaryRec.expectedImpact,
          financialImpact: financialText,
          confidencePercent: primaryRec.frequencyProtectionScore || 92,
        },
        parameters: {
          targetAsset: primaryRec.dispatchPlan?.targetAsset || (isBessActive ? `Plant BESS Unit (${maxBatteryMw} MW / ${maxBatteryMwh} MWh)` : 'Inverter Master Controller'),
          setpointMw,
          currentSocPercent: currentSoc,
          minSocThresholdPercent: 15.0,
          expectedSocDepletionPercent: socDepletion,
          postDispatchSocPercent: postSoc,
          armingLeadTimeMinutes: 5,
          dispatchDurationMinutes: durationMin,
        },
        executionSteps: isBessActive ? bessSteps : nonBessSteps,
        alternatives: isBessActive ? bessAlternatives : nonBessAlternatives,
      },
      sandboxModel: {
        nominalDropMw: dropMw,
        cercRampLimit: -(configuration?.rampLimitMwPerMin || 2.5),
        baselineRamp: Number((-dropMw / 15).toFixed(2)),
        maxBatteryPowerMw: maxBatteryMw,
      },
    };
  }, [recommendations, risks, plant, configuration, setpointMw, isBessActive]);

  // Dynamic audit logs or nominal placeholder
  const logs: ActionHistoryLog[] = React.useMemo(() => {
    if (!recommendations || recommendations.length === 0) return [];
    return [
      {
        id: 'LOG-READY',
        timestamp: 'Real-Time Active',
        recId: recommendations[0].id,
        action: recommendations[0].title,
        targetAsset: recommendations[0].dispatchPlan?.targetAsset || 'Plant Master Controller',
        operator: 'SUPERVISED OPERATOR',
        status: 'SIMULATED EXECUTED',
        complianceResult: 'Grid Ramp Tolerance Preserved',
      },
    ];
  }, [recommendations]);

  return (
    <AppShell activePlantId={plant?.id || 'current'}>
      <PageContainer>
        {/* 1. Header with Plant, Badges, and Prescriptions */}
        {dynamicData && <RecommendationsHeader data={dynamicData} />}

        {/* Empty state when no recommendations exist */}
        {!dynamicData && !isLoading && (
          <Card className="border-border/80 bg-[#F9FAF8] shadow-card mb-6">
            <CardContent className="py-8 px-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-[#EBF5EE] border border-[#BCE3CA] flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      No Operational Interventions Required
                    </h3>
                    <p className="text-xs text-foreground-secondary">
                      Deterministic solar physics models indicate plant operates within safe grid dispatch limits without manual overrides.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-primary font-semibold bg-surface px-3 py-1.5 rounded-md border border-[#BCE3CA] self-start sm:self-auto">
                  <CheckCircle2 className="size-4" />
                  <span>AUTONOMOUS DISPATCH · NOMINAL</span>
                </div>
              </div>

              {/* Operational Posture Checklist */}
              <div>
                <h4 className="text-[11px] font-mono uppercase font-bold text-muted mb-3">
                  Evaluated Dispatch &amp; Asset Operational Posture
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Inverter Tracking</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      Full MPPT Active
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>No derating or curtailment needed</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Ramp Slew-Rate</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      Nominal Gradient
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>Within {configuration?.rampLimitMwPerMin || 2.5} MW/min limit</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Storage Dispatch</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      {configuration?.bessEnabled ? `${configuration.bessSocPct}% SOC Standby` : 'Passive Operation'}
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>{configuration?.bessEnabled ? 'Reserve ready for transients' : 'No storage configured'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface border border-border-subtle">
                    <span className="text-[10px] font-mono text-muted uppercase block">Operator Action</span>
                    <div className="font-mono text-base font-bold text-foreground mt-0.5">
                      None Required
                    </div>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="size-3" />
                      <span>Operating in nominal state</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. Hero Action Prescription Card */}
        {dynamicData && (
          <PrimaryRecommendationPanel
            recommendation={dynamicData.primary}
            overrideSetpointMw={setpointMw}
            onModifyClick={handleScrollToSandbox}
          />
        )}

        {/* 3. Action Execution Procedure Roadmap */}
        {dynamicData && <ActionTimelineCard steps={dynamicData.primary.executionSteps} />}

        {/* 4. Alternative Operational Strategies Trade-off Matrix */}
        {dynamicData && <AlternativeActionsTable alternatives={dynamicData.primary.alternatives} />}

        {/* 5. Interactive Operator Setpoint Override Sandbox (Only if BESS is enabled) */}
        {dynamicData && isBessActive && (
          <OperatorOverrideSandbox
            setpointMw={setpointMw}
            onSetpointChange={setSetpointMw}
            onResetDefault={() => setSetpointMw(defaultSetpoint)}
            bessEnabled={configuration?.bessEnabled}
            maxPowerMw={configuration?.bessPowerMw}
            bessEnergyMwh={configuration?.bessEnergyMwh}
            currentSoc={configuration?.bessSocPct}
            rampLimitMwPerMin={configuration?.rampLimitMwPerMin}
            nominalDropMw={dynamicData.sandboxModel.nominalDropMw}
            energyPricePerMwh={configuration?.energyPricePerMwh}
          />
        )}

        {/* 6. Recent Operational Decisions Audit Log */}
        {logs.length > 0 && <ActionHistoryLogPanel logs={logs} />}
      </PageContainer>
    </AppShell>
  );
}
