import * as React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-[#F9FAF8] p-8 text-center',
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-white border border-border shadow-subtle mb-3 text-foreground-secondary">
        <Icon className="size-5" />
      </div>
      <h4 className="font-display font-semibold text-sm text-foreground mb-1">
        {title}
      </h4>
      <p className="text-xs text-foreground-secondary max-w-sm mb-4 leading-normal">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
