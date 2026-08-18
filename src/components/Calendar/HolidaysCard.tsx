import React from 'react';
import { HolidayEntry } from '../../hooks/useHolidays';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarHeart } from 'lucide-react';

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
    <Card className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden shadow-apple">
      {/* Header */}
      <CardHeader className="py-3 px-5 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-subtle-light dark:bg-surface-subtle-dark">
        <CardTitle className="font-semibold text-sm tracking-tight text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <CalendarHeart className="h-4 w-4 text-gold dark:text-gold-dark" />
          Ngày lễ{countryName && !isVietnam ? ` — ${countryName}` : ''}
        </CardTitle>
      </CardHeader>
      {/* Body */}
      <CardContent className="px-5 py-4 space-y-3">
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
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={h.source === 'vn-lunar' ? 'gold' : h.source === 'vn-solar' ? 'good' : 'info'}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                  >
                    {SOURCE_LABELS[h.source]}
                  </Badge>
                  {h.daysOff && (
                    <Badge variant="bad" className="text-[11px] px-2 py-0.5 rounded-full">
                      Nghỉ lễ
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default HolidaysCard;
