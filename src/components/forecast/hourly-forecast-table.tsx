'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HourlyWorkbenchPoint } from '@/data/demo-data';
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HourlyForecastTableProps {
  points: HourlyWorkbenchPoint[];
  resolution: '15m' | '1h';
}

export function HourlyForecastTable({ points, resolution }: HourlyForecastTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRampOnly, setFilterRampOnly] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 12;

  // Filtered rows
  const filteredPoints = React.useMemo(() => {
    return points.filter((p) => {
      if (filterRampOnly && !p.isRampAlert) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.timeIst.toLowerCase().includes(term) ||
        p.weatherCondition.toLowerCase().includes(term) ||
        (p.isRampAlert && 'ramp alert'.includes(term))
      );
    });
  }, [points, searchTerm, filterRampOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredPoints.length / rowsPerPage));
  const paginatedPoints = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPoints.slice(start, start + rowsPerPage);
  }, [filteredPoints, currentPage, rowsPerPage]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRampOnly, resolution]);

  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Granular Forecast Telemetry Ledger</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Hour-by-hour power projections, confidence intervals, cleared schedule deltas, and atmospheric indices
            </CardDescription>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44 sm:w-56">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <Input
                placeholder="Filter time, condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs bg-surface"
              />
            </div>

            <Button
              size="sm"
              variant={filterRampOnly ? 'danger' : 'outline'}
              onClick={() => setFilterRampOnly(!filterRampOnly)}
              className="h-8 text-xs gap-1 font-mono"
            >
              <AlertTriangle className="size-3" />
              <span>Ramp Alerts Only</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F6F8F6]">
              <TableRow className="border-border">
                <TableHead className="w-[140px] text-xs font-mono font-semibold text-foreground">Time (IST)</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">P10 (MW)</TableHead>
                <TableHead className="text-right text-xs font-mono font-bold text-[#167A4A]">P50 Forecast</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">P90 (MW)</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-[#92400E]">Schedule</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">Delta vs Sched</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">Ramp Rate</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Condition</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">Cloud %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-xs text-muted">
                    No forecast records matching the current filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPoints.map((row) => {
                  const deltaPositive = row.deltaMw >= 0;
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'border-border/60 transition-colors',
                        row.isRampAlert && 'bg-danger-tint/25 hover:bg-danger-tint/35'
                      )}
                    >
                      <TableCell className="font-mono text-xs font-medium text-foreground py-2.5">
                        <div className="flex items-center gap-1.5">
                          {row.isRampAlert && <AlertTriangle className="size-3 text-danger shrink-0" />}
                          <span>{row.timeIst}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary py-2.5">
                        {row.p10Mw.toFixed(1)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs font-bold tabular-nums text-[#167A4A] py-2.5">
                        {row.p50Mw.toFixed(1)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary py-2.5">
                        {row.p90Mw.toFixed(1)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums text-[#92400E] font-medium py-2.5">
                        {row.dayAheadMw.toFixed(1)}
                      </TableCell>

                      <TableCell
                        className={cn(
                          'text-right font-mono text-xs tabular-nums font-semibold py-2.5',
                          deltaPositive ? 'text-primary' : 'text-danger'
                        )}
                      >
                        {deltaPositive ? `+${row.deltaMw.toFixed(1)}` : row.deltaMw.toFixed(1)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary py-2.5">
                        {row.rampRateMw15m.toFixed(2)} MW/15m
                      </TableCell>

                      <TableCell className="text-xs py-2.5">
                        {row.isRampAlert ? (
                          <Badge variant="critical" className="text-[10px] py-0 px-1.5">
                            RAMP BREACH
                          </Badge>
                        ) : (
                          <span className="text-foreground-secondary">{row.weatherCondition}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary py-2.5">
                        {row.cloudCoverPercent}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-border-subtle px-4 py-3 text-xs text-foreground-secondary">
          <div className="font-mono text-[11px]">
            Showing {(currentPage - 1) * rowsPerPage + 1}–
            {Math.min(currentPage * rowsPerPage, filteredPoints.length)} of {filteredPoints.length} time intervals (
            {resolution === '15m' ? '15-min intervals' : 'Hourly intervals'})
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="font-mono text-xs font-semibold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
