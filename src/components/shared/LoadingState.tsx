/**
 * LoadingState — Branded loading indicator.
 *
 * Uses the project's gold accent for the spinner and an optional
 * module-aware label for contextual loading messages.
 */
import React from 'react';

interface LoadingStateProps {
  /** Loading message (default: "Đang tải..."). */
  label?: string;
}

function LoadingState({ label = 'Đang tải...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-24 animate-fade-scale" role="status" aria-label={label}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-3 border-gold/30 border-t-gold animate-spin" />
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium animate-pulse">
          {label}
        </p>
      </div>
    </div>
  );
}

export default React.memo(LoadingState);
