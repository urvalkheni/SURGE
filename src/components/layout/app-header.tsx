'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Zap, Clock, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/feedback/demo-badge';
import { Select } from '@/components/ui/select';
import { AccountMenu } from './account-menu';

export interface AppHeaderProps {
  onOpenMobileNav?: () => void;
  activePlantId?: string;
  onPlantChange?: (plantId: string) => void;
}

export function AppHeader({
  onOpenMobileNav,
  activePlantId = 'ahmedabad-solar-01',
  onPlantChange,
}: AppHeaderProps) {
  const [time, setTime] = React.useState<{ utc: string; local: string }>({
    utc: '00:00:00 UTC',
    local: '00:00:00',
  });

  React.useEffect(() => {
    function updateClock() {
      const now = new Date();
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');

      const localHours = String(now.getHours()).padStart(2, '0');
      const localMinutes = String(now.getMinutes()).padStart(2, '0');
      const localSeconds = String(now.getSeconds()).padStart(2, '0');

      setTime({
        utc: `${utcHours}:${utcMinutes}:${utcSeconds} UTC`,
        local: `${localHours}:${localMinutes}:${localSeconds}`,
      });
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-surface/95 backdrop-blur-xs transition-colors">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu toggle + Brand icon */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileNav}
            className="lg:hidden text-foreground-secondary hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2.5 focus-ring rounded-md">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary-dark text-white">
              <Zap className="size-4" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-foreground hidden sm:inline-block">
              RenewableIQ
            </span>
          </Link>

          {/* Plant Selector Dropdown */}
          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-border max-w-[280px]">
            <Select
              value={activePlantId}
              onChange={(e) => onPlantChange?.(e.target.value)}
              className="h-8 text-xs font-medium border-border-subtle bg-[#F8FAF8] hover:bg-surface focus:bg-surface cursor-pointer"
              aria-label="Select active renewable generation asset"
            >
              <option value="ahmedabad-solar-01">Ahmedabad Solar Plant (42 MW AC / 50 MW DC)</option>
              <option value="north-valley-02">North Valley Wind Farm (80 MW · Secondary)</option>
              <option value="apex-mountain-01">Apex Mountain Hybrid (150 MW · Secondary)</option>
            </Select>
          </div>
        </div>

        {/* Right: Telemetry status + Operational clock + Demo badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Real-time Clock Ribbon */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono tabular-nums text-foreground-secondary bg-[#F4F6F4] px-2.5 py-1 rounded-sm border border-border-subtle">
            <Clock className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">{time.utc}</span>
            <span className="text-muted">|</span>
            <span>Local: {time.local}</span>
          </div>

          {/* SCADA Heartbeat Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-secondary"
            title="SCADA Telemetry: Simulated feed (18ms latency)"
            aria-label="SCADA Telemetry Status: Simulated feed, 18 milliseconds latency"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <Wifi className="size-3.5 text-primary" />
            <span className="font-medium text-[11px] uppercase tracking-wider text-primary-dark">
              SCADA SIMULATED <span className="font-mono tabular-nums text-foreground-secondary lowercase tracking-normal">· 18ms</span>
            </span>
          </div>

          {/* Demo Fallback Badge */}
          <DemoBadge isDemo={true} />

          {/* Account & Profile Control */}
          <div className="pl-1 sm:pl-2 border-l border-border">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
