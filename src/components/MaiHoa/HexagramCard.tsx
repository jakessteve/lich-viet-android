// ── HexagramCard.tsx ──────────────────────────────────────────
// Epic 4 (US_MH_11): Card wrapper for a single hexagram display.
// Clean, unified design with optional expandable metadata table.

import React from 'react';
import HexagramLines from './HexagramLines';
import type { Hexagram, Trigram, HaoDetail } from '../../types/maiHoa';

interface HexagramCardProps {
  /** The hexagram to display */
  readonly hexagram: Hexagram;
  /** Label for the card, e.g. "Quẻ Chủ", "Quẻ Hỗ", "Quẻ Biến" */
  readonly label: string;
  /** Moving line position (1–6). Only shown for Quẻ Chủ. */
  readonly movingLine?: number;
  /** Trigram data map for line rendering. */
  readonly trigramDataMap: ReadonlyMap<number, Trigram>;
  /** Optional accent color class for the label. */
  readonly accentClass?: string;
  /** Detailed per-line metadata (Nạp Giáp, Lục Thân, Thế/Ứng) */
  readonly haoDetails?: readonly HaoDetail[];
  /** Controlled: whether the detail table is expanded. */
  readonly expanded?: boolean;
  /** Controlled: callback to toggle expand state. */
  readonly onToggleExpand?: () => void;
}

/** Renders the expandable per-line metadata table. */
export function HaoDetailTable({ haoDetails }: { readonly haoDetails: readonly HaoDetail[] }): React.ReactElement {
  // Sort by position descending (top line 6 → bottom line 1)
  const sorted = [...haoDetails].sort((a, b) => b.position - a.position);

  return (
    <div className="overflow-hidden rounded-lg border border-border-light/60 dark:border-border-dark/60">
      <table className="w-full text-[10px] sm:text-xs">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark">
            <th className="py-1.5 px-2 text-left font-semibold uppercase tracking-wider">Hào</th>
            <th className="py-1.5 px-2 text-left font-semibold uppercase tracking-wider">Nạp Giáp</th>
            <th className="py-1.5 px-2 text-left font-semibold uppercase tracking-wider">Hành</th>
            <th className="py-1.5 px-2 text-left font-semibold uppercase tracking-wider">Lục Thân</th>
            <th className="py-1.5 px-2 text-center font-semibold uppercase tracking-wider">Vị Trí</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light/40 dark:divide-border-dark/40">
          {sorted.map((d) => (
            <tr
              key={d.position}
              className={`${d.isMoving ? 'bg-amber-50/60 dark:bg-amber-900/15' : ''} transition-colors`}
            >
              <td className="py-1.5 px-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                {d.position}
                {d.isMoving && <span className="text-amber-500 dark:text-amber-400 ml-0.5">●</span>}
              </td>
              <td className="py-1.5 px-2 font-bold text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                {d.can} {d.chi}
              </td>
              <td className="py-1.5 px-2">
                <span className="inline-block bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-secondary-light dark:text-text-secondary-dark font-medium">
                  {d.element}
                </span>
              </td>
              <td className="py-1.5 px-2 font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                {d.lucThan}
              </td>
              <td className="py-1.5 px-2 text-center">
                {d.isTh && <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px]">Thế</span>}
                {d.isUng && <span className="text-orange-600 dark:text-orange-400 font-bold text-[10px]">Ứng</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A styled card that displays a hexagram with its name and clean line graphics.
 * When haoDetails are provided, a toggle reveals the metadata table.
 */
export default function HexagramCard({
  hexagram,
  label,
  movingLine,
  trigramDataMap,
  accentClass = 'text-blue-600 dark:text-blue-400',
  haoDetails,
  expanded = false,
  onToggleExpand,
}: HexagramCardProps): React.ReactElement {
  const upperTrigram = trigramDataMap.get(hexagram.upper);
  const lowerTrigram = trigramDataMap.get(hexagram.lower);
  const hasDetails = haoDetails !== undefined && haoDetails.length > 0;

  return (
    <div className="flex flex-col h-full rounded-xl sm:rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light/50 dark:border-border-dark/50 shadow-apple transition-all duration-200 hover:shadow-apple-hover overflow-hidden">
      {/* ── Card Body: Centered Content ───────────────── */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 p-1.5 sm:p-4 md:p-5 flex-1">
        {/* Label badge */}
        <span className={`text-[10px] sm:text-[10px] uppercase tracking-widest font-bold ${accentClass}`}>{label}</span>

        {/* Hexagram Name */}
        <h4 className="text-xs sm:text-base md:text-lg font-bold text-text-primary-light dark:text-text-primary-dark text-center leading-tight">
          {hexagram.name}
        </h4>

        {/* Hexagram Lines — Clean visual, no inline metadata */}
        <div className="py-1 sm:py-2 w-14 sm:w-20 md:w-24 mx-auto">
          <HexagramLines
            upperTrigramId={hexagram.upper}
            lowerTrigramId={hexagram.lower}
            movingLine={movingLine}
            trigramDataMap={trigramDataMap}
          />
        </div>

        {/* Trigram Names */}
        <div className="flex items-center justify-center gap-1 sm:gap-3 text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark flex-wrap">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="hidden sm:inline font-semibold opacity-50 uppercase text-[10px] tracking-wider">
              Ngoại
            </span>
            <span className="font-medium">{upperTrigram?.name ?? '?'}</span>
            <span className="hidden sm:inline opacity-40">({upperTrigram?.element ?? '?'})</span>
          </div>
          <span className="opacity-25">·</span>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="hidden sm:inline font-semibold opacity-50 uppercase text-[10px] tracking-wider">Nội</span>
            <span className="font-medium">{lowerTrigram?.name ?? '?'}</span>
            <span className="hidden sm:inline opacity-40">({lowerTrigram?.element ?? '?'})</span>
          </div>
        </div>
      </div>

      {/* ── Expandable Detail Section ──────────────────── */}
      {hasDetails && (
        <div className="hidden md:block border-t border-border-light/50 dark:border-border-dark/50">
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-expanded={expanded}
          >
            <span
              className="material-icons-round text-sm transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
            {expanded ? 'Ẩn chi tiết hào' : 'Chi tiết hào'}
          </button>

          {expanded && (
            <div className="px-3 pb-3 animate-fade-in-up">
              <HaoDetailTable haoDetails={haoDetails!} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
