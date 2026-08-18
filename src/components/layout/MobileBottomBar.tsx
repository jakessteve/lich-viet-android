import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CalendarCheck, Sparkles, Moon, Orbit } from 'lucide-react';
import { ROUTE_TO_TAB, type ActiveTab } from '@/router/constants';
import { useAppStore } from '@/stores/appStore';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

interface BottomTabItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const BOTTOM_TABS: BottomTabItem[] = [
  { id: 'am-lich', label: 'Lịch Ngày', icon: Calendar, route: '/app/am-lich' },
  { id: 'ngay-tot', label: 'Ngày Tốt', icon: CalendarCheck, route: '/app/ngay-tot' },
  { id: 'tu-vi', label: 'Tử Vi', icon: Sparkles, route: '/app/tu-vi' },
  { id: 'chiem-tinh', label: 'Chiêm Tinh', icon: Orbit, route: '/app/chiem-tinh' },
  { id: 'gieo-que', label: 'Gieo Quẻ', icon: Moon, route: '/app/gieo-que' },
];

export const MobileBottomBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const autoHideNav = useAppStore((s) => s.autoHideNav);
  const { isVisible } = useHeaderScroll({ minScroll: 70, threshold: 12 });

  const activeTab: ActiveTab = ROUTE_TO_TAB[location.pathname] || 'am-lich';

  return (
    <nav
      aria-label="Thanh điều hướng đáy di động"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-border-light/50 dark:border-border-dark/50 shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-gpu ${
        autoHideNav && !isVisible ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
        {BOTTOM_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.route)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative min-h-[44px] transition-all spring-press ${
                isActive
                  ? 'text-text-primary-light dark:text-gold-dark font-semibold'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-text-primary-light dark:bg-gold-dark" />
              )}
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-text-primary-light dark:text-gold-dark' : 'opacity-80'
                }`}
              />
              <span className="text-[10px] mt-0.5 tracking-tight leading-tight block truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomBar;

