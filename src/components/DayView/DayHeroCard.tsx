import React from 'react';
import { Star, Sparkles, Settings2 } from 'lucide-react';
import type { DayDetailsData } from '@/types/calendar';
import type { UserBirthProfile } from '@/utils/userBirthProfile';
import type { UpcomingEventOccurrence } from '@lich-viet/contracts';

interface DayHeroCardProps {
  date: Date;
  data: DayDetailsData;
  dayNapAmColor?: string;
  monthNapAmColor?: string;
  yearNapAmColor?: string;
  top3HoursList: string[];
  dayEvents: UpcomingEventOccurrence[];
  isPersonalized: boolean;
  computedProfile: UserBirthProfile | null;
  onTogglePersonalization: () => void;
  onOpenPersonalizationDrawer: () => void;
}

export const DayHeroCard: React.FC<DayHeroCardProps> = ({
  date,
  data,
  dayNapAmColor,
  monthNapAmColor,
  yearNapAmColor,
  top3HoursList,
  dayEvents,
  isPersonalized,
  computedProfile,
  onTogglePersonalization,
  onOpenPersonalizationDrawer,
}) => {
  return (
    <div
      id="tour-day-summary"
      className="rounded-3xl bg-surface-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 p-4 sm:p-5 shadow-sm space-y-3.5 relative overflow-hidden"
    >
      {/* Header: Day of week & Solar date (Left) + Deity & Five Element Grade (Right) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {data.dayOfWeek}
          </h2>
          <span className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
            ngày <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{date.getDate()}</span> tháng{' '}
            <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{date.getMonth() + 1}</span> năm{' '}
            <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{date.getFullYear()}</span>
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {data.deityStatus && (
            <span
              className={`text-xs sm:text-sm font-bold ${
                data.deityStatus.includes('Hắc')
                  ? 'text-text-primary-light dark:text-text-primary-dark'
                  : 'text-good dark:text-good-dark'
              }`}
            >
              {data.deityStatus}
            </span>
          )}
          {data.nguHanhGrade && (
            <span
              title={
                data.nguHanhGrade === 'Phạt nhật'
                  ? 'Ngày xung hành với tháng — nên cẩn trọng, hạn chế khởi sự'
                  : data.nguHanhGrade === 'Chế nhật'
                    ? 'Ngày khắc hành với tháng — cần xem xét kỹ trước khi hành động'
                    : 'Ngày hài hòa ngũ hành với tháng — tốt cho khởi sự'
              }
              className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
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
      </div>

      {/* Lunar Date & Solar Term info block */}
      <div className="space-y-1 text-sm sm:text-base leading-relaxed pt-3 border-t border-border-light/40 dark:border-border-dark/30">
        <div>
          <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Âm lịch:</span>{' '}
          <span className="text-text-primary-light dark:text-text-primary-dark">
            ngày <span className="font-bold">{data.lunarDate?.day}</span> tháng{' '}
            <span className="font-bold">{data.lunarDate?.month}</span> năm{' '}
            <span className="font-bold">
              {data.canChi?.year?.can} {data.canChi?.year?.chi}
            </span>
          </span>
        </div>
        <div>
          <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Tiết khí:</span>{' '}
          <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{data.solarTerm}</span>
          {data.tietKhiDetail && (
            <div className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              ({data.tietKhiDetail})
            </div>
          )}
        </div>
      </div>

      {/* 4-Column Can Chi & Nạp Âm Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 text-center gap-y-3 gap-x-2 pt-3 border-t border-border-light/40 dark:border-border-dark/30">
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1">
            NGÀY
          </span>
          <p
            className="font-bold text-base sm:text-lg text-text-primary-light dark:text-text-primary-dark"
            style={dayNapAmColor ? { color: dayNapAmColor } : undefined}
          >
            {data.canChi?.day?.can} {data.canChi?.day?.chi}
          </p>
          <p
            className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate max-w-full"
            style={dayNapAmColor ? { color: dayNapAmColor } : undefined}
          >
            {data.fiveElements?.napAm}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1">
            THÁNG
          </span>
          <p
            className="font-bold text-base sm:text-lg text-text-primary-light dark:text-text-primary-dark"
            style={monthNapAmColor ? { color: monthNapAmColor } : undefined}
          >
            {data.canChi?.month?.can} {data.canChi?.month?.chi}
          </p>
          <p
            className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate max-w-full"
            style={monthNapAmColor ? { color: monthNapAmColor } : undefined}
          >
            {data.fiveElements?.napAmMonth}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1">
            NĂM
          </span>
          <p
            className="font-bold text-base sm:text-lg text-text-primary-light dark:text-text-primary-dark"
            style={yearNapAmColor ? { color: yearNapAmColor } : undefined}
          >
            {data.canChi?.year?.can} {data.canChi?.year?.chi}
          </p>
          <p
            className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate max-w-full"
            style={yearNapAmColor ? { color: yearNapAmColor } : undefined}
          >
            {data.fiveElements?.napAmYear}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1">
            PHẬT LỊCH
          </span>
          <p className="font-bold text-base sm:text-lg text-text-primary-light dark:text-text-primary-dark">
            {data.buddhistYear}
          </p>
        </div>
      </div>

      {/* Khung giờ vàng */}
      <div className="pt-3 border-t border-border-light/40 dark:border-border-dark/30 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
          Khung giờ vàng:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {top3HoursList.map((h, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark font-semibold text-text-primary-light dark:text-text-primary-dark border border-border-light/60 dark:border-border-dark/60 text-[11px]"
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* User Events / Anniversaries for this day */}
      {dayEvents.length > 0 && (
        <div className="pt-2.5 border-t border-border-light/40 dark:border-border-dark/30 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple dark:text-purple-dark">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sự kiện & Lịch nhắc trong ngày:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dayEvents.map((ev, idx) => (
              <span
                key={`${ev.eventId}-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple/10 dark:bg-purple/20 border border-purple/30 text-xs font-semibold text-text-primary-light dark:text-text-primary-dark"
              >
                <span>{ev.emoji}</span>
                <span>{ev.title}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Cá nhân hóa button */}
      <div className="pt-3 border-t border-border-light/40 dark:border-border-dark/30 flex items-center gap-2 w-full">
        {computedProfile?.birthYear ? (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={onTogglePersonalization}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all spring-press cursor-pointer ${
                isPersonalized
                  ? 'bg-purple/15 text-purple dark:text-purple-dark border border-purple/30 shadow-xs'
                  : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low'
              }`}
              title={isPersonalized ? 'Tắt cá nhân hoá' : 'Bật cá nhân hoá theo tuổi'}
            >
              <span className="indicator-pip-sm bg-purple animate-glow-breathe" aria-hidden="true" />
              <span>{isPersonalized ? `Đã cá nhân hóa (${computedProfile.birthYear})` : 'Cá nhân hóa'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenPersonalizationDrawer}
              className="p-2 text-xs font-medium rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-container-low transition-colors spring-press cursor-pointer"
              title="Thay đổi thông tin ngày giờ sinh"
              aria-label="Thay đổi thông tin ngày giờ sinh"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenPersonalizationDrawer}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl bg-purple/10 dark:bg-purple-900/30 text-purple dark:text-purple-dark border border-purple/30 hover:bg-purple/15 transition-all spring-press cursor-pointer shadow-xs"
            title="Nhập thông tin năm sinh để kích hoạt cá nhân hóa theo tuổi"
          >
            <Sparkles className="h-4 w-4 text-purple dark:text-purple-dark" />
            <span>Cá nhân hóa (Nhập năm sinh)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(DayHeroCard);
