import * as React from 'react';
import { AlertOctagon, Layers, TrendingDown, DollarSign, ShieldAlert } from 'lucide-react';
import { RiskLedgerData } from '@/data/demo-data';

export interface RiskSummaryStripProps {
  summary: RiskLedgerData['summary'];
}

export function RiskSummaryStrip({ summary }: RiskSummaryStripProps) {
  const cards = [
    {
      id: 'high',
      label: 'Active High-Priority Risks',
      value: `${summary.activeHighRisks} Critical`,
      subtext: 'Requires pre-dispatch intervention',
      icon: AlertOctagon,
      accent: 'text-danger',
      bgAccent: 'bg-danger-tint/30 border-danger/30',
      valueColor: 'text-danger-dark',
    },
    {
      id: 'total',
      label: 'Identified Risk Events',
      value: `${summary.totalIdentified72h} Events`,
      subtext: 'Across 72h forecast horizon',
      icon: Layers,
      accent: 'text-primary',
      bgAccent: 'bg-[#EBF5EE] border-[#BCE3CA]',
      valueColor: 'text-foreground',
    },
    {
      id: 'maxRamp',
      label: 'Max Projected Ramp',
      value: summary.maxProjectedRamp,
      subtext: `CERC Limit: ${summary.rampThreshold}`,
      icon: TrendingDown,
      accent: 'text-danger',
      bgAccent: 'bg-danger-tint/30 border-danger/30',
      valueColor: 'text-danger-dark',
    },
    {
      id: 'exposure',
      label: 'Financial Exposure at Risk',
      value: `$${summary.financialExposureUsd.toLocaleString()}`,
      subtext: `${summary.financialExposureInr} DSM penalties`,
      icon: DollarSign,
      accent: 'text-warning-dark',
      bgAccent: 'bg-warning-tint/30 border-warning/30',
      valueColor: 'text-foreground',
    },
    {
      id: 'compliance',
      label: 'Grid Compliance Risk',
      value: summary.gridComplianceStatus,
      subtext: 'Regulation 5.2 ramp exceedance',
      icon: ShieldAlert,
      accent: 'text-warning-dark',
      bgAccent: 'bg-warning-tint/30 border-warning/30',
      valueColor: 'text-[#92400E]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`rounded-lg border ${c.bgAccent} bg-surface p-4 shadow-xs transition-shadow hover:shadow-subtle flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary line-clamp-1">
                {c.label}
              </span>
              <div className="size-6 rounded-md bg-surface/80 flex items-center justify-center shrink-0 border border-border-subtle">
                <Icon className={`size-3.5 ${c.accent}`} />
              </div>
            </div>

            <div>
              <div className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${c.valueColor} tabular-nums`}>
                {c.value}
              </div>
              <div className="text-[11px] text-muted mt-0.5 font-medium truncate">
                {c.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
