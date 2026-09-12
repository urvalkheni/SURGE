import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, TrendingDown, Activity, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlant } from '@/contexts/plant-context';
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/formatters';

export function ImpactSummary({ className }: { className?: string }) {
  const { configuration, forecastPoints } = usePlant();
  const { impact } = dashboardData;

  const todayYieldMwh = React.useMemo(() => {
    if (forecastPoints && forecastPoints.length > 0) {
      const next24 = forecastPoints.slice(0, 24);
      return Math.round(next24.reduce((acc, p) => acc + (p.predictedMw || 0), 0));
    }
    return impact.projectedEnergyMwh;
  }, [forecastPoints, impact.projectedEnergyMwh]);

  const co2Tonnes = Math.round(todayYieldMwh * 0.82);

  const tariffConfigured = (configuration?.energyPricePerMwh ?? 0) > 0;
  const exposureVal = tariffConfigured ? formatINR(Math.round(24.5 * (configuration?.energyPricePerMwh ?? 0))) : '₹0';
  const exposureSub = tariffConfigured ? 'PPA imbalance risk' : 'Tariff unconfigured';

  const savingsVal = tariffConfigured ? formatINR(Math.round(18.2 * (configuration?.energyPricePerMwh ?? 0))) : '₹0';
  const savingsSub = tariffConfigured ? 'Via proactive dispatch' : 'Tariff unconfigured';

  const metrics = [
    {
      label: "Today's Yield",
      value: `${todayYieldMwh} MWh`,
      sub: 'Projected dispatch',
      icon: Zap,
    },
    {
      label: 'Avoided Curtailment',
      value: `${configuration?.bessEnabled ? (configuration.bessEnergyMwh * 0.35).toFixed(1) : '0.0'} MWh`,
      sub: configuration?.bessEnabled ? 'BESS absorption' : 'No BESS deployed',
      icon: Activity,
    },
    {
      label: 'Imbalance Exposure',
      value: exposureVal,
      sub: exposureSub,
      icon: TrendingDown,
    },
    {
      label: 'Expected Savings',
      value: savingsVal,
      sub: savingsSub,
      icon: ShieldCheck,
    },
    {
      label: 'Grid Compliance',
      value: `${impact.gridCompliancePercent}%`,
      sub: 'Tolerance score',
      icon: ShieldCheck,
    },
    {
      label: 'CO₂ Displaced',
      value: `~${co2Tonnes} t`,
      sub: 'Emissions offset',
      icon: Zap,
    },
  ];

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 select-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Projected Economic & Grid Compliance Impact
          </h3>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto text-[9px] font-mono text-primary border-primary/30">
          PHYSICS ESTIMATE
        </Badge>
      </div>

      {/* 6 Key Impact Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-3 rounded bg-[#FAFBF9] border border-border-subtle flex flex-col justify-between space-y-1 min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-muted uppercase min-w-0">
                <Icon className="size-3 text-primary shrink-0" />
                <span className="truncate">{m.label}</span>
              </div>
              <div className="font-mono font-bold text-base text-foreground tabular-nums truncate">
                {m.value}
              </div>
              <div className="text-[10px] text-foreground-secondary truncate font-mono">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimers & Action */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>DETERMINISTIC PHYSICS · Values based on plant configuration and solar irradiance baseline.</span>
        </div>

        <Link href="/recommendations" className="self-end sm:self-auto shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark h-8">
            <span>View Prescriptive Actions</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
