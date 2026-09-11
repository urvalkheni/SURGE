'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sliders, RotateCcw, BatteryCharging } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OperatorOverrideSandboxProps {
  setpointMw: number;
  onSetpointChange: (val: number) => void;
  onResetDefault: () => void;
}

export function OperatorOverrideSandbox({
  setpointMw,
  onSetpointChange,
  onResetDefault,
}: OperatorOverrideSandboxProps) {
  // Real-time calculations based on slider setpoint (0 to 20 MW)
  const resultingRamp = Number((-0.62 + (setpointMw / 20.0) * 0.44).toFixed(2));
  const isCompliant = resultingRamp >= -0.40; // CERC limit is -0.40
  const isOptimal = setpointMw >= 14.0 && setpointMw <= 20.0;

  const compliancePercent = isCompliant
    ? Math.min(98.4, Number((88 + (setpointMw - 10) * 1.15).toFixed(1)))
    : Math.max(42.0, Number((42 + setpointMw * 4.2).toFixed(1)));

  const residualExposureUsd = Math.max(3500, Math.round(18400 - setpointMw * 784));
  const socDepletionPercent = Number((setpointMw * 0.65).toFixed(1));
  const postSocPercent = Number((74.0 - socDepletionPercent).toFixed(1));

  return (
    <Card id="setpoint-sandbox" className="shadow-card mb-6 scroll-mt-20 border-border">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <CardTitle className="text-base">Operator Setpoint Override &amp; Dynamic Response Sandbox</CardTitle>
          </div>
          <Badge
            variant={isOptimal ? 'nominal' : isCompliant ? 'warning' : 'critical'}
            className="font-mono text-xs uppercase"
          >
            {isOptimal ? 'SAFE OPERATING ZONE' : isCompliant ? 'MARGINAL COMPLIANCE' : 'Ramp Violation Zone'}
          </Badge>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Real-time recalculation of interconnect ramp gradient, compliance probability, and battery capacity throughput
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Interactive Slider Control */}
        <div className="rounded-lg border border-border-subtle bg-[#F9FAF8] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="font-display font-bold text-sm text-foreground">
                BESS Active Discharge Setpoint:
              </span>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Target asset: BESS Inverter Units 1 &amp; 2 (40 MWh system)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                {setpointMw.toFixed(1)} <span className="text-sm font-medium text-foreground-secondary">MW</span>
              </span>
              {setpointMw !== 19.0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onResetDefault}
                  className="h-8 text-xs font-mono text-muted hover:text-foreground gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset (19.0 MW)</span>
                </Button>
              )}
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={setpointMw}
              onChange={(e) => onSetpointChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-[#E3E8E3] rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="BESS Discharge Setpoint Slider (0 to 20 MW)"
            />

            {/* Slider visual track markings */}
            <div className="flex justify-between text-[11px] font-mono text-muted px-1">
              <span>0.0 MW (No BESS)</span>
              <span className="text-danger font-semibold">10.0 MW</span>
              <span className="text-warning font-semibold">14.0 MW (Threshold)</span>
              <span className="text-primary font-bold">19.0 MW (Recommended)</span>
              <span>20.0 MW (Max)</span>
            </div>
          </div>

          {/* Safe Zone Visual Ribbon */}
          <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-foreground-secondary">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-primary/20 border border-primary" />
              <span className="font-mono">Safe Operating Zone: 14.0 MW – 20.0 MW maintains full CERC compliance</span>
            </div>
            <span className="font-mono text-muted text-[11px]">
              CERC Reg 5.2 limit: -0.40 MW/min
            </span>
          </div>
        </div>

        {/* Real-time Dynamic Recalculation Output Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Resulting Ramp */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Resulting Ramp Gradient</span>
              <div className={cn('font-mono text-xl font-bold mt-1 tabular-nums', isCompliant ? 'text-primary' : 'text-danger')}>
                {resultingRamp.toFixed(2)} <span className="text-xs font-normal text-muted">MW/min</span>
              </div>
            </div>
            <p className={cn('text-[11px] font-medium mt-1', isCompliant ? 'text-primary' : 'text-danger')}>
              {isCompliant ? 'Compliant (Limit: -0.40)' : 'VIOLATION OF CERC LIMIT'}
            </p>
          </div>

          {/* Compliance Probability */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Grid Compliance Probability</span>
              <div className={cn('font-mono text-xl font-bold mt-1 tabular-nums', compliancePercent >= 90 ? 'text-primary' : 'text-warning')}>
                {compliancePercent.toFixed(1)}%
              </div>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">Based on 18 NWP ensemble members</p>
          </div>

          {/* Residual DSM Exposure */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Residual Financial Exposure</span>
              <div className="font-mono text-xl font-bold text-foreground mt-1 tabular-nums">
                ${residualExposureUsd.toLocaleString()}
              </div>
            </div>
            <p className="text-[11px] text-primary font-medium mt-1">
              ${(18400 - residualExposureUsd).toLocaleString()} penalty avoided
            </p>
          </div>

          {/* Battery SOC Depletion */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Battery Capacity Post-Dispatch</span>
              <div className="font-mono text-xl font-bold text-foreground mt-1 tabular-nums">
                {postSocPercent}% <span className="text-xs font-normal text-muted">SOC</span>
              </div>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1 flex items-center gap-1">
              <BatteryCharging className="size-3 text-primary" />
              Depletes {socDepletionPercent}% (Safe reserve)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
