import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors select-none',
  {
    variants: {
      variant: {
        nominal:
          'bg-success-tint text-primary-dark border border-[#BCE3CA]',
        warning:
          'bg-warning-tint text-warning-dark border border-[#F5D6A4]',
        critical:
          'bg-danger-tint text-danger-dark border border-[#F8B4B4]',
        info:
          'bg-info-tint text-info-dark border border-[#B9D7EA]',
        outline:
          'border border-border text-foreground-secondary bg-surface',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
