import React from 'react';
import { Sparkles, Clock, Compass } from 'lucide-react';

export type DayViewSection = 'tong-quan' | 'gio-hoang-dao' | 'hoc-thuat' | 'tat-ca';

interface SectionTabsProps {
  activeSection: DayViewSection;
  onSelectSection: (section: DayViewSection) => void;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  activeSection,
  onSelectSection,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
      <div className="inline-flex p-1 rounded-2xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark/60 shadow-xs">
        <button
          type="button"
          onClick={() => onSelectSection('tong-quan')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSection === 'tong-quan'
              ? 'bg-surface-light dark:bg-surface-container-high text-text-primary-light dark:text-text-primary-dark shadow-2xs'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
          <span>Tổng Quan</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('gio-hoang-dao')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSection === 'gio-hoang-dao'
              ? 'bg-surface-light dark:bg-surface-container-high text-text-primary-light dark:text-text-primary-dark shadow-2xs'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-info dark:text-info-dark" />
          <span>Giờ Hoàng Đạo</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('hoc-thuat')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSection === 'hoc-thuat'
              ? 'bg-surface-light dark:bg-surface-container-high text-text-primary-light dark:text-text-primary-dark shadow-2xs'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-purple dark:text-purple-dark" />
          <span>Học Thuật Cổ</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('tat-ca')}
          className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSection === 'tat-ca'
              ? 'bg-surface-light dark:bg-surface-container-high text-text-primary-light dark:text-text-primary-dark shadow-2xs'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
          }`}
        >
          <span>Xem Tất Cả</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(SectionTabs);
