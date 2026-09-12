import Link from 'next/link';
import { Compass, LayoutDashboard, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-card p-8 text-center space-y-6">
        {/* Brand & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-subtle">
            <Compass className="size-6 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-border-subtle/50 text-[11px] font-mono font-semibold text-muted">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>HTTP 404 · CORRIDOR NOT FOUND</span>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl text-foreground">
            Resource Unreachable
          </h1>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            The dispatch route or telemetry corridor you requested does not exist on this RenewableIQ gateway node.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary-dark text-white text-xs gap-1.5 h-9">
              <LayoutDashboard className="size-3.5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <Link href="/forecast" className="flex-1">
            <Button variant="outline" className="w-full text-xs gap-1.5 h-9">
              <LineChart className="size-3.5" />
              <span>Forecast</span>
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-border-subtle text-[11px] font-mono text-muted flex items-center justify-between">
          <span>RENEWABLEIQ NODE · IN-GJ-CHOR-01</span>
          <span>GATEWAY V2.1</span>
        </div>
      </div>
    </div>
  );
}
