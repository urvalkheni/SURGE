import * as React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs, BreadcrumbItem } from './breadcrumbs';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 pb-6 border-b border-border mb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-2">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-foreground-secondary max-w-3xl leading-normal">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
