import React from 'react';

export type SkeletonVariant = 'calendar' | 'chart' | 'settings' | 'default';

interface PageSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = 'default', className = '' }) => {
  return (
    <div className={`w-full max-w-4xl mx-auto space-y-4 p-3 sm:p-4 animate-pulse ${className}`} role="status" aria-label="Đang tải nội dung">
      {/* Top Header Bar Skeleton */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border-light/40 dark:border-border-dark/40">
        <div className="h-7 w-36 bg-surface-subtle-light dark:bg-white/10 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-7 w-16 bg-surface-subtle-light dark:bg-white/10 rounded-lg" />
          <div className="h-7 w-8 bg-surface-subtle-light dark:bg-white/10 rounded-lg" />
        </div>
      </div>

      {variant === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Month Grid Skeleton */}
          <div className="h-44 sm:h-56 bg-surface-subtle-light dark:bg-white/5 rounded-3xl border border-border-light/40 dark:border-border-dark/40" />
          {/* Hero Card Skeleton */}
          <div className="h-64 sm:h-72 bg-surface-subtle-light dark:bg-white/5 rounded-3xl border border-border-light/40 dark:border-border-dark/40 p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-6 w-32 bg-surface-subtle-light dark:bg-white/10 rounded-lg" />
              <div className="h-6 w-20 bg-surface-subtle-light dark:bg-white/10 rounded-lg" />
            </div>
            <div className="h-16 w-full bg-surface-subtle-light dark:bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="h-12 bg-surface-subtle-light dark:bg-white/10 rounded-xl" />
              <div className="h-12 bg-surface-subtle-light dark:bg-white/10 rounded-xl" />
              <div className="h-12 bg-surface-subtle-light dark:bg-white/10 rounded-xl" />
              <div className="h-12 bg-surface-subtle-light dark:bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {variant === 'chart' && (
        <div className="space-y-4">
          {/* Chart Header Skeleton */}
          <div className="h-20 bg-surface-subtle-light dark:bg-white/5 rounded-2xl border border-border-light/40 dark:border-border-dark/40" />
          {/* 12-palace / Natal Chart Wheel Skeleton */}
          <div className="h-96 sm:h-[480px] bg-surface-subtle-light dark:bg-white/5 rounded-3xl border border-border-light/40 dark:border-border-dark/40" />
        </div>
      )}

      {variant === 'settings' && (
        <div className="space-y-3">
          <div className="h-28 bg-surface-subtle-light dark:bg-white/5 rounded-2xl border border-border-light/40 dark:border-border-dark/40" />
          <div className="h-36 bg-surface-subtle-light dark:bg-white/5 rounded-2xl border border-border-light/40 dark:border-border-dark/40" />
          <div className="h-44 bg-surface-subtle-light dark:bg-white/5 rounded-2xl border border-border-light/40 dark:border-border-dark/40" />
        </div>
      )}

      {variant === 'default' && (
        <div className="space-y-4">
          <div className="h-40 bg-surface-subtle-light dark:bg-white/5 rounded-2xl border border-border-light/40 dark:border-border-dark/40" />
          <div className="h-60 bg-surface-subtle-light dark:bg-white/5 rounded-2xl border border-border-light/40 dark:border-border-dark/40" />
        </div>
      )}
    </div>
  );
};

export default React.memo(PageSkeleton);
