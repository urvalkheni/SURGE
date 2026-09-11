import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ForecastWorkbenchData } from '@/data/demo-data';

export interface ForecastInsightsProps {
  insights: ForecastWorkbenchData['insights'];
}

export function ForecastInsights({ insights }: ForecastInsightsProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="text-base">Operational AI Insights &amp; Meteorological Findings</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-[11px] text-foreground-secondary">
            Ensemble Inference Pipeline
          </Badge>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Deterministic meteorological event detection across the 72-hour forecasting horizon
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((item) => {
            const isCritical = item.severity === 'CRITICAL';
            const isModerate = item.severity === 'MODERATE';

            const borderColor = isCritical
              ? 'border-danger/30 bg-danger-tint/15'
              : isModerate
              ? 'border-warning/30 bg-warning-tint/15'
              : 'border-border-subtle bg-[#F8FAF8]';

            const icon = isCritical ? (
              <AlertOctagon className="size-4 text-danger" />
            ) : isModerate ? (
              <AlertTriangle className="size-4 text-warning" />
            ) : (
              <CheckCircle2 className="size-4 text-primary" />
            );

            return (
              <div
                key={item.id}
                className={`rounded-lg border ${borderColor} p-4 flex flex-col justify-between transition-shadow hover:shadow-subtle`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">
                      {item.timeWindow}
                    </span>
                    <Badge
                      variant={isCritical ? 'critical' : isModerate ? 'warning' : 'nominal'}
                      className="text-[10px] py-0 font-mono"
                    >
                      {item.badge}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <span className="mt-0.5 shrink-0">{icon}</span>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-foreground leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-foreground-secondary leading-relaxed mb-4">
                    {item.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle/80">
                  <Link href={item.actionRoute} className="inline-block w-full">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-between h-8 text-xs font-medium text-foreground hover:text-primary hover:bg-surface/80 px-2"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
