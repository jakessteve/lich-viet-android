import React from 'react';
import { CheckCircle2, AlertTriangle, ChevronDown, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/shared';
import CollapsibleCard from '@/components/CollapsibleCard';
import type { FormattedDungSu } from '@/utils/dungSuFormatters';
import type { PersonalDungSuResult, ScoredActivity } from '@/services/personalization';

interface DungSuSectionProps {
  date: Date;
  isPersonalized: boolean;
  personalDungSu: PersonalDungSuResult | null;
  formattedNghi: FormattedDungSu;
  formattedKy: FormattedDungSu;
  isNghiOpen: boolean;
  isKyOpen: boolean;
  onToggleNghi: () => void;
  onToggleKy: () => void;
  onDungSuBadgeClick: (text: string) => void;
  onNavigateToFindDays: (date: Date) => void;
}

export const DungSuSection: React.FC<DungSuSectionProps> = ({
  date,
  isPersonalized,
  personalDungSu,
  formattedNghi,
  formattedKy,
  isNghiOpen,
  isKyOpen,
  onToggleNghi,
  onToggleKy,
  onDungSuBadgeClick,
  onNavigateToFindDays,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Personalized Dụng Sự */}
      {isPersonalized && personalDungSu && (
        <CollapsibleCard title="Dụng sự theo tuổi của bạn" defaultOpen={false} collapseOnMobile={true}>
          <div className="divide-y divide-border-light dark:divide-border-dark text-sm px-4 sm:px-6 py-3">
            {personalDungSu.recommended.length > 0 && (
              <div className="py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple dark:text-purple-dark mb-1.5">
                  Nên làm
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {personalDungSu.recommended.map((act: ScoredActivity, i: number) => (
                    <Badge
                      key={i}
                      variant="purple"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onDungSuBadgeClick(act.name)}
                    >
                      {act.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {personalDungSu.regular.length > 0 && (
              <div className="py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
                  Bình thường
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {personalDungSu.regular.map((act: ScoredActivity, i: number) => (
                    <Badge
                      key={i}
                      variant="neutral"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onDungSuBadgeClick(act.name)}
                    >
                      {act.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {personalDungSu.warned.length > 0 && (
              <div className="py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-orange dark:text-orange-dark mb-1.5">
                  Cẩn thận
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {personalDungSu.warned.map((act: ScoredActivity, i: number) => (
                    <Badge
                      key={i}
                      variant="orange"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onDungSuBadgeClick(act.name)}
                    >
                      {act.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-border-light dark:border-border-dark text-right">
            <button
              onClick={() => onNavigateToFindDays(date)}
              className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Tìm ngày tốt quanh ngày này
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CollapsibleCard>
      )}

      {/* ── Việc Nên Làm & Việc Cần Kiêng ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Việc Nên Làm (Nghi) */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/15 p-4 space-y-2.5 flex flex-col justify-between overflow-hidden">
          <button
            type="button"
            onClick={onToggleNghi}
            className="w-full flex items-center justify-between text-left interactive-press rounded-xl"
            aria-expanded={isNghiOpen}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Việc Nên Làm (Nghi)
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {formattedNghi.focus ? (
                <Badge variant="good" pip={true}>
                  Tốt Mọi Việc
                </Badge>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {formattedNghi.rest.length} việc
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 shrink-0 ${
                  isNghiOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-250 ease-out ${
              isNghiOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formattedNghi.rest.length > 0 ? (
                  formattedNghi.rest.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onDungSuBadgeClick(item)}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-light dark:bg-surface-elevated-dark text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 shadow-2xs hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors cursor-pointer interactive-press"
                      title={`Tra cứu ngày giờ cho việc "${item}"`}
                    >
                      {item}
                    </button>
                  ))
                ) : !formattedNghi.focus ? (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
                    Không có việc nghi đặc biệt hôm nay
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Việc Cần Kiêng (Kỵ) */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/15 p-4 space-y-2.5 flex flex-col justify-between overflow-hidden">
          <button
            type="button"
            onClick={onToggleKy}
            className="w-full flex items-center justify-between text-left interactive-press rounded-xl"
            aria-expanded={isKyOpen}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Việc Cần Kiêng (Kỵ)
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {formattedKy.focus ? (
                <Badge variant="bad" pip={true}>
                  Xấu Mọi Việc
                </Badge>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold">
                  {formattedKy.rest.length} việc
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-rose-600 dark:text-rose-400 transition-transform duration-200 shrink-0 ${
                  isKyOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-250 ease-out ${
              isKyOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formattedKy.rest.length > 0 ? (
                  formattedKy.rest.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onDungSuBadgeClick(item)}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-light dark:bg-surface-elevated-dark text-rose-800 dark:text-rose-200 border border-rose-500/20 shadow-2xs hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors cursor-pointer interactive-press"
                      title={`Tra cứu ngày giờ cho việc "${item}"`}
                    >
                      {item}
                    </button>
                  ))
                ) : !formattedKy.focus ? (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
                    Không có việc kỵ đặc biệt hôm nay
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DungSuSection);
