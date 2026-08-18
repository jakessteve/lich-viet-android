// ── MaiHoaView.tsx ─────────────────────────────────────────────
// Epic 4 + Epic 5 (US_MH_09..12, US_MH_U01, US_MH_P01..P03):
// Top-level Mai Hoa Dịch Số view. Orchestrates input, calculation,
// interpretation, and result display with animations and responsive layout.

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Flower2, Calendar, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';

import InputForm from './InputForm';
import HexagramCard, { HaoDetailTable } from './HexagramCard';
import SummaryCard from './SummaryCard';
import TheoryCard from './TheoryCard';
import { MaiHoaErrorBoundary } from './MaiHoaErrorBoundary';
import QmdjCrossRef from './QmdjCrossRef';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { Trigram, DivinationResult, DivineReadingSummary, CalendarMode } from '../../types/maiHoa';

import {
  buildTimeBasedInput,
  buildDivinationContext,
  performTimeBasedDivination,
  performNumberBasedDivination,
  adjustDateForTyBoundary,
  ensureHexagramsLoaded,
} from '@lich-viet/core/maihoa';

import { interpretDivination } from '@lich-viet/core/maihoa';
import { getLunarDate } from '@lich-viet/core/calendar';

import trigramData from '../../data/phase_2/trigrams.json';

// ── Constants ──────────────────────────────────────────────────

/** All 8 trigrams loaded once and shared with child components. */
const TRIGRAM_MAP: ReadonlyMap<number, Trigram> = new Map(
  (trigramData as unknown as readonly Trigram[]).map((t) => [t.id, t]),
);

/** Hexagram card display configurations — unified accent colors. */
const HEXAGRAM_CARDS = [
  { key: 'main', label: 'Quẻ Chủ', accentClass: 'text-accent-main dark:text-accent-main-dark', showMovingLine: true },
  {
    key: 'mutual',
    label: 'Quẻ Hỗ',
    accentClass: 'text-accent-mutual dark:text-accent-mutual-dark',
    showMovingLine: false,
  },
  {
    key: 'changed',
    label: 'Quẻ Biến',
    accentClass: 'text-accent-changed dark:text-accent-changed-dark',
    showMovingLine: false,
  },
] as const;

// ── State ──────────────────────────────────────────────────────

interface ResultState {
  readonly divination: DivinationResult;
  readonly summary: DivineReadingSummary;
  readonly lunarMonth: number;
}

interface MaiHoaViewProps {
  /** The currently selected date from the calendar. */
  readonly selectedDate: Date;
}

/**
 * Main Mai Hoa Dịch Số view.
 */
export default function MaiHoaView({ selectedDate }: MaiHoaViewProps): React.ReactElement {
  const [result, setResult] = useState<ResultState | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [haoExpanded, setHaoExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  /** Scroll to results when they appear. */
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  /** Preload hexagram data on mount so divination is instant. */
  useEffect(() => {
    ensureHexagramsLoaded();
  }, []);

  /** Toggle expand for all hexagram detail tables at once. */
  const toggleHaoExpand = useCallback(() => setHaoExpanded((prev) => !prev), []);

  /** Current lunar date derived from selectedDate. */
  const lunarDate = useMemo(() => getLunarDate(selectedDate), [selectedDate]);

  /**
   * Simulates a brief loading state before showing results.
   */
  const showResultWithDelay = useCallback((resultData: ResultState) => {
    setIsLoading(true);
    setTimeout(() => {
      setResult(resultData);
      setIsLoading(false);
    }, 800);
  }, []);

  /**
   * Handles time-based divination using the selected date + current hour.
   */
  const handleDivineByTime = useCallback(
    async (mode: CalendarMode, query: string) => {
      setErrorMsg('');
      try {
        await ensureHexagramsLoaded();
        const now = new Date();
        const currentHour = now.getHours();
        const adjustedDate = adjustDateForTyBoundary(selectedDate, currentHour);
        const context = buildDivinationContext(adjustedDate, mode, 'Mai Hoa', query);
        const divLunarDate = getLunarDate(adjustedDate);

        const input = buildTimeBasedInput(divLunarDate.year, context.effectiveMonth, divLunarDate.day, currentHour);

        let divination = performTimeBasedDivination(input);
        divination = { ...divination, context };

        const summary = interpretDivination(divination, context.effectiveMonth);
        showResultWithDelay({ divination, summary, lunarMonth: context.effectiveMonth });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi gieo quẻ.');
      }
    },
    [selectedDate, showResultWithDelay],
  );

  /**
   * Handles number-based divination.
   */
  const handleDivineByNumbers = useCallback(
    async (num1: number, num2: number, mode: CalendarMode, query: string) => {
      setErrorMsg('');
      try {
        await ensureHexagramsLoaded();
        const now = new Date();
        const currentHour = now.getHours();
        const adjustedDate = adjustDateForTyBoundary(selectedDate, currentHour);
        const context = buildDivinationContext(adjustedDate, mode, 'Nhập Số', query);

        let divination = performNumberBasedDivination({ num1, num2 });
        divination = { ...divination, context };

        const summary = interpretDivination(divination, context.effectiveMonth);
        showResultWithDelay({ divination, summary, lunarMonth: context.effectiveMonth });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi gieo quẻ.');
      }
    },
    [selectedDate, showResultWithDelay],
  );

  /** The upper (Ngoại) trigram label for Thể/Dụng display. */
  const theLabel = result ? (result.divination.theTrigram === 'upper' ? 'Ngoại' : 'Nội') : '';
  const dungLabel = result ? (result.divination.dungTrigram === 'upper' ? 'Ngoại' : 'Nội') : '';

  /** Map card key to the corresponding hexagram and hao details from the result. */
  function getCardData(key: 'main' | 'mutual' | 'changed') {
    if (!result) return { hexagram: undefined, haoDetails: undefined };
    switch (key) {
      case 'main':
        return { hexagram: result.divination.mainHexagram, haoDetails: result.divination.mainHaoDetails };
      case 'mutual':
        return { hexagram: result.divination.mutualHexagram, haoDetails: undefined };
      case 'changed':
        return { hexagram: result.divination.changedHexagram, haoDetails: result.divination.changedHaoDetails };
    }
  }

  return (
    <MaiHoaErrorBoundary>
      <div className="space-y-6">
        {/* ── Header & Input Card ────────────────────── */}
        <Card className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden shadow-apple">
          <CardHeader className="text-center pb-2 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-subtle-light dark:bg-surface-subtle-dark">
            <div className="flex items-center justify-center gap-2">
              <Flower2 className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <CardTitle className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                Mai Hoa Dịch Số
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Gieo quẻ theo phương pháp Mai Hoa Dịch Số — Thiệu Ung
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

            <InputForm onDivineByTime={handleDivineByTime} onDivineByNumbers={handleDivineByNumbers} />
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

        {/* ── Loading State ──────────────────────────── */}
        {isLoading && (
          <Card className="p-8 flex flex-col items-center gap-4 animate-scale-in motion-gpu rounded-2xl border border-border-light/60 dark:border-border-dark/60">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center animate-glow-breathe">
              <Sparkles className="h-8 w-8 text-gold dark:text-gold-dark animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">Đang khởi quẻ...</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Nạp Giáp, an Lục Thân, phân định Thể Dụng
              </p>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-main via-accent-mutual to-amber-500 loading-shimmer"
                style={{ width: '100%' }}
              />
            </div>
          </Card>
        )}

        {/* ── Results ────────────────────────────────── */}
        {result && !isLoading && (
          <div className="space-y-6" ref={resultsRef}>
            {/* Three Hexagram Cards — visible to ALL users (visual hook) */}
            <div className="flex gap-2 sm:gap-2 md:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible items-stretch -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
              {HEXAGRAM_CARDS.map((card) => {
                const { hexagram, haoDetails } = getCardData(card.key);
                if (!hexagram) return null;
                return (
                  <div key={card.key} className="min-w-[72%] sm:min-w-0 h-full snap-center animate-fade-in-up">
                    <HexagramCard
                      hexagram={hexagram}
                      label={card.label}
                      movingLine={card.showMovingLine ? result.divination.movingLine : undefined}
                      trigramDataMap={TRIGRAM_MAP}
                      accentClass={card.accentClass}
                      haoDetails={haoDetails}
                      expanded={haoExpanded}
                      onToggleExpand={toggleHaoExpand}
                    />
                  </div>
                );
              })}
            </div>

            {/* ── Mobile-only Detail Panel below cards ─────── */}
            {(result.divination.mainHaoDetails || result.divination.changedHaoDetails) && (
              <div className="md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleHaoExpand}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark rounded-xl h-10"
                  aria-expanded={haoExpanded}
                >
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform duration-200', haoExpanded && 'rotate-180')}
                  />
                  {haoExpanded ? 'Ẩn chi tiết hào' : 'Chi tiết hào'}
                </Button>

                {haoExpanded && (
                  <div className="mt-2 space-y-3 animate-fade-in-up">
                    {result.divination.mainHaoDetails && (
                      <div>
                        <span className="label-standard text-accent-main dark:text-accent-main-dark mb-1.5 block">
                          Quẻ Chủ
                        </span>
                        <HaoDetailTable haoDetails={result.divination.mainHaoDetails} />
                      </div>
                    )}
                    {result.divination.changedHaoDetails && (
                      <div>
                        <span className="label-standard text-accent-changed dark:text-accent-changed-dark mb-1.5 block">
                          Quẻ Biến
                        </span>
                        <HaoDetailTable haoDetails={result.divination.changedHaoDetails} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Interpretation Summary */}
            <SummaryCard
              summary={result.summary}
              theLabel={theLabel}
              dungLabel={dungLabel}
              movingLine={result.divination.movingLine}
              context={result.divination.context}
            />

            {/* QMDJ Cross-Reference */}
            <QmdjCrossRef date={selectedDate} />

            {/* Theory Card */}
            <TheoryCard
              mainHexagram={result.divination.mainHexagram}
              mutualHexagram={result.divination.mutualHexagram}
              changedHexagram={result.divination.changedHexagram}
              movingLine={result.divination.movingLine}
              mainHaoDetails={result.divination.mainHaoDetails}
              mutualHaoDetails={result.divination.mutualHaoDetails}
              changedHaoDetails={result.divination.changedHaoDetails}
              trigramDataMap={TRIGRAM_MAP}
              context={result.divination.context}
              summary={result.summary}
              theLabel={theLabel}
              dungLabel={dungLabel}
            />
          </div>
        )}
      </div>
    </MaiHoaErrorBoundary>
  );
}
