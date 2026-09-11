import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RecommendationAlternative } from '@/data/demo-data';
import { Scale, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlternativeActionsTableProps {
  alternatives: RecommendationAlternative[];
}

export function AlternativeActionsTable({ alternatives }: AlternativeActionsTableProps) {
  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3 border-b border-border-subtle bg-[#FAFBF9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            <CardTitle className="text-base">Operational Strategy Trade-Off Comparison Matrix</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-foreground-secondary">
            Multi-Objective Evaluation
          </Badge>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Evaluating battery dispatch vs inverter curtailment vs spot energy procurement vs penalty acceptance
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F6F8F6]">
              <TableRow className="border-border">
                <TableHead className="w-[220px] text-xs font-semibold text-foreground">Operational Strategy</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Mechanism &amp; Dispatch Path</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">Compliance</TableHead>
                <TableHead className="text-right text-xs font-mono font-semibold text-foreground">Financial Impact</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Operational Trade-Offs</TableHead>
                <TableHead className="w-[120px] text-center text-xs font-semibold text-foreground">Evaluation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((opt) => {
                const isRec = opt.isRecommended;
                const isBad = opt.badge === 'NON-COMPLIANT';

                return (
                  <TableRow
                    key={opt.id}
                    className={cn(
                      'border-border/60 transition-colors',
                      isRec ? 'bg-[#EBF5EE]/70 hover:bg-[#EBF5EE] border-l-4 border-l-primary' : 'hover:bg-[#F9FAF8]'
                    )}
                  >
                    <TableCell className="font-display font-bold text-xs text-foreground py-3.5">
                      <div className="flex items-center gap-2">
                        {isRec ? (
                          <CheckCircle2 className="size-4 text-primary shrink-0" />
                        ) : isBad ? (
                          <XCircle className="size-4 text-danger shrink-0" />
                        ) : (
                          <AlertTriangle className="size-4 text-warning shrink-0" />
                        )}
                        <span>{opt.title}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-foreground-secondary py-3.5 leading-relaxed">
                      {opt.action}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums font-bold py-3.5">
                      <span className={opt.compliancePercent >= 95 ? 'text-primary' : opt.compliancePercent >= 80 ? 'text-[#92400E]' : 'text-danger'}>
                        {opt.compliancePercent.toFixed(1)}%
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums font-bold py-3.5">
                      <span className={opt.financialEffect.startsWith('+') ? 'text-primary' : 'text-danger'}>
                        {opt.financialEffect}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-foreground-secondary py-3.5">
                      {opt.tradeoffs}
                    </TableCell>

                    <TableCell className="text-center py-3.5">
                      <Badge
                        variant={
                          opt.badge === 'RECOMMENDED'
                            ? 'nominal'
                            : opt.badge === 'NON-COMPLIANT'
                            ? 'critical'
                            : 'warning'
                        }
                        className="font-mono text-[10px] py-0 uppercase"
                      >
                        {opt.badge}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
