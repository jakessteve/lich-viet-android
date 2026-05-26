import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { NAV_LINKS, ROUTE_TO_TAB, TAB_TO_ROUTE, type ActiveTab } from '@/router/constants';

export default function AppNav() {
  const isDark = useAppStore((s) => s.isDark);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSizeLevel = useAppStore((s) => s.setFontSizeLevel);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkModeFlash, setDarkModeFlash] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const activeTab: ActiveTab = ROUTE_TO_TAB[location.pathname] || 'am-lich';
  const isFullPage = location.pathname === '/app/cai-dat';

  const handleTabChange = (tabId: ActiveTab) => {
    navigate(TAB_TO_ROUTE[tabId]);
  };

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Font size helpers
  const levels: ('small' | 'normal' | 'large')[] = ['small', 'normal', 'large'];
  const fontSizeLabel = fontSize === 'small' ? 'Nhỏ' : fontSize === 'normal' ? 'Vừa' : 'Lớn';

  return (
    <nav className="sticky top-0 z-50 glass-nav" aria-label="Điều hướng chính">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Hamburger (mobile) / Logo (desktop) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hamburger button — mobile only */}
          <button
            className="sm:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-mobile-menu'))}
            aria-label="Mở menu điều hướng"
          >
            <span className="material-icons-round text-2xl">menu</span>
          </button>
          {/* Logo */}
          <button
            id="tour-logo"
            onClick={() => navigate('/')}
            className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            LỊCH VIỆT
          </button>
        </div>

        {/* Center: Desktop tabs */}
        <div
          id="tour-tabs"
          className="hidden sm:flex items-center gap-1 bg-surface-subtle-light dark:bg-white/6 rounded-full p-1 backdrop-blur-sm"
          role="tablist"
          aria-label="Chức năng"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => link.enabled && handleTabChange(link.id)}
              className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === link.id && !isFullPage
                  ? 'bg-white dark:bg-transparent dark:nav-glass-pill text-text-primary-light dark:text-white shadow-sm dark:shadow-none'
                  : link.enabled
                    ? 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white hover:bg-white/5'
                    : 'text-gray-400 dark:text-gray-600 cursor-default'
              }`}
              disabled={!link.enabled}
              aria-current={activeTab === link.id && !isFullPage ? 'page' : undefined}
            >
              <span
                className={`material-icons-round text-base ${activeTab === link.id && !isFullPage ? 'text-gold dark:text-gold-dark' : ''}`}
              >
                {link.icon}
              </span>
              {link.label}
              {!link.enabled && (
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 leading-none">
                  Soon
                </span>
              )}
              {activeTab === link.id && !isFullPage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gold dark:bg-gold-dark transition-all duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Right: Dark mode + User menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Dark mode toggle */}
          <button
            id="tour-theme-toggle"
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 btn-interact transition-all duration-300 ${darkModeFlash ? 'scale-110 rotate-180' : ''}`}
            onClick={() => {
              toggleDarkMode();
              setDarkModeFlash(true);
              setTimeout(() => setDarkModeFlash(false), 400);
            }}
            aria-label="Chuyển chế độ sáng/tối"
          >
            <span className="material-icons-round text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="tour-user-menu"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 btn-interact"
              aria-label="Menu người dùng"
            >
              <span className="material-icons-round text-xl">person</span>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-mystery-surface/90 dark:backdrop-blur-xl rounded-xl shadow-xl border border-border-light dark:border-mystery-purple/15 py-1.5 animate-scale-in z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mystery-purple/20 to-mystery-blue/20 dark:from-mystery-purple/25 dark:to-mystery-blue/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-mystery-purple dark:text-mystery-purple-light">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {user.provider !== 'email' && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-mystery-purple/8 dark:bg-mystery-purple/12 text-mystery-purple dark:text-mystery-purple-light">
                          <span className="material-icons-round text-xs">
                            {user.provider === 'google' ? 'account_circle' : 'person'}
                          </span>
                          {user.provider === 'google' ? 'Google' : 'Facebook'}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Khách</p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                        Phiên bản miễn phí
                      </p>
                    </>
                  )}
                </div>

                {/* ── Preferences section ── */}
                <div className="px-4 py-2.5 border-b border-border-light/50 dark:border-border-dark/30">
                  {/* Font size control */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-base text-text-secondary-light dark:text-text-secondary-dark">
                        format_size
                      </span>
                      <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                        Cỡ chữ
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const idx = levels.indexOf(fontSize);
                          if (idx > 0) setFontSizeLevel(levels[idx - 1]);
                        }}
                        disabled={fontSize === 'small'}
                        className="w-7 h-7 min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary-light dark:text-text-primary-dark active:scale-95"
                        aria-label="Giảm cỡ chữ"
                      >
                        <span className="text-xs font-bold">A-</span>
                      </button>
                      <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark min-w-[28px] text-center">
                        {fontSizeLabel}
                      </span>
                      <button
                        onClick={() => {
                          const idx = levels.indexOf(fontSize);
                          if (idx < levels.length - 1) setFontSizeLevel(levels[idx + 1]);
                        }}
                        disabled={fontSize === 'large'}
                        className="w-7 h-7 min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary-light dark:text-text-primary-dark active:scale-95"
                        aria-label="Tăng cỡ chữ"
                      >
                        <span className="text-xs font-bold">A+</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Menu items ── */}
                <div className="py-1">
                  {isAuthenticated ? (
                    <>
                      {[
                        { icon: 'settings', label: 'Cài đặt', action: () => navigate('/app/cai-dat') },
                        { icon: 'help_outline', label: 'Trợ giúp', action: () => {} },
                        { icon: 'info', label: 'Giới thiệu', action: () => navigate('/') },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            item.action();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                      <div className="border-t border-border-light/50 dark:border-border-dark/30 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors"
                        >
                          <span className="material-icons-round text-lg">logout</span>
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate('/app/dang-nhap');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="material-icons-round text-lg text-gold dark:text-gold-dark">login</span>
                        Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          navigate('/app/dang-ky');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="material-icons-round text-lg text-mystery-purple dark:text-mystery-purple-light">
                          person_add
                        </span>
                        Đăng ký
                      </button>
                      <div className="border-t border-border-light/50 dark:border-border-dark/30 mt-1 pt-1">
                        {[
                          { icon: 'settings', label: 'Cài đặt', action: () => navigate('/app/cai-dat') },
                          { icon: 'info', label: 'Giới thiệu', action: () => navigate('/') },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              item.action();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                              {item.icon}
                            </span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
