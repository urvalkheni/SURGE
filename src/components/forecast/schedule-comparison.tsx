import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ForecastWorkbenchData } from '@/data/demo-data';

export interface ScheduleComparisonProps {
  data: ForecastWorkbenchData['scheduleComparison'];
}

export function ScheduleComparison({ data }: ScheduleComparisonProps) {
  return (
    <Card id="schedule-comparison" className="shadow-card mb-6 scroll-mt-20">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Day-Ahead Schedule Commitment vs AI Forecast</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              SLDC Gujarat cleared day-ahead bids compared against ensemble physical forecast to isolate DSM imbalance risk
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-[#92400E] border-[#FDE68A] bg-[#FEF3C7]">
            SLDC Gujarat Interconnect
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Metric Comparison Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Cleared Day-Ahead Schedule</span>
            <div className="font-mono text-xl font-bold text-foreground mt-1 tabular-nums">
              {data.totalScheduleMwh} <span className="text-xs font-normal text-muted">MWh</span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-0.5">72-Hour market clearing</p>
          </div>

          <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">RenewableIQ Forecast</span>
            <div className="font-mono text-xl font-bold text-primary mt-1 tabular-nums">
              {data.totalForecastMwh} <span className="text-xs font-normal text-muted">MWh</span>
            </div>
            <p className="text-[11px] text-primary mt-0.5 font-medium">+{data.netDeltaMwh} MWh net generation margin</p>
          </div>

          <div className="p-3 rounded-md border border-danger/30 bg-danger-tint/20">
            <span className="text-[11px] font-medium uppercase tracking-wider text-danger-dark">Unmitigated DSM Exposure</span>
            <div className="font-mono text-xl font-bold text-danger-dark mt-1 tabular-nums">
              ${data.dsmExposureUsd.toLocaleString()}
            </div>
            <p className="text-[11px] text-danger-dark/80 mt-0.5">₹1,24,000 without BESS dispatch</p>
          </div>

          <div className="p-3 rounded-md border border-[#BCE3CA] bg-[#EBF5EE]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-primary-dark">Expected Mitigated Exposure</span>
            <div className="font-mono text-xl font-bold text-primary-dark mt-1 tabular-nums">
              ${data.mitigatedExposureUsd.toLocaleString()}
            </div>
            <p className="text-[11px] text-primary-dark/80 mt-0.5">81% risk elimination with REC-4011</p>
          </div>
        </div>

        {/* Critical Imbalance Window Callout */}
        <div className="rounded-lg border border-warning/40 bg-[#FFFBEB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-warning shrink-0 mt-0.5">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-[#92400E]">
                  Critical Imbalance Window Identified: {data.criticalHourWindow}
                </span>
                <Badge variant="critical" className="text-[10px] py-0">
                  UNDER-GEN RISK
                </Badge>
              </div>
              <p className="text-xs text-[#92400E]/90 mt-1 leading-relaxed max-w-2xl">
                Generation plunges to <span className="font-mono font-bold">24.1 MW</span> while scheduled cleared commitment is{' '}
                <span className="font-mono font-bold">32.8 MW</span> (deficit of{' '}
                <span className="font-mono font-bold text-danger">{data.criticalHourDeficitMw} MW</span>). 
                Without active battery ramp support, plant violates CERC Regulation 5.2 ramp ceiling (-0.62 MW/min vs -0.40 limit).
              </p>
            </div>
          </div>

          <Link href="/recommendations" className="shrink-0">
            <Button size="sm" className="gap-1.5 h-9 font-medium text-xs bg-primary hover:bg-primary-dark text-white">
              <ShieldCheck className="size-3.5" />
              <span>Review REC-4011 Dispatch</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
