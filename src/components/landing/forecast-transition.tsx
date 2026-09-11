import * as React from 'react';
import { CloudSun, Cpu, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ForecastTransition() {
  return (
    <div className="w-full bg-[#FAFBF9] border border-border rounded-lg p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
            ANALYTICAL PROCESSING PIPELINE
          </span>
          <h4 className="font-display font-bold text-base text-foreground">
            From Environmental Inputs to Probabilistic Generation
          </h4>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-[10px] font-mono">
          TRANSFORMATION ARCHITECTURE
        </Badge>
      </div>

      {/* 3-Tier Technical Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative">
        {/* Tier 1: Inputs */}
        <Card className="border-border bg-surface shadow-none">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-muted">01. INGESTION</span>
              <CloudSun className="size-4 text-primary" />
            </div>
            <h5 className="font-display font-bold text-sm text-foreground">Input Data Streams</h5>
            <ul className="text-xs text-foreground-secondary space-y-1 font-mono pt-1">
              <li className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-primary" />
                <span>NWP Weather: GHI, Temp, Wind</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-primary" />
                <span>Historical SCADA Telemetry</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-primary" />
                <span>Plant Constraints: DC:AC 1.25</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tier 2: Forecast Engine */}
        <Card className="border-primary/40 bg-white shadow-subtle relative">
          <div className="absolute -top-2.5 left-4">
            <Badge variant="nominal" className="text-[9px] font-mono px-1.5 py-0">
              CORE MODEL
            </Badge>
          </div>
          <CardContent className="p-4 space-y-2 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-primary-dark">02. COMPUTE</span>
              <Cpu className="size-4 text-primary" />
            </div>
            <h5 className="font-display font-bold text-sm text-foreground">Forecast Engine</h5>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Combines atmospheric photon flux with inverter thermal saturation and string degradation constraints.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-muted">
              <span>Resolution: 15-min</span>
              <span>·</span>
              <span>Sync: Sub-hourly</span>
            </div>
          </CardContent>
        </Card>

        {/* Tier 3: Quantile Outputs */}
        <Card className="border-border bg-surface shadow-none">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-muted">03. OUTPUT</span>
              <TrendingUp className="size-4 text-primary" />
            </div>
            <h5 className="font-display font-bold text-sm text-foreground">Probabilistic 72h Output</h5>
            <ul className="text-xs text-foreground-secondary space-y-1 font-mono pt-1">
              <li className="flex items-center justify-between">
                <span>p10 Lower Bound:</span>
                <span className="font-semibold text-foreground">Conservative</span>
              </li>
              <li className="flex items-center justify-between">
                <span>p50 Expected Output:</span>
                <span className="font-semibold text-primary-dark">Nominal Base</span>
              </li>
              <li className="flex items-center justify-between">
                <span>p90 Upper Bound:</span>
                <span className="font-semibold text-foreground">High Irradiance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
