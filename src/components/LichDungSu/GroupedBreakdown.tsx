/**
 * GroupedBreakdown — Score breakdown grouped into 3 categories
 * Replaces flat factor list with collapsible groups:
 *   📅 Ngày (Factors 1-4)
 *   👥 Hợp Tuổi (Factors 5, 6, 9)
 *   🌌 Vận Khí (Factors 7, 8)
 */

import React, { useState } from 'react';
import { LineChart, ChevronDown } from 'lucide-react';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import { ScoreBreakdownItem } from '@lich-viet/core/dungsu';
import AcademicCitation, { GROUP_CITATIONS } from './AcademicCitation';

interface GroupedBreakdownProps {
  breakdown: ScoreBreakdownItem[];
}

interface FactorGroup {
  id: string;
  icon: string;
  label: string;
  factors: string[];
}

const GROUPS: FactorGroup[] = [
  { id: 'day', icon: '📅', label: 'Chất lượng Ngày', factors: ['truc', 'stars', 'dayGrade', 'hour'] },
  { id: 'compat', icon: '👥', label: 'Hợp Tuổi', factors: ['kiTuoi', 'napAm', 'baziSynastry'] },
  { id: 'cosmic', icon: '🌌', label: 'Vận Khí', factors: ['qmdj', 'thaiAt'] },
];

const FACTOR_ICONS: Record<string, string> = {
  truc: 'calendar_today',
  stars: 'star',
  dayGrade: 'wb_sunny',
  hour: 'schedule',
  kiTuoi: 'person',
  napAm: 'balance',
  qmdj: 'grid_view',
  thaiAt: 'public',
  baziSynastry: 'favorite',
};

function quantifyScore(value: number, maxValue: number): { text: string; colorClass: string } {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  if (ratio >= 0.7) return { text: 'Rất tốt', colorClass: 'text-good dark:text-good-dark' };
  if (ratio >= 0.4) return { text: 'Tốt vừa', colorClass: 'text-good dark:text-good-dark' };
  if (ratio >= 0.05) return { text: 'Bình thường', colorClass: 'text-gold dark:text-gold-dark' };
  if (ratio >= -0.3) return { text: 'Xấu', colorClass: 'text-orange dark:text-orange-dark' };
  return { text: 'Rất Xấu', colorClass: 'text-bad dark:text-bad-dark' };
}

const GroupedBreakdown: React.FC<GroupedBreakdownProps> = ({ breakdown }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (breakdown.length === 0) return null;

  const itemsByFactor = new Map(breakdown.map((b) => [b.factor, b]));

  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden bg-surface-light dark:bg-surface-dark">
      <div className="px-4 py-3 border-b border-border-light/50 dark:border-border-dark/50 bg-surface-subtle-light/40 dark:bg-surface-subtle-dark/40">
        <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <LineChart className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
          Chi tiết đánh giá (theo nhóm)
        </span>
      </div>

      {GROUPS.map((group) => {
        const groupItems = group.factors.map((f) => itemsByFactor.get(f)).filter(Boolean) as ScoreBreakdownItem[];
        if (groupItems.length === 0) return null;

        const groupScore = groupItems.reduce((sum, item) => sum + item.value, 0);
        const groupMax = groupItems.reduce((sum, item) => sum + item.maxValue, 0);
        const isExpanded = expandedGroup === group.id;
        const q = quantifyScore(groupScore, groupMax);

        return (
          <div key={group.id} className="border-b border-border-light/30 dark:border-border-dark/30 last:border-b-0">
            <button
              onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{group.icon}</span>
                <div className="text-left">
                  <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    {group.label}
                  </span>
                  <span className={`ml-2 text-xs font-bold ${q.colorClass}`}>{q.text}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${groupScore >= 0 ? 'text-good dark:text-good-dark' : 'text-bad dark:text-bad-dark'}`}
                >
                  {groupScore > 0 ? '+' : ''}
                  {groupScore}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isExpanded && (
              <>
                <div className="divide-y divide-border-light/30 dark:divide-border-dark/30 animate-fade-scale bg-surface-subtle-light/50 dark:bg-white/[0.02]">
                  {groupItems.map((item) => {
                    const iq = quantifyScore(item.value, item.maxValue);
                    return (
                      <div key={item.factor} className="px-4 py-2.5 pl-12 flex items-start gap-3">
                        <div className="text-text-secondary-light dark:text-text-secondary-dark mt-0.5 shrink-0">
                          {renderDynamicIcon(FACTOR_ICONS[item.factor] || 'info', 'h-4 w-4')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                              {item.label}
                            </span>
                            <span className={`text-xs font-bold ${iq.colorClass}`}>
                              {item.value > 0 ? '+' : ''}
                              {item.value}/{item.maxValue}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 leading-relaxed">
                            {item.detail}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-1 h-1 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.value > 0 ? 'bg-good dark:bg-good-dark' : item.value < 0 ? 'bg-bad dark:bg-bad-dark' : 'bg-text-secondary-light/40'
                              }`}
                              style={{ width: `${Math.max(3, Math.abs(item.value / item.maxValue) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Academic Citations */}
                <div className="px-4 py-1.5 pl-12">
                  <AcademicCitation
                    groupLabel={group.label}
                    sources={
                      GROUP_CITATIONS[
                        group.id === 'compat' ? 'compatibility' : group.id === 'day' ? 'day' : 'cosmicEnergy'
                      ] ?? []
                    }
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupedBreakdown;
