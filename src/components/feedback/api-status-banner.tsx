'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceStatusTag } from '@/services/api/types';

export interface ApiStatusBannerProps {
  statusTag?: ServiceStatusTag;
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ApiStatusBanner({
  statusTag = 'DEMO DATA',
  error,
  onRetry,
  isRetrying = false,
  className = '',
}: ApiStatusBannerProps) {
  // If we have an explicit error or fallback
  if (error || statusTag === 'DEMO FALLBACK') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-md border border-warning/40 bg-[#FDF9F2] p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <AlertCircle className="size-4 text-warning shrink-0" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                MODEL SERVICE UNAVAILABLE
              </span>
              <Badge variant="warning" className="text-[10px] font-mono uppercase">
                DEMO FALLBACK
              </Badge>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              RenewableIQ is currently showing deterministic demo data for Ahmedabad Solar Plant. {error ? `(${error})` : ''}
            </p>
          </div>
        </div>

        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs gap-1.5 border-warning/50 hover:bg-warning/10 text-foreground"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={`size-3 text-warning ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Connecting...' : 'Retry'}</span>
          </Button>
        )}
      </div>
    );
  }

  // Normal demo or live tag
  return null;
}

export function ServiceStatusIndicator({
  statusTag = 'DEMO DATA',
  latencyMs = 18,
}: {
  statusTag?: ServiceStatusTag;
  latencyMs?: number;
}) {
  const isLive = statusTag === 'LIVE';

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-border-subtle bg-[#F8FAF8] text-[11px] font-mono">
      {isLive ? (
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="font-semibold text-primary">API LIVE</span>
          <span className="text-muted">·</span>
          <span className="text-foreground-secondary">{latencyMs}ms</span>
        </>
      ) : (
        <>
          <Database className="size-3 text-foreground-secondary" />
          <span className="font-semibold text-foreground-secondary">{statusTag}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{latencyMs}ms SCADA</span>
        </>
      )}
    </div>
  );
}
