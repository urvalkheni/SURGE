'use client';

import * as React from 'react';
import Link from 'next/link';
import { BatteryCharging, ArrowRight, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function RecommendationCard({ className }: { className?: string }) {
  const { activeRecommendation } = dashboardData;
  const [isReviewed, setIsReviewed] = React.useState(false);

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
          <Badge variant="critical" className="text-[9px] font-mono px-1.5 py-0">
            {activeRecommendation.priority} PRIORITY
          </Badge>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto text-[9px] font-mono text-muted">
          {activeRecommendation.status}
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
          <div className="font-bold text-foreground text-xs">{activeRecommendation.riskSummary}</div>
          <p className="text-[11px] text-foreground-secondary leading-tight">
            Anticipated 8.7 MW drop violates CAISO/PJM ramp tolerances.
          </p>
        </div>

        {/* 2. Root Cause */}
        <div className="p-3 rounded-md bg-[#FAFBF9] border border-border-subtle space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-[#C98216] flex items-center gap-1">
            <Clock className="size-3" />
            <span>02. ROOT CAUSE</span>
          </div>
          <div className="font-bold text-foreground text-xs">Cloud Optical Surge</div>
          <p className="text-[11px] text-foreground-secondary leading-tight">
            {activeRecommendation.rootCause}.
          </p>
        </div>

        {/* 3. Recommended Action */}
        <div className="p-3 rounded-md bg-primary-tint/30 border border-primary/30 space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-primary flex items-center gap-1">
            <BatteryCharging className="size-3" />
            <span>03. PRESCRIBED ACTION</span>
          </div>
          <div className="font-bold text-primary-dark text-xs">{activeRecommendation.action}</div>
          <p className="text-[11px] text-foreground-secondary leading-tight">
            Dispatch {activeRecommendation.targetAsset} at {activeRecommendation.setpointMw} MW.
          </p>
        </div>

        {/* 4. Expected Impact */}
        <div className="p-3 rounded-md bg-[#FAFBF9] border border-border-subtle space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-primary-dark flex items-center gap-1">
            <ShieldCheck className="size-3 text-primary" />
            <span>04. AVOIDED IMPACT</span>
          </div>
          <div className="font-bold text-foreground text-xs">${activeRecommendation.estimatedSavingsUsd.toLocaleString()} Saved</div>
          <p className="text-[11px] text-foreground-secondary leading-tight">
            {activeRecommendation.expectedImpact}.
          </p>
        </div>
      </div>

      {/* Action Review Confirmation Drawer / Controls */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isReviewed ? 'outline' : 'primary'}
            onClick={() => setIsReviewed(!isReviewed)}
            className="h-8 text-xs font-mono gap-1.5"
          >
            {isReviewed ? (
              <>
                <CheckCircle2 className="size-3.5 text-primary" />
                <span>Reviewed & Armed (Simulation)</span>
              </>
            ) : (
              <span>Review & Arm Dispatch</span>
            )}
          </Button>

          <span className="text-[11px] text-muted">
            Lead time: {activeRecommendation.responseWindowMinutes} min · Confidence: {activeRecommendation.confidencePercent}%
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
