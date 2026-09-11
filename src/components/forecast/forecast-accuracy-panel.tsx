import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { ForecastWorkbenchData } from '@/data/demo-data';

export interface ForecastAccuracyPanelProps {
  data: ForecastWorkbenchData['accuracyMetrics'];
}

export function ForecastAccuracyPanel({ data }: ForecastAccuracyPanelProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <CardTitle className="text-base">Forecast Quality & Model Benchmark Scorecard</CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Verified out-of-sample skill score against Persistence and Numerical Weather Prediction (NWP) baselines
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-primary-dark border-[#BCE3CA] bg-[#EBF5EE]">
            Continuous Kalman Calibrated
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 4 Core Verification Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Mean Absolute Error</span>
            <div className="font-mono text-2xl font-bold text-foreground mt-1 tabular-nums">
              {data.maeMw} <span className="text-xs font-normal text-muted">MW</span>
            </div>
            <p className="text-[11px] text-primary mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3 text-primary" />
              3.38% of nameplate rating
            </p>
          </div>

          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Root Mean Square Error</span>
            <div className="font-mono text-2xl font-bold text-foreground mt-1 tabular-nums">
              {data.rmseMw} <span className="text-xs font-normal text-muted">MW</span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">4.38% normalized RMSE</p>
          </div>

          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Skill vs Persistence</span>
            <div className="font-mono text-2xl font-bold text-primary mt-1 tabular-nums">
              +{data.skillScorePercent}%
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1 font-medium flex items-center gap-1">
              <Award className="size-3 text-primary" />
              Tier-1 commercial grade
            </p>
          </div>

          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Ramp Capture Rate</span>
            <div className="font-mono text-2xl font-bold text-foreground mt-1 tabular-nums">
              {data.rampCaptureRatePercent}%
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">Events &gt;0.4 MW/min detected</p>
          </div>
        </div>

        {/* Ensemble Constituents & Weighting Distribution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display font-semibold text-foreground">
              Ensemble Model Weighting &amp; Data Pipeline Architecture
            </span>
            <span className="text-[11px] font-mono text-muted">{data.modelRun}</span>
          </div>

          <div className="space-y-2.5">
            {data.constituents.map((item) => (
              <div
                key={item.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-md border border-border-subtle bg-[#FAFCFA] text-xs gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary" />
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <span className="text-muted text-[11px]">({item.resolution})</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted text-[11px]">Weight:</span>
                    <span className="font-bold text-foreground">{item.weightPercent}%</span>
                    <div className="w-16 h-1.5 bg-[#E3E8E3] rounded-full overflow-hidden ml-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${item.weightPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-primary">
                    <ArrowUpRight className="size-3" />
                    <span>Skill: {item.skillScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
