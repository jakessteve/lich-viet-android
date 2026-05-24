import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function UpgradePage() {
  usePageTitle('Nâng cấp');
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto py-12 px-4 animate-fade-in-up">
      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold/15 to-amber-600/10 dark:from-gold-dark/12 dark:to-amber-500/8 flex items-center justify-center">
          <span className="material-icons-round text-3xl text-gold dark:text-gold-dark">construction</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Đang phát triển</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-sm mx-auto">
            Tính năng nâng cấp đang được phát triển. Vui lòng quay lại sau.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/am-lich')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-gold dark:text-gold-dark bg-gold/10 dark:bg-gold-dark/10 border border-gold/20 dark:border-gold-dark/20 hover:bg-gold/20 dark:hover:bg-gold-dark/20 transition-all"
        >
          <span className="material-icons-round text-base">arrow_back</span>
          Quay lại ứng dụng
        </button>
      </div>
    </div>
  );
}
