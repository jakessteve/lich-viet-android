import React from 'react';
import { Compass, ChevronDown, ArrowRight } from 'lucide-react';
import CollapsibleCard from '@/components/CollapsibleCard';
import TermTooltip from '@/components/shared/TermTooltip';
import { formatXungHop, formatNapAm } from '@/utils/dungSuFormatters';
import type { DayDetailsData } from '@/types/calendar';

interface AcademicSectionProps {
  date: Date;
  data: DayDetailsData;
  isXungHopOpen: boolean;
  onToggleXungHop: () => void;
  onNavigateToFindDays: (date: Date) => void;
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
  date,
  data,
  isXungHopOpen,
  onToggleXungHop,
  onNavigateToFindDays,
}) => {
  const renderWithItalics = (text: string) => {
    return <span>{text}</span>;
  };

  return (
    <div className="space-y-4 page-enter-smooth">
      {/* ── Trực/Tú & Xung Hợp Collapsible Card ──────────────── */}
      <div className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 bg-surface-light dark:bg-surface-elevated-dark p-4 space-y-3 overflow-hidden">
        <button
          type="button"
          onClick={onToggleXungHop}
          className="w-full flex items-center justify-between text-left interactive-press rounded-xl"
          aria-expanded={isXungHopOpen}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Compass className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
              Trực · Tú & Xung Hợp Chi
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="text-[11px] px-2.5 py-1 rounded-xl bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark font-semibold text-right leading-tight flex flex-col items-end border border-border-light/40 dark:border-border-dark/40 shrink-0">
              <span>Trực {data.modifyingLayer.trucDetail.name}</span>
              <span className="opacity-80 font-medium">Sao {data.modifyingLayer.tuDetail.name}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 shrink-0 ${
                isXungHopOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-250 ease-out ${
            isXungHopOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-light/40 dark:border-border-dark/40">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Trực {data.modifyingLayer.trucDetail.name} · Sao {data.modifyingLayer.tuDetail.name}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {data.modifyingLayer.trucDetail.description}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {formatXungHop(data.canChiXungHop || '')}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Nạp âm: {formatNapAm(data.napAmInteraction || '')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chi Tiết Học Thuật Ngày Âm (Deep Dive Academic Accordion) ─── */}
      <CollapsibleCard title="Chi tiết học thuật ngày âm" defaultOpen={true} collapseOnMobile={false}>
        <div className="divide-y divide-border-light dark:divide-border-dark text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Ngũ hành">Ngũ hành</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.nguHanhInteraction || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Nạp âm">Nạp âm</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {formatNapAm(data.napAmInteraction || '')}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Tam Hợp">Xung hợp</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {formatXungHop(data.canChiXungHop || '')}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Cát thần">Cát thần</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.goodStars.join(', ') || 'Không có'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Hung thần">Hung thần</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.badStars.join(', ') || 'Không có'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Bành tổ bách kỵ">Bành tổ bách kỵ</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed space-y-1.5">
              {renderWithItalics(data.banhTo.can)}
              {renderWithItalics(data.banhTo.chi)}
            </div>
          </div>
          <div className="px-4 sm:px-6 py-3 border-t border-border-light dark:border-border-dark text-right">
            <button
              onClick={() => onNavigateToFindDays(date)}
              className="text-sm font-semibold text-good dark:text-good-dark hover:underline inline-flex items-center gap-1 interactive-press cursor-pointer"
            >
              Tìm ngày giờ tốt trong 14 ngày tới
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
};

export default React.memo(AcademicSection);
