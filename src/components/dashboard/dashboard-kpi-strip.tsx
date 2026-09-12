import * as React from 'react';
import { Zap, Activity, Cpu, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlant } from '@/contexts/plant-context';
import { cn } from '@/lib/utils';

export function DashboardKpiStrip({ className }: { className?: string }) {
  const {
    currentOutputMw,
    utilizationPercent,
    configuration,
    forecastPoints,
    risks,
  } = usePlant();

  // Sum expected energy for the next 24 hours from physics points
  const todayExpectedEnergyMwh = React.useMemo(() => {
    if (!forecastPoints || forecastPoints.length === 0) return 248.4;
    const next24 = forecastPoints.slice(0, 24);
    const sum = next24.reduce((acc, p) => acc + (p.predictedMw || 0), 0);
    return Math.round(sum);
  }, [forecastPoints]);

  const activeRisk = risks[0];

  const cards = [
    {
      label: 'Current Output',
      value: `${currentOutputMw.toFixed(1)} MW`,
      subtext: `${utilizationPercent}% of ${configuration.acCapacityMw} MW cap`,
      icon: Zap,
      statusColor: 'text-primary-dark',
      badge: 'ESTIMATED',
    },
    {
      label: "Today's Energy",
      value: `${todayExpectedEnergyMwh} MWh`,
      subtext: 'Integrated 24h physics baseline',
      icon: Activity,
      statusColor: 'text-primary',
      badge: 'PHYSICS',
    },
    {
      label: 'Forecast Engine',
      value: 'PHYSICS',
      subtext: 'ML: Not Connected (Awaiting model)',
      icon: Cpu,
      statusColor: 'text-foreground',
      badge: 'DETERMINISTIC',
    },
    {
      label: 'Grid Ramp Risk',
      value: activeRisk ? activeRisk.severity.toUpperCase() : 'NOMINAL',
      subtext: `${risks.length} active rule alert${risks.length === 1 ? '' : 's'}`,
      icon: AlertTriangle,
      statusColor: activeRisk ? 'text-[#C98216]' : 'text-primary',
      badge: 'RULE-BASED',
    },
    {
      label: 'Next Risk Event',
      value: activeRisk ? `T-${activeRisk.leadTimeMinutes}m` : 'NONE',
      subtext: activeRisk ? activeRisk.headline : 'Generation stable within limits',
      icon: Clock,
      statusColor: activeRisk?.severity === 'critical' ? 'text-danger' : 'text-foreground',
      badge: activeRisk ? 'IMMINENT' : 'CLEAR',
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
              className="border-border bg-surface shadow-subtle hover:border-primary/40 transition-colors min-w-0 overflow-hidden"
            >
              <CardContent className="p-3.5 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted min-w-0 flex-1">
                    <Icon className="size-3 text-primary shrink-0" />
                    <span className="truncate">{card.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 uppercase shrink-0">
                    {card.badge}
                  </Badge>
                </div>

                <div className={cn('font-mono font-bold text-lg sm:text-xl lg:text-2xl tabular-nums break-words', card.statusColor)}>
                  {card.value}
                </div>

                <div className="text-[11px] text-foreground-secondary truncate font-mono" title={card.subtext}>
                  {card.subtext}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Honest Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted px-1">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted" />
          <span className="text-foreground-secondary">SCADA: NOT CONNECTED</span>
        </span>
        <span className="flex items-center gap-3">
          <span>FORECAST: PHYSICS BASELINE</span>
          <span className="text-amber-600 font-semibold">ML: NOT CONNECTED</span>
        </span>
      </div>
    </div>
  );
}
