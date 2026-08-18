import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 spring-press motion-gpu',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-mystery-deep to-indigo-950 text-white ring-1 ring-gold/20 hover:shadow-xl hover:shadow-mystery-deep/20 dark:from-gold dark:to-amber-500 dark:text-indigo-950 dark:ring-0 dark:hover:shadow-gold-dark/25 font-bold',
        primary:
          'bg-gradient-to-r from-mystery-deep to-indigo-950 text-white ring-1 ring-gold/20 hover:shadow-xl hover:shadow-mystery-deep/20 dark:from-gold dark:to-amber-500 dark:text-indigo-950 dark:ring-0 dark:hover:shadow-gold-dark/25 font-bold',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark hover:bg-surface-container-low dark:hover:bg-white/5',
        secondary:
          'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-container-low dark:hover:bg-surface-elevated-dark/80',
        ghost:
          'text-text-primary-light dark:text-text-secondary-dark hover:bg-surface-container-low dark:hover:bg-white/5 hover:text-text-primary-light dark:hover:text-text-primary-dark',
        link: 'text-primary underline-offset-4 hover:underline',
        gold: 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-stone-950 dark:text-indigo-950 shadow-md shadow-gold/20 font-bold',
      },
      size: {
        default: 'h-11 px-5 py-2.5 min-h-11',
        sm: 'h-9 rounded-lg px-3 text-xs min-h-9',
        lg: 'h-12 rounded-2xl px-8 text-base min-h-12',
        icon: 'h-11 w-11 min-h-11 min-w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
