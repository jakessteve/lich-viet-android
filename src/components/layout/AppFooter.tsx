import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/auth';

export function getFooterActionLabel(user: User | null, isAuthenticated: boolean): string {
  if (!isAuthenticated || !user) return 'Nâng cấp';

  if (user.accessTier === 'admin' || user.email.toLowerCase() === 'admin@lichviet.app') {
    return 'Admin';
  }

  if (user.accessTier === 'premium') {
    return 'Premium';
  }

  return 'Nâng cấp';
}

function AppFooter() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const footerActionLabel = getFooterActionLabel(user, isAuthenticated);

  return (
    <footer className="border-t border-border-light dark:border-mystery-purple/10 mt-8 relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-end gap-4 text-sm">
          <button
            onClick={() => navigate('/app/nang-cap')}
            className="relative cursor-pointer text-gold dark:text-gold-dark font-semibold hover:text-amber-700 dark:hover:text-amber-300 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold dark:after:bg-gold-dark after:transition-all after:duration-200 hover:after:w-full"
          >
            {footerActionLabel}
          </button>
          <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 text-xs font-medium">v3.0</span>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(AppFooter);
