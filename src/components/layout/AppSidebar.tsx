import React, { useCallback, startTransition } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useHolidays } from '@/hooks/useHolidays';
import MonthCalendar from '../MonthCalendar';
import HolidaysCard from '../Calendar/HolidaysCard';
import UpcomingEventsCard from '../Calendar/UpcomingEventsCard';
import CollapsibleCard from '../CollapsibleCard';
import { getNapAmThemeColor } from '@/utils/formatHelpers';
import type { ActiveTab } from '../../router/constants';
import { Info, ShieldCheck, User } from 'lucide-react';

interface AppSidebarProps {
  activeTab: ActiveTab;
}

function AppSidebar({ activeTab }: AppSidebarProps) {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const data = useAppStore((s) => s.dayData);
  const viewerLocation = useAppStore((s) => s.viewerLocation);
  const isDark = useAppStore((s) => s.isDark);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const isPersonalized = useAppStore((s) => s.isPersonalized);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // P2-11: Wrap date changes in startTransition to keep UI responsive
  const onSelectDate = useCallback(
    (date: Date) => {
      startTransition(() => {
        setSelectedDate(date);
      });
    },
    [setSelectedDate],
  );

  // Autonomous holiday fetching
  const { holidays, isLoading: holidaysLoading, countryName, isVietnam } = useHolidays(selectedDate, viewerLocation);

  const dayNapAmColor = getNapAmThemeColor(data.fiveElements.napAm, isDark);
  const monthNapAmColor = getNapAmThemeColor(data.fiveElements.napAmMonth, isDark);
  const yearNapAmColor = getNapAmThemeColor(data.fiveElements.napAmYear, isDark);

  return (
    <aside
      id="tour-sidebar"
      className="w-full md:w-[280px] lg:w-[340px] xl:w-[400px] shrink-0 md:sticky md:top-20 flex flex-col gap-6"
      aria-label="Lịch tháng và thông tin nhanh"
    >
      <div className="space-y-6">
        <div id="tour-calendar">
          <MonthCalendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            viewerLocation={viewerLocation}
            isPersonalized={isPersonalized}
            collapseOnMobile={true}
          />
        </div>

        {/* Holidays Card & Upcoming Events Card — on Âm Lịch tab */}
        {activeTab === 'am-lich' && (
          <>
            <HolidaysCard
              holidays={holidays}
              isLoading={holidaysLoading}
              countryName={countryName}
              isVietnam={isVietnam}
            />
            <UpcomingEventsCard
              daysAhead={14}
              selectedDate={selectedDate}
            />
          </>
        )}



        {/* Contextual Hints for New Features */}
        {activeTab === 'ngay-tot' && (
          <div className="surface-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="flex items-start gap-3 text-sm text-text-primary-light dark:text-text-primary-dark">
              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block mb-1">Tra cứu Ngày Tốt</span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  Thuật toán tổng hợp chấm điểm từ Tử Vi, Lục Nhâm, và Chiêm Tinh Tây Phương.
                </span>
              </div>
            </div>
          </div>
        )}

        {String(activeTab).startsWith('chiem-tinh') && (
          <div className="surface-card p-4 rounded-2xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/10">
            <div className="flex items-start gap-3 text-sm text-text-primary-light dark:text-text-primary-dark">
              {isAuthenticated ? (
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              ) : (
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              )}
              <div>
                <span className="font-semibold block mb-1">Chiêm Tinh Học</span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  {isAuthenticated
                    ? `Đã liên kết hồ sơ của ${user?.displayName || user?.email?.split('@')[0] || 'bạn'}. Tự động đồng bộ tọa độ & giờ sinh chuẩn xác.`
                    : 'Đăng nhập để tự động điền lá số của bạn và xem luận giải chi tiết hơn.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default React.memo(AppSidebar);
