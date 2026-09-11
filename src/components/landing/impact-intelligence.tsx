import * as React from 'react';
import Link from 'next/link';
import { DollarSign, Activity, Battery, Clock, ArrowRight, XCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ImpactIntelligence() {
  const kpis = [
    {
      label: 'Avoided Imbalance Exposure',
      value: '$18,400',
      sub: 'Per simulated cloud event',
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'BESS Dispatch Response',
      value: '19.0 MW',
      sub: 'Automated ramp smoothing',
      icon: Battery,
      color: 'text-primary-dark',
    },
    {
      label: 'Lookahead Horizon',
      value: '72 Hours',
      sub: 'Multi-day operational window',
      icon: Clock,
      color: 'text-foreground',
    },
    {
      label: 'Risk Events Identified',
      value: '2 Events',
      sub: 'Pre-event mitigation active',
      icon: Activity,
      color: 'text-foreground',
    },
  ];

  return (
    <div className="w-full bg-surface border border-border rounded-lg shadow-card p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="size-3" />
              STAGE 05 · QUANTIFIED OPERATIONAL IMPACT
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              SIMULATED SCENARIO
            </Badge>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
            Commercial & Grid Reliability Outcomes
          </h3>
        </div>

        <div className="text-xs font-mono text-muted tabular-nums self-start sm:self-auto">
          Baseline: 42 MW Ahmedabad Solar Array
        </div>
      </div>

      {/* 4 Impact Key Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border-subtle bg-[#FAFBF9] shadow-none">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-muted uppercase tracking-wider">
                  <Icon className="size-3 text-primary" />
                  <span className="truncate">{kpi.label}</span>
                </div>
                <div className="font-mono font-bold text-xl sm:text-2xl text-foreground tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-[10px] text-foreground-secondary truncate">
                  {kpi.sub}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Before / After Comparison Grid */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">
          Comparative Dispatch Operational Flow
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Without RenewableIQ */}
          <div className="p-4 rounded-md border border-[#F8B4B4] bg-[#FDF2F2]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                <XCircle className="size-3.5 text-danger" />
                WITHOUT PREDICTIVE INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono text-danger font-semibold">REACTIVE</span>
            </div>

            <ul className="text-xs space-y-2 text-foreground-secondary font-mono">
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">1.</span>
                <span>Unexpected 19.2 MW cloud cliff breaches interconnect ramp tolerance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">2.</span>
                <span>Late manual operator response (25+ min delay after frequency deviation).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">3.</span>
                <span>Severe CAISO/PJM imbalance settlement penalties incurred ($18,400+).</span>
              </li>
            </ul>
          </div>

          {/* With RenewableIQ */}
          <div className="p-4 rounded-md border border-[#BCE3CA] bg-[#E8F5ED]/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary-dark flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />
                WITH RENEWABLEIQ CLOSED LOOP
              </span>
              <span className="text-[10px] font-mono text-primary font-semibold">PROACTIVE</span>
            </div>

            <ul className="text-xs space-y-2 text-foreground-secondary font-mono">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Advance cloud front detection 240 minutes ahead of impact.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Prescriptive 19 MW BESS ramp discharge armed with 15-min lead window.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Nominal schedule preserved, 98.4% grid compliance, penalty avoided.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimers & Action */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>SIMULATED SCENARIO · Figures are model calculations based on 42 MW solar + 20 MW BESS tariffs.</span>
        </div>

        <Link href="/dashboard" className="self-end sm:self-auto shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark">
            <span>Open Dashboard Control Room</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
