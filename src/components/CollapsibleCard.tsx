import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

type TierLevel = 'free' | 'premium' | 'elite' | 'credit';

interface CollapsibleCardProps {
  /** Card title — string or JSX */
  title: React.ReactNode;
  /**
   * Material Icons name (e.g. "auto_awesome", "calculate").
   * Avoid emojis — use icon names for visual consistency.
   */
  icon?: string;
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
   * is required to see this card's content. Does NOT gate the content — just
   * communicates access. Pair with <ContentGate> for actual gating.
   */
  tierBadge?: TierLevel;
  /**
   * Always-visible "one thing first" row shown ABOVE the collapsible content,
   * even when the card is collapsed. Use for a key insight / highlight.
   */
  highlightRow?: React.ReactNode;
  /**
   * Credit cost badge shown in header (e.g. 1 = "1 tín dụng").
   * Displayed alongside tierBadge when tierBadge="credit".
   */
  creditCost?: number;
  children: React.ReactNode;
}

const TIER_BADGE_CONFIG: Record<string, { label: string; icon: string; colorClass: string }> = {
  free: {
    label: 'Miễn Phí',
    icon: 'lock',
    colorClass: 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
  },
  premium: {
    label: 'Premium',
    icon: 'workspace_premium',
    colorClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  elite: {
    label: 'Elite',
    icon: 'diamond',
    colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  },
  credit: {
    label: 'Tín dụng',
    icon: 'stars',
    colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  },
};

function CollapsibleCard({
  title,
  icon,
  defaultOpen = true,
  collapseOnMobile = true,
  alwaysOpenOnDesktop = false,
  headerRight,
  className = '',
  tierBadge,
  highlightRow,
  creditCost,
  children,
}: CollapsibleCardProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(() => !(collapseOnMobile && isMobile) && defaultOpen);

  // On desktop with alwaysOpenOnDesktop, force open
  const forceOpen = alwaysOpenOnDesktop && !isMobile;
  const effectiveOpen = forceOpen || isOpen;

  // Sync collapsed state when tab changes or viewport switches
  useEffect(() => {
    if (collapseOnMobile && isMobile) {
      setIsOpen(false);
    } else if (!collapseOnMobile) {
      setIsOpen(defaultOpen);
    }
  }, [collapseOnMobile, isMobile, defaultOpen]);

  const badgeCfg = tierBadge ? TIER_BADGE_CONFIG[tierBadge] : null;

  return (
    <div className={`card-surface ${className}`}>
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
        className={`card-header flex items-center justify-between w-full text-left transition-colors ${forceOpen ? '' : 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/3'}`}
        aria-expanded={effectiveOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span
              className="material-icons-round text-lg shrink-0 text-text-secondary-light dark:text-text-secondary-dark"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          {typeof title === 'string' ? <h2 className="section-title truncate">{title}</h2> : title}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Tier badge */}
          {badgeCfg && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium h-6 ${badgeCfg.colorClass}`}
            >
              <span className="material-icons-round text-[13px] leading-none" aria-hidden="true">
                {badgeCfg.icon}
              </span>
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
            <span
              className={`material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-300 ${effectiveOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              expand_more
            </span>
          )}
        </div>
      </div>

      {/* Always-visible highlight row (one key insight, shown even when collapsed) */}
      {highlightRow && (
        <div className="px-4 py-2.5 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-subtle-light/50 dark:bg-surface-subtle-dark/30">
          {highlightRow}
        </div>
      )}

      <div className="collapse-grid" data-open={effectiveOpen}>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default React.memo(CollapsibleCard);
