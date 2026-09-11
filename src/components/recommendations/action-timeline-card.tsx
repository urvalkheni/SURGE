import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExecutionStep } from '@/data/demo-data';
import { Clock } from 'lucide-react';

export interface ActionTimelineCardProps {
  steps: ExecutionStep[];
}

export function ActionTimelineCard({ steps }: ActionTimelineCardProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <CardTitle className="text-base">Operational Execution Roadmap &amp; SCADA Command Sequence</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-foreground-secondary">
            5-Stage Closed-Loop Dispatch
          </Badge>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Deterministic execution protocol synchronized with NWP cloud advance telemetry
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <div className="space-y-4">
          {steps.map((step) => {
            const isCompleted = step.status === 'COMPLETED';
            const isReady = step.status === 'READY';

            return (
              <div
                key={step.step}
                className="flex flex-col sm:flex-row sm:items-start gap-4 p-3.5 rounded-lg border border-border-subtle bg-[#FAFBF9] transition-colors hover:bg-surface"
              >
                {/* Step indicator */}
                <div className="flex items-center gap-3 sm:w-40 shrink-0">
                  <div
                    className={`size-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-[#EBF5EE] text-primary border border-[#BCE3CA]'
                        : isReady
                        ? 'bg-[#FEF3C7] text-warning border border-[#FDE68A]'
                        : 'bg-[#EEF2EE] text-muted border border-border'
                    }`}
                  >
                    0{step.step}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-foreground block">
                      {step.timeIst}
                    </span>
                    <Badge
                      variant={isCompleted ? 'nominal' : isReady ? 'warning' : 'outline'}
                      className="font-mono text-[9px] py-0 px-1 mt-0.5 uppercase"
                    >
                      {step.status}
                    </Badge>
                  </div>
                </div>

                {/* Step Detail */}
                <div className="flex-1">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-foreground">
                    {step.title}
                  </h4>
                  <p className="text-xs text-foreground-secondary leading-relaxed mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
