'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sliders, RotateCcw, BatteryCharging } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/formatters';

export interface OperatorOverrideSandboxProps {
  setpointMw: number;
  onSetpointChange: (val: number) => void;
  onResetDefault: () => void;
  bessEnabled?: boolean;
  maxPowerMw?: number;
  bessEnergyMwh?: number;
  currentSoc?: number;
  rampLimitMwPerMin?: number;
  nominalDropMw?: number;
  energyPricePerMwh?: number;
}

export function OperatorOverrideSandbox({
  setpointMw,
  onSetpointChange,
  onResetDefault,
  bessEnabled = true,
  maxPowerMw = 20.0,
  bessEnergyMwh = 40.0,
  currentSoc = 68.0,
  rampLimitMwPerMin = 2.5,
  nominalDropMw = 8.7,
  energyPricePerMwh = 0,
}: OperatorOverrideSandboxProps) {
  if (!bessEnabled || maxPowerMw <= 0) {
    return null;
  }

  const maxPower = Math.max(1, maxPowerMw);
  const baselineDrop = nominalDropMw;
  const residualDrop = Math.max(0, baselineDrop - setpointMw);
  const resultingRamp = Number((-residualDrop / 15).toFixed(2));
  const isCompliant = Math.abs(resultingRamp) <= rampLimitMwPerMin;
  const isOptimal = setpointMw >= baselineDrop * 0.7 && setpointMw <= maxPower;

  const compliancePercent = isCompliant
    ? Math.min(99.0, Number((85 + (setpointMw / maxPower) * 14).toFixed(1)))
    : Math.max(40.0, Number((40 + (setpointMw / maxPower) * 45).toFixed(1)));

  const tariffConfigured = energyPricePerMwh > 0;
  const exposureInr = tariffConfigured ? Math.round(residualDrop * energyPricePerMwh) : 0;
  const avoidedInr = tariffConfigured ? Math.round(setpointMw * energyPricePerMwh) : 0;

  const dispatchDurationMinutes = 45;
  const energyDispatchedMwh = (setpointMw * (dispatchDurationMinutes / 60));
  const maxEnergy = Math.max(1, bessEnergyMwh);
  const socDepletionPercent = Number(((energyDispatchedMwh / maxEnergy) * 100).toFixed(1));
  const postSocPercent = Number(Math.max(0, currentSoc - socDepletionPercent).toFixed(1));

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
            {isOptimal ? 'SAFE OPERATING ZONE' : isCompliant ? 'MARGINAL BUFFER' : 'RAMP EXCURSION'}
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
                Target asset: Plant BESS Unit ({maxPower} MW / {bessEnergyMwh} MWh system)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                {setpointMw.toFixed(1)} <span className="text-sm font-medium text-foreground-secondary">MW</span>
              </span>
              {setpointMw !== Number((maxPower * 0.9).toFixed(1)) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onResetDefault}
                  className="h-8 text-xs font-mono text-muted hover:text-foreground gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset Default</span>
                </Button>
              )}
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={maxPower}
              step="0.5"
              value={setpointMw}
              onChange={(e) => onSetpointChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-[#E3E8E3] rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label={`BESS Discharge Setpoint Slider (0 to ${maxPower} MW)`}
            />

            {/* Slider visual track markings */}
            <div className="flex justify-between text-[11px] font-mono text-muted px-1">
              <span>0.0 MW (Standby)</span>
              <span className="text-warning font-semibold">{(maxPower * 0.5).toFixed(1)} MW</span>
              <span className="text-primary font-bold">{setpointMw.toFixed(1)} MW (Active)</span>
              <span>{maxPower.toFixed(1)} MW (Max)</span>
            </div>
          </div>

          {/* Safe Zone Visual Ribbon */}
          <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-foreground-secondary">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-primary/20 border border-primary" />
              <span className="font-mono">Configured Plant Ramp Limit: {rampLimitMwPerMin} MW/min</span>
            </div>
            <span className="font-mono text-muted text-[11px]">
              Maximum Inverter Capacity: {maxPower} MW
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
              {isCompliant ? `Compliant (Limit: ${rampLimitMwPerMin} MW/min)` : 'Exceeds Tolerance'}
            </p>
          </div>

          {/* Compliance Probability */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Tolerance Compliance</span>
              <div className={cn('font-mono text-xl font-bold mt-1 tabular-nums', compliancePercent >= 90 ? 'text-primary' : 'text-warning')}>
                {compliancePercent.toFixed(1)}%
              </div>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">Physics ramp rate smoothing model</p>
          </div>

          {/* Residual Exposure */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Residual Exposure</span>
              <div className="font-mono text-xl font-bold text-foreground mt-1 tabular-nums">
                {tariffConfigured ? formatINR(exposureInr) : '₹0'}
              </div>
            </div>
            <p className="text-[11px] text-primary font-medium mt-1">
              {tariffConfigured ? `${formatINR(avoidedInr)} mitigated` : 'Tariff unconfigured'}
            </p>
          </div>

          {/* Battery SOC Depletion */}
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted uppercase">Battery SOC Post-Dispatch</span>
              <div className="font-mono text-xl font-bold text-foreground mt-1 tabular-nums">
                {postSocPercent}% <span className="text-xs font-normal text-muted">SOC</span>
              </div>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1 flex items-center gap-1">
              <BatteryCharging className="size-3 text-primary" />
              Depletes {socDepletionPercent}% (from {currentSoc}%)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
