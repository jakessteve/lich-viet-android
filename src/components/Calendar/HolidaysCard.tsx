import React from 'react';
import { HolidayEntry } from '../../hooks/useHolidays';
import CollapsibleCard from '../CollapsibleCard';
import { Badge } from '@/components/ui/badge';
import { CalendarHeart, Clock } from 'lucide-react';

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

  const titleNode = (
    <div className="flex items-center gap-2 font-semibold text-sm">
      <CalendarHeart className="h-4 w-4 text-gold dark:text-gold-dark" />
      <span>Ngày lễ sắp tới (14 ngày){countryName && !isVietnam ? ` — ${countryName}` : ''}</span>
    </div>
  );

  const headerRightNode = holidays.length > 0 ? (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gold/10 text-text-primary-light dark:text-gold-dark">
      {holidays.length} ngày lễ
    </span>
  ) : null;

  return (
    <CollapsibleCard
      title={titleNode}
      defaultOpen={false}
      collapseOnMobile={true}
      headerRight={headerRightNode}
      className="shadow-apple"
    >
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-3 py-2 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ) : (
          holidays.map((h, idx) => {
            const isToday = h.daysUntil === 0;
            const isTomorrow = h.daysUntil === 1;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors border ${
                  isToday
                    ? 'bg-gold/10 dark:bg-gold-dark/10 border-gold/30 dark:border-gold-dark/30'
                    : isTomorrow
                      ? 'bg-surface-subtle-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/40'
                      : 'bg-transparent border-border-light/30 dark:border-border-dark/20'
                }`}
              >
                <span className="text-2xl leading-none mt-0.5 shrink-0 select-none">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark leading-snug">
                      {h.name}
                    </p>
                    {/* Countdown Badge */}
                    {h.daysUntil !== undefined && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                          isToday
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : isTomorrow
                              ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                              : 'bg-surface-container-low dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isToday ? 'Hôm nay' : isTomorrow ? 'Ngày mai' : `Còn ${h.daysUntil} ngày`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {h.dateStr && (
                      <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark font-sans">
                        {h.dayOfWeek ? `${h.dayOfWeek}, ` : ''}{h.dateStr}
                      </span>
                    )}
                    <Badge
                      variant={h.source === 'vn-lunar' ? 'gold' : h.source === 'vn-solar' ? 'good' : 'info'}
                      className="text-[10px] px-1.5 py-0.2 rounded-full"
                    >
                      {SOURCE_LABELS[h.source]}
                    </Badge>
                    {h.daysOff && (
                      <Badge variant="bad" className="text-[10px] px-1.5 py-0.2 rounded-full">
                        Nghỉ lễ
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CollapsibleCard>
  );
};

export default HolidaysCard;
