import React from 'react';
import { DayCellData } from '@/types/calendar';

interface DayCellProps {
  data: DayCellData;
  isSelected: boolean;
  onClick: (date: Date) => void;
  roundedClass?: string;
}

const DayCellInner: React.FC<DayCellProps> = ({ data, isSelected, onClick, roundedClass = '' }) => {
  const { solarDate, lunarDate, dayQuality, isCurrentMonth, isToday, fullDate, personalScore } = data;
  const isWeekend = fullDate.getDay() === 0 || fullDate.getDay() === 6;

  /** Readable date label for screen readers, e.g. "3 tháng 3 năm 2026, Tốt" */
  const dayQualityLabel = dayQuality === 'Good' ? ', Ngày tốt' : dayQuality === 'Bad' ? ', Ngày xấu' : '';
  const personalAria = personalScore ? `, Tuổi bạn: ${personalScore.label}` : '';
  const ariaLabel = `Ngày ${solarDate} tháng ${fullDate.getMonth() + 1} năm ${fullDate.getFullYear()}, Âm lịch ${lunarDate}${isToday ? ', Hôm nay' : ''}${dayQualityLabel}${personalAria}`;

  const getDotColor = () => {
    switch (dayQuality) {
      case 'Good':
        return 'bg-emerald-500';
      case 'Bad':
        return 'bg-red-500 dark:bg-red-400';
      default:
        return null;
    }
  };

  const dotColor = getDotColor();

  if (!isCurrentMonth) {
    return (
      <div
        className={`bg-surface-light dark:bg-surface-dark aspect-square flex flex-col items-center justify-center opacity-50 pointer-events-none ${roundedClass}`}
        aria-hidden="true"
      >
        <span className="text-xs font-medium">{solarDate}</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(fullDate)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(fullDate);
        }
      }}
      role="gridcell"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-selected={isSelected}
      className={`
        aspect-square min-h-[2.75rem] sm:min-h-[3rem] flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer relative group
        active:scale-95
        ${
          isToday
            ? 'bg-amber-50/70 dark:bg-amber-900/20 day-cell-today'
            : 'bg-surface-light dark:bg-surface-dark'
        }
        ${roundedClass}
        ${
          isSelected && !isToday
            ? 'day-cell-selected bg-surface-bright dark:bg-surface-elevated-dark/60'
            : !isToday
              ? 'hover:bg-surface-container-lowest dark:hover:bg-white/5'
              : ''
        }
        ${
          isSelected && !isToday
            ? ''
            : isToday
              ? 'focus:outline-none'
              : 'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset'
        }
      `}
    >
      <span
        className={`
        text-xs sm:text-sm font-medium mb-0.5 relative z-10
        ${isToday ? 'text-primary' : isWeekend ? 'text-calendar-weekend' : 'text-text-primary-light dark:text-text-primary-dark'}
      `}
      >
        {solarDate}
      </span>
      <span className="text-xs leading-none text-text-secondary-light dark:text-text-secondary-dark font-semibold relative z-10">
        {lunarDate}
      </span>

      {/* Day Quality Indicator — shape differentiation for color-blind accessibility */}
      <div className="flex gap-1 mt-0.5 relative z-10 items-center justify-center">
        {dotColor ? (
          dayQuality === 'Good' ? (
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} title="Hoàng Đạo (ngày tốt)" aria-hidden="true" />
          ) : (
            <div
              className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rotate-45"
              title="Hắc Đạo (ngày xấu)"
              aria-hidden="true"
            />
          )
        ) : (
          <div className="w-1.5 h-1.5 bg-transparent" aria-hidden="true" />
        )}

        {/* WCAG compliant Personal Score Badge */}
        {personalScore &&
          (personalScore.actionScore >= 3 ? (
            <div
              className="w-1.5 h-1.5 rounded-sm bg-purple-500"
              title={`Cát theo tuổi: ${personalScore.label}`}
              aria-hidden="true"
            /> // Square for personal good
          ) : personalScore.actionScore < 0 ? (
            <div
              className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rotate-45 ring-1 ring-amber-700/25 dark:ring-amber-200/20"
              title={`Hung theo tuổi: ${personalScore.label}`}
              aria-hidden="true"
            /> // Diamond for personal bad
          ) : null)}
      </div>
    </div>
  );
};

const DayCell = React.memo(DayCellInner);

export default DayCell;
