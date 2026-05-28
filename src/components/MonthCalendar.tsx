import React, { useState, useMemo, useEffect } from 'react';
import DayCell from './DayCell';
import { getMonthDays } from '@lich-viet/core/calendar';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../stores/authStore';
import { calculatePersonalDayScore } from '../services/personalization';
import { IconButton } from './shared';
import type { SwissGeoLocation } from '../services/astronomy/swissEphemeris';
import { getCivilDateForOffset } from '@/utils/geo';
import { getUserBirthProfile } from '@/utils/userBirthProfile';

interface MonthCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  viewerLocation?: SwissGeoLocation | null;
  /** Start collapsed on mobile (shows only selected week row) */
  collapseOnMobile?: boolean;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  selectedDate,
  onSelectDate,
  viewerLocation,
  collapseOnMobile = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const { user } = useAuthStore();
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);

  const days = useMemo(() => {
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth(), viewerLocation ?? undefined);
  }, [currentDate, viewerLocation]);

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate]);

  const birthYear = userBirthProfile?.birthYear;

  // Overlay personal scores onto days
  const daysWithScore = useMemo(() => {
    if (!birthYear) return days;
    return days.map((day) => {
      if (!day.dayChi) return day;
      const personalScore = calculatePersonalDayScore(birthYear, day.dayChi, userBirthProfile);
      return personalScore ? { ...day, personalScore } : day;
    });
  }, [birthYear, days, userBirthProfile]);

  // Labels matching the design order (Starting from Monday/T2)
  const visualWeekDays = useMemo(() => ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], []);
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
  const yearOptions = useMemo(() => Array.from({ length: 201 }, (_, i) => 1900 + i), []);

  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!(collapseOnMobile && isMobile));

  // Sync expanded state when navigating between tabs (prop changes)
  useEffect(() => {
    if (collapseOnMobile && isMobile) {
      setIsExpanded(false);
    } else if (!collapseOnMobile) {
      setIsExpanded(true);
    }
  }, [collapseOnMobile, isMobile]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Compute which row index (0-based, 7 days per row) contains the selected date
  const selectedRowIndex = useMemo(() => {
    const selectedStr = selectedDate.toDateString();
    const idx = daysWithScore.findIndex((d) => d.fullDate.toDateString() === selectedStr);
    if (idx === -1) return 0; // fallback to first row
    return Math.floor(idx / 7);
  }, [daysWithScore, selectedDate]);

  // When collapsed, show the row containing the selected date
  const collapsedRowDays = useMemo(() => {
    const start = selectedRowIndex * 7;
    return daysWithScore.slice(start, start + 7);
  }, [daysWithScore, selectedRowIndex]);

  // Month/Year dropdown selection handlers
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  // Shared select styling
  const selectClass =
    'appearance-none bg-transparent font-semibold text-sm sm:text-sm text-text-primary-light dark:text-text-primary-dark cursor-pointer hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-md px-1.5 py-1 text-center';

  return (
    <div className="space-y-4">
      {/* Month/Year Picker */}
      <div className="surface-card rounded-xl p-2 w-full relative">
        <div className="sm:hidden flex items-center gap-1">
          <IconButton
            onClick={prevMonth}
            className="z-10 shrink-0 h-10 w-10 min-h-10 min-w-10"
            icon="chevron_left"
            label="Tháng trước"
          />

          <div className="flex min-w-0 flex-1 justify-center px-1">
            <div className="flex items-center gap-1 whitespace-nowrap font-semibold text-sm">
              <select
                value={currentDate.getMonth()}
                onChange={handleMonthChange}
                className={selectClass}
                aria-label="Chọn tháng"
              >
                {monthOptions.map((i) => (
                  <option key={i} value={i}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-gray-300 dark:text-gray-600 select-none">|</span>
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className={selectClass}
                aria-label="Chọn năm"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="z-10 flex items-center gap-1 shrink-0">
            <IconButton
              onClick={nextMonth}
              className="shrink-0 h-10 w-10 min-h-10 min-w-10"
              icon="chevron_right"
              label="Tháng sau"
            />
            <IconButton
              onClick={() => {
                const today = viewerLocation
                  ? getCivilDateForOffset(new Date(), viewerLocation.timezoneOffsetHours)
                  : new Date();
                setCurrentDate(today);
                onSelectDate(today);
              }}
              className="shrink-0 h-10 w-10 min-h-10 min-w-10"
              title="Hôm nay"
              icon="today"
              label="Về hôm nay"
            />
            <div className="w-px h-4 bg-border-light dark:bg-border-dark mx-1 shrink-0" />
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 h-10 w-10 min-h-10 min-w-10"
              icon="expand_more"
              iconClassName={isExpanded ? 'rotate-180' : undefined}
              label={isExpanded ? 'Thu gọn lịch' : 'Mở rộng lịch'}
            />
            <span className="sr-only" aria-live="polite">
              {isExpanded ? 'Lịch đang mở rộng' : 'Lịch đang thu gọn'}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-between w-full">
          <IconButton
            onClick={prevMonth}
            className="z-10 shrink-0"
            icon="chevron_left"
            label="Tháng trước"
          />

          <div className="flex-1 flex justify-center py-1.5">
            <div className="flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-sm">
              <select
                value={currentDate.getMonth()}
                onChange={handleMonthChange}
                className={selectClass}
                aria-label="Chọn tháng"
              >
                {monthOptions.map((i) => (
                  <option key={i} value={i}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-gray-300 dark:text-gray-600 select-none">|</span>
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className={selectClass}
                aria-label="Chọn năm"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="z-10 flex items-center gap-1 shrink-0">
            <IconButton
              onClick={nextMonth}
              className="shrink-0"
              icon="chevron_right"
              label="Tháng sau"
            />
            <IconButton
              onClick={() => {
                const today = viewerLocation
                  ? getCivilDateForOffset(new Date(), viewerLocation.timezoneOffsetHours)
                  : new Date();
                setCurrentDate(today);
                onSelectDate(today);
              }}
              className="shrink-0"
              title="Hôm nay"
              icon="today"
              label="Về hôm nay"
            />
            <div className="w-px h-4 bg-border-light dark:bg-border-dark mx-1" />
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
              icon="expand_more"
              iconClassName={isExpanded ? 'rotate-180' : undefined}
              label={isExpanded ? 'Thu gọn lịch' : 'Mở rộng lịch'}
            />
            <span className="sr-only" aria-live="polite">
              {isExpanded ? 'Lịch đang mở rộng' : 'Lịch đang thu gọn'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid - Collapsible */}
      <div
        className="surface-card p-3 transition-colors flex flex-col"
        role="grid"
        aria-label={`Lịch tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`}
      >
        {/* Weekday header — always visible */}
        <div className="grid grid-cols-7 mb-1 pb-1 border-b border-border-light dark:border-border-dark">
          {visualWeekDays.map((day) => (
            <div
              key={day}
              className={`text-center text-xs font-bold py-1 ${day === 'CN' || day === 'T7' ? 'text-calendar-weekend' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
            >
              {day}
            </div>
          ))}
        </div>

        {isExpanded ? (
          /* Full calendar grid */
          <div className="flex flex-col rounded-lg border border-border-light/60 dark:border-border-dark/60 bg-surface-container-low dark:bg-surface-elevated-dark overflow-visible">
            {Array.from({ length: Math.ceil(daysWithScore.length / 7) }).map((_, rowIdx) => {
              const rowDays = daysWithScore.slice(rowIdx * 7, rowIdx * 7 + 7);
              const isFirst = rowIdx === 0;
              const isLast = rowIdx === Math.ceil(daysWithScore.length / 7) - 1;
              return (
                <div key={rowIdx} className={`grid grid-cols-7 gap-px w-full ${rowIdx > 0 ? 'mt-px' : ''}`}>
                  {rowDays.map((day, colIdx) => {
                    let roundedClass = '';
                    if (isFirst && colIdx === 0) roundedClass = 'rounded-tl-lg';
                    else if (isFirst && colIdx === 6) roundedClass = 'rounded-tr-lg';
                    else if (isLast && colIdx === 0) roundedClass = 'rounded-bl-lg';
                    else if (isLast && colIdx === 6) roundedClass = 'rounded-br-lg';

                    return (
                      <DayCell
                        key={rowIdx * 7 + colIdx}
                        data={day}
                        isSelected={selectedDate.toDateString() === day.fullDate.toDateString()}
                        onClick={onSelectDate}
                        roundedClass={roundedClass}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          /* Collapsed: show only the row containing the selected date */
          <div className="flex flex-col rounded-lg border border-border-light/60 dark:border-border-dark/60 bg-surface-container-low dark:bg-surface-elevated-dark overflow-visible">
            <div className="grid grid-cols-7 gap-px w-full">
              {collapsedRowDays.map((day, colIdx) => {
                let roundedClass = '';
                if (colIdx === 0) roundedClass = 'rounded-l-lg';
                else if (colIdx === 6) roundedClass = 'rounded-r-lg';

                return (
                  <DayCell
                    key={`collapsed-${colIdx}`}
                    data={day}
                    isSelected={selectedDate.toDateString() === day.fullDate.toDateString()}
                    onClick={onSelectDate}
                    roundedClass={roundedClass}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Legend — all color-coded indicators */}
        <div className="mt-2 border-t border-border-light/50 pt-2 text-xs text-text-secondary-light select-none dark:border-border-dark/50 dark:text-text-secondary-dark">
          <div className="mx-auto grid max-w-fit grid-cols-2 gap-x-4 gap-y-1">
            {/* Day quality indicators */}
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              Hoàng Đạo
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-red-500 dark:bg-red-400" />
              Hắc Đạo
            </span>
            {/* Personal score indicators */}
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-sm bg-purple-500" />
              Cát theo tuổi
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500 ring-1 ring-amber-700/25 dark:bg-amber-400 dark:ring-amber-200/20" />
              Hung theo tuổi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MonthCalendar);
