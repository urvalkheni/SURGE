import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCta() {
  return (
    <section className="w-full py-16 sm:py-24 bg-background border-t border-border">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-surface p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-card relative overflow-hidden">
          {/* Subtle Industrial Background Pattern */}
          <div
            className="absolute inset-0 bg-[radial-gradient(#167A4A0A_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              <Zap className="size-3.5" />
              <span>READY FOR DEPLOYMENT</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight leading-tight">
              Make renewable generation predictable.
            </h2>

            <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed">
              Forecast the next 72 hours. Understand the risk. Act before uncertainty becomes a grid problem.
            </p>
          </div>

          <div className="relative flex flex-wrap items-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" variant="primary" className="gap-2 font-semibold min-h-[44px]">
                <BarChart2 className="size-4" />
                <span>Open Operations</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/forecast">
              <Button size="lg" variant="secondary" className="gap-2 font-medium min-h-[44px]">
                <span>Explore Forecast</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
