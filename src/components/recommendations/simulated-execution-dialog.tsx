'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RecommendationData } from '@/data/demo-data';

export interface SimulatedExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recommendation: RecommendationData['primary'];
  overrideSetpointMw: number;
}

export function SimulatedExecutionDialog({
  isOpen,
  onClose,
  onConfirm,
  recommendation,
  overrideSetpointMw,
}: SimulatedExecutionDialogProps) {
  const [confirmedAuth, setConfirmedAuth] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-full bg-[#EBF5EE] border border-[#BCE3CA] flex items-center justify-center text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-display">Confirm Simulated Dispatch Execution</DialogTitle>
              <DialogDescription className="text-xs">
                Authorizing SCADA closed-loop simulated setpoint transmission
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Dispatch Spec Card */}
          <div className="rounded-md border border-border bg-[#F8FAF8] p-3.5 space-y-2 font-mono">
            <div className="flex justify-between items-center text-muted">
              <span>Prescription ID:</span>
              <strong className="text-foreground">{recommendation.id}</strong>
            </div>
            <div className="flex justify-between items-center text-muted">
              <span>Target Asset:</span>
              <span className="text-foreground font-semibold">{recommendation.parameters.targetAsset}</span>
            </div>
            <div className="flex justify-between items-center text-muted">
              <span>Active Setpoint:</span>
              <span className="text-primary font-bold text-sm">{overrideSetpointMw.toFixed(1)} MW Discharge</span>
            </div>
            <div className="flex justify-between items-center text-muted">
              <span>Ramp Smoothing Window:</span>
              <span className="text-foreground">14:40–15:25 IST (45 min)</span>
            </div>
            <div className="flex justify-between items-center text-muted border-t border-border-subtle pt-1.5">
              <span>Current Battery SOC:</span>
              <span className="text-foreground">{recommendation.parameters.currentSocPercent}% (PASS &gt; 20%)</span>
            </div>
          </div>

          {/* Simulation Disclaimer Notice */}
          <div className="rounded-md border border-warning/40 bg-warning-tint/20 p-3 flex items-start gap-2.5 text-xs text-[#92400E]">
            <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SIMULATED EXECUTION SAFEGUARD:</span>
              <p className="text-[11px] leading-relaxed mt-0.5">
                This will trigger a simulated SCADA write-back signal with audit logging. No live high-voltage switchgear or inverters will be commanded.
              </p>
            </div>
          </div>

          {/* Authorization Checkbox */}
          <label className="flex items-start gap-2.5 p-2 rounded-sm hover:bg-[#F4F6F4] cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedAuth}
              onChange={(e) => setConfirmedAuth(e.target.checked)}
              className="mt-0.5 rounded-xs border-border text-primary focus:ring-primary size-4"
            />
            <span className="text-xs text-foreground select-none">
              I verify the calculated ramp response ({overrideSetpointMw.toFixed(1)} MW) and authorize the simulated BESS dispatch sequence.
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!confirmedAuth}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="text-xs font-semibold bg-primary hover:bg-primary-dark text-white gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Transmit Simulated Dispatch</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
