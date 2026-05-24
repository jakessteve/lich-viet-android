/**
 * ResultTabs — Tabbed result dashboard for Dụng Sự
 * Organizes results into: Tổng quan | Chi tiết | Giờ tốt | Phân tích | [Intent-specific]
 */

import React from 'react';
import type { FAQIntent } from './FAQIntentCards';

export interface ResultTab {
  id: string;
  label: string;
  icon: string;
}

interface ResultTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  intent?: FAQIntent | null;
  hasResult: boolean;
}

function getTabsForIntent(intent: FAQIntent | null | undefined, hasResult: boolean): ResultTab[] {
  const base: ResultTab[] = [
    { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { id: 'details', label: 'Chi tiết', icon: 'analytics' },
    { id: 'hours', label: 'Giờ tốt', icon: 'schedule' },
    { id: 'analysis', label: 'Phân tích', icon: 'radar' },
  ];

  if (!hasResult) return base;

  // Intent-specific extra tabs
  if (intent === 'chon-ngay-cuoi') {
    base.push({ id: 'wedding', label: 'Lịch cưới', icon: 'favorite' });
  }
  if (intent === 'tang-le') {
    base.push({ id: 'funeral', label: 'Hướng mộ', icon: 'explore' });
  }

  return base;
}

const ResultTabs: React.FC<ResultTabsProps> = ({ activeTab, onTabChange, intent, hasResult }) => {
  const tabs = getTabsForIntent(intent, hasResult);

  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-gold/12 dark:bg-gold-dark/12 text-gold dark:text-gold-dark ring-1 ring-gold/25 dark:ring-gold-dark/25 shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5 hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            <span className="material-icons-round" style={{ fontSize: '16px' }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export { getTabsForIntent };
export default ResultTabs;
