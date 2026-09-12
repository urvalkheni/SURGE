import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { ForecastWorkbenchData } from '@/data/demo-data';

export interface ForecastAccuracyPanelProps {
  data?: ForecastWorkbenchData['accuracyMetrics'];
}

export function ForecastAccuracyPanel({ data }: ForecastAccuracyPanelProps) {
  const pipelineVersion = data?.modelRun ? `Phase 9 (${data.modelRun})` : 'Phase 9 Dynamic Pipeline';
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
          <Badge variant="outline" className="font-mono text-xs text-amber-700 border-amber-300 bg-amber-50">
            ML: NOT CONNECTED · PHYSICS BASELINE ACTIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 4 Core Verification Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Mean Absolute Error (MAE)</span>
            <div className="font-mono text-xl font-bold text-foreground mt-1">
              N/A <span className="text-xs font-normal text-muted">(ML Pending)</span>
            </div>
            <p className="text-[11px] text-amber-600 mt-1 font-medium flex items-center gap-1">
              <span>ML backend disconnected</span>
            </p>
          </div>

          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Root Mean Square Error</span>
            <div className="font-mono text-xl font-bold text-foreground mt-1">
              N/A <span className="text-xs font-normal text-muted">(ML Pending)</span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">Awaiting FastAPI model feed</p>
          </div>

          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Weather Ingestion</span>
            <div className="font-mono text-xl font-bold text-primary mt-1">
              LIVE
            </div>
            <p className="text-[11px] text-primary mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3 text-primary" />
              Open-Meteo GTI/GHI synced
            </p>
          </div>

          <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Estimation Engine</span>
            <div className="font-mono text-xl font-bold text-foreground mt-1">
              PV PHYSICS
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">Temp derated + AC clipped</p>
          </div>
        </div>

        {/* Ensemble Constituents & Weighting Distribution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display font-semibold text-foreground">
              Data Ingestion &amp; Generation Pipeline Architecture
            </span>
            <span className="text-[11px] font-mono text-muted">{pipelineVersion}</span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Open-Meteo NWP Solar Irradiance', detail: 'Live GTI, GHI, DNI, DHI Feed', weight: 100, status: 'Active (Live)' },
              { name: 'Photovoltaic Thermal Derating Model', detail: 'Tcell derating at -0.35%/°C', weight: 100, status: 'Deterministic Physics' },
              { name: 'Inverter Efficiency & AC Clamping', detail: 'Cap at Nameplate AC Rating', weight: 100, status: 'Physics Bound' },
              { name: 'External ML Model (FastAPI Backend)', detail: 'Post-processing GBDT / LSTM', weight: 0, status: 'Not Connected' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-md border border-border-subtle bg-[#FAFCFA] text-xs gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${item.weight > 0 ? 'bg-primary' : 'bg-amber-500'}`} />
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <span className="text-muted text-[11px]">({item.detail})</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted text-[11px]">Pipeline:</span>
                    <span className="font-bold text-foreground">{item.weight}%</span>
                    <div className="w-16 h-1.5 bg-[#E3E8E3] rounded-full overflow-hidden ml-1">
                      <div className={`h-full rounded-full ${item.weight > 0 ? 'bg-primary' : 'bg-amber-400'}`} style={{ width: `${item.weight}%` }} />
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 ${item.weight > 0 ? 'text-primary' : 'text-amber-700'}`}>
                    <ArrowUpRight className="size-3" />
                    <span>{item.status}</span>
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
