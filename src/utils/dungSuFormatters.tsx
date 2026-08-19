import React from 'react';
import { normalizeDungSuBuckets } from '@/utils/dungSuDisplay';

export interface FormattedDungSu {
  focus: boolean;
  rest: string[];
}

/**
 * Helper to deduplicate and clean bracket descriptions for Nghi / Ky
 */
export function formatDungSu(items: string[] | undefined, focusWord: string): FormattedDungSu {
  if (!items || items.length === 0) return { focus: false, rest: [] };
  const cleanedItems = items.map((item) => item.split(' (')[0].trim());
  const uniqueItems = Array.from(new Set(cleanedItems));
  const hasFocus = uniqueItems.includes(focusWord);
  const rest = uniqueItems.filter((item) => item !== focusWord);
  return { focus: hasFocus, rest };
}

/**
 * Calculates the sum of signed percentage modifiers in breakdown texts
 */
export function getSignedModifierTotalBySign(breakdowns: string[] | undefined, sign: '+' | '-'): number | null {
  if (!breakdowns || breakdowns.length === 0) return null;

  const total = breakdowns.reduce((sum, entry) => {
    const match = entry.match(/\(([+-]\d+)%\)/);
    if (!match || !match[1].startsWith(sign)) return sum;
    return sum + Number(match[1]);
  }, 0);

  return Number.isFinite(total) ? total : null;
}

/**
 * Maps percentage tone to Tailwind color classes
 */
export function getBreakdownToneClass(text: string): string {
  if (/\(\+\d+%\)/.test(text)) {
    return 'text-good dark:text-good-dark';
  }
  if (/\(-\d+%\)/.test(text)) {
    return 'text-bad dark:text-bad-dark';
  }
  return 'text-text-secondary-light dark:text-text-secondary-dark';
}

/**
 * Highlight positive and negative percentage substrings in text with appropriate tone colors
 */
export function renderTextWithPercents(text: string): React.ReactNode {
  const percentPattern = /\((\d+)%\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = percentPattern.exec(text)) !== null) {
    const [matchedText, percentValue] = match;
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      <span
        key={`${start}-${matchedText}`}
        className={Number(percentValue) >= 50 ? 'text-good dark:text-good-dark font-medium' : 'text-bad dark:text-bad-dark font-medium'}
      >
        {matchedText}
      </span>,
    );

    lastIndex = start + matchedText.length;
  }

  if (parts.length === 0) return text;
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/**
 * Renders a comma-separated list of items with colored percentages
 */
export function renderTextListWithPercents(items: string[] | undefined, emptyText: string): React.ReactNode {
  if (!items || items.length === 0) {
    return <span>{emptyText}</span>;
  }

  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 && ', '}
          {renderTextWithPercents(item)}
        </React.Fragment>
      ))}
    </>
  );
}

/**
 * Normalizes Nghi and Ky items and returns React nodes for rendering
 */
export function renderNormalizedDungSu(nghi: string[] = [], ky: string[] = []) {
  const normalized = normalizeDungSuBuckets(nghi, ky);
  return {
    nghi: renderTextListWithPercents(normalized.nghi, 'không có việc gì tốt'),
    ky: renderTextListWithPercents(normalized.ky, 'không có việc gì kỵ đặc biệt'),
  };
}

/**
 * Formats Can Chi xung hop text into a human readable description
 */
export function formatXungHop(raw: string): string {
  if (!raw) return 'Không có xung hợp đặc biệt';
  return raw;
}

/**
 * Formats Nap Am interaction text into human readable form
 */
export function formatNapAm(raw: string): string {
  if (!raw) return 'Bình hòa';
  return raw;
}
