/**
 * BestTimesPanel — Top 3 best hours for the selected activity today
 */

import React from 'react';
import { HourScoreEntry } from '@lich-viet/core/dungsu';

interface BestTimesPanelProps {
  bestHours: HourScoreEntry[];
  activityName: string;
}

const BestTimesPanel: React.FC<BestTimesPanelProps> = ({ bestHours, activityName }) => {
  if (bestHours.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
      <div className="px-4 py-3 bg-surface-subtle-light dark:bg-surface-subtle-dark">
        <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <span className="material-icons-round text-base text-gold dark:text-gold-dark">schedule</span>
          Giờ tốt nhất cho "{activityName}"
        </span>
      </div>
      <div className="divide-y divide-border-light/50 dark:divide-border-dark/50">
        {bestHours.map((entry, idx) => {
          const h = entry.hourInfo;
          const timeLabel = h.timeRange.replace(/:00/g, '').replace(' - ', ' – ');
          const medals = ['🥇', '🥈', '🥉'];

          return (
            <div
              key={h.canChi.chi}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-lg shrink-0">{medals[idx] || ''}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    {h.canChi.can} {h.canChi.chi}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      h.isAuspicious
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400'
                    }`}
                  >
                    {h.isAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo'}
                  </span>
                </div>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{timeLabel}</span>
              </div>
              <span
                className={`text-sm font-bold tabular-nums ${
                  entry.activityScore >= 70
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : entry.activityScore >= 50
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                }`}
              >
                {entry.activityScore}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BestTimesPanel;
