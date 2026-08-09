import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SynastryView } from './SynastryView';

export const SynastryPage: React.FC = () => {
  usePageTitle('Hợp Lá Số');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <span className="material-icons-round text-xl text-rose-500 dark:text-rose-400">favorite</span>
          Hợp Lá Số
        </h2>
      </div>

      <div className="flex justify-center gap-2">
        <span className="px-4 py-1.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm font-semibold">Hợp Lá Số</span>
      </div>

      <SynastryView />
    </div>
  );
};

export default SynastryPage;
