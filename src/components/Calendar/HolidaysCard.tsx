import React from 'react';
import { HolidayEntry } from '../../hooks/useHolidays';

interface HolidaysCardProps {
  holidays: HolidayEntry[];
  isLoading: boolean;
  countryName: string | null;
  isVietnam: boolean;
}

const SOURCE_LABELS: Record<HolidayEntry['source'], string> = {
  'vn-solar': 'Dương lịch VN',
  'vn-lunar': 'Âm lịch VN',
  local: 'Ngày lễ địa phương',
};

const HolidaysCard: React.FC<HolidaysCardProps> = ({ holidays, isLoading, countryName, isVietnam }) => {
  // Don't render the card at all if nothing to show and not loading
  if (!isLoading && holidays.length === 0) {
    return null;
  }

  return (
    <div className="card-surface">
      {/* Header */}
      <div className="card-header !py-3">
        <h3 className="font-semibold text-sm tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Ngày lễ{countryName && !isVietnam ? ` — ${countryName}` : ''}
        </h3>
      </div>
      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-3 py-2 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ) : (
          holidays.map((h, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <span className="text-2xl leading-none mt-0.5 shrink-0">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark leading-snug">
                  {h.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      h.source === 'vn-lunar'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        : h.source === 'vn-solar'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    }`}
                  >
                    {SOURCE_LABELS[h.source]}
                  </span>
                  {h.daysOff && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                      Nghỉ lễ
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HolidaysCard;
