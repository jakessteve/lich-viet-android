import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SunMedium, MoonStar, Menu } from 'lucide-react';

import { useAppStore } from '@/stores/appStore';
import { NAV_LINKS, ROUTE_TO_TAB, TAB_TO_ROUTE, type ActiveTab } from '@/router/constants';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

import HelpModal from '../shared/HelpModal';
import AboutModal from '../shared/AboutModal';
import UserMenu from '../shared/UserMenu';
import MobileDrawer from './MobileDrawer';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';

export default function AppNav() {
  const isDark = useAppStore((s) => s.isDark);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const autoHideNav = useAppStore((s) => s.autoHideNav);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { isVisible, isScrolled } = useHeaderScroll({ minScroll: 70, threshold: 12 });

  const activeTab: ActiveTab = ROUTE_TO_TAB[location.pathname] || 'am-lich';
  const isFullPage = location.pathname === '/app/cai-dat' || location.pathname === '/app/nang-cap';

  const isNavHidden = autoHideNav && !isVisible && !isUserMenuOpen && !mobileDrawerOpen;

  const handleTabChange = (tabId: ActiveTab) => {
    navigate(TAB_TO_ROUTE[tabId]);
  };

  const handleHomeClick = () => {
    navigate('/app/am-lich');
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 glass-nav transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-gpu ${
          isNavHidden ? '-translate-y-full' : 'translate-y-0'
        } ${isScrolled ? 'shadow-md dark:shadow-black/20 backdrop-blur-md' : ''}`}
        aria-label="Điều hướng chính"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Hamburger button (Mobile) + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-text-primary-light dark:text-text-primary-dark hover:bg-surface-subtle-light dark:hover:bg-white/10 transition-colors interactive-press"
              aria-label="Mở menu chức năng"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              id="tour-logo"
              onClick={handleHomeClick}
              className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
            >
              LỊCH VIỆT
            </button>
          </div>

          {/* Center: Desktop tabs */}
          <div
            id="tour-tabs"
            className="hidden md:flex items-center gap-1 bg-surface-subtle-light dark:bg-white/6 rounded-full p-1 backdrop-blur-sm"
            role="tablist"
            aria-label="Chức năng"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => link.enabled && handleTabChange(link.id)}
                className={`relative flex items-center gap-1.5 px-3 lg:px-4 py-1.5 rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 spring-press motion-gpu ${
                  activeTab === link.id && !isFullPage
                    ? 'bg-white dark:bg-transparent dark:nav-glass-pill text-text-primary-light dark:text-white shadow-sm dark:shadow-none font-semibold'
                    : link.enabled
                      ? 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white hover:bg-white/5'
                      : 'text-gray-400 dark:text-gray-600 cursor-default'
                }`}
                title={link.label}
                disabled={!link.enabled}
                aria-current={activeTab === link.id && !isFullPage ? 'page' : undefined}
              >
                {renderDynamicIcon(
                  link.icon,
                  `h-4 w-4 transition-colors duration-200 ${activeTab === link.id && !isFullPage ? 'text-text-primary-light dark:text-gold-dark' : ''}`,
                )}
                <span className="hidden lg:inline">{link.label}</span>
                {!link.enabled && (
                  <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 leading-none">
                    Soon
                  </span>
                )}
                {activeTab === link.id && !isFullPage && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-text-primary-light dark:bg-gold-dark transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                )}
              </button>
            ))}
          </div>

          {/* Right: Dark mode + User menu */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Dark mode toggle */}
            <button
              id="tour-theme-toggle"
              className="h-10 w-10 min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-colors spring-press"
              onClick={(e) => toggleDarkMode(e)}
              aria-label="Chuyển chế độ sáng/tối"
            >
              {isDark ? (
                <SunMedium className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-gold-dark" strokeWidth={2} />
              ) : (
                <MoonStar className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-amber-600" strokeWidth={2} />
              )}
            </button>

            {/* User menu */}
            <UserMenu
              showFontSizeControl={true}
              onOpenHelp={() => setHelpModalOpen(true)}
              onOpenAbout={() => setAboutModalOpen(true)}
              onOpenChange={setIsUserMenuOpen}
            />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      {/* Reusable Modals */}
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
    </>
  );
}
