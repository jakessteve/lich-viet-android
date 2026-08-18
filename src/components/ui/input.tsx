import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 px-3.5 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 dark:focus-visible:ring-gold-dark/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors spring-press motion-gpu text-text-primary-light dark:text-text-primary-dark',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
