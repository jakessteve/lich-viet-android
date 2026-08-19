import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { Toggle, SettingRow, Select } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode | string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-card rounded-2xl overflow-hidden border border-border-light/40 dark:border-border-dark/30">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border-light/20 dark:border-border-dark/15">
        <div className="text-gold dark:text-gold-dark">
          {renderDynamicIcon(icon, 'h-4 w-4 shrink-0')}
        </div>
        <span className="text-base font-semibold tracking-tight">{title}</span>
      </div>
      <div className="px-5 py-1">{children}</div>
    </Card>
  );
}

interface DisplaySectionProps {
  activeSubSection: 'appearance' | 'general' | 'calendar' | 'notifications';
  dateFormat: string;
  onDateFormatChange: (v: string) => void;
  holidayCountry: string;
  onHolidayCountryChange: (v: string) => void;
  defaultView: string;
  onDefaultViewChange: (v: string) => void;
  showLunarDetails: boolean;
  onShowLunarDetailsChange: (v: boolean) => void;
  dailyHoroscope: boolean;
  onDailyHoroscopeChange: (v: boolean) => void;
  auspiciousReminder: boolean;
  onAuspiciousReminderChange: (v: boolean) => void;
  lunarEvents: boolean;
  onLunarEventsChange: (v: boolean) => void;
}

export const DisplaySection: React.FC<DisplaySectionProps> = ({
  activeSubSection,
  dateFormat,
  onDateFormatChange,
  holidayCountry,
  onHolidayCountryChange,
  defaultView,
  onDefaultViewChange,
  showLunarDetails,
  onShowLunarDetailsChange,
  dailyHoroscope,
  onDailyHoroscopeChange,
  auspiciousReminder,
  onAuspiciousReminderChange,
  lunarEvents,
  onLunarEventsChange,
}) => {
  const isDark = useAppStore((s) => s.isDark);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSizeLevel = useAppStore((s) => s.setFontSizeLevel);
  const showScrollToTopButton = useAppStore((s) => s.showScrollToTopButton);
  const setShowScrollToTopButton = useAppStore((s) => s.setShowScrollToTopButton);
  const autoHideNav = useAppStore((s) => s.autoHideNav);
  const setAutoHideNav = useAppStore((s) => s.setAutoHideNav);

  if (activeSubSection === 'appearance') {
    return (
      <SectionCard icon="palette" title="Giao diện">
        <SettingRow icon="dark_mode" label="Chế độ tối" description="Giảm mỏi mắt khi dùng ban đêm">
          <Toggle id="toggle-dark-mode" checked={isDark} onChange={(_checked, e) => toggleDarkMode(e)} />
        </SettingRow>
        <SettingRow icon="format_size" label="Cỡ chữ">
          <div className="flex items-center gap-0.5">
            {(['small', 'normal', 'large'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFontSizeLevel(level)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  fontSize === level
                    ? 'bg-gold/12 dark:bg-gold-dark/12 text-text-primary-light dark:text-gold-dark font-semibold'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {level === 'small' ? 'Nhỏ' : level === 'normal' ? 'Vừa' : 'Lớn'}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow
          icon="arrow_upward"
          label="Nút cuộn lên đầu trang"
          description="Hiển thị nút nổi hỗ trợ cuộn nhanh khi trang có nội dung dài"
        >
          <Toggle
            id="toggle-scroll-to-top"
            checked={showScrollToTopButton}
            onChange={() => setShowScrollToTopButton(!showScrollToTopButton)}
          />
        </SettingRow>
        <SettingRow
          icon="unfold_less"
          label="Tự động ẩn thanh điều hướng"
          description="Trượt ẩn thanh đỉnh và thanh đáy khi cuộn xuống để mở rộng không gian đọc luận giải"
        >
          <Toggle
            id="toggle-auto-hide-nav"
            checked={autoHideNav}
            onChange={() => setAutoHideNav(!autoHideNav)}
          />
        </SettingRow>
      </SectionCard>
    );
  }

  if (activeSubSection === 'general') {
    return (
      <SectionCard icon="schedule" title="Ngày tháng">
        <SettingRow icon="date_range" label="Định dạng ngày">
          <Select
            id="select-date-format"
            value={dateFormat}
            onChange={onDateFormatChange}
            options={[
              { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
              { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
              { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
            ]}
          />
        </SettingRow>
        <SettingRow icon="flag" label="Quốc gia ngày lễ">
          <Select
            id="select-holiday-country"
            value={holidayCountry}
            onChange={onHolidayCountryChange}
            options={[
              { value: 'VN', label: 'Việt Nam' },
              { value: 'US', label: 'Mỹ' },
              { value: 'JP', label: 'Nhật Bản' },
              { value: 'KR', label: 'Hàn Quốc' },
              { value: 'CN', label: 'Trung Quốc' },
            ]}
          />
        </SettingRow>
      </SectionCard>
    );
  }

  if (activeSubSection === 'calendar') {
    return (
      <SectionCard icon="calendar_month" title="Âm Lịch">
        <SettingRow icon="view_module" label="Giao diện mặc định">
          <Select
            id="select-default-view"
            value={defaultView}
            onChange={onDefaultViewChange}
            options={[
              { value: 'month', label: 'Theo tháng' },
              { value: 'week', label: 'Theo tuần' },
            ]}
          />
        </SettingRow>
        <SettingRow icon="info" label="Chi tiết âm lịch" description="Can chi, tiết khí trên ô lịch">
          <Toggle
            id="toggle-lunar-details"
            checked={showLunarDetails}
            onChange={onShowLunarDetailsChange}
          />
        </SettingRow>
      </SectionCard>
    );
  }

  if (activeSubSection === 'notifications') {
    return (
      <SectionCard icon="notifications" title="Thông báo">
        <SettingRow icon="wb_sunny" label="Lá số hàng ngày" description="Phân tích ngày mới mỗi sáng">
          <Toggle
            id="toggle-daily-horoscope"
            checked={dailyHoroscope}
            onChange={onDailyHoroscopeChange}
          />
        </SettingRow>
        <SettingRow icon="event_available" label="Nhắc ngày tốt" description="Thông báo ngày hoàng đạo sắp tới">
          <Toggle
            id="toggle-auspicious"
            checked={auspiciousReminder}
            onChange={onAuspiciousReminderChange}
          />
        </SettingRow>
        <SettingRow icon="nights_stay" label="Sự kiện âm lịch" description="Rằm, mùng 1, tiết khí">
          <Toggle
            id="toggle-lunar-events"
            checked={lunarEvents}
            onChange={onLunarEventsChange}
          />
        </SettingRow>
      </SectionCard>
    );
  }

  return null;
};

export default React.memo(DisplaySection);
