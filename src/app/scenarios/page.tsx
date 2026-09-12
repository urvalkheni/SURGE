'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { usePlant } from '@/contexts/plant-context';
import { formatINR } from '@/lib/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function ScenariosPage() {
  const { plant, configuration, forecastPoints, isLoading } = usePlant();

  // Scenario parameters
  const [cloudShift, setCloudShift] = React.useState<number>(0);
  const [inverterAvail, setInverterAvail] = React.useState<number>(100);
  const [bessSoc, setBessSoc] = React.useState<number>(configuration?.bessSocPct ?? 68);
  const [horizonHours, setHorizonHours] = React.useState<24 | 48>(24);

  // Synchronize BESS default when configuration loads
  React.useEffect(() => {
    if (configuration?.bessSocPct !== undefined) {
      setBessSoc(configuration.bessSocPct);
    }
  }, [configuration?.bessSocPct]);

  const handleResetBaseline = () => {
    setCloudShift(0);
    setInverterAvail(100);
    setBessSoc(configuration?.bessSocPct ?? 68);
  };

  const handleApplyPreset = (cloud: number, inv: number) => {
    setCloudShift(cloud);
    setInverterAvail(inv);
  };

  // Sliced horizon points
  const points = React.useMemo(() => {
    return (forecastPoints || []).slice(0, horizonHours);
  }, [forecastPoints, horizonHours]);

  const acCapacity = configuration?.acCapacityMw || 42.0;

  // Calculate Scenario vs Baseline curves deterministically
  const chartData = React.useMemo(() => {
    if (!points || points.length === 0) return [];

    return points.map((p) => {
      const timeStr = new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const baseline = Number(p.predictedMw.toFixed(1));

      if (!p.isDaytime || baseline === 0) {
        return {
          timestamp: p.timestamp,
          time: timeStr,
          baseline: 0,
          scenario: 0,
          delta: 0,
        };
      }

      // Physics solar factor based on cloud shift
      const currentCloud = p.cloudCoverPercent || 0;
      const shockedCloud = Math.min(100, Math.max(0, currentCloud + cloudShift));

      // Attenuation factor: (1 - cloud/100)
      const clearSkyRatio = (100 - shockedCloud) / Math.max(1, 100 - currentCloud);
      const clampedRatio = Math.min(1.4, Math.max(0.1, clearSkyRatio));

      const invFactor = inverterAvail / 100;
      const rawShocked = baseline * clampedRatio * invFactor;
      const scenario = Number(Math.min(acCapacity, Math.max(0, rawShocked)).toFixed(1));
      const delta = Number((scenario - baseline).toFixed(1));

      return {
        timestamp: p.timestamp,
        time: timeStr,
        baseline,
        scenario,
        delta,
      };
    });
  }, [points, cloudShift, inverterAvail, acCapacity]);

  // Derive aggregate delta metrics
  const metrics = React.useMemo(() => {
    const totalBaselineEnergy = chartData.reduce((acc, d) => acc + d.baseline, 0);
    const totalScenarioEnergy = chartData.reduce((acc, d) => acc + d.scenario, 0);
    const energyDelta = totalScenarioEnergy - totalBaselineEnergy;
    const energyDeltaPct = totalBaselineEnergy > 0 ? (energyDelta / totalBaselineEnergy) * 100 : 0;

    const maxBaseline = Math.max(0, ...chartData.map((d) => d.baseline));
    const maxScenario = Math.max(0, ...chartData.map((d) => d.scenario));
    const peakDelta = maxScenario - maxBaseline;

    const tariffConfigured = (configuration?.energyPricePerMwh ?? 0) > 0;
    const financialExposure = tariffConfigured
      ? Math.round(Math.abs(energyDelta) * (configuration?.energyPricePerMwh ?? 0))
      : 0;

    return {
      totalBaselineEnergy: Math.round(totalBaselineEnergy),
      totalScenarioEnergy: Math.round(totalScenarioEnergy),
      energyDelta: Number(energyDelta.toFixed(1)),
      energyDeltaPct: Number(energyDeltaPct.toFixed(1)),
      maxBaseline,
      maxScenario,
      peakDelta: Number(peakDelta.toFixed(1)),
      financialExposure,
      tariffConfigured,
    };
  }, [chartData, configuration?.energyPricePerMwh]);

  return (
    <AppShell activePlantId={plant?.id || 'current'}>
      <PageContainer>
        <PageHeader
          title="Scenario Analysis Sandbox"
          description="Interactive deterministic physics laboratory to stress-test plant resilience against cloud surges, inverter derating, and thermal transients."
          breadcrumbs={[
            { label: 'Analysis' },
            { label: 'Scenario Sandbox' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5 h-9" onClick={handleResetBaseline}>
                <RotateCcw className="size-3.5 text-foreground-secondary" />
                <span>Reset Baseline</span>
              </Button>
              <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 bg-surface text-primary border-primary/30">
                DETERMINISTIC PHYSICS (NOT AI / ML)
              </Badge>
            </div>
          }
        />

        {/* Quick Presets Strip */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-foreground-secondary mr-1">Stress Presets:</span>
          <Button
            size="sm"
            variant={cloudShift === 0 && inverterAvail === 100 ? 'primary' : 'outline'}
            className="h-7 text-xs font-mono"
            onClick={() => handleApplyPreset(0, 100)}
          >
            Nominal Baseline
          </Button>
          <Button
            size="sm"
            variant={cloudShift === 35 && inverterAvail === 100 ? 'primary' : 'outline'}
            className="h-7 text-xs font-mono"
            onClick={() => handleApplyPreset(35, 100)}
          >
            +35% Cloud Surges
          </Button>
          <Button
            size="sm"
            variant={cloudShift === 0 && inverterAvail === 75 ? 'primary' : 'outline'}
            className="h-7 text-xs font-mono"
            onClick={() => handleApplyPreset(0, 75)}
          >
            25% Inverter Bank Trip
          </Button>
          <Button
            size="sm"
            variant={cloudShift === 30 && inverterAvail === 80 ? 'primary' : 'outline'}
            className="h-7 text-xs font-mono"
            onClick={() => handleApplyPreset(30, 80)}
          >
            Compound Stress (+30% Cloud, -20% Inverters)
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1/3: Parameter Sliders Panel */}
            <Card className="h-fit shadow-card">
              <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Parametric Stress Sliders</CardTitle>
                  <SlidersHorizontal className="size-4 text-primary" />
                </div>
                <CardDescription className="text-xs">Adjust weather and hardware parameters</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-5">
                {/* Horizon Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground-secondary">Analysis Horizon</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHorizonHours(24)}
                      className={`flex-1 py-1.5 text-xs font-mono rounded-md border cursor-pointer transition-colors ${
                        horizonHours === 24
                          ? 'bg-primary text-white border-primary font-bold'
                          : 'bg-surface text-foreground-secondary border-border hover:text-foreground'
                      }`}
                    >
                      24 Hours
                    </button>
                    <button
                      onClick={() => setHorizonHours(48)}
                      className={`flex-1 py-1.5 text-xs font-mono rounded-md border cursor-pointer transition-colors ${
                        horizonHours === 48
                          ? 'bg-primary text-white border-primary font-bold'
                          : 'bg-surface text-foreground-secondary border-border hover:text-foreground'
                      }`}
                    >
                      48 Hours
                    </button>
                  </div>
                </div>

                {/* Cloud Cover Shift */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Cloud Cover Shift</span>
                    <span className={`font-mono font-bold ${cloudShift > 0 ? 'text-danger' : cloudShift < 0 ? 'text-primary' : 'text-foreground'}`}>
                      {cloudShift > 0 ? `+${cloudShift}%` : `${cloudShift}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={cloudShift}
                    onChange={(e) => setCloudShift(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-[#E3E8E3] rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono">
                    <span>-50% (Clearer)</span>
                    <span>0% (Live NWP)</span>
                    <span>+50% (Overcast)</span>
                  </div>
                </div>

                {/* Inverter Availability */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Inverter Availability</span>
                    <span className={`font-mono font-bold ${inverterAvail < 100 ? 'text-warning-dark' : 'text-foreground'}`}>
                      {inverterAvail}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={inverterAvail}
                    onChange={(e) => setInverterAvail(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-[#E3E8E3] rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono">
                    <span>50% (50% Outage)</span>
                    <span>75%</span>
                    <span>100% (Nominal)</span>
                  </div>
                </div>

                {/* BESS Initial SOC */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>BESS Initial State of Charge</span>
                    <span className="font-mono text-primary font-bold">{bessSoc}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={bessSoc}
                    onChange={(e) => setBessSoc(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-[#E3E8E3] rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono">
                    <span>0% (Depleted)</span>
                    <span>50%</span>
                    <span>100% (Full)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle text-[11px] text-foreground-secondary leading-relaxed">
                  Calculated using deterministic clear-sky solar attenuation equations and inverter availability multipliers.
                </div>
              </CardContent>
            </Card>

            {/* Right 2/3: Reactive Diff Chart */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-surface p-5 shadow-card flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between border-b border-border-subtle pb-4 gap-2">
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Baseline vs. Stress Scenario Profile
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Deterministic physics trajectory comparison across {horizonHours} hours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="inline-block size-2.5 rounded-full bg-[#1B4D3E]" />
                    <span className="text-foreground-secondary">Baseline ({metrics.totalBaselineEnergy} MWh)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono ml-2">
                    <span className="inline-block size-2.5 rounded-full bg-[#D97706]" />
                    <span className="text-foreground-secondary">Scenario ({metrics.totalScenarioEnergy} MWh)</span>
                  </div>
                </div>
              </div>

              {/* Recharts Dual Series Chart */}
              <div className="my-4 h-[320px] w-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted font-mono">
                    Loading weather profile...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={280} debounce={50}>
                    <LineChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2EE" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis
                        unit=" MW"
                        domain={[0, Math.ceil(acCapacity * 1.1)]}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(val: unknown) => [`${typeof val === 'number' ? val.toFixed(1) : val} MW`]}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="baseline"
                        name="Baseline (Live Weather)"
                        stroke="#1B4D3E"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        name="Shocked Scenario"
                        stroke="#D97706"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Real-time Summary Delta Strip */}
              <div className="border-t border-border-subtle pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-md bg-[#F9FAF8] border border-border-subtle">
                  <span className="text-[10px] uppercase font-semibold text-muted">Energy Delta</span>
                  <div className={`font-mono text-base font-bold mt-0.5 ${metrics.energyDelta < 0 ? 'text-danger' : metrics.energyDelta > 0 ? 'text-primary' : 'text-foreground'}`}>
                    {metrics.energyDelta > 0 ? `+${metrics.energyDelta}` : metrics.energyDelta} MWh
                  </div>
                  <span className="text-[10px] text-muted">({metrics.energyDeltaPct > 0 ? `+${metrics.energyDeltaPct}` : metrics.energyDeltaPct}%)</span>
                </div>

                <div className="p-2.5 rounded-md bg-[#F9FAF8] border border-border-subtle">
                  <span className="text-[10px] uppercase font-semibold text-muted">Peak Shift</span>
                  <div className="font-mono text-base font-bold text-foreground mt-0.5">
                    {metrics.peakDelta > 0 ? `+${metrics.peakDelta}` : metrics.peakDelta} MW
                  </div>
                  <span className="text-[10px] text-muted">Max {metrics.maxScenario.toFixed(1)} MW</span>
                </div>

                <div className="p-2.5 rounded-md bg-[#F9FAF8] border border-border-subtle">
                  <span className="text-[10px] uppercase font-semibold text-muted">Financial Variance</span>
                  <div className="font-mono text-base font-bold text-foreground mt-0.5">
                    {metrics.tariffConfigured ? formatINR(metrics.financialExposure) : '₹0'}
                  </div>
                  <span className="text-[10px] text-muted">
                    {metrics.tariffConfigured ? 'At PPA rate' : 'Tariff unconfigured'}
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-[#F9FAF8] border border-border-subtle">
                  <span className="text-[10px] uppercase font-semibold text-muted">Grid Stress Index</span>
                  <div className="font-mono text-base font-bold text-foreground mt-0.5">
                    {Math.abs(metrics.energyDelta) > 20 ? 'HIGH' : Math.abs(metrics.energyDelta) > 5 ? 'MODERATE' : 'LOW'}
                  </div>
                  <span className="text-[10px] text-muted">Balancing impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
