import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Telemetry Connection Error',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-[#F8B4B4] bg-danger-tint p-6 text-center',
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-white border border-[#F8B4B4] mb-3 text-danger">
        <AlertTriangle className="size-5" />
      </div>
      <h4 className="font-display font-semibold text-sm text-danger-dark mb-1">
        {title}
      </h4>
      <p className="text-xs text-danger-dark/80 max-w-sm mb-4 leading-normal">
        {message}
      </p>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          <span>Retry Connection</span>
        </Button>
      )}
    </div>
  );
}
