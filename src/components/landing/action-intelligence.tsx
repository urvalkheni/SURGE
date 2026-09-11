'use client';

import * as React from 'react';
import Link from 'next/link';
import { BatteryCharging, ArrowRight, ShieldCheck, Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ActionIntelligence() {
  const [dispatchStatus, setDispatchStatus] = React.useState<'pending' | 'dispatched'>('pending');

  return (
    <div className="w-full bg-surface border border-border rounded-lg shadow-card p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <BatteryCharging className="size-3" />
              STAGE 04 · PRESCRIPTIVE ACTION DISPATCH
            </span>
            <Badge variant="nominal" className="text-[10px] font-mono px-1.5 py-0">
              SIMULATED RECOMMENDATION
            </Badge>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
            Automated Battery Storage (BESS) Ramp Mitigation Plan
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="text-[10px] font-mono">
            ASSET: BESS-01 · 20MW/80MWh
          </Badge>
        </div>
      </div>

      {/* Control-Room Style 4-Stage Card: Risk -> Root Cause -> Action -> Impact */}
      <div className="bg-[#FAFBF9] border border-border rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3 text-xs">
          <span className="font-mono font-bold text-foreground">
            DISPATCH INSTRUCTION · REC-4011
          </span>
          <span className="font-mono text-muted tabular-nums">
            Trigger: 15:00 UTC · Lead Time: 15 min
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Risk */}
          <div className="space-y-1 p-3 rounded-md bg-white border border-border-subtle">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-danger flex items-center gap-1">
              <AlertTriangle className="size-3 text-danger" />
              01. RISK
            </div>
            <div className="font-bold text-foreground text-sm">Cloud Ramp Cliff</div>
            <p className="text-foreground-secondary text-[11px] leading-relaxed">
              38.4 MW generation drops to 19.2 MW in under 45 minutes, violating CAISO ramp thresholds.
            </p>
          </div>

          {/* Root Cause */}
          <div className="space-y-1 p-3 rounded-md bg-white border border-border-subtle">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C98216] flex items-center gap-1">
              <Zap className="size-3 text-[#C98216]" />
              02. ROOT CAUSE
            </div>
            <div className="font-bold text-foreground text-sm">Irradiance Drop</div>
            <p className="text-foreground-secondary text-[11px] leading-relaxed">
              Dense convective cloud front dropping surface GHI from 880 W/m² to 195 W/m².
            </p>
          </div>

          {/* Action */}
          <div className="space-y-1 p-3 rounded-md bg-white border border-primary/30 bg-primary-tint/20">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <BatteryCharging className="size-3 text-primary" />
              03. PRESCRIBED ACTION
            </div>
            <div className="font-bold text-primary-dark text-sm">Discharge BESS 19.0 MW</div>
            <p className="text-foreground-secondary text-[11px] leading-relaxed">
              Pre-condition battery and discharge 19 MW for 78 min to maintain day-ahead schedule.
            </p>
          </div>

          {/* Impact */}
          <div className="space-y-1 p-3 rounded-md bg-white border border-border-subtle">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-dark flex items-center gap-1">
              <ShieldCheck className="size-3 text-primary" />
              04. IMPACT
            </div>
            <div className="font-bold text-foreground text-sm">Zero Grid Deviation</div>
            <p className="text-foreground-secondary text-[11px] leading-relaxed">
              Eliminates frequency breach and protects an estimated $18,400 in imbalance penalties.
            </p>
          </div>
        </div>
      </div>

      {/* Dispatch Controls & Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums text-xs">
        <div className="p-3 rounded-md bg-[#F4F6F4] border border-border-subtle">
          <div className="text-[10px] uppercase text-muted font-semibold">Discharge Setpoint</div>
          <div className="text-base font-bold text-foreground mt-0.5">19.0 MW</div>
          <div className="text-[10px] text-foreground-secondary">Rate: 95% capacity</div>
        </div>

        <div className="p-3 rounded-md bg-[#F4F6F4] border border-border-subtle">
          <div className="text-[10px] uppercase text-muted font-semibold">Response Window</div>
          <div className="text-base font-bold text-foreground mt-0.5 flex items-center gap-1">
            <Clock className="size-3.5 text-primary" />
            <span>15 min</span>
          </div>
          <div className="text-[10px] text-foreground-secondary">Pre-ramp lead time</div>
        </div>

        <div className="p-3 rounded-md bg-[#F4F6F4] border border-border-subtle">
          <div className="text-[10px] uppercase text-muted font-semibold">BESS State of Charge</div>
          <div className="text-base font-bold text-foreground mt-0.5">74.0% SOC</div>
          <div className="text-[10px] text-foreground-secondary">Post-run: 55.2% SOC</div>
        </div>

        <div className="p-3 rounded-md bg-[#F4F6F4] border border-border-subtle">
          <div className="text-[10px] uppercase text-muted font-semibold">Dispatch Execution</div>
          <div className="text-base font-bold mt-0.5 flex items-center gap-1">
            {dispatchStatus === 'dispatched' ? (
              <span className="text-primary flex items-center gap-1 font-semibold">
                <CheckCircle2 className="size-4" />
                ARMED
              </span>
            ) : (
              <span className="text-muted font-semibold">PENDING</span>
            )}
          </div>
          <div className="text-[10px] text-foreground-secondary">SCADA telemetry bus</div>
        </div>
      </div>

      {/* Simulated Interactive Trigger & Link */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground-secondary">
          <Button
            size="sm"
            variant={dispatchStatus === 'dispatched' ? 'outline' : 'primary'}
            onClick={() => setDispatchStatus(dispatchStatus === 'dispatched' ? 'pending' : 'dispatched')}
            className="text-xs font-mono h-8"
          >
            {dispatchStatus === 'dispatched' ? 'Reset Dispatch' : 'Arm Simulated BESS Dispatch'}
          </Button>
          <span className="text-[11px] text-muted hidden sm:inline">
            Simulates automated IEC 61850 inverter setpoint handshake.
          </span>
        </div>

        <Link href="/recommendations" className="self-end sm:self-auto shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark">
            <span>Explore Recommendations</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
