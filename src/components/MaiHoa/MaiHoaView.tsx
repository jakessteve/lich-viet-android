// ── MaiHoaView.tsx ─────────────────────────────────────────────
// Epic 4 + Epic 5 (US_MH_09..12, US_MH_U01, US_MH_P01..P03):
// Top-level Mai Hoa Dịch Số view. Orchestrates input, calculation,
// interpretation, and result display with animations and responsive layout.

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

import InputForm from './InputForm';
import HexagramCard, { HaoDetailTable } from './HexagramCard';
import SummaryCard from './SummaryCard';
import TheoryCard from './TheoryCard';
import { MaiHoaErrorBoundary } from './MaiHoaErrorBoundary';
import QmdjCrossRef from './QmdjCrossRef';

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

  /** Preload hexagram data (201 KB) on mount so divination is instant. */
  useEffect(() => {
    ensureHexagramsLoaded();
  }, []);

  /** Toggle expand for all hexagram detail tables at once. */
  const toggleHaoExpand = useCallback(() => setHaoExpanded((prev) => !prev), []);

  /** Current lunar date derived from selectedDate. */
  const lunarDate = useMemo(() => getLunarDate(selectedDate), [selectedDate]);

  /**
   * Simulates a brief loading state before showing results.
   * Makes the divination feel deliberate rather than instant.
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
        <div className="card-surface">
          <div className="card-header">
            <div className="text-center w-full space-y-1">
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
                <span className="material-icons-round text-xl text-amber-500 dark:text-amber-400">spa</span>
                Mai Hoa Dịch Số
              </h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Gieo quẻ theo phương pháp Mai Hoa Dịch Số — Thiệu Ung
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {/* Lunar date context */}
            <div className="mb-4 text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
              <span className="material-icons-round text-base">calendar_today</span>
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
          </div>

          {/* Error display */}
          {errorMsg && (
            <div
              className="mx-4 sm:mx-5 mb-4 sm:mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-bad dark:text-bad-dark flex items-start gap-2"
              role="alert"
            >
              <span className="material-icons-round text-base mt-0.5">error</span>
              {errorMsg}
            </div>
          )}
        </div>

        {/* ── Loading State ──────────────────────────── */}
        {isLoading && (
          <div className="card-surface p-8 flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-main/20 to-accent-mutual/20 dark:from-accent-main-dark/20 dark:to-accent-mutual-dark/20 flex items-center justify-center">
              <span
                className="material-icons-round text-3xl text-accent-main dark:text-accent-main-dark animate-spin"
                style={{ animationDuration: '2s' }}
              >
                auto_awesome
              </span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">Đang luận quẻ...</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Phân tích Ngũ Hành, Thể Dụng, và Lục Thân
              </p>
            </div>
            <div className="w-48 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-main to-accent-mutual loading-shimmer"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* ── Results ────────────────────────────────── */}
        {result && !isLoading && (
          <div className="space-y-6" ref={resultsRef}>
            {/* Three Hexagram Cards — visible to ALL users (visual hook) */}
            <div className="flex gap-2 sm:gap-2 md:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible items-stretch -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
              {HEXAGRAM_CARDS.map((card, index) => {
                const { hexagram, haoDetails } = getCardData(card.key);
                if (!hexagram) return null;
                return (
                  <div
                    key={card.key}
                    className={`min-w-[72%] sm:min-w-0 h-full snap-center animate-fade-in-up animate-delay-${index + 1}`}
                  >
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
                <button
                  type="button"
                  onClick={toggleHaoExpand}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark card-surface hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-sm !rounded-xl"
                  aria-expanded={haoExpanded}
                >
                  <span
                    className="material-icons-round text-sm transition-transform duration-200"
                    style={{ transform: haoExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  {haoExpanded ? 'Ẩn chi tiết hào' : 'Chi tiết hào'}
                </button>

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

            {/* Interpretation */}
            {/* Summary Card (Verdict & Bottom-Line Answer) */}
            <SummaryCard
              summary={result.summary}
              theLabel={theLabel}
              dungLabel={dungLabel}
              movingLine={result.divination.movingLine}
              context={result.divination.context}
            />

            {/* QMDJ Cross-Reference */}
            <QmdjCrossRef date={selectedDate} />

            {/* Theory Card — fully visible */}
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
