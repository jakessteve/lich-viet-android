import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gold data-[state=checked]:to-amber-600 dark:data-[state=checked]:from-gold-dark dark:data-[state=checked]:to-amber-500 data-[state=checked]:shadow-sm data-[state=checked]:shadow-gold/20 data-[state=unchecked]:bg-surface-subtle-light dark:data-[state=unchecked]:bg-surface-elevated-dark data-[state=unchecked]:border data-[state=unchecked]:border-border-light dark:data-[state=unchecked]:border-border-dark/60 spring-press motion-gpu',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white dark:bg-gray-200 shadow-sm ring-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 motion-gpu',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
