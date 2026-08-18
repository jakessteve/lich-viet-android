import React from 'react';
import { DayCellData } from '@/types/calendar';

interface DayCellProps {
  data: DayCellData;
  isSelected: boolean;
  onClick: (date: Date) => void;
  roundedClass?: string;
  hasEvent?: boolean;
  eventTitles?: string[];
}

const DayCellInner: React.FC<DayCellProps> = ({
  data,
  isSelected,
  onClick,
  roundedClass = '',
  hasEvent = false,
  eventTitles,
}) => {
  const { solarDate, lunarDate, dayQuality, isCurrentMonth, isToday, fullDate, personalScore } = data;
  const isWeekend = fullDate.getDay() === 0 || fullDate.getDay() === 6;

  /** Readable date label for screen readers, e.g. "3 tháng 3 năm 2026, Tốt" */
  const dayQualityLabel = dayQuality === 'Good' ? ', Ngày tốt' : dayQuality === 'Bad' ? ', Ngày xấu' : '';
  const personalAria = personalScore ? `, Tuổi bạn: ${personalScore.label}` : '';
  const eventAria = hasEvent && eventTitles?.length
    ? `, Có ${eventTitles.length} sự kiện: ${eventTitles.join(', ')}`
    : hasEvent
      ? ', Có sự kiện'
      : '';
  const ariaLabel = `Ngày ${solarDate} tháng ${fullDate.getMonth() + 1} năm ${fullDate.getFullYear()}, Âm lịch ${lunarDate}${isToday ? ', Hôm nay' : ''}${dayQualityLabel}${personalAria}${eventAria}`;

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
        className={`bg-surface-light dark:bg-surface-dark aspect-square flex flex-col items-center justify-center opacity-40 pointer-events-none ${roundedClass}`}
        aria-hidden="true"
      >
        <span className="text-sm sm:text-base font-semibold">{solarDate}</span>
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
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-current={isToday ? 'date' : undefined}
      className={`
        aspect-square p-0.5 sm:p-1 flex flex-col items-center justify-center relative cursor-pointer
        transition-[background-color,box-shadow,color,opacity] duration-150 motion-gpu select-none
        ${roundedClass}
        ${isToday ? 'bg-primary/10 dark:bg-primary/15' : 'bg-surface-light dark:bg-surface-dark'}
        ${
          isSelected
            ? 'ring-2 ring-inset ring-primary bg-primary/15 dark:bg-primary/25 z-20 font-bold shadow-apple rounded-lg sm:rounded-md'
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
        text-sm sm:text-base md:text-lg font-bold tracking-tight mb-0.5 relative z-10 text-center leading-none select-none
        ${
          isSelected
            ? 'text-text-primary-light dark:text-white font-extrabold'
            : isToday
              ? 'text-primary dark:text-purple-300 font-extrabold'
              : isWeekend
                ? 'text-calendar-weekend'
                : 'text-text-primary-light dark:text-text-primary-dark'
        }
      `}
      >
        {solarDate}
      </span>
      <span className="text-[10px] sm:text-[11px] md:text-xs leading-none text-text-secondary-light/80 dark:text-text-secondary-dark/80 font-normal relative z-10 text-center select-none">
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
          (personalScore.actionScore >= 2 ? (
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

        {/* User Scheduled Event Pip */}
        {hasEvent && (
          <div
            className="w-1.5 h-1.5 rounded-full bg-purple dark:bg-purple-dark ring-1 ring-purple/40 shrink-0"
            title={eventTitles?.length ? `Có ${eventTitles.length} sự kiện: ${eventTitles.join(', ')}` : 'Có sự kiện'}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

const DayCell = React.memo(DayCellInner);

export default DayCell;
