'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecommendationData } from '@/data/demo-data';
import { SimulatedExecutionDialog } from './simulated-execution-dialog';
import {
  Zap,
  CheckCircle2,
  Sliders,
  XCircle,
  Clock,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrimaryRecommendationPanelProps {
  recommendation: RecommendationData['primary'];
  overrideSetpointMw: number;
  onModifyClick: () => void;
}

export function PrimaryRecommendationPanel({
  recommendation,
  overrideSetpointMw,
  onModifyClick,
}: PrimaryRecommendationPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [executionState, setExecutionState] = React.useState<'IDLE' | 'EXECUTED' | 'DISMISSED'>('IDLE');
  const [executedAt, setExecutedAt] = React.useState<string | null>(null);
  const [dismissReason, setDismissReason] = React.useState<string | null>(null);
  const [showDismissMenu, setShowDismissMenu] = React.useState(false);

  const handleConfirmExecution = () => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    setExecutionState('EXECUTED');
    setExecutedAt(timeStr);
  };

  const handleDismiss = (reason: string) => {
    setExecutionState('DISMISSED');
    setDismissReason(reason);
    setShowDismissMenu(false);
  };

  const isExecuted = executionState === 'EXECUTED';
  const isDismissed = executionState === 'DISMISSED';

  return (
    <>
      <Card className={cn('shadow-card mb-6 border-2 transition-all', isExecuted ? 'border-primary' : 'border-primary/40')}>
        {/* Card Header with Status and Priority */}
        <CardHeader className="bg-[#FAFBF9] border-b border-[#BCE3CA]/60 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="critical" className="text-xs font-mono uppercase">
                <AlertOctagon className="size-3 mr-1" />
                URGENT PRESCRIPTION
              </Badge>
              <span className="font-mono text-xs font-bold text-foreground">
                {recommendation.id}
              </span>
              <span className="text-muted">·</span>
              <span className="text-xs font-mono text-foreground-secondary">
                Target: {recommendation.targetRiskId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isExecuted ? (
                <Badge variant="nominal" className="bg-[#EBF5EE] text-primary-dark border-[#BCE3CA] font-mono text-xs font-bold">
                  <CheckCircle2 className="size-3 mr-1 text-primary" />
                  SIMULATED DISPATCH EXECUTED ({executedAt})
                </Badge>
              ) : isDismissed ? (
                <Badge variant="outline" className="bg-[#F2F4F2] text-muted font-mono text-xs">
                  DISMISSED: {dismissReason}
                </Badge>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono text-danger-dark font-semibold">
                  <Clock className="size-3.5 text-danger" />
                  <span>Lead Time: 15 min remaining</span>
                </div>
              )}
            </div>
          </div>

          <CardTitle className="text-lg sm:text-xl font-display font-bold text-foreground mt-2">
            {recommendation.title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
            Target Event: {recommendation.targetWindow} · Inverter Busbar Ramp Mitigation
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Post-execution Banner */}
          {isExecuted && (
            <div className="rounded-lg border border-[#BCE3CA] bg-[#EBF5EE] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-surface border border-primary flex items-center justify-center text-primary shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#0D4F32] font-display">
                    Simulated Dispatch Order Transmitted: AUDIT-TX-8492
                  </span>
                  <p className="text-xs text-[#0D4F32]/80 mt-0.5 font-mono">
                    Setpoint: {overrideSetpointMw.toFixed(1)} MW · SCADA Confirmation: 18ms · BESS Controller Armed
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 bg-surface rounded-md border border-[#BCE3CA]">
                STATUS: COMPLIANT
              </span>
            </div>
          )}

          {/* 4-Part Mental Model Grid: Trigger -> Root Cause -> Action -> Impact */}
          <div>
            <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-muted mb-3">
              Operational Causal Architecture (Trigger → Root Cause → Action → Impact)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                    01 / HAZARD TRIGGER
                  </span>
                  <p className="text-xs text-foreground font-medium mt-1 leading-relaxed">
                    {recommendation.causalArchitecture.trigger}
                  </p>
                </div>
                <div className="text-[11px] text-danger font-mono font-semibold mt-2 pt-2 border-t border-border-subtle">
                  Exceeds Ramp Tolerance
                </div>
              </div>

              <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                    02 / PHYSICAL ROOT CAUSE
                  </span>
                  <p className="text-xs text-foreground font-medium mt-1 leading-relaxed">
                    {recommendation.causalArchitecture.rootCause}
                  </p>
                </div>
                <div className="text-[11px] text-foreground-secondary font-mono mt-2 pt-2 border-t border-border-subtle">
                  Physics Atmospheric Divergence
                </div>
              </div>

              <div className="p-3.5 rounded-md border border-[#BCE3CA] bg-[#F2FAF4] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-dark">
                    03 / PRESCRIBED ACTION
                  </span>
                  <p className="text-xs text-[#0D4F32] font-semibold mt-1 leading-relaxed">
                    {recommendation.causalArchitecture.prescribedAction}
                  </p>
                </div>
                <div className="text-[11px] text-primary font-mono font-bold mt-2 pt-2 border-t border-[#BCE3CA]">
                  Active Setpoint: {overrideSetpointMw.toFixed(1)} MW
                </div>
              </div>

              <div className="p-3.5 rounded-md border border-[#BCE3CA] bg-[#F2FAF4] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-dark">
                    04 / EXPECTED IMPACT
                  </span>
                  <p className="text-xs text-[#0D4F32] font-semibold mt-1 leading-relaxed">
                    {recommendation.causalArchitecture.netEffect}
                  </p>
                </div>
                <div className="text-[11px] text-primary font-mono font-bold mt-2 pt-2 border-t border-[#BCE3CA]">
                  {recommendation.causalArchitecture.financialImpact}
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry & Constraints Summary */}
          <div className="rounded-lg border border-border-subtle bg-[#F9FAF8] p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4">
              <span>Target Asset: <strong className="text-foreground">{recommendation.parameters.targetAsset}</strong></span>
              <span className="text-muted">|</span>
              <span>Current SOC: <strong className="text-foreground">{recommendation.parameters.currentSocPercent}%</strong></span>
              <span className="text-muted">|</span>
              <span>Post-Dispatch SOC: <strong className="text-primary">{recommendation.parameters.postDispatchSocPercent}%</strong></span>
              <span className="text-muted">|</span>
              <span>Physics Model Confidence: <strong className="text-foreground">{recommendation.causalArchitecture.confidencePercent}%</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles className="size-3.5" />
              <span>Supervised Autonomy Eligible</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                disabled={isExecuted}
                className={cn(
                  'h-9 font-semibold text-xs gap-1.5 shadow-subtle',
                  isExecuted
                    ? 'bg-[#EEF2EE] text-muted border border-border'
                    : 'bg-primary hover:bg-primary-dark text-white'
                )}
              >
                <Zap className="size-3.5" />
                <span>{isExecuted ? 'Simulated Dispatch Executed' : 'Simulate Execution (19.0 MW)'}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onModifyClick}
                className="h-9 font-medium text-xs gap-1.5 border-border bg-surface hover:bg-[#EEF2EE]"
              >
                <Sliders className="size-3.5 text-foreground-secondary" />
                <span>Modify Parameters (Sandbox)</span>
              </Button>
            </div>

            {/* Dismiss / Defer Dropdown */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                disabled={isExecuted || isDismissed}
                onClick={() => setShowDismissMenu(!showDismissMenu)}
                className="h-9 text-xs text-muted hover:text-danger font-medium gap-1"
              >
                <XCircle className="size-3.5" />
                <span>Dismiss / Defer</span>
              </Button>

              {showDismissMenu && (
                <div className="absolute right-0 bottom-full mb-1 w-56 rounded-md border border-border bg-surface p-1.5 shadow-lg text-xs z-20 space-y-1">
                  <div className="px-2 py-1 font-semibold text-[11px] text-muted uppercase">
                    Select Deferral Reason
                  </div>
                  {[
                    'Radar shows cloud track diverting',
                    'Manual plant maintenance active',
                    'SLDC grid directive override',
                    'BESS SOC reserved for evening peak',
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleDismiss(reason)}
                      className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-[#EEF2EE] text-foreground text-xs transition-colors cursor-pointer"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <SimulatedExecutionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmExecution}
        recommendation={recommendation}
        overrideSetpointMw={overrideSetpointMw}
      />
    </>
  );
}
