import React, { useCallback, startTransition } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useHolidays } from '@/hooks/useHolidays';
import MonthCalendar from '../MonthCalendar';
import HolidaysCard from '../Calendar/HolidaysCard';
import CollapsibleCard from '../CollapsibleCard';
import { NAP_AM_HANH, STAR_COLORS } from '@/services/tuvi/constants';
import type { ActiveTab } from '../../router/constants';

interface AppSidebarProps {
  activeTab: ActiveTab;
}

function AppSidebar({ activeTab }: AppSidebarProps) {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const data = useAppStore((s) => s.dayData);
  const viewerLocation = useAppStore((s) => s.viewerLocation);
  const isDark = useAppStore((s) => s.isDark);
  const _setSelectedDate = useAppStore((s) => s.setSelectedDate);

  // P2-11: Wrap date changes in startTransition to keep UI responsive
  const onSelectDate = useCallback(
    (date: Date) => {
      startTransition(() => {
        _setSelectedDate(date);
      });
    },
    [_setSelectedDate],
  );

  // Autonomous holiday fetching
  const { holidays, isLoading: holidaysLoading, countryName, isVietnam } = useHolidays(selectedDate, viewerLocation);

  const getNapAmColor = (napAm: string): string | undefined => {
    const element = NAP_AM_HANH[napAm];
    if (!element) return undefined;

    // Thủy is intentionally near-black in light mode, but that disappears on dark surfaces.
    if (isDark && element === 'Thủy') {
      return '#7dd3fc';
    }

    return STAR_COLORS[element];
  };
  const dayNapAmColor = getNapAmColor(data.fiveElements.napAm);
  const monthNapAmColor = getNapAmColor(data.fiveElements.napAmMonth);
  const yearNapAmColor = getNapAmColor(data.fiveElements.napAmYear);

  return (
    <aside
      id="tour-sidebar"
      className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-20 flex flex-col gap-6"
      aria-label="Lịch tháng và thông tin nhanh"
    >
      <div className="space-y-6">
        <div id="tour-calendar">
          <MonthCalendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            viewerLocation={viewerLocation}
            collapseOnMobile={true}
          />
        </div>

        {/* Holidays Card — only on Âm Lịch tab */}
        {activeTab === 'am-lich' && (
          <HolidaysCard
            holidays={holidays}
            isLoading={holidaysLoading}
            countryName={countryName}
            isVietnam={isVietnam}
          />
        )}

        {/* Daily Astrological Summary — shown on all tabs, collapsible */}
        <CollapsibleCard
          title={
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="section-title">{data.dayOfWeek}</span>
              <span className="text-xs sm:text-xs text-text-secondary-light dark:text-text-secondary-dark leading-tight font-normal whitespace-nowrap">
                ngày{' '}
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
                  {selectedDate.getDate()}
                </span>{' '}
                tháng{' '}
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
                  {selectedDate.getMonth() + 1}
                </span>{' '}
                năm{' '}
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
                  {selectedDate.getFullYear()}
                </span>
              </span>
            </div>
          }
          defaultOpen={true}
          collapseOnMobile={activeTab !== 'am-lich'}
          alwaysOpenOnDesktop={true}
          headerRight={
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`text-xs sm:text-sm font-bold ${(data.deityStatus || '').includes('Hắc') ? 'text-text-primary-light dark:text-text-primary-dark' : 'text-good dark:text-good-dark'}`}
              >
                {data.deityStatus}
              </span>
              {data.nguHanhGrade && (
                <span
                  title={
                    data.nguHanhGrade === 'Phạt nhật'
                      ? 'Ngày xung hành với tháng — nên cẩn trọng, hạn chế khởi sự'
                      : data.nguHanhGrade === 'Chế nhật'
                        ? 'Ngày khắc hành với tháng — cần xem xét kỹ trước khi hành động'
                        : 'Ngày hài hòa ngũ hành với tháng — tốt cho khởi sự'
                  }
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full cursor-help ${
                    data.nguHanhGrade === 'Phạt nhật'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      : data.nguHanhGrade === 'Chế nhật'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  }`}
                >
                  {data.nguHanhGrade}
                </span>
              )}
            </div>
          }
        >
          <div className="p-5">
            <div className="flex flex-col gap-2.5 mb-6 border-b border-border-light/50 dark:border-border-dark/50 pb-6 text-sm sm:text-base leading-relaxed">
              <div>
                <span className="font-semibold text-text-secondary-light dark:text-text-secondary-dark">Âm lịch:</span>{' '}
                <span className="text-text-primary-light dark:text-text-primary-dark">
                  ngày <span className="font-bold">{data.lunarDate.day}</span> tháng{' '}
                  <span className="font-bold">{data.lunarDate.month}</span> năm{' '}
                  <span className="font-bold">
                    {data.canChi.year.can} {data.canChi.year.chi}
                  </span>
                </span>
              </div>
              <div>
                <span className="font-semibold text-text-secondary-light dark:text-text-secondary-dark">Tiết khí:</span>{' '}
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{data.solarTerm}</span>
                {data.tietKhiDetail && (
                  <div className="text-sm sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    ({data.tietKhiDetail})
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 text-center gap-y-6 gap-x-4">
              <div className="flex flex-col items-center">
                <span className="label-standard block mb-1">Ngày</span>
                <p
                  className="font-bold text-base sm:text-base text-text-primary-light dark:text-text-primary-dark"
                  style={dayNapAmColor ? { color: dayNapAmColor } : undefined}
                >
                  {data.canChi.day.can} {data.canChi.day.chi}
                </p>
                <p
                  className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate max-w-full"
                  style={dayNapAmColor ? { color: dayNapAmColor } : undefined}
                >
                  {data.fiveElements.napAm}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="label-standard block mb-1">Tháng</span>
                <p
                  className="font-bold text-base sm:text-base text-text-primary-light dark:text-text-primary-dark"
                  style={monthNapAmColor ? { color: monthNapAmColor } : undefined}
                >
                  {data.canChi.month.can} {data.canChi.month.chi}
                </p>
                <p
                  className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate max-w-full"
                  style={monthNapAmColor ? { color: monthNapAmColor } : undefined}
                >
                  {data.fiveElements.napAmMonth}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="label-standard block mb-1">Năm</span>
                <p
                  className="font-bold text-base sm:text-base text-text-primary-light dark:text-text-primary-dark"
                  style={yearNapAmColor ? { color: yearNapAmColor } : undefined}
                >
                  {data.canChi.year.can} {data.canChi.year.chi}
                </p>
                <p
                  className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate max-w-full"
                  style={yearNapAmColor ? { color: yearNapAmColor } : undefined}
                >
                  {data.fiveElements.napAmYear}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="label-standard block mb-1">Phật Lịch</span>
                <p className="font-bold text-base sm:text-base text-text-primary-light dark:text-text-primary-dark">
                  {data.buddhistYear}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </aside>
  );
}

export default React.memo(AppSidebar);
