import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionHistoryLog } from '@/data/demo-data';
import { History, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionHistoryLogProps {
  logs: ActionHistoryLog[];
}

export function ActionHistoryLogPanel({ logs }: ActionHistoryLogProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <CardTitle className="text-base">Operational Decision Audit Trail &amp; Execution History</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-foreground-secondary">
            Immutable SCADA Audit Log
          </Badge>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Chronological ledger of autonomous dispatches, operator confirmations, and setpoint overrides
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F6F8F6]">
              <TableRow className="border-border">
                <TableHead className="w-[140px] text-xs font-mono font-semibold text-foreground">Timestamp</TableHead>
                <TableHead className="w-[110px] text-xs font-mono font-semibold text-foreground">Rec ID</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Dispatched Action</TableHead>
                <TableHead className="w-[180px] text-xs font-semibold text-foreground">Target Substation</TableHead>
                <TableHead className="w-[160px] text-xs font-mono font-semibold text-foreground">Operator ID</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Compliance Outcome</TableHead>
                <TableHead className="w-[130px] text-center text-xs font-semibold text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-border/60 hover:bg-[#F9FAF8]">
                  <TableCell className="font-mono text-xs text-foreground font-medium py-3">
                    {log.timestamp}
                  </TableCell>

                  <TableCell className="font-mono text-xs font-bold text-primary py-3">
                    {log.recId}
                  </TableCell>

                  <TableCell className="font-semibold text-xs text-foreground py-3">
                    {log.action}
                  </TableCell>

                  <TableCell className="text-xs text-foreground-secondary py-3">
                    {log.targetAsset}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-foreground-secondary py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="size-3 text-muted" />
                      <span>{log.operator}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-[#0D4F32] font-medium py-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      <span>{log.complianceResult}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-3">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs uppercase',
                        log.status === 'SIMULATED EXECUTED'
                          ? 'bg-[#EBF5EE] text-primary-dark border border-[#BCE3CA]'
                          : log.status === 'MANUAL OVERRIDE'
                          ? 'bg-[#FEF3C7] text-warning border border-[#FDE68A]'
                          : 'bg-[#F2F4F2] text-foreground-secondary'
                      )}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
