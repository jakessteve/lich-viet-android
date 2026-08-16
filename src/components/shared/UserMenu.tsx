import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { IconButton } from './ui';

interface UserMenuProps {
  showFontSizeControl?: boolean;
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
  className?: string;
}

export default function UserMenu({ showFontSizeControl = false, onOpenHelp, onOpenAbout, className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSizeLevel = useAppStore((s) => s.setFontSizeLevel);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const levels: ('small' | 'normal' | 'large')[] = ['small', 'normal', 'large'];
  const fontSizeLabel = fontSize === 'small' ? 'Nhỏ' : fontSize === 'normal' ? 'Vừa' : 'Lớn';

  return (
    <div className={`relative ${className || ''}`} ref={menuRef}>
      <IconButton
        id="tour-user-menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full text-text-secondary-light/70 dark:text-text-secondary-dark/70"
        icon="person"
        label="Menu người dùng"
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border-light bg-white py-1.5 shadow-xl dark:border-mystery-purple/15 dark:bg-mystery-surface/90 dark:backdrop-blur-xl animate-scale-in z-50">
          {/* User profile header */}
          <div className="border-b border-border-light px-4 py-3 dark:border-border-dark">
            {isAuthenticated && user ? (
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mystery-purple/20 to-mystery-blue/20 dark:from-mystery-purple/25 dark:to-mystery-blue/15">
                    <span className="text-xs font-bold text-center leading-none select-none text-mystery-purple dark:text-mystery-purple-light">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {user.displayName}
                    </p>
                    <p className="truncate text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {user.email}
                    </p>
                  </div>
                </div>
                {user.provider && user.provider !== 'email' && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-mystery-purple/8 dark:bg-mystery-purple/12 text-mystery-purple dark:text-mystery-purple-light">
                    <span className="material-icons-round text-xs">
                      {user.provider === 'google' ? 'account_circle' : 'person'}
                    </span>
                    {user.provider === 'google' ? 'Google' : 'Facebook'}
                  </span>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Khách</p>
                <p className="mt-0.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Phiên bản miễn phí
                </p>
              </>
            )}
          </div>

          {/* Optional font size control */}
          {showFontSizeControl && (
            <div className="px-4 py-2.5 border-b border-border-light/50 dark:border-border-dark/30">
              <div className="flex items-center justify-between mb-1">
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
                    className="w-7 h-7 min-w-[36px] min-h-[36px] rounded-md flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary-light dark:text-text-primary-dark active:scale-95"
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
                    className="w-7 h-7 min-w-[36px] min-h-[36px] rounded-md flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary-light dark:text-text-primary-dark active:scale-95"
                    aria-label="Tăng cỡ chữ"
                  >
                    <span className="text-xs font-bold">A+</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Menu items */}
          <div className="py-1">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    navigate('/app/cai-dat');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                >
                  <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                    settings
                  </span>
                  Cài đặt
                </button>
                {onOpenHelp && (
                  <button
                    onClick={() => {
                      onOpenHelp();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                  >
                    <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                      help_outline
                    </span>
                    Trợ giúp
                  </button>
                )}
                {onOpenAbout && (
                  <button
                    onClick={() => {
                      onOpenAbout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                  >
                    <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                      info
                    </span>
                    Giới thiệu
                  </button>
                )}
                <div className="mt-1 border-t border-border-light/50 pt-1 dark:border-border-dark/30">
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/15"
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
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                >
                  <span className="material-icons-round text-lg text-gold dark:text-gold-dark">login</span>
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    navigate('/app/dang-ky');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                >
                  <span className="material-icons-round text-lg text-mystery-purple dark:text-mystery-purple-light">
                    person_add
                  </span>
                  Đăng ký
                </button>
                {onOpenAbout && (
                  <button
                    onClick={() => {
                      onOpenAbout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                  >
                    <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                      info
                    </span>
                    Giới thiệu
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
