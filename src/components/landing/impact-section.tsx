import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Activity, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ImpactSection() {
  return (
    <section id="impact-section" className="w-full py-16 sm:py-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              RISK-TO-ACTION INTELLIGENCE
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
              Turn forecast uncertainty into prescriptive dispatch.
            </h2>
            <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed">
              When a sudden cloud front or thermal derating threatens interconnect tolerances, 
              RenewableIQ doesn’t just show a red warning — it generates a type-safe battery dispatch or curtailment plan before the grid reacts.
            </p>
          </div>

          <Link href="/risks">
            <Button variant="outline" size="sm" className="gap-2 font-medium self-start md:self-auto">
              <span>View Active Risk Ledger</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* Real-World Operational Example: Risk -> Root Cause -> Action -> Impact */}
        <div className="bg-[#FAFBF9] border border-border rounded-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="critical" className="gap-1 font-mono text-xs uppercase px-2 py-0.5">
                <ShieldAlert className="size-3" />
                CRITICAL RAMP HAZARD · RK-8091
              </Badge>
              <span className="text-xs font-mono text-muted">Ahmedabad Interconnect Node</span>
            </div>
            <span className="text-xs font-mono text-foreground-secondary tabular-nums">
              Lead Time: 240 min ahead of event
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1: Risk */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-danger">
                01. DETECTED RISK
              </div>
              <h4 className="font-display font-bold text-sm text-foreground">
                38.4 MW Cloud Ramp-Down
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Convective cloud front advancing at 28 km/h drops solar output from 40 MW to 2 MW in under 45 minutes.
              </p>
            </div>

            {/* Step 2: Root Cause */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C98216]">
                02. ROOT CAUSE
              </div>
              <h4 className="font-display font-bold text-sm text-foreground">
                Optical Depth Surge
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Localized cumulus cluster reduces GHI from 880 W/m² to 195 W/m², violating CAISO ramp rate boundaries (-0.85 MW/min).
              </p>
            </div>

            {/* Step 3: Prescribed Action */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                03. PRESCRIBED ACTION
              </div>
              <h4 className="font-display font-bold text-sm text-foreground">
                Dispatch BESS 19.0 MW
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Pre-charge 20 MW / 80 MWh battery and initiate ramp-smoothing discharge at 18:12 UTC for 78 minutes.
              </p>
            </div>

            {/* Step 4: Avoided Impact */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary-dark">
                04. MEASURED IMPACT
              </div>
              <h4 className="font-display font-bold text-sm text-foreground">
                ₹1,50,000 Penalty Avoided
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Maintains scheduled day-ahead market commitment and protects grid interconnect frequency stability.
              </p>
            </div>
          </div>
        </div>

        {/* Quantified Outcome Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-border bg-surface">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-primary">₹</span>
                <Badge variant="outline" className="text-[10px] font-mono font-semibold">Avoided Cost</Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-foreground mt-2">
                ₹12,00,000<span className="text-sm font-sans font-normal text-muted"> / yr</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Average annual savings in grid deviation settlement penalties per 50 MW installation by automating ramp mitigation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Activity className="size-5 text-primary" />
                <Badge variant="outline" className="text-[10px] font-mono font-semibold">Reliability</Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-foreground mt-2">
                98.4%<span className="text-sm font-sans font-normal text-muted"> Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Interconnection agreement compliance score achieved via predictive battery ramp-rate smoothing.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Zap className="size-5 text-primary" />
                <Badge variant="outline" className="text-[10px] font-mono font-semibold">Curtailment</Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-foreground mt-2">
                -34%<span className="text-sm font-sans font-normal text-muted"> Energy Loss</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Reduction in over-generation curtailment losses through proactive co-located BESS absorption schedules.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
