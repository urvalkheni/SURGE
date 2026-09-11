'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskLedgerData } from '@/data/demo-data';
import { Clock, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RiskTimelineProps {
  timeline: RiskLedgerData['timeline'];
  selectedRiskId: string;
  onSelectRisk: (id: string) => void;
}

export function RiskTimeline({
  timeline,
  selectedRiskId,
  onSelectRisk,
}: RiskTimelineProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <CardTitle className="text-base">72-Hour Chronological Risk Projection Timeline</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-foreground-secondary">
            Click node to focus risk
          </Badge>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Temporal progression of expected balancing deviations, optical transients, and equipment derates
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((node) => {
            const isSelected = node.eventId === selectedRiskId;
            const isHigh = node.severity === 'HIGH';
            const isModerate = node.severity === 'MODERATE';

            return (
              <div
                key={node.id}
                onClick={() => onSelectRisk(node.eventId)}
                className={cn(
                  'rounded-lg border p-4 transition-all cursor-pointer flex flex-col justify-between',
                  isSelected
                    ? 'border-primary bg-[#EBF5EE] ring-2 ring-primary/20 shadow-md'
                    : isHigh
                    ? 'border-danger/40 bg-danger-tint/15 hover:bg-danger-tint/25'
                    : isModerate
                    ? 'border-warning/40 bg-warning-tint/15 hover:bg-warning-tint/25'
                    : 'border-border-subtle bg-[#F9FAF8] hover:bg-surface shadow-xs'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {node.dateLabel} · {node.timeLabel}
                    </span>
                    <Badge
                      variant={isHigh ? 'critical' : isModerate ? 'warning' : 'nominal'}
                      className="font-mono text-[10px] py-0 uppercase"
                    >
                      {node.severity}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    {isHigh ? (
                      <AlertOctagon className="size-4 text-danger shrink-0 mt-0.5" />
                    ) : isModerate ? (
                      <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    )}
                    <h4 className="font-display font-bold text-xs sm:text-sm text-foreground leading-snug">
                      {node.title}
                    </h4>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-border-subtle/80 flex items-center justify-between text-[11px] font-mono text-foreground-secondary">
                  <span>{node.category}</span>
                  <span className={cn('font-semibold', isSelected ? 'text-primary' : 'text-muted')}>
                    {isSelected ? 'ACTIVE VIEW' : `${node.eventId} →`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
