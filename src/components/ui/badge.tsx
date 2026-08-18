import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide select-none transition-colors duration-150',
  {
    variants: {
      variant: {
        default:
          'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark/40',
        neutral:
          'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark/40',
        gold: 'bg-gold/10 dark:bg-gold-dark/10 text-amber-950 dark:text-gold-dark border-gold/30 dark:border-gold-dark/25 font-semibold',
        good: 'bg-good/10 dark:bg-good-dark/10 text-good dark:text-good-dark border-good/30 dark:border-good-dark/25',
        bad: 'bg-bad/10 dark:bg-bad-dark/10 text-bad dark:text-bad-dark border-bad/30 dark:border-bad-dark/25',
        purple:
          'bg-purple/10 dark:bg-purple-dark/10 text-purple dark:text-purple-dark border-purple/30 dark:border-purple-dark/25',
        orange:
          'bg-orange/10 dark:bg-orange-dark/10 text-orange dark:text-orange-dark border-orange/30 dark:border-orange-dark/25',
        info: 'bg-info/10 dark:bg-info-dark/10 text-info dark:text-info-dark border-info/30 dark:border-info-dark/25',
        astral:
          'bg-astral-primary/10 dark:bg-astral-primary-dark/15 text-astral-primary dark:text-astral-primary-dark border-astral-border-light dark:border-astral-border-dark',
        destructive: 'bg-destructive/10 text-destructive border-destructive/30',
        outline: 'text-foreground border-border',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-sm',
        lg: 'px-3.5 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const pipVariants: Record<string, string> = {
  default: 'bg-text-secondary-light/40 dark:text-text-secondary-dark/40',
  neutral: 'bg-text-secondary-light/40 dark:text-text-secondary-dark/40',
  gold: 'bg-gold dark:bg-gold-dark',
  good: 'bg-good dark:bg-good-dark',
  bad: 'bg-bad dark:bg-bad-dark',
  purple: 'bg-purple dark:bg-purple-dark',
  orange: 'bg-orange dark:bg-orange-dark',
  info: 'bg-info dark:bg-info-dark',
  astral: 'bg-astral-primary dark:bg-astral-primary-dark',
  destructive: 'bg-destructive',
  outline: 'bg-foreground',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  pip?: boolean;
}

function Badge({ className, variant = 'default', size, pip = false, children, ...props }: BadgeProps) {
  const variantKey = variant ?? 'default';
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {pip && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full shrink-0 animate-glow-breathe',
            pipVariants[variantKey] || pipVariants.default,
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
