import React, { useState, useEffect } from 'react';
import { ChevronDown, Lock, Award, Diamond, Sparkles } from 'lucide-react';
import { useDeviceClass } from '../hooks/useDeviceClass';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';

type TierLevel = 'free' | 'premium' | 'elite' | 'credit';

interface CollapsibleCardProps {
  /** Card title — string or JSX */
  title: React.ReactNode;
  /**
   * Icon name (string for Material Icons, or React node for Lucide).
   */
  icon?: string | React.ReactNode;
  /** Whether card is open by default on desktop */
  defaultOpen?: boolean;
  /** Override: force collapsed on mobile regardless of defaultOpen */
  collapseOnMobile?: boolean;
  /** When true, the card is always expanded on desktop (non-collapsible) */
  alwaysOpenOnDesktop?: boolean;
  /** Optional element rendered to the right of the header */
  headerRight?: React.ReactNode;
  /** Optional extra className for the outer container */
  className?: string;
  /**
   * If set, shows a TierBadge in the header right area indicating which tier
   * is required to see this card's content.
   */
  tierBadge?: TierLevel;
  /**
   * Always-visible "one thing first" row shown ABOVE the collapsible content,
   * even when the card is collapsed.
   */
  highlightRow?: React.ReactNode;
  /**
   * Credit cost badge shown in header (e.g. 1 = "1 tín dụng").
   */
  creditCost?: number;
  children: React.ReactNode;
}

const TIER_BADGE_CONFIG: Record<string, { label: string; icon: React.ReactNode; colorClass: string }> = {
  free: {
    label: 'Miễn Phí',
    icon: <Lock className="h-3 w-3" />,
    colorClass:
      'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark',
  },
  premium: {
    label: 'Premium',
    icon: <Award className="h-3 w-3" />,
    colorClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  },
  elite: {
    label: 'Elite',
    icon: <Diamond className="h-3 w-3" />,
    colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  },
  credit: {
    label: 'Tín dụng',
    icon: <Sparkles className="h-3 w-3" />,
    colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  },
};

function CollapsibleCard({
  title,
  icon,
  defaultOpen = false,
  collapseOnMobile = true,
  alwaysOpenOnDesktop = false,
  headerRight,
  className = '',
  tierBadge,
  highlightRow,
  creditCost,
  children,
}: CollapsibleCardProps) {
  const { isCompact } = useDeviceClass();
  const [isOpen, setIsOpen] = useState(() => !(collapseOnMobile && isCompact) && defaultOpen);

  // On desktop with alwaysOpenOnDesktop, force open
  const forceOpen = alwaysOpenOnDesktop && !isCompact;
  const effectiveOpen = forceOpen || isOpen;

  // Sync collapsed state when tab changes or viewport switches
  useEffect(() => {
    if (collapseOnMobile && isCompact) {
      setIsOpen(false);
    } else if (!collapseOnMobile) {
      setIsOpen(defaultOpen);
    }
  }, [collapseOnMobile, isCompact, defaultOpen]);

  const badgeCfg = tierBadge ? TIER_BADGE_CONFIG[tierBadge] : null;

  return (
    <Collapsible
      open={effectiveOpen}
      onOpenChange={forceOpen ? undefined : setIsOpen}
      className={cn('card-surface overflow-hidden rounded-2xl', className)}
    >
      <div
        role={forceOpen ? undefined : 'button'}
        tabIndex={forceOpen ? undefined : 0}
        onClick={forceOpen ? undefined : () => setIsOpen((prev) => !prev)}
        onKeyDown={
          forceOpen
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsOpen((prev) => !prev);
                }
              }
        }
        className={cn(
          'card-header flex items-center justify-between w-full text-left transition-all',
          effectiveOpen
            ? 'rounded-t-2xl rounded-b-none border-b border-border-light/50 dark:border-border-dark/50'
            : 'rounded-2xl border-b-0',
          forceOpen
            ? ''
            : 'cursor-pointer hover:bg-surface-container-low/50 dark:hover:bg-white/5 spring-press motion-gpu',
        )}
        aria-expanded={effectiveOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && (
            <div className="text-text-secondary-light dark:text-text-secondary-dark shrink-0">
              {renderDynamicIcon(icon, 'h-4 w-4 shrink-0')}
            </div>
          )}
          {typeof title === 'string' ? (
            <h2 className="section-title text-sm sm:text-base font-semibold leading-snug break-words">
              {title}
            </h2>
          ) : (
            title
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Tier badge */}
          {badgeCfg && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium h-6 border border-border-light/40 dark:border-border-dark/40',
                badgeCfg.colorClass,
              )}
            >
              {badgeCfg.icon}
              {creditCost != null && tierBadge === 'credit' ? (
                <span>
                  {creditCost} {badgeCfg.label}
                </span>
              ) : (
                <span>{badgeCfg.label}</span>
              )}
            </div>
          )}
          {headerRight && (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
              {headerRight}
            </div>
          )}
          {!forceOpen && (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                effectiveOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Always-visible highlight row */}
      {highlightRow && (
        <div className="px-4 py-2.5 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-subtle-light/50 dark:bg-surface-subtle-dark/30">
          {highlightRow}
        </div>
      )}

      <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default React.memo(CollapsibleCard);
