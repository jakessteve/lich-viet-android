/**
 * TamThucView — Unified Tam Thức Divination View
 *
 * Runs all three Great Divination Arts (QMDJ, Lục Nhâm, Thái Ất)
 * from a shared date/time input and displays cross-referenced results.
 *
 * Reuses the shared InputForm from Mai Hoa for consistent UX.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Calendar, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { synthesizeTamThuc, type TamThucSynthesis, type MethodSummary } from '@lich-viet/core/tamThuc';
import { getLunarDate } from '@lich-viet/core/calendar';
import { adjustDateForTyBoundary } from '@lich-viet/core/maihoa';
import type { CalendarMode } from '../../types/maiHoa';
import InputForm from '../MaiHoa/InputForm';
import CrossRefSynthesis from './CrossRefSynthesis';
import CollapsibleCard from '../CollapsibleCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────

const VERDICT_COLORS: Record<string, string> = {
  cat: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-700/30',
  hung: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-700/30',
  trungBinh:
    'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700/30',
};

// ── Method Detail Card ─────────────────────────────────────────

function MethodDetailCard({ method }: { method: MethodSummary }) {
  const verdictColor = VERDICT_COLORS[method.verdict] || VERDICT_COLORS.trungBinh;

  return (
    <CollapsibleCard
      title={
        <div className="flex items-center gap-2">
          <span className="text-base">{method.icon}</span>
          <span>{method.name}</span>
        </div>
      }
      defaultOpen={true}
    >
      <div className="p-4 space-y-3">
        {/* Verdict badge */}
        <div
          className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border', verdictColor)}
        >
          {method.verdict === 'cat' ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : method.verdict === 'hung' ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : (
            <Info className="h-3.5 w-3.5" />
          )}
          {method.verdictLabel}
        </div>

        {/* Summary */}
        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{method.summary}</p>

        {/* Details */}
        {method.details.length > 0 && (
          <div className="space-y-1.5">
            {method.details.map((detail, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark"
              >
                <span className="text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-0.5">•</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}

// ── Main View ──────────────────────────────────────────────────

interface TamThucViewProps {
  /** The currently selected date from the calendar. */
  readonly selectedDate: Date;
}

export default function TamThucView({ selectedDate }: TamThucViewProps) {
  const [synthesis, setSynthesis] = useState<TamThucSynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  /** Current lunar date derived from selectedDate. */
  const lunarDate = useMemo(() => getLunarDate(selectedDate), [selectedDate]);

  /** Scroll to results when they appear. */
  useEffect(() => {
    if (synthesis && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [synthesis]);

  /**
   * Derive the Địa Chi hour index from a 24-hour clock value.
   */
  const getHourIndex = (h: number): number => {
    return Math.floor(((h + 1) % 24) / 2);
  };

  /**
   * Time-based divination handler.
   */
  const handleDivineByTime = useCallback(
    async (_mode: CalendarMode, _query: string) => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const now = new Date();
        const currentHour = now.getHours();
        const adjustedDate = adjustDateForTyBoundary(selectedDate, currentHour);
        const hourIdx = getHourIndex(currentHour);

        const result = synthesizeTamThuc(adjustedDate, hourIdx);
        setTimeout(() => {
          setSynthesis(result);
          setIsLoading(false);
        }, 600);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi bốc quẻ Tam Thức.');
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  /**
   * Number-based divination handler.
   */
  const handleDivineByNumbers = useCallback(
    async (num1: number, _num2: number, _mode: CalendarMode, _query: string) => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const hourIdx = (num1 - 1) % 12;
        const now = new Date();
        const adjustedDate = adjustDateForTyBoundary(selectedDate, now.getHours());

        const result = synthesizeTamThuc(adjustedDate, hourIdx);
        setTimeout(() => {
          setSynthesis(result);
          setIsLoading(false);
        }, 600);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi bốc quẻ.');
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  return (
    <div className="space-y-6">
      {/* ── Input Card (reuses Mai Hoa InputForm) ── */}
      <Card className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden shadow-apple">
        <CardHeader className="text-center pb-2 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-subtle-light dark:bg-surface-subtle-dark">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            <CardTitle className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Tam Thức — Tam Đại Quái Thuật
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Kỳ Môn Độn Giáp · Đại Lục Nhâm · Thái Ất Thần Số — cùng phân tích từ một thời điểm
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {/* Lunar date context */}
          <div className="mb-4 text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Âm lịch: ngày{' '}
              <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{lunarDate.day}</span>{' '}
              tháng{' '}
              <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{lunarDate.month}</span>{' '}
              năm{' '}
              <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{lunarDate.year}</span>
              {lunarDate.isLeap && (
                <span className="text-accent-moving dark:text-accent-moving-dark ml-1">(nhuận)</span>
              )}
            </span>
          </div>

          <InputForm
            onDivineByTime={handleDivineByTime}
            onDivineByNumbers={handleDivineByNumbers}
            isLoading={isLoading}
            submitLabel="Bốc Quẻ Tam Thức"
            loadingLabel="Đang phân tích Tam Thức..."
            idPrefix="tamThuc"
          />
        </CardContent>

        {/* Error display */}
        {errorMsg && (
          <div
            className="mx-4 sm:mx-5 mb-4 sm:mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-start gap-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}
      </Card>

      {/* ── Loading State ── */}
      {isLoading && (
        <Card className="p-8 flex flex-col items-center gap-4 animate-fade-in-up rounded-2xl border border-border-light/60 dark:border-border-dark/60">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-purple-500 dark:text-purple-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              Đang khởi động Tam Thức...
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Kỳ Môn Độn Giáp · Đại Lục Nhâm · Thái Ất Thần Số
            </p>
          </div>
          <div className="w-48 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 loading-shimmer"
              style={{ width: '100%' }}
            />
          </div>
        </Card>
      )}

      {/* ── Results ── */}
      {synthesis && !isLoading && (
        <div className="space-y-5 animate-fade-in-up" ref={resultsRef}>
          {/* Cross-Reference Synthesis — the consensus panel */}
          <CrossRefSynthesis synthesis={synthesis} />

          {/* Individual Method Detail Cards */}
          <MethodDetailCard method={synthesis.methods.qmdj} />
          <MethodDetailCard method={synthesis.methods.lucNham} />
          <MethodDetailCard method={synthesis.methods.thaiAt} />

          {/* Technical footer */}
          <div className="text-center text-[10px] text-text-secondary-light/60 dark:text-text-secondary-dark/60 space-y-0.5">
            <p>
              Thời điểm: Giờ {synthesis.hourBranchName} · {synthesis.date.toLocaleDateString('vi-VN')}
            </p>
            <p>Tam Thức = Kỳ Môn Độn Giáp + Đại Lục Nhâm + Thái Ất Thần Số</p>
          </div>
        </div>
      )}
    </div>
  );
}
