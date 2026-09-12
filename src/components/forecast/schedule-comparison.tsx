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
            <CardTitle className="text-base">Day-Ahead Schedule Commitment vs Physics Forecast</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Cleared day-ahead schedule commitment compared against deterministic physics forecast to evaluate dispatch alignment
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-[#92400E] border-[#FDE68A] bg-[#FEF3C7]">
            Grid Interconnect Schedule
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
            <p className="text-[11px] text-foreground-secondary mt-0.5">Selected forecast horizon</p>
          </div>

          <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Physics Forecast Baseline</span>
            <div className="font-mono text-xl font-bold text-primary mt-1 tabular-nums">
              {data.totalForecastMwh} <span className="text-xs font-normal text-muted">MWh</span>
            </div>
            <p className="text-[11px] text-primary mt-0.5 font-medium">
              {data.netDeltaMwh >= 0 ? `+${data.netDeltaMwh}` : `${data.netDeltaMwh}`} MWh net variance margin
            </p>
          </div>

          <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Financial Exposure</span>
            <div className="font-mono text-sm font-bold text-foreground mt-1">
              Tariff Not Configured
            </div>
            <p className="text-[11px] text-muted mt-0.5">Configure tariff in Plant Settings</p>
          </div>

          <div className="p-3 rounded-md border border-[#BCE3CA] bg-[#EBF5EE]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-primary-dark">Storage Dispatch Buffer</span>
            <div className="font-mono text-sm font-bold text-primary-dark mt-1">
              BESS Posture Nominal
            </div>
            <p className="text-[11px] text-primary-dark/80 mt-0.5">Operational headroom monitored</p>
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
                  Schedule Variance Window: {data.criticalHourWindow}
                </span>
                <Badge variant="critical" className="text-[10px] py-0">
                  DEFICIT RISK
                </Badge>
              </div>
              <p className="text-xs text-[#92400E]/90 mt-1 leading-relaxed max-w-2xl">
                Projected generation exhibits variance against scheduled commitment.
                Operational ramp limits and storage headroom should be reviewed in the dispatch console to maintain grid alignment.
              </p>
            </div>
          </div>

          <Link href="/recommendations" className="shrink-0">
            <Button size="sm" className="gap-1.5 h-9 font-medium text-xs bg-primary hover:bg-primary-dark text-white">
              <ShieldCheck className="size-3.5" />
              <span>Review Dispatch Console</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
