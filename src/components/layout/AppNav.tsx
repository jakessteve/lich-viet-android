import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { NAV_LINKS, ROUTE_TO_TAB, TAB_TO_ROUTE, type ActiveTab } from '@/router/constants';

import HelpModal from '../shared/HelpModal';
import AboutModal from '../shared/AboutModal';
import UserMenu from '../shared/UserMenu';

export default function AppNav() {
  const isDark = useAppStore((s) => s.isDark);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const [darkModeFlash, setDarkModeFlash] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isNative = Capacitor.isNativePlatform();

  const activeTab: ActiveTab = ROUTE_TO_TAB[location.pathname] || 'am-lich';
  const isFullPage = location.pathname === '/app/cai-dat';

  const handleTabChange = (tabId: ActiveTab) => {
    navigate(TAB_TO_ROUTE[tabId]);
  };

  const handleHomeClick = () => {
    navigate('/app/am-lich');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 glass-nav" aria-label="Điều hướng chính">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Hamburger (mobile) / Logo (desktop) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Hamburger button — mobile only */}
            <button
              className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
              onClick={() => document.dispatchEvent(new CustomEvent('toggle-mobile-menu'))}
              aria-label="Mở menu điều hướng"
            >
              <span className="material-icons-round text-2xl">menu</span>
            </button>
            {/* Logo */}
            <button
              id="tour-logo"
              onClick={handleHomeClick}
              className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap"
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
                className={`relative flex items-center gap-1.5 px-3 lg:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === link.id && !isFullPage
                    ? 'bg-white dark:bg-transparent dark:nav-glass-pill text-text-primary-light dark:text-white shadow-sm dark:shadow-none'
                    : link.enabled
                      ? 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white hover:bg-white/5'
                      : 'text-gray-400 dark:text-gray-600 cursor-default'
                }`}
                title={link.label}
                disabled={!link.enabled}
                aria-current={activeTab === link.id && !isFullPage ? 'page' : undefined}
              >
                <span
                  className={`material-icons-round text-base ${activeTab === link.id && !isFullPage ? 'text-gold dark:text-gold-dark' : ''}`}
                >
                  {link.icon}
                </span>
                <span className="hidden lg:inline">{link.label}</span>
                {!link.enabled && (
                  <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 leading-none">
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
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${darkModeFlash ? 'scale-110 rotate-180' : ''}`}
              onClick={() => {
                toggleDarkMode();
                setDarkModeFlash(true);
                setTimeout(() => setDarkModeFlash(false), 300);
              }}
              aria-label="Chuyển chế độ sáng/tối"
            >
              <span className="material-icons-round text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            {/* User menu */}
            <UserMenu
              showFontSizeControl={true}
              onOpenHelp={() => setHelpModalOpen(true)}
              onOpenAbout={() => setAboutModalOpen(true)}
            />
          </div>
        </div>
      </nav>

      {/* Reusable Modals */}
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
    </>
  );
}
