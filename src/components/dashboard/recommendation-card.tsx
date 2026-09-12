'use client';

import * as React from 'react';
import Link from 'next/link';
import { BatteryCharging, ArrowRight, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlant } from '@/contexts/plant-context';
import { cn } from '@/lib/utils';

export function RecommendationCard({ className }: { className?: string }) {
  const { recommendations, configuration } = usePlant();
  const plantRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;
  const [isReviewed, setIsReviewed] = React.useState(false);

  if (!plantRec) {
    return (
      <div
        className={cn(
          'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-3 select-none',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground">
              Prescriptive Dispatch Status
            </h3>
            <Badge variant="nominal" className="text-[9px] font-mono px-1.5 py-0">
              NOMINAL OPERATION
            </Badge>
          </div>
          <span className="text-xs font-mono text-muted">Zero Active Prescriptions</span>
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          Asset operating within nominal envelope. Deterministic physics models indicate all parameters conform to configured tolerances ({configuration?.rampLimitMwPerMin || 2.5} MW/min limit).
        </p>
        <div className="pt-2 flex justify-end">
          <Link href="/recommendations">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark h-8 text-xs">
              <span>View Prescriptive Workstation</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tariffConfigured = (configuration?.energyPricePerMwh ?? 0) > 0;
  const savingsText = tariffConfigured
    ? `$${Math.round((plantRec.dispatchPlan?.setpointMw || 10) * (configuration?.energyPricePerMwh ?? 0)).toLocaleString()} Protected`
    : 'Tariff Unconfigured';

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
          <BatteryCharging className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Prescriptive Dispatch Recommendation
          </h3>
          <Badge variant={plantRec.priority === 'urgent' ? 'critical' : 'warning'} className="text-[9px] font-mono px-1.5 py-0 uppercase">
            {plantRec.priority} PRIORITY
          </Badge>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto text-[9px] font-mono text-muted">
          READY FOR DISPATCH
        </Badge>
      </div>

      {/* 4-Column Structured Flow: Risk -> Root Cause -> Action -> Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. Risk */}
        <div className="p-3 rounded-md bg-[#FAFBF9] border border-border-subtle space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-danger flex items-center gap-1">
            <AlertTriangle className="size-3" />
            <span>01. RISK DETECTED</span>
          </div>
          <div className="font-bold text-foreground text-xs line-clamp-2">{plantRec.title}</div>
          <p className="text-[11px] text-foreground-secondary leading-tight line-clamp-2">
            {plantRec.riskSummary}
          </p>
        </div>

        {/* 2. Root Cause */}
        <div className="p-3 rounded-md bg-[#FAFBF9] border border-border-subtle space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-[#C98216] flex items-center gap-1">
            <Clock className="size-3" />
            <span>02. ROOT CAUSE</span>
          </div>
          <div className="font-bold text-foreground text-xs">Physics Atmospheric Influx</div>
          <p className="text-[11px] text-foreground-secondary leading-tight line-clamp-2">
            {plantRec.rootCause}
          </p>
        </div>

        {/* 3. Recommended Action */}
        <div className="p-3 rounded-md bg-primary-tint/30 border border-primary/30 space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-primary flex items-center gap-1">
            <BatteryCharging className="size-3" />
            <span>03. PRESCRIBED ACTION</span>
          </div>
          <div className="font-bold text-primary-dark text-xs line-clamp-1">{plantRec.prescribedAction}</div>
          <p className="text-[11px] text-foreground-secondary leading-tight">
            Target: {plantRec.dispatchPlan?.targetAsset || 'Array Controller'}
          </p>
        </div>

        {/* 4. Expected Impact */}
        <div className="p-3 rounded-md bg-[#FAFBF9] border border-border-subtle space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-primary-dark flex items-center gap-1">
            <ShieldCheck className="size-3 text-primary" />
            <span>04. AVOIDED IMPACT</span>
          </div>
          <div className="font-bold text-foreground text-xs">{savingsText}</div>
          <p className="text-[11px] text-foreground-secondary leading-tight line-clamp-2">
            {plantRec.expectedImpact}
          </p>
        </div>
      </div>

      {/* Action Review Confirmation Drawer / Controls */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={isReviewed ? 'outline' : 'primary'}
            onClick={() => setIsReviewed(!isReviewed)}
            className="h-8 text-xs font-mono gap-1.5"
          >
            {isReviewed ? (
              <>
                <CheckCircle2 className="size-3.5 text-primary" />
                <span>SIMULATED ACTION ARMED</span>
              </>
            ) : (
              <span>SIMULATE DISPATCH</span>
            )}
          </Button>

          <span className="text-[11px] text-muted">
            Duration: {plantRec.dispatchPlan?.durationMinutes || 45} min · Efficacy: {plantRec.frequencyProtectionScore || 92}%
          </span>
        </div>

        <Link href="/recommendations" className="self-end sm:self-auto">
          <Button variant="ghost" size="sm" className="gap-1.5 font-medium text-primary hover:text-primary-dark h-8">
            <span>Open All Recommendations</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
