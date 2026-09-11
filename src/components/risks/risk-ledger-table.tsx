'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RiskLedgerEvent } from '@/data/demo-data';
import { AlertOctagon, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RiskLedgerTableProps {
  events: RiskLedgerEvent[];
  selectedRiskId: string;
  onSelectRisk: (id: string) => void;
}

export function RiskLedgerTable({
  events,
  selectedRiskId,
  onSelectRisk,
}: RiskLedgerTableProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Operational Risk &amp; Hazard Ledger</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Identified physical ramp threats, schedule mismatches, and equipment derates across the 72-hour horizon
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-foreground-secondary">
            Click row to inspect diagnostics
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F6F8F6]">
              <TableRow className="border-border">
                <TableHead className="w-[120px] text-xs font-mono font-semibold text-foreground">Risk ID</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-foreground">Severity</TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-foreground">Category</TableHead>
                <TableHead className="w-[150px] text-xs font-mono font-semibold text-foreground">Time Window</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Description &amp; Grid Impact</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">Magnitude</TableHead>
                <TableHead className="w-[110px] text-center text-xs font-semibold text-foreground">Action Link</TableHead>
                <TableHead className="w-[90px] text-center text-xs font-semibold text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-xs text-muted">
                    No risk events match the current filter selection.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((evt) => {
                  const isSelected = evt.id === selectedRiskId;
                  const isHigh = evt.severity === 'HIGH';
                  const isModerate = evt.severity === 'MODERATE';

                  return (
                    <TableRow
                      key={evt.id}
                      onClick={() => onSelectRisk(evt.id)}
                      className={cn(
                        'border-border/60 transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-[#EBF5EE] hover:bg-[#E2F0E6] border-l-4 border-l-primary'
                          : isHigh
                          ? 'bg-danger-tint/15 hover:bg-danger-tint/25'
                          : 'hover:bg-[#F9FAF8]'
                      )}
                    >
                      {/* Risk ID */}
                      <TableCell className="font-mono text-xs font-bold text-foreground py-3">
                        <div className="flex items-center gap-1.5">
                          {isHigh ? (
                            <AlertOctagon className="size-3.5 text-danger shrink-0" />
                          ) : isModerate ? (
                            <AlertTriangle className="size-3.5 text-warning shrink-0" />
                          ) : (
                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                          )}
                          <span>{evt.id}</span>
                        </div>
                      </TableCell>

                      {/* Severity */}
                      <TableCell className="py-3">
                        <Badge
                          variant={isHigh ? 'critical' : isModerate ? 'warning' : 'nominal'}
                          className="font-mono text-[10px] uppercase py-0"
                        >
                          {evt.severity}
                        </Badge>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="py-3 text-xs font-mono text-foreground-secondary">
                        {evt.category}
                      </TableCell>

                      {/* Time Window */}
                      <TableCell className="py-3 font-mono text-xs text-foreground font-medium">
                        {evt.timeWindow}
                      </TableCell>

                      {/* Description & Grid Impact */}
                      <TableCell className="py-3">
                        <div className="font-semibold text-xs text-foreground leading-snug">
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-muted leading-normal mt-0.5">
                          {evt.gridImpact}
                        </div>
                      </TableCell>

                      {/* Magnitude */}
                      <TableCell className="py-3 text-right font-mono text-xs tabular-nums text-foreground-secondary">
                        {evt.magnitude}
                      </TableCell>

                      {/* Action Link */}
                      <TableCell className="py-3 text-center">
                        <Link
                          href="/recommendations"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary hover:text-primary-dark underline"
                        >
                          <span>{evt.actionId}</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 text-center">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs uppercase',
                            evt.status === 'ACTIVE'
                              ? 'bg-danger-tint text-danger-dark'
                              : evt.status === 'MONITORING'
                              ? 'bg-warning-tint text-warning-dark'
                              : 'bg-[#EEF2EE] text-foreground-secondary'
                          )}
                        >
                          {evt.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
