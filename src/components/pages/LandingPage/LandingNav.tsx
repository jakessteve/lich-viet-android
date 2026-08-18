import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { SunMedium, MoonStar } from 'lucide-react';
import { UserMenu } from '@/components/shared';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

export default function LandingNav() {
  const isDark = useAppStore((s) => s.isDark);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const autoHideNav = useAppStore((s) => s.autoHideNav);
  const { isVisible, isScrolled } = useHeaderScroll({ minScroll: 60, threshold: 10 });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 glass-nav transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-gpu ${
        autoHideNav && !isVisible ? '-translate-y-full' : 'translate-y-0'
      } ${isScrolled ? 'shadow-md dark:shadow-black/20 backdrop-blur-md' : ''}`}
      aria-label="Điều hướng trang chủ"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer select-none"
          >
            LỊCH VIỆT
          </button>
        </div>

        {/* Right: Dark mode + User menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme toggle */}
          <button
            id="tour-theme-toggle"
            onClick={(e) => toggleDarkMode(e)}
            className="h-10 w-10 min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-colors spring-press"
            aria-label="Chuyển chế độ sáng/tối"
          >
            {isDark ? (
              <SunMedium className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-gold-dark" strokeWidth={2} />
            ) : (
              <MoonStar className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-amber-600" strokeWidth={2} />
            )}
          </button>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}

