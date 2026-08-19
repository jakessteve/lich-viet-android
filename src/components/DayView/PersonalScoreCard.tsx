import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';
import { Badge } from '@/components/shared';
import type { PersonalDayScore } from '@/types/calendar';

interface PersonalScoreCardProps {
  personalScore: PersonalDayScore;
}

export const PersonalScoreCard: React.FC<PersonalScoreCardProps> = ({
  personalScore,
}) => {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 page-enter-smooth ${
        personalScore.actionScore >= 2
          ? 'bg-purple/5 dark:bg-purple-dark/5 border-purple/30 dark:border-purple-dark/30'
          : personalScore.actionScore < 0
            ? 'bg-orange/5 dark:bg-orange-dark/5 border-orange/30 dark:border-orange-dark/30'
            : 'bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/60 border-border-light/60 dark:border-border-dark/60'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div className="mt-0.5 shrink-0">
          {personalScore.actionScore >= 2 ? (
            <Smile className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          ) : personalScore.actionScore < 0 ? (
            <Frown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          ) : (
            <Meh className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
          )}
        </div>
        <div className="text-sm leading-relaxed flex-1">
          <div className="font-bold text-text-primary-light dark:text-text-primary-dark">
            Điểm cá nhân hoá:{' '}
            <span
              className={
                personalScore.actionScore >= 2
                  ? 'text-purple dark:text-purple-dark'
                  : personalScore.actionScore < 0
                    ? 'text-orange dark:text-orange-dark'
                    : 'text-text-primary-light dark:text-text-primary-dark'
              }
            >
              {personalScore.label}
            </span>
          </div>
          <div className="text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            {personalScore.description}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {personalScore.isTamHop && <Badge variant="purple">Tam Hợp</Badge>}
            {personalScore.isLucHop && <Badge variant="purple">Lục Hợp</Badge>}
            {personalScore.isThaiTue && <Badge variant="gold">Trị Thái Tuế</Badge>}
            {personalScore.isTuongXung && <Badge variant="orange">Lục Xung</Badge>}
            {personalScore.isTuongHai && <Badge variant="orange">Lục Hại</Badge>}
            {personalScore.isTuongHinh && <Badge variant="bad">Tương Hình</Badge>}
            {personalScore.isTuongPha && <Badge variant="bad">Tương Phá</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PersonalScoreCard);
