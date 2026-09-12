import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-dark text-white hover:bg-primary border border-transparent shadow-subtle',
        secondary:
          'bg-surface text-foreground hover:bg-[#F0F2ED] border border-border shadow-subtle',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-surface hover:text-foreground',
        ghost:
          'hover:bg-primary-tint hover:text-primary-dark text-foreground-secondary',
        danger:
          'bg-danger text-white hover:bg-danger-dark border border-transparent shadow-subtle',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-9 px-4 py-2 gap-2',
        lg: 'h-11 px-6 text-base gap-2.5',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
