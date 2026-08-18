import React from 'react';
import { cn } from '@/lib/utils';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';

export interface SubNavTabItem<T extends string = string> {
  id: T;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode | string;
  badge?: string | number;
}

export interface SubNavTabsProps<T extends string = string> {
  tabs: readonly SubNavTabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  variant?: 'pills' | 'segmented' | 'underline';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function SubNavTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  size = 'md',
  fullWidth = false,
  className,
}: SubNavTabsProps<T>): React.ReactElement {
  const isSegmented = variant === 'segmented';
  const isUnderline = variant === 'underline';

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'flex items-center',
        fullWidth ? 'w-full' : 'inline-flex',
        isSegmented &&
          'p-1 bg-surface-subtle-light dark:bg-surface-elevated-dark rounded-2xl border border-border-light/60 dark:border-border-dark/60 shadow-xs gap-1',
        isUnderline && 'border-b border-border-light/50 dark:border-border-dark/50 gap-2 sm:gap-4',
        !isSegmented && !isUnderline && 'gap-1.5 p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 outline-none select-none spring-press',
              'min-h-[44px] text-xs sm:text-sm',
              size === 'sm' ? 'px-3 py-1.5 min-h-[38px]' : 'px-4 py-2',
              fullWidth && 'flex-1',
              // Segmented styling
              isSegmented &&
                (isActive
                  ? 'bg-white dark:bg-white/10 text-text-primary-light dark:text-gold-dark shadow-sm ring-1 ring-black/5 dark:ring-white/10 font-bold'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'),
              // Underline styling
              isUnderline &&
                (isActive
                  ? 'text-gold dark:text-gold-dark border-b-2 border-gold dark:border-gold-dark font-bold'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-primary-dark'),
              // Pills styling
              !isSegmented &&
                !isUnderline &&
                (isActive
                  ? 'bg-gold/15 dark:bg-gold-dark/20 text-gold-dark dark:text-gold-dark ring-1 ring-gold/30 dark:ring-gold-dark/30 font-bold'
                  : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white'),
            )}
          >
            {tab.icon && (
              <span className="shrink-0">
                {typeof tab.icon === 'string' ? renderDynamicIcon(tab.icon, 'h-4 w-4') : tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                  isActive
                    ? 'bg-gold/20 dark:bg-gold-dark/30 text-amber-950 dark:text-gold-dark'
                    : 'bg-black/10 dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark',
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SubNavTabs;
