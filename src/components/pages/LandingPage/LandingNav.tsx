import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { UserMenu } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

export default function LandingNav() {
  const isDark = useAppStore((s) => s.isDark);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const navigate = useNavigate();
  const { isVisible, isScrolled } = useHeaderScroll({ minScroll: 50, threshold: 10 });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 glass-nav transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
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

          {/* Persistent CTA pill that smoothly appears after scrolling */}
          {isScrolled && (
            <div className="hidden sm:block transition-all duration-300 animate-in fade-in slide-in-from-top-1 ml-2">
              <Button
                onClick={() => navigate('/app/am-lich')}
                variant="gold"
                className="h-8 sm:h-9 px-3.5 sm:px-4 text-xs font-semibold gap-1.5 shadow-sm rounded-full"
              >
                <span>Trải nghiệm ngay</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Right: Dark mode + User menu (exact matching position with AppNav) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            id="tour-theme-toggle"
            onClick={(e) => toggleDarkMode(e)}
            className="h-10 w-10 min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-colors spring-press"
            aria-label="Chuyển chế độ sáng/tối"
          >
            {isDark ? (
              <Sun className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} />
            ) : (
              <Moon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} />
            )}
          </button>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
