import * as React from 'react';
import { Zap, Activity, Target, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function DashboardKpiStrip({ className }: { className?: string }) {
  const { kpis } = dashboardData;

  const cards = [
    {
      label: 'Current Output',
      value: `${kpis.currentOutputMw.toFixed(1)} MW`,
      subtext: `${kpis.utilizationPercent.toFixed(1)}% plant utilization`,
      icon: Zap,
      statusColor: 'text-primary-dark',
      badge: 'REALTIME',
    },
    {
      label: "Today's Expected Energy",
      value: `${kpis.todayExpectedEnergyMwh} MWh`,
      subtext: `+${kpis.energyDeltaPercent.toFixed(1)}% vs day-ahead schedule`,
      icon: Activity,
      statusColor: 'text-primary',
      badge: 'INTEGRATED',
    },
    {
      label: 'Forecast Confidence',
      value: `${kpis.forecastConfidencePercent.toFixed(1)}%`,
      subtext: `RMSE ${kpis.forecastRmseMw.toFixed(1)} MW · p10–p90 tight`,
      icon: Target,
      statusColor: 'text-foreground',
      badge: 'ENSEMBLE',
    },
    {
      label: 'Current Operational Risk',
      value: kpis.currentRiskLevel,
      subtext: `Risk score ${kpis.currentRiskScore} / 100 · Monitor`,
      icon: AlertTriangle,
      statusColor: 'text-[#C98216]',
      badge: 'EVALUATED',
    },
    {
      label: 'Next Risk Event',
      value: kpis.nextRiskEventTime,
      subtext: `${kpis.nextRiskEventType} (-8.7 MW)`,
      icon: Clock,
      statusColor: 'text-danger',
      badge: 'T-2h 45m',
    },
  ];

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="border-border bg-surface shadow-subtle hover:border-primary/40 transition-colors"
            >
              <CardContent className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                    <Icon className="size-3 text-primary" />
                    <span className="truncate">{card.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 uppercase">
                    {card.badge}
                  </Badge>
                </div>

                <div className={cn('font-mono font-bold text-xl sm:text-2xl tabular-nums', card.statusColor)}>
                  {card.value}
                </div>

                <div className="text-[11px] text-foreground-secondary truncate font-mono">
                  {card.subtext}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-muted px-1">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>SIMULATED LIVE TELEMETRY · DETERMINISTIC DEMO ENGINE</span>
        </span>
        <span className="hidden sm:inline">INTERVAL: 15-MIN ROLL · SCADA IEC-61850</span>
      </div>
    </div>
  );
}
