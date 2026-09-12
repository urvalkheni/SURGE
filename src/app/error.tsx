'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log exception to local telemetry
    console.error('RenewableIQ Application Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-card p-8 text-center space-y-6">
        {/* Brand & Alert Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-danger flex items-center justify-center text-white shadow-subtle">
            <AlertTriangle className="size-6 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-danger-tint text-[11px] font-mono font-semibold text-danger-dark">
            <span className="size-1.5 rounded-full bg-danger animate-pulse" />
            <span>EXECUTIVE DISPATCH EXCEPTION</span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl text-foreground">
            Corridor Exception
          </h1>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            An unhandled runtime disruption occurred within the current telemetry corridor.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-muted">
              Fault Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs gap-1.5 h-9"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry Stream</span>
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full text-xs gap-1.5 h-9">
              <LayoutDashboard className="size-3.5" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-border-subtle text-[11px] font-mono text-muted flex items-center justify-between">
          <span>RENEWABLEIQ NODE · FAULT ISOLATION</span>
          <span>SAFETY SHIELD ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
