import * as React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardData } from '@/data/demo-data';
import { cn } from '@/lib/utils';

export function OutlookTable({ className }: { className?: string }) {
  const { outlookTable } = dashboardData;

  const getRiskBadge = (level: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW':
        return <Badge variant="nominal" className="text-[9px] font-mono px-1 py-0">LOW</Badge>;
      case 'MODERATE':
        return <Badge variant="warning" className="text-[9px] font-mono px-1 py-0">MODERATE</Badge>;
      case 'HIGH':
        return <Badge variant="critical" className="text-[9px] font-mono px-1 py-0">HIGH</Badge>;
    }
  };

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 select-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            72-Hour Operational Schedule Outlook
          </h3>
          <Badge variant="outline" className="text-[10px] font-mono">
            6 DISPATCH NODES
          </Badge>
        </div>

        <Link href="/forecast" className="self-start sm:self-auto">
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-mono text-primary hover:text-primary-dark h-7 px-2">
            <span>Full 72h Workbench</span>
            <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>

      {/* Desktop Responsive Table (hidden on small mobile, visible on sm+) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs font-mono text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase font-bold text-muted bg-[#FAFBF9]">
              <th className="py-2.5 px-3">Dispatch Time</th>
              <th className="py-2.5 px-3">Forecast Output</th>
              <th className="py-2.5 px-3">Utilization</th>
              <th className="py-2.5 px-3">Risk Level</th>
              <th className="py-2.5 px-3">Recommended Action</th>
              <th className="py-2.5 px-3 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle tabular-nums">
            {outlookTable.map((row) => (
              <tr key={row.time} className="hover:bg-[#FAFBF9] transition-colors">
                <td className="py-2.5 px-3 font-semibold text-foreground">{row.time}</td>
                <td className="py-2.5 px-3 font-bold text-primary-dark">{row.forecastMw.toFixed(1)} MW</td>
                <td className="py-2.5 px-3 text-foreground-secondary">{row.utilizationPercent}%</td>
                <td className="py-2.5 px-3">{getRiskBadge(row.riskLevel)}</td>
                <td className="py-2.5 px-3">
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', row.action === 'None' ? 'text-muted bg-[#F4F6F4]' : 'text-primary-dark bg-primary-tint/50 font-bold')}>
                    {row.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-medium text-foreground">{row.confidencePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (< sm) */}
      <div className="sm:hidden space-y-2">
        {outlookTable.map((row) => (
          <div
            key={row.time}
            className="p-3 rounded-md bg-[#FAFBF9] border border-border-subtle space-y-1.5 text-xs font-mono"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{row.time}</span>
              {getRiskBadge(row.riskLevel)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] tabular-nums pt-1 border-t border-border-subtle">
              <div>
                <span className="text-muted">Forecast: </span>
                <span className="font-bold text-primary-dark">{row.forecastMw.toFixed(1)} MW ({row.utilizationPercent}%)</span>
              </div>
              <div className="text-right">
                <span className="text-muted">Confidence: </span>
                <span className="font-bold text-foreground">{row.confidencePercent}%</span>
              </div>
            </div>

            <div className="text-[11px] text-foreground-secondary">
              <span className="text-muted">Action: </span>
              <span className="font-semibold text-foreground">{row.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
