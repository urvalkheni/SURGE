import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'standard' | 'narrow' | 'full';
}

export function PageContainer({
  children,
  className,
  maxWidth = 'standard',
  ...props
}: PageContainerProps) {
  const maxWidthClass = {
    standard: 'max-w-[1440px]',
    narrow: 'max-w-5xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
        maxWidthClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
