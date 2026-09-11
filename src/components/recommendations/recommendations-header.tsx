'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldCheck, Lock } from 'lucide-react';
import { RecommendationData } from '@/data/demo-data';

export interface RecommendationsHeaderProps {
  data: RecommendationData;
}

export function RecommendationsHeader({ data }: RecommendationsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              PRESCRIPTIVE OPERATIONS WORKSTATION
            </span>
            <span className="text-muted">·</span>
            <div
              className="inline-flex items-center gap-1.5 text-xs text-primary-dark font-medium bg-[#EBF5EE] px-2 py-0.5 rounded-sm border border-[#BCE3CA]"
              title="SCADA Simulated Telemetry feed"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <Activity className="size-3 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                SCADA SIMULATED <span className="text-foreground-secondary lowercase font-normal">· 18ms</span>
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Prescriptive Operations Workstation
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            {data.plant} · Autonomous &amp; Supervised BESS Dispatch Setpoints · Risk Mitigation Engine
          </p>
        </div>

        {/* Automation Mode & Safety Interlock Badges */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="nominal" className="font-mono text-xs text-primary-dark border-[#BCE3CA] bg-[#EBF5EE]">
              <ShieldCheck className="size-3 mr-1 text-primary" />
              Operator-In-The-Loop
            </Badge>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#F4F6F4] border border-border-subtle text-[11px] font-mono text-foreground-secondary">
              <Lock className="size-3 text-muted" />
              <span>SCADA Interlock: Simulated Only</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-muted">
            Active Prescriptions: <strong className="text-foreground">{data.activePrescriptionsCount.immediate} Immediate</strong> · {data.activePrescriptionsCount.scheduled} Scheduled · {data.activePrescriptionsCount.advisory} Advisory
          </span>
        </div>
      </div>
    </div>
  );
}
