import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import CollapsibleCard from '@/components/CollapsibleCard';
import {
  getSignedModifierTotalBySign,
  getBreakdownToneClass,
  renderNormalizedDungSu,
} from '@/utils/dungSuFormatters';
import type { HourInfo } from '@/types/calendar';

interface HoursTimelineProps {
  sortedHours: HourInfo[];
  personalizedHours: HourInfo[];
  topHourIndices: Set<number>;
  isPersonalized: boolean;
  sortByScore: boolean;
  onToggleSort: () => void;
}

export const HoursTimeline: React.FC<HoursTimelineProps> = ({
  sortedHours,
  personalizedHours,
  topHourIndices,
  isPersonalized,
  sortByScore,
  onToggleSort,
}) => {
  return (
    <div className="space-y-4 page-enter-smooth">
      <CollapsibleCard
        title="Giờ tốt và xấu trong ngày"
        defaultOpen={true}
        collapseOnMobile={false}
        headerRight={
          <button
            onClick={onToggleSort}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low transition-[background-color,color,transform] duration-150 spring-press motion-gpu cursor-pointer"
          >
            {sortByScore ? <Clock className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {sortByScore ? 'Theo giờ' : 'Giờ tốt trước'}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/70 tracking-wider border-b border-border-light dark:border-border-dark/70">
              <tr>
                <th className="hidden sm:table-cell px-6 py-3 w-24" scope="col">
                  Khung Giờ
                </th>
                <th className="px-3 sm:px-6 py-3 w-[90px] sm:w-32 text-center" scope="col">
                  Can Chi
                </th>
                <th className="px-3 sm:px-6 py-3" scope="col">
                  Nghi / Kỵ
                </th>
                <th className="px-3 sm:px-6 py-3 text-right w-[70px] sm:w-28 align-middle" scope="col">
                  Điểm Số
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark/70">
              {sortedHours.map((h, idx) => {
                const advanced = h.advancedInfo || [];
                const statusIndex = advanced.findIndex((s) => s.startsWith('Trạng thái:'));
                let statusInfo = '';
                if (statusIndex !== -1) {
                  statusInfo = advanced[statusIndex].replace('Trạng thái:', '').trim();
                }

                const personalBreakdowns = advanced.filter((s) => s.startsWith('Cá nhân:'));
                const positiveBreakdowns = personalBreakdowns.filter(
                  (s) => s.includes('Tương hợp') && /\(\+\d+%\)/.test(s),
                );
                const negativeBreakdowns = personalBreakdowns.filter(
                  (s) => s.includes('Tương khắc') && /\(-\d+%\)/.test(s),
                );

                const isHoangDao = statusInfo === 'HOÀNG ĐẠO' || h.isAuspicious;

                const originalIndex = personalizedHours.findIndex((orig) => orig.timeRange === h.timeRange);
                const isTop3 = topHourIndices.has(originalIndex);

                const currentScore = h.score;
                const isWeak = currentScore < 40;
                const isAuspiciousCurrent = currentScore >= 60;
                const positiveModifierTotal = getSignedModifierTotalBySign(personalBreakdowns, '+');
                const negativeModifierTotal = getSignedModifierTotalBySign(personalBreakdowns, '-');
                const scoreToneClass =
                  currentScore >= 50 ? 'text-good dark:text-good-dark' : 'text-bad dark:text-bad-dark';
                const normalizedHourDungSu = renderNormalizedDungSu(h.nghi, h.ky);

                return (
                  <tr
                    key={idx}
                    className={`transition-colors border-b border-border-light/70 dark:border-border-dark/60 last:border-b-0 ${
                      isTop3
                        ? 'bg-gold/10 dark:bg-gold-dark/10 hover:bg-gold/15'
                        : isWeak
                          ? 'opacity-60 hover:opacity-100 hover:bg-surface-subtle-light dark:hover:bg-white/5'
                          : isAuspiciousCurrent
                            ? 'bg-info/5 dark:bg-info-dark/5 hover:bg-surface-subtle-light dark:hover:bg-white/5'
                            : 'hover:bg-surface-subtle-light dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="hidden sm:table-cell px-6 py-4 font-medium whitespace-nowrap align-top">
                      {h.timeRange.replace(/:00/g, '').replace(' - ', '–')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center align-top">
                      <div className="sm:hidden text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium">
                        {h.timeRange.replace(/:00/g, '').replace(' - ', '–')}
                      </div>
                      <div
                        className={`font-bold text-sm sm:text-base mt-0.5 ${
                          h.isAuspicious ? 'text-good dark:text-good-dark' : 'text-text-primary-light dark:text-text-primary-dark'
                        }`}
                      >
                        {h.canChi.can} {h.canChi.chi}
                      </div>
                      <div className="text-[11px] mt-0.5 tracking-tight font-semibold">
                        {isHoangDao ? (
                          <span className="text-good dark:text-good-dark">HOÀNG ĐẠO</span>
                        ) : (
                          <span className="text-text-secondary-light dark:text-text-secondary-dark">HẮC ĐẠO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-text-primary-light dark:text-text-primary-dark space-y-1.5 align-top">
                      <div className="leading-relaxed">
                        <span className="font-bold text-good dark:text-good-dark mr-1">Nghi:</span>
                        <span>{normalizedHourDungSu.nghi}</span>
                      </div>
                      <div className="leading-relaxed">
                        <span className="font-bold text-bad dark:text-bad-dark mr-1">Kỵ:</span>
                        <span>{normalizedHourDungSu.ky}</span>
                      </div>
                      {isPersonalized && personalBreakdowns.length > 0 && (
                        <div className="space-y-0.5 mt-1">
                          {personalBreakdowns.map((b, i) => (
                            <div key={i} className={`text-xs font-normal ${getBreakdownToneClass(b)}`}>
                              {b.replace('Cá nhân:', '').trim()}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm align-top flex flex-col items-end space-y-0.5 text-text-primary-light dark:text-text-primary-dark">
                      <div className={scoreToneClass}>{currentScore}%</div>
                      {isPersonalized && (positiveBreakdowns.length > 0 || negativeBreakdowns.length > 0) && (
                        <div className="space-y-0.5 mt-1">
                          {positiveModifierTotal !== null && positiveModifierTotal > 0 && (
                            <div className="text-xs font-normal text-good dark:text-good-dark">
                              Tương hợp +{positiveModifierTotal}%
                            </div>
                          )}
                          {negativeModifierTotal !== null && negativeModifierTotal < 0 && (
                            <div className="text-xs font-normal text-bad dark:text-bad-dark">
                              Tương khắc {negativeModifierTotal}%
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>
    </div>
  );
};

export default React.memo(HoursTimeline);
