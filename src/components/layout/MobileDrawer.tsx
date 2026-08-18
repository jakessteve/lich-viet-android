import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import { useAuthStore } from '@/stores/authStore';

interface MobileDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface DrawerLinkItem {
  id: string;
  path: string;
  icon: string;
  label: string;
  desc: string;
}

export default function MobileDrawer({ isOpen: controlledOpen, onClose: controlledClose }: MobileDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isPremiumOrAdmin =
    user?.accessTier === 'premium' ||
    user?.accessTier === 'admin' ||
    user?.email?.toLowerCase() === 'admin@lichviet.app';

  const isControlled = typeof controlledOpen === 'boolean';
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      if (isControlled && controlledClose) {
        controlledClose();
      } else {
        setInternalOpen(false);
      }
      setIsClosing(false);
    }, 350);
  }, [controlledClose, isControlled]);

  const handleNav = useCallback(
    (path: string) => {
      if (location.pathname === path) {
        handleClose();
        return;
      }
      handleClose();
      // Micro-defer to allow drawer animation to initiate without blocking main thread
      setTimeout(() => {
        navigate(path);
      }, 50);
    },
    [handleClose, location.pathname, navigate],
  );

  // Listen for custom toggle event from AppNav or elsewhere
  useEffect(() => {
    const handler = () => {
      if (isControlled && controlledClose) {
        // controlled via parent
      } else {
        setInternalOpen(true);
      }
    };
    document.addEventListener('toggle-mobile-menu', handler);
    return () => document.removeEventListener('toggle-mobile-menu', handler);
  }, [controlledClose, isControlled]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isOpen]);

  if (!isOpen && !isClosing) return null;

  const isFullPage = location.pathname === '/app/cai-dat' || location.pathname === '/app/nang-cap';

  const groups: { title: string; items: DrawerLinkItem[] }[] = [
    {
      title: 'Lịch Pháp & Ngày Giờ',
      items: [
        {
          id: 'am-lich',
          path: '/app/am-lich',
          icon: 'calendar_month',
          label: 'Âm Lịch',
          desc: 'Âm Lịch · Chi tiết ngày & Lịch tháng',
        },
        {
          id: 'ngay-tot',
          path: '/app/ngay-tot',
          icon: 'event_available',
          label: 'Ngày Tốt & Dụng Sự',
          desc: 'Tìm ngày tốt · Tra cứu dụng sự đa hệ',
        },
      ],
    },
    {
      title: 'Mệnh Lý Đông - Tây',
      items: [
        {
          id: 'tu-vi',
          path: '/app/tu-vi',
          icon: 'auto_awesome',
          label: 'Tử Vi Đẩu Số',
          desc: 'Lá số 12 Cung · Sao & Vận hạn',
        },
        {
          id: 'chiem-tinh-tay-phuong',
          path: '/app/chiem-tinh/tay-phuong',
          icon: 'public',
          label: 'Chiêm Tinh Tây Phương',
          desc: 'Bản đồ sao Natal & Transit hành tinh',
        },
        {
          id: 'chiem-tinh-vedic',
          path: '/app/chiem-tinh/vedic',
          icon: 'sparkles',
          label: 'Chiêm Tinh Vệ Đà (Vedic)',
          desc: 'Jyotish · Dasha · Gochar & Yogas',
        },
        {
          id: 'chiem-tinh-hop-la',
          path: '/app/chiem-tinh/hop-la',
          icon: 'favorite',
          label: 'Tương Hợp Lá Số (Synastry)',
          desc: 'So khớp 5 chiều Tử Vi, Vedic & Tây Phương',
        },
      ],
    },
    {
      title: 'Dịch Học & Dự Đoán',
      items: [
        {
          id: 'gieo-que',
          path: '/app/gieo-que',
          icon: 'casino',
          label: 'Mai Hoa & Tam Thức',
          desc: 'Mai Hoa Dịch Số · Kỳ Môn · Lục Nhâm · Thái Ất',
        },
      ],
    },
    {
      title: 'Hệ Thống & Tài Khoản',
      items: [
        {
          id: 'cai-dat',
          path: '/app/cai-dat',
          icon: 'settings',
          label: 'Cài đặt',
          desc: 'Tùy chỉnh hồ sơ & trường phái học thuật',
        },
        ...(!isPremiumOrAdmin
          ? [
              {
                id: 'nang-cap',
                path: '/app/nang-cap',
                icon: 'stars',
                label: 'Nâng cấp tài khoản',
                desc: 'Mở khóa tính năng chuyên sâu',
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[60] md:hidden ${isClosing ? 'pointer-events-none' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng di động"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-350 ease-out ${
          isClosing ? 'opacity-0' : 'animate-fade-in'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-surface-light dark:bg-surface-dark shadow-2xl flex flex-col z-10 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] motion-gpu border-r border-border-light/40 dark:border-border-dark/40 ${
          isClosing ? '-translate-x-full' : 'animate-slide-right'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light/50 dark:border-border-dark/50">
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="flex items-center gap-2 group text-left cursor-pointer transition-opacity hover:opacity-85 spring-press"
            title="Về Trang chủ Lịch Việt"
          >
            <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-400">
              LỊCH VIỆT
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gold/10 text-text-primary-light dark:text-gold-dark">
              v1.0
            </span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors interactive-press cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {groups.map((group) => (
            <div key={group.title}>
              <span className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark opacity-60 block">
                {group.title}
              </span>
              {group.items.map((link) => {
                const isActive =
                  !isFullPage &&
                  (location.pathname === link.path ||
                    (link.path === '/app/chiem-tinh/tay-phuong' && location.pathname === '/app/chiem-tinh') ||
                    (link.path === '/app/am-lich' && (location.pathname === '/app' || location.pathname === '/app/am-lich')));

                return (
                  <button
                    key={link.id}
                    onClick={() => handleNav(link.path)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5 interactive-press ${
                      isActive
                        ? 'bg-gold/10 dark:bg-gold-dark/10 text-text-primary-light dark:text-gold-dark font-semibold'
                        : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {renderDynamicIcon(
                      link.icon,
                      `h-5 w-5 mt-0.5 ${isActive ? 'text-text-primary-light dark:text-gold-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`,
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block">{link.label}</span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mt-0.5 opacity-70 truncate">
                        {link.desc}
                      </span>
                    </div>
                    {isActive && (
                      <Check className="ml-auto h-4 w-4 shrink-0 mt-1 text-text-primary-light dark:text-gold-dark" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
