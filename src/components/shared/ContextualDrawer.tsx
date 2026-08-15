/**
 * Contextual Bottom Sheet Drawer Component — Lịch Việt v3
 *
 * Provides a smooth, non-intrusive bottom drawer for mobile and desktop chart exploration.
 * Keeps the visual chart visible while displaying deep contextual interpretation below.
 */

import React, { useState } from 'react';

interface ContextualDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeClass?: string;
  children: React.ReactNode;
}

export const ContextualDrawer: React.FC<ContextualDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeClass = 'bg-gold/15 text-gold-light dark:text-gold-dark',
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed sm:relative inset-x-0 bottom-0 z-40 sm:z-auto transition-all duration-300 ease-out flex flex-col ${
        isExpanded ? 'h-[80vh]' : 'h-[44vh] sm:h-auto'
      } max-h-[85vh] bg-surface-card/95 backdrop-blur-md sm:backdrop-blur-none border-t sm:border border-border-light/80 dark:border-border-dark/80 rounded-t-3xl sm:rounded-2xl shadow-2xl sm:shadow-md overflow-hidden`}
      role="region"
      aria-label={title}
    >
        {/* Drag Handle & Header */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2.5 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-container-low/80 select-none">
          {/* Mobile Handle bar */}
          <div className="flex justify-center sm:hidden pb-2">
            <div className="w-10 h-1 rounded-full bg-border-light dark:bg-border-dark" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                  {title}
                </h3>
                {badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / Collapse toggle for mobile */}
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1 rounded-lg text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark sm:hidden"
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
              >
                <span className="material-icons-round text-base">
                  {isExpanded ? 'unfold_less' : 'unfold_more'}
                </span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark transition-colors"
                title="Đóng ngăn kéo"
              >
                <span className="material-icons-round text-base">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {children}
        </div>
      </div>
  );
};
