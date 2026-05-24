/**
 * ScoreBreakdown — Factor-by-factor expandable card
 * Shows each of the 6 scoring factors with its contribution.
 */

import React, { useState } from 'react';
import { ScoreBreakdownItem } from '@lich-viet/core/dungsu';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownItem[];
}

const FACTOR_ICONS: Record<string, string> = {
  truc: 'calendar_today',
  stars: 'star',
  dayGrade: 'wb_sunny',
  hour: 'schedule',
  kiTuoi: 'person',
  napAm: 'balance',
};

/** Map a score ratio to a qualitative label. */
function quantifyScore(value: number, maxValue: number): { text: string; colorClass: string } {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  if (ratio >= 0.7) return { text: 'Rất tốt', colorClass: 'text-emerald-600 dark:text-emerald-400' };
  if (ratio >= 0.4) return { text: 'Tốt vừa', colorClass: 'text-green-600 dark:text-green-400' };
  if (ratio >= 0.05) return { text: 'Bình thường', colorClass: 'text-amber-600 dark:text-amber-400' };
  if (ratio >= -0.3) return { text: 'Xấu', colorClass: 'text-orange-600 dark:text-orange-400' };
  return { text: 'Rất Xấu', colorClass: 'text-red-600 dark:text-red-400' };
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (breakdown.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <span className="material-icons-round text-base text-text-secondary-light dark:text-text-secondary-dark">
            analytics
          </span>
          Chi tiết đánh giá
        </span>
        <span
          className={`material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <div className="divide-y divide-border-light/50 dark:divide-border-dark/50 animate-fade-scale">
          {breakdown.map((item) => {
            const q = quantifyScore(item.value, item.maxValue);
            return (
              <div key={item.factor} className="px-4 py-3 flex items-start gap-3">
                <span className="material-icons-round text-base text-text-secondary-light dark:text-text-secondary-dark mt-0.5 shrink-0">
                  {FACTOR_ICONS[item.factor] || 'info'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      {item.label}
                    </span>
                    <span className={`text-sm font-bold ${q.colorClass}`}>{q.text}</span>
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 leading-relaxed">
                    {item.detail}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.value > 0 ? 'bg-emerald-500' : item.value < 0 ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.max(3, Math.abs(item.value / item.maxValue) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;
