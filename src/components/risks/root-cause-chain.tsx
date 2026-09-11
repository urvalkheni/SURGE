import * as React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { RiskCausalStep } from '@/data/demo-data';

export interface RootCauseChainProps {
  steps: RiskCausalStep[];
}

export function RootCauseChain({ steps }: RootCauseChainProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-[#F8FAF8] p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="size-4 text-warning" />
        <h4 className="font-display font-semibold text-xs text-foreground uppercase tracking-wider">
          End-to-End Causal Physics Sequence
        </h4>
      </div>

      {/* Responsive step chain: horizontal on desktop, vertical on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-2.5">
        {steps.map((s, idx) => (
          <React.Fragment key={s.step}>
            <div className="flex-1 rounded-md border border-border bg-surface p-3 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5 font-mono text-[10px]">
                  <span className="font-bold text-muted uppercase">STEP 0{s.step}</span>
                  <span className="px-1.5 py-0.2 bg-[#EEF2EE] text-foreground rounded-xs font-semibold">
                    {s.time}
                  </span>
                </div>
                <h5 className="font-display font-bold text-xs text-foreground leading-snug mb-1">
                  {s.label}
                </h5>
                <p className="text-[11px] text-foreground-secondary leading-relaxed">
                  {s.detail}
                </p>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex items-center justify-center text-muted lg:self-center">
                <ArrowRight className="size-4 rotate-90 lg:rotate-0 text-muted/60" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
