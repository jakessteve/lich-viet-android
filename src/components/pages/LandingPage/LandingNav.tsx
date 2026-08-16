import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { IconButton, UserMenu } from '@/components/shared';

export default function LandingNav() {
  const { isDark, toggleDarkMode } = useAppStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav" aria-label="Điều hướng trang chủ">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight select-none">
          LỊCH VIỆT
        </span>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={(e) => toggleDarkMode(e)}
            className="rounded-full text-text-secondary-light/70 dark:text-text-secondary-dark/70"
            icon={isDark ? 'light_mode' : 'dark_mode'}
            label="Chuyển chế độ sáng/tối"
          />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
