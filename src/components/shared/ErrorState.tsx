/**
 * ErrorState — Unified error display card.
 *
 * Replaces the 3 different inline error UIs found across
 * MaiHoaView and other engine views.
 */
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  /** The error message to display. */
  message: string;
  /** Optional title (default: "Đã xảy ra lỗi"). */
  title?: string;
  /** Callback when the user clicks retry/back. */
  onRetry?: () => void;
  /** Label for the retry button (default: "← Thử lại"). */
  retryLabel?: string;
}

export default function ErrorState({
  message,
  title = 'Đã xảy ra lỗi',
  onRetry,
  retryLabel = '← Thử lại',
}: ErrorStateProps) {
  return (
    <div className="card-surface p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
      <div className="flex items-center gap-3 text-bad dark:text-bad-dark">
        <AlertCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-bold text-sm">{title}</h3>
          <p className="text-sm mt-0.5 opacity-80">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 text-sm text-gold dark:text-gold-dark font-medium hover:underline">
          {retryLabel}
        </button>
      )}
    </div>
  );
}
