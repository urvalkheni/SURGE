'use client';

import * as React from 'react';
import { RefreshCw, Download, Zap, Wifi, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DashboardHeaderProps {
  horizon: '24h' | '48h' | '72h';
  onHorizonChange: (horizon: '24h' | '48h' | '72h') => void;
  plantName?: string;
  capacityMw?: number;
  className?: string;
}

export function DashboardHeader({
  horizon,
  onHorizonChange,
  plantName = 'Ahmedabad Solar Plant',
  capacityMw = 42.0,
  className,
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState('12:00 IST (06:30 UTC)');
  const [exportNotice, setExportNotice] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      const istTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setLastUpdated(`${istTime} IST (Simulated Sync)`);
    }, 600);
  };

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <div
      className={cn(
        'w-full bg-surface border-b border-border py-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none',
        className
      )}
    >
      {/* Plant Identity & Telemetry Heartbeat */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-xs bg-primary-dark text-white">
              <Zap className="size-3" />
            </div>
            <h1 className="font-display font-bold text-lg sm:text-xl text-foreground tracking-tight">
              {plantName}
            </h1>
          </div>

          <Badge variant="nominal" className="text-[10px] font-mono px-1.5 py-0">
            OPERATIONAL
          </Badge>

          <div
            className="flex items-center gap-1 text-[11px] font-mono text-foreground-secondary border-l border-border pl-2"
            title="SCADA Bus: IEC 61850 protocol emulated"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <Wifi className="size-3 text-primary ml-0.5" />
            <span className="text-primary-dark font-medium">SCADA SIMULATED · 18ms</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-mono tabular-nums">
          <span>Nameplate: {capacityMw.toFixed(1)} MW AC (50 MW DC)</span>
          <span>·</span>
          <span>Grid: GETCO 220kV Interconnect</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-foreground-secondary">
            <Clock className="size-3 text-primary" />
            <span>Updated: {lastUpdated}</span>
          </span>
        </div>
      </div>

      {/* Horizon Switcher & Workstation Controls */}
      <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
        {/* Horizon Toggle */}
        <div className="flex items-center gap-1 bg-[#F4F6F4] p-1 rounded-md border border-border-subtle">
          {(['24h', '48h', '72h'] as const).map((h) => {
            const isActive = horizon === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => onHorizonChange(h)}
                className={cn(
                  'px-3 py-1 text-xs font-mono font-bold rounded-sm transition-all focus-ring',
                  isActive
                    ? 'bg-surface text-primary-dark shadow-subtle'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-white/50'
                )}
                aria-pressed={isActive}
              >
                {h.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 font-mono text-xs h-8"
            title="Trigger immediate telemetry bus poll"
          >
            <RefreshCw className={cn('size-3.5 text-foreground-secondary', isRefreshing && 'animate-spin text-primary')} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync SCADA'}</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            className="gap-1.5 font-mono text-xs h-8 relative"
            title="Export 72h telemetry dataset"
          >
            <Download className="size-3.5 text-foreground-secondary" />
            <span>{exportNotice ? 'Exported CSV' : 'Export'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
