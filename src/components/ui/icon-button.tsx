import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { renderDynamicIcon } from './icon-renderer';

export interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  icon?: React.ReactNode | string;
  label: string;
  iconClassName?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, iconClassName, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label={label}
        className={cn('rounded-xl focus:ring-2 focus:ring-gold/35 dark:focus:ring-gold-dark/30', className)}
        {...props}
      >
        {renderDynamicIcon(icon, cn('h-5 w-5', iconClassName)) || children}
      </Button>
    );
  },
);
IconButton.displayName = 'IconButton';
