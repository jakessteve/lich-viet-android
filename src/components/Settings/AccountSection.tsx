import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/card';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import {
  User,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode | string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-card rounded-2xl overflow-hidden border border-border-light/40 dark:border-border-dark/30">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border-light/20 dark:border-border-dark/15">
        <div className="text-gold dark:text-gold-dark">
          {renderDynamicIcon(icon, 'h-4 w-4 shrink-0')}
        </div>
        <span className="text-base font-semibold tracking-tight">{title}</span>
      </div>
      <div className="px-5 py-1">{children}</div>
    </Card>
  );
}

export const AccountSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <SectionCard icon={<User className="h-4 w-4" />} title="Tài khoản">
      <div className="py-5 text-center">
        {isAuthenticated && user ? (
          <>
            <div className="w-12 h-12 mx-auto mb-2.5 rounded-full overflow-hidden bg-gradient-to-br from-mystery-purple/20 to-mystery-blue/20 dark:from-mystery-purple/25 dark:to-mystery-blue/15 flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-center leading-none select-none text-mystery-purple dark:text-mystery-purple-light">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold mb-0.5">{user.displayName}</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{user.email}</p>
            {user.provider !== 'email' && (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-mystery-purple/8 dark:bg-mystery-purple/12 text-mystery-purple dark:text-mystery-purple-light">
                {user.provider === 'google' ? 'Google' : 'Facebook'}
              </span>
            )}
            <div className="mt-4">
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn đăng xuất?')) logout();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto mb-2.5 rounded-full bg-gray-100 dark:bg-white/6 flex items-center justify-center text-center select-none">
              <User className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-semibold mb-0.5">Khách</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-4">
              Đăng nhập để đồng bộ dữ liệu
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => navigate('/app/dang-nhap')}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gold/10 dark:bg-gold-dark/8 text-text-primary-light dark:text-gold-dark hover:bg-gold/18 dark:hover:bg-gold-dark/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/app/dang-ky')}
                className="px-4 py-1.5 rounded-xl text-xs font-medium border border-border-light/50 dark:border-mystery-purple/15 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Đăng ký
              </button>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
};

export default React.memo(AccountSection);
