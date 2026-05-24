import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_LINKS, ROUTE_TO_TAB, TAB_TO_ROUTE, type ActiveTab } from '@/router/constants';

export default function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab: ActiveTab = ROUTE_TO_TAB[location.pathname] || 'am-lich';
  const isFullPage = location.pathname === '/app/cai-dat';

  // Listen for toggle event from AppNav hamburger
  useEffect(() => {
    const handler = () => setIsOpen(true);
    document.addEventListener('toggle-mobile-menu', handler);
    return () => document.removeEventListener('toggle-mobile-menu', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  };

  const handleTabChange = (tabId: ActiveTab) => {
    navigate(TAB_TO_ROUTE[tabId]);
    setIsOpen(false);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] sm:hidden ${isClosing ? 'pointer-events-none' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'animate-fade-scale'}`}
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClose();
          }
        }}
        role="button"
        tabIndex={-1}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        className={`absolute top-0 left-0 h-full w-64 bg-white dark:bg-mystery-surface/95 dark:backdrop-blur-xl shadow-2xl dark:shadow-mystery-purple/10 flex flex-col transition-transform duration-300 ${isClosing ? '-translate-x-full' : 'animate-fade-in-up'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight">
              LỊCH VIỆT
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
            aria-label="Đóng menu"
          >
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>
        {/* Nav links */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto" aria-label="Điều hướng chính">
          {NAV_LINKS.map((link, index) => (
            <button
              key={link.id}
              onClick={() => {
                if (link.enabled) handleTabChange(link.id);
              }}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-0.5 animate-slide-up ${
                activeTab === link.id && !isFullPage
                  ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold-light dark:text-gold-dark'
                  : link.enabled
                    ? 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    : 'text-gray-400 dark:text-gray-600 cursor-default'
              }`}
              style={{ animationDelay: `${index * 50 + 100}ms` }}
              disabled={!link.enabled}
              aria-current={activeTab === link.id && !isFullPage ? 'page' : undefined}
            >
              <span
                className={`material-icons-round text-xl mt-0.5 ${activeTab === link.id && !isFullPage ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
              >
                {link.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{link.label}</span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70">
                  {link.desc}
                </span>
              </div>
              {activeTab === link.id && !isFullPage && (
                <span className="ml-auto material-icons-round text-base shrink-0 mt-0.5">check</span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-border-light/50 dark:border-border-dark/50 my-2 mx-4" />

          {/* Settings link */}
          {[
            { id: 'cai-dat', icon: 'settings', label: 'Cài đặt', desc: 'Tùy chỉnh ứng dụng', path: '/app/cai-dat' },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => {
                navigate(link.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-0.5 ${
                location.pathname === link.path
                  ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold-light dark:text-gold-dark'
                  : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span
                className={`material-icons-round text-xl mt-0.5 ${location.pathname === link.path ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
              >
                {link.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{link.label}</span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70">
                  {link.desc}
                </span>
              </div>
              {location.pathname === link.path && (
                <span className="ml-auto material-icons-round text-base shrink-0 mt-0.5">check</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
