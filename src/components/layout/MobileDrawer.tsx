import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { NAV_LINKS, ROUTE_TO_TAB, TAB_TO_ROUTE, type ActiveTab } from '@/router/constants';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';

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
      className={`fixed inset-0 z-[60] md:hidden ${isClosing ? 'pointer-events-none' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng di động"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-250 ${
          isClosing ? 'opacity-0' : 'animate-fade-in'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-surface-light dark:bg-surface-dark shadow-2xl flex flex-col z-10 transition-transform duration-250 ease-out border-r border-border-light/40 dark:border-border-dark/40 ${
          isClosing ? '-translate-x-full' : 'animate-slide-right'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light/50 dark:border-border-dark/50">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-400">
              LỊCH VIỆT
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gold/10 text-gold dark:text-gold-dark">
              v3
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Home Link */}
          <div>
            <button
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5 animate-slide-up ${
                location.pathname === '/'
                  ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold dark:text-gold-dark font-semibold'
                  : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              {renderDynamicIcon(
                'home',
                `h-5 w-5 mt-0.5 ${location.pathname === '/' ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`,
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">Trang chủ</span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70">
                  Giới thiệu & Tổng quan Lịch Việt
                </span>
              </div>
              {location.pathname === '/' && (
                <Check className="ml-auto h-4 w-4 shrink-0 mt-1 text-gold dark:text-gold-dark" />
              )}
            </button>
          </div>

          {/* Group 1: Lịch & Dụng Sự */}
          <div>
            <span className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark opacity-60 block">
              Lịch & Dụng Sự
            </span>
            {NAV_LINKS.filter((l) => ['am-lich', 'ngay-tot'].includes(l.id)).map((link, index) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.enabled) handleTabChange(link.id);
                }}
                className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5 animate-slide-up ${
                  activeTab === link.id && !isFullPage
                    ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold dark:text-gold-dark font-semibold'
                    : link.enabled
                      ? 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      : 'text-gray-400 dark:text-gray-600 cursor-default'
                }`}
                style={{ animationDelay: `${index * 40 + 50}ms` }}
                disabled={!link.enabled}
                aria-current={activeTab === link.id && !isFullPage ? 'page' : undefined}
              >
                {renderDynamicIcon(
                  link.icon,
                  `h-5 w-5 mt-0.5 ${activeTab === link.id && !isFullPage ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`,
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block">{link.label}</span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70">
                    {link.desc}
                  </span>
                </div>
                {activeTab === link.id && !isFullPage && (
                  <Check className="ml-auto h-4 w-4 shrink-0 mt-1 text-gold dark:text-gold-dark" />
                )}
              </button>
            ))}
          </div>

          {/* Group 2: Tử Vi & Chiêm Tinh */}
          <div>
            <span className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark opacity-60 block">
              Tử Vi & Chiêm Tinh
            </span>
            {[
              {
                id: 'tu-vi',
                path: '/app/tu-vi',
                icon: 'auto_awesome',
                label: 'Tử Vi',
                desc: 'Tử Vi Đẩu Số · 12 Cung & Sao',
              },
              {
                id: 'chiem-tinh-tay-phuong',
                path: '/app/chiem-tinh/tay-phuong',
                icon: 'public',
                label: 'Chiêm Tinh Tây Phương',
                desc: 'Bản đồ sao Natal & Vận hạn',
              },
              {
                id: 'chiem-tinh-vedic',
                path: '/app/chiem-tinh/vedic',
                icon: 'sparkles',
                label: 'Chiêm Tinh Ấn Độ (Vedic)',
                desc: 'Jyotish, Dasha & Cung Vệ Đà',
              },
              {
                id: 'chiem-tinh-hop-la',
                path: '/app/chiem-tinh/hop-la',
                icon: 'favorite',
                label: 'Hợp Lá Số (Synastry)',
                desc: 'So khớp & Tương hợp đa hệ',
              },
            ].map((link, index) => {
              const isActive =
                !isFullPage &&
                (location.pathname === link.path ||
                  (link.path === '/app/chiem-tinh/tay-phuong' && location.pathname === '/app/chiem-tinh'));

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    navigate(link.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5 animate-slide-up ${
                    isActive
                      ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold dark:text-gold-dark font-semibold'
                      : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  style={{ animationDelay: `${index * 30 + 90}ms` }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {renderDynamicIcon(
                    link.icon,
                    `h-5 w-5 mt-0.5 ${isActive ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`,
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{link.label}</span>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70 truncate">
                      {link.desc}
                    </span>
                  </div>
                  {isActive && <Check className="ml-auto h-4 w-4 shrink-0 mt-1 text-gold dark:text-gold-dark" />}
                </button>
              );
            })}
          </div>

          {/* Group 3: Bói Toán & Kinh Dịch */}
          <div>
            <span className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark opacity-60 block">
              Bói Toán & Tam Thức
            </span>
            {NAV_LINKS.filter((l) => ['gieo-que'].includes(l.id)).map((link, index) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.enabled) handleTabChange(link.id);
                }}
                className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5 animate-slide-up ${
                  activeTab === link.id && !isFullPage
                    ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold dark:text-gold-dark font-semibold'
                    : link.enabled
                      ? 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      : 'text-gray-400 dark:text-gray-600 cursor-default'
                }`}
                style={{ animationDelay: `${index * 40 + 130}ms` }}
                disabled={!link.enabled}
                aria-current={activeTab === link.id && !isFullPage ? 'page' : undefined}
              >
                {renderDynamicIcon(
                  link.icon,
                  `h-5 w-5 mt-0.5 ${activeTab === link.id && !isFullPage ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`,
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block">{link.label}</span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70">
                    {link.desc}
                  </span>
                </div>
                {activeTab === link.id && !isFullPage && (
                  <Check className="ml-auto h-4 w-4 shrink-0 mt-1 text-gold dark:text-gold-dark" />
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border-light/50 dark:border-border-dark/50 my-2 mx-4" />

          {/* Settings link */}
          {[
            {
              id: 'cai-dat',
              icon: 'settings',
              label: 'Cài đặt',
              desc: 'Tùy chỉnh ứng dụng & hồ sơ',
              path: '/app/cai-dat',
            },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => {
                navigate(link.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5 ${
                location.pathname === link.path
                  ? 'bg-gold/10 dark:bg-gold-dark/10 text-gold dark:text-gold-dark font-semibold'
                  : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {renderDynamicIcon(
                link.icon,
                `h-5 w-5 mt-0.5 ${location.pathname === link.path ? 'text-gold dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`,
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{link.label}</span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70">
                  {link.desc}
                </span>
              </div>
              {location.pathname === link.path && (
                <Check className="ml-auto h-4 w-4 shrink-0 mt-1 text-gold dark:text-gold-dark" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
