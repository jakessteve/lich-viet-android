import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, HelpCircle, Info, LogOut, LogIn, UserPlus, Type } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { IconButton } from './ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  showFontSizeControl?: boolean;
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
  className?: string;
}

export default function UserMenu({ showFontSizeControl = false, onOpenHelp, onOpenAbout, className }: UserMenuProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSizeLevel = useAppStore((s) => s.setFontSizeLevel);

  const levels: ('small' | 'normal' | 'large')[] = ['small', 'normal', 'large'];
  const fontSizeLabel = fontSize === 'small' ? 'Nhỏ' : fontSize === 'normal' ? 'Vừa' : 'Lớn';

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            id="tour-user-menu"
            className="rounded-full text-text-secondary-light/80 dark:text-text-secondary-dark/80 hover:text-text-primary-light dark:hover:text-text-primary-dark"
            icon={<User className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} />}
            label="Menu người dùng"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-2xl">
          {/* User profile header */}
          <div className="border-b border-border-light/60 dark:border-border-dark/40 px-3 py-2.5 mb-1">
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

          {/* Font size control */}
          {showFontSizeControl && (
            <div className="px-3 py-2 border-b border-border-light/40 dark:border-border-dark/30 mb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                  <Type className="h-3.5 w-3.5" />
                  <span>Cỡ chữ</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const idx = levels.indexOf(fontSize);
                      if (idx > 0) setFontSizeLevel(levels[idx - 1]);
                    }}
                    disabled={fontSize === 'small'}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold hover:bg-surface-container-low dark:hover:bg-white/10 disabled:opacity-30 spring-press"
                    aria-label="Giảm cỡ chữ"
                  >
                    A-
                  </button>
                  <span className="text-xs font-bold min-w-[28px] text-center">{fontSizeLabel}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const idx = levels.indexOf(fontSize);
                      if (idx < levels.length - 1) setFontSizeLevel(levels[idx + 1]);
                    }}
                    disabled={fontSize === 'large'}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold hover:bg-surface-container-low dark:hover:bg-white/10 disabled:opacity-30 spring-press"
                    aria-label="Tăng cỡ chữ"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          {isAuthenticated ? (
            <>
              <DropdownMenuItem onClick={() => navigate('/app/cai-dat')} className="gap-2.5 cursor-pointer">
                <Settings className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              {onOpenHelp && (
                <DropdownMenuItem onClick={onOpenHelp} className="gap-2.5 cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                  <span>Trợ giúp</span>
                </DropdownMenuItem>
              )}
              {onOpenAbout && (
                <DropdownMenuItem onClick={onOpenAbout} className="gap-2.5 cursor-pointer">
                  <Info className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                  <span>Giới thiệu</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="gap-2.5 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => navigate('/app/dang-nhap')} className="gap-2.5 cursor-pointer">
                <LogIn className="h-4 w-4 text-gold dark:text-gold-dark" />
                <span>Đăng nhập</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/dang-ky')} className="gap-2.5 cursor-pointer">
                <UserPlus className="h-4 w-4 text-mystery-purple dark:text-mystery-purple-light" />
                <span>Đăng ký</span>
              </DropdownMenuItem>
              {onOpenAbout && (
                <DropdownMenuItem onClick={onOpenAbout} className="gap-2.5 cursor-pointer">
                  <Info className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                  <span>Giới thiệu</span>
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
