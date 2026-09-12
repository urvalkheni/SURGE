'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskLedgerEvent } from '@/data/demo-data';
import { RootCauseChain } from './root-cause-chain';
import { ShieldCheck, ArrowRight, Clock, CloudSun } from 'lucide-react';

export interface RiskDiagnosticInspectorProps {
  selectedRisk: RiskLedgerEvent;
  gridNode?: string;
  rampLimit?: string;
}

export function RiskDiagnosticInspector({ selectedRisk, gridNode = 'GETCO-220KV', rampLimit = '2.5 MW/min' }: RiskDiagnosticInspectorProps) {
  const isCritical = selectedRisk.severity === 'HIGH';

  return (
    <Card className="shadow-card mb-6 border-l-4 border-l-primary">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              variant={isCritical ? 'critical' : selectedRisk.severity === 'MODERATE' ? 'warning' : 'nominal'}
              className="font-mono text-xs uppercase"
            >
              {selectedRisk.severity} SEVERITY
            </Badge>
            <span className="font-mono text-xs font-bold text-foreground">
              {selectedRisk.id}
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs font-mono font-medium text-foreground-secondary">
              {selectedRisk.category}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-foreground-secondary">
            <Clock className="size-3.5 text-primary" />
            <span>Lead Time: <strong className="text-foreground">{selectedRisk.leadTimeMinutes}m</strong> remaining</span>
          </div>
        </div>

        <CardTitle className="text-lg sm:text-xl mt-2 text-foreground">
          {selectedRisk.title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
          {selectedRisk.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Multi-Parameter Impact Matrix */}
        <div>
          <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-muted mb-3">
            Multi-Parameter Impact &amp; Grid Telemetry Matrix
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
              <span className="text-[11px] font-medium text-muted uppercase">Generation Delta</span>
              <div className="font-mono text-lg sm:text-xl font-bold text-danger mt-1">
                {selectedRisk.magnitude.split(';')[0]}
              </div>
              <p className="text-[11px] text-foreground-secondary mt-0.5">Busbar injection delta</p>
            </div>

            <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
              <span className="text-[11px] font-medium text-muted uppercase">Ramp Rate Exceedance</span>
              <div className="font-mono text-lg sm:text-xl font-bold text-danger mt-1">
                {selectedRisk.magnitude.includes('MW/min') ? selectedRisk.magnitude.split('(')[1]?.replace(' ramp)', '') || selectedRisk.magnitude : 'Nominal'}
              </div>
              <p className="text-[11px] text-danger-dark font-medium mt-0.5">Limit: {rampLimit}</p>
            </div>

            <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
              <span className="text-[11px] font-medium text-muted uppercase">Grid Frequency Stress</span>
              <div className="font-mono text-lg sm:text-xl font-bold text-[#92400E] mt-1">
                {selectedRisk.frequencySensitivity.split(' ')[0]}
              </div>
              <p className="text-[11px] text-foreground-secondary mt-0.5 truncate">
                {selectedRisk.frequencySensitivity}
              </p>
            </div>

            <div className="p-3 rounded-md border border-danger/20 bg-danger-tint/15">
              <span className="text-[11px] font-medium text-danger-dark uppercase">Financial Exposure</span>
              <div className="font-mono text-lg sm:text-xl font-bold text-danger-dark mt-1">
                {selectedRisk.penaltyExposureInr !== 'Tariff Not Configured' ? selectedRisk.penaltyExposureInr : '₹0'}
              </div>
              <p className="text-[11px] text-danger-dark/80 mt-0.5">
                {selectedRisk.penaltyExposureInr !== 'Tariff Not Configured' ? 'PPA Imbalance Exposure' : 'Tariff Not Configured'}
              </p>
            </div>
          </div>
        </div>

        {/* Root Cause Physical Indices */}
        <div className="rounded-lg border border-border-subtle bg-[#F9FAF8] p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudSun className="size-4 text-primary" />
            <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-foreground">
              Atmospheric Root Cause Analysis
            </h4>
          </div>
          <p className="text-xs text-foreground-secondary leading-relaxed mb-3">
            {selectedRisk.rootCause}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-foreground-secondary pt-2 border-t border-border-subtle">
            {selectedRisk.opticalDepthTau !== undefined && (
              <span>Cloud Optical Depth (&tau;): <strong className="text-foreground">{selectedRisk.opticalDepthTau}</strong></span>
            )}
            {selectedRisk.dniCollapse && (
              <span>DNI Variation: <strong className="text-danger">{selectedRisk.dniCollapse}</strong></span>
            )}
            <span>Grid Node: <strong className="text-foreground">{gridNode}</strong></span>
          </div>
        </div>

        {/* Visual Causal Chain Flow */}
        <RootCauseChain steps={selectedRisk.causalChain} />

        {/* Recommended Mitigation Callout */}
        <div className="rounded-lg border border-[#BCE3CA] bg-[#EBF5EE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-full bg-surface border border-[#BCE3CA] flex items-center justify-center text-primary shrink-0 mt-0.5">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-foreground">
                  Prescribed Mitigation: {selectedRisk.mitigation.label}
                </span>
                <Badge variant="nominal" className="font-mono text-[10px] py-0">
                  {selectedRisk.mitigation.actionId}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-secondary mt-1">
                <span>Resulting Ramp: <strong className="text-primary font-mono">{selectedRisk.mitigation.resultingRamp}</strong></span>
                <span className="text-muted">|</span>
                <span>Avoided Penalties: <strong className="text-primary font-mono">{selectedRisk.mitigation.penaltyMitigated}</strong></span>
                <span className="text-muted">|</span>
                <span>Efficacy: <strong className="text-foreground font-mono">{selectedRisk.mitigation.efficacyScorePercent}%</strong></span>
              </div>
            </div>
          </div>

          <Link href="/recommendations" className="shrink-0">
            <Button size="sm" className="gap-1.5 h-9 font-medium text-xs bg-primary hover:bg-primary-dark text-white shadow-subtle">
              <span>Simulate Dispatch in Workstation</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
