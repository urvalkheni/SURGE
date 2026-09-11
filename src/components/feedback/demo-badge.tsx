import * as React from 'react';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

export interface DemoBadgeProps {
  className?: string;
  isDemo?: boolean;
}

export function DemoBadge({ className, isDemo = true }: DemoBadgeProps) {
  if (!isDemo) return null;

  return (
    <Tooltip content="Running on deterministic high-fidelity demo data (Backend offline or simulated)">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm bg-[#EFF3EF] px-2 py-0.5 border border-[#D5DDD5] text-foreground-secondary text-xs font-semibold cursor-help select-none',
          className
        )}
      >
        <Database className="size-3 text-primary" />
        <span className="tracking-wide uppercase text-[10px]">DEMO MODE</span>
      </div>
    </Tooltip>
  );
}
