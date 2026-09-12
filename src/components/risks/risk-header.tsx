'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Filter, RotateCcw } from 'lucide-react';

export interface RiskHeaderProps {
  selectedSeverity: string;
  onSeverityChange: (s: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedHorizon: '24h' | '48h' | '72h';
  onHorizonChange: (h: '24h' | '48h' | '72h') => void;
  onResetFilters: () => void;
  plantName?: string;
  capacityMw?: number;
  location?: string;
  rampThreshold?: string;
  aggregateRiskScore?: number;
  activeHighCount?: number;
  activeModerateCount?: number;
  activeLowCount?: number;
}

export function RiskHeader({
  selectedSeverity,
  onSeverityChange,
  selectedCategory,
  onCategoryChange,
  selectedHorizon,
  onHorizonChange,
  onResetFilters,
  plantName = 'Ahmedabad Solar Plant',
  capacityMw = 42.0,
  location = 'Gujarat, India',
  rampThreshold = '2.5 MW/min',
  aggregateRiskScore = 0,
  activeHighCount = 0,
  activeModerateCount = 0,
  activeLowCount = 0,
}: RiskHeaderProps) {
  const isFiltered = selectedSeverity !== 'ALL' || selectedCategory !== 'ALL' || selectedHorizon !== '72h';

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 mb-6">
      {/* Top row: Identity, Heartbeat, Aggregate Risk Score */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              RISK INTELLIGENCE LEDGER
            </span>
            <span className="text-muted">·</span>
            <div
              className="inline-flex items-center gap-1.5 text-xs text-primary-dark font-medium bg-[#EBF5EE] px-2 py-0.5 rounded-sm border border-[#BCE3CA]"
              title="Deterministic physics risk evaluation engine"
            >
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <Activity className="size-3 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                DETERMINISTIC PHYSICS <span className="text-foreground-secondary font-normal">· ACTIVE</span>
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Risk Intelligence &amp; Anomaly Ledger
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            {plantName} · {capacityMw} MW · {location} · Ramp Tolerance: {rampThreshold}
          </p>
        </div>

        {/* Aggregate Risk State Badge */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground-secondary">Aggregate Risk State:</span>
              <Badge
                variant={aggregateRiskScore > 60 ? 'critical' : aggregateRiskScore > 25 ? 'warning' : 'nominal'}
                className="font-mono font-bold text-xs"
              >
                {aggregateRiskScore > 60 ? 'HIGH' : aggregateRiskScore > 25 ? 'MODERATE' : 'NOMINAL'} · {aggregateRiskScore}/100
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-muted mt-0.5">
              {activeHighCount} HIGH · {activeModerateCount} MODERATE · {activeLowCount} LOW ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Severity, Category, Horizon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Severity filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-foreground-secondary flex items-center gap-1">
              <Filter className="size-3 text-muted" />
              Severity:
            </span>
            <div className="inline-flex rounded-md bg-[#EEF2EE] p-0.5 border border-border-subtle">
              {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((sev) => {
                const active = selectedSeverity === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => onSeverityChange(sev)}
                    className={`px-2.5 py-0.5 text-xs font-mono rounded-sm transition-colors cursor-pointer ${
                      active
                        ? 'bg-surface text-foreground font-bold shadow-subtle'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-foreground-secondary">Category:</span>
            <div className="inline-flex rounded-md bg-[#EEF2EE] p-0.5 border border-border-subtle">
              {(['ALL', 'RAMP RATE', 'OVER-GENERATION', 'CURTAILMENT', 'EQUIPMENT'] as const).map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded-sm transition-colors cursor-pointer ${
                      active
                        ? 'bg-surface text-foreground font-bold shadow-subtle'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {cat === 'ALL' ? 'ALL' : cat.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizon filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-foreground-secondary">Horizon:</span>
            <div className="inline-flex rounded-md bg-[#EEF2EE] p-0.5 border border-border-subtle">
              {(['24h', '48h', '72h'] as const).map((h) => {
                const active = selectedHorizon === h;
                return (
                  <button
                    key={h}
                    onClick={() => onHorizonChange(h)}
                    className={`px-2.5 py-0.5 text-xs font-mono rounded-sm transition-colors cursor-pointer ${
                      active
                        ? 'bg-surface text-foreground font-bold shadow-subtle'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {h.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isFiltered && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetFilters}
            className="h-7 text-xs gap-1 text-muted hover:text-foreground font-mono"
          >
            <RotateCcw className="size-3" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
