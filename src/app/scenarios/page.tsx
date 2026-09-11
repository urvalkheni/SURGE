import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SlidersHorizontal, Play, RotateCcw, TrendingDown } from 'lucide-react';

export default function ScenariosPage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Scenario Analysis Sandbox"
          description="Interactive predictive laboratory to stress-test plant resilience against cloud surges, heatwaves, and inverter derating."
          breadcrumbs={[
            { label: 'Analysis' },
            { label: 'Scenario Sandbox' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5 h-9">
                <RotateCcw className="size-3.5 text-foreground-secondary" />
                <span>Reset Baseline</span>
              </Button>
              <Button size="sm" variant="primary" className="gap-1.5 h-9">
                <Play className="size-3.5" />
                <span>Run Simulation</span>
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1/3: Parameter Sliders Panel */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Simulation Parameters</CardTitle>
                  <SlidersHorizontal className="size-4 text-primary" />
                </div>
                <CardDescription>Adjust atmospheric and asset shock variables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Cloud Cover Shift</span>
                    <span className="font-mono text-primary font-bold">+25%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EAEFEA] overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>-50% Clear</span>
                    <span>+50% Overcast</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Inverter Availability</span>
                    <span className="font-mono text-foreground font-bold">100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EAEFEA] overflow-hidden">
                    <div className="h-full bg-primary-dark w-full rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>50% (Banks tripped)</span>
                    <span>100% (All nominal)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>BESS Initial State of Charge</span>
                    <span className="font-mono text-foreground font-bold">74%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EAEFEA] overflow-hidden">
                    <div className="h-full bg-primary w-[74%] rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>0% Empty</span>
                    <span>100% Full</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right 2/3: Reactive Diff Chart Slot */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-surface p-6 shadow-card min-h-[420px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Baseline vs. Shock Scenario Curve
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Real-time delta tracking against committed schedule
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">Phase 9 Lab</Badge>
              </div>

              <div className="my-auto py-12 flex flex-col items-center justify-center text-center">
                <div className="size-12 rounded-full bg-[#EFF3EF] border border-border flex items-center justify-center text-primary mb-3">
                  <TrendingDown className="size-6" />
                </div>
                <h4 className="font-display font-semibold text-sm text-foreground mb-1">
                  Simulation Diff Canvas Container
                </h4>
                <p className="text-xs text-foreground-secondary max-w-md leading-relaxed">
                  Scheduled for Phase 9 implementation. Dynamically renders dual-series line comparison 
                  between day-ahead baseline generation and shocked scenario parameters with real-time delta stats.
                </p>
              </div>

              <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-xs text-foreground-secondary">
                <span>Net Projected Delta: -18.4 MWh</span>
                <span>Financial Exposure: $2,300 USD</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
