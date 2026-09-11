'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';

export function SkeletonMetricsStrip({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="p-3 bg-[#FAFCFA] border-border-subtle animate-pulse">
          <div className="h-3 w-16 bg-[#E5EAE5] rounded-xs mb-2" />
          <div className="h-6 w-24 bg-[#DCE3DC] rounded-xs mb-1.5" />
          <div className="h-2.5 w-20 bg-[#E5EAE5] rounded-xs" />
        </Card>
      ))}
    </div>
  );
}

export function SkeletonChart({ heightClass = 'h-[360px]' }: { heightClass?: string }) {
  return (
    <Card className="p-5 border-border bg-surface animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-48 bg-[#DCE3DC] rounded-xs" />
          <div className="h-3 w-64 bg-[#E5EAE5] rounded-xs" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-[#E5EAE5] rounded-xs" />
          <div className="h-7 w-24 bg-[#E5EAE5] rounded-xs" />
        </div>
      </div>

      <div className={`w-full ${heightClass} rounded-md bg-[#F4F6F4] border border-dashed border-border-subtle flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2 text-muted text-xs">
          <div className="h-32 w-48 border-b-2 border-l-2 border-border-subtle relative">
            <div className="absolute inset-x-0 bottom-0 h-16 bg-[#EAEFEA]/60 rounded-t-xs" />
          </div>
          <span className="text-[11px] font-mono">Synthesizing 72h generation curves...</span>
        </div>
      </div>
    </Card>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card className="border-border bg-surface animate-pulse overflow-hidden">
      <div className="p-4 border-b border-border-subtle flex justify-between items-center">
        <div className="h-4 w-40 bg-[#DCE3DC] rounded-xs" />
        <div className="h-7 w-28 bg-[#E5EAE5] rounded-xs" />
      </div>

      <div className="p-4 space-y-3">
        {/* Table Header */}
        <div className="grid gap-3 pb-2 border-b border-border-subtle" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-[#DCE3DC] rounded-xs" />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3 py-1.5 border-b border-border-subtle/50" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-3.5 bg-[#EAEFEA] rounded-xs" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
