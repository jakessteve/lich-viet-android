import React from 'react';
import { Clock } from 'lucide-react';
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
          <Clock className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
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
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors"
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
                        ? 'bg-good/10 text-good dark:bg-good-dark/15 dark:text-good-dark'
                        : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark'
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
                    ? 'text-good dark:text-good-dark'
                    : entry.activityScore >= 50
                      ? 'text-gold dark:text-gold-dark'
                      : 'text-bad dark:text-bad-dark'
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
