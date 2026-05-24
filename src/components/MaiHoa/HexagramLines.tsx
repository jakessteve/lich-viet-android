// ── HexagramLines.tsx ──────────────────────────────────────────
// Epic 4 (US_MH_11): Pure visual component to render 6 hexagram lines.
// Dương (yang) = solid line, Âm (yin) = broken line.
// The moving line (Hào Động) is highlighted with a distinct color.

import React from 'react';
import type { Trigram } from '../../types/maiHoa';

interface HexagramLinesProps {
  /** ID of the upper (outer) trigram (1–8) */
  readonly upperTrigramId: number;
  /** ID of the lower (inner) trigram (1–8) */
  readonly lowerTrigramId: number;
  /** The moving line position (1–6, 1=bottom). Pass 0 or undefined to disable highlight. */
  readonly movingLine?: number;
  /** Preloaded trigram data for rendering lines without re-import. */
  readonly trigramDataMap: ReadonlyMap<number, Trigram>;
}

/** Height of each hexagram line in pixels. */
const LINE_HEIGHT = 5;
/** Gap between broken line halves in pixels. */
const BROKEN_GAP = 8;
/** Vertical gap between lines in pixels. */
const LINE_GAP = 7;

/**
 * Renders a single hexagram line (solid or broken).
 */
function HexagramLine({
  isYang,
  isMoving,
  lineNumber,
}: {
  readonly isYang: boolean;
  readonly isMoving: boolean;
  readonly lineNumber: number;
}): React.ReactElement {
  const baseColor = isMoving ? 'bg-amber-500 dark:bg-amber-400' : 'bg-gray-700 dark:bg-gray-300';

  const lineGraphic = isYang ? (
    <div className="relative flex items-center w-full" role="img">
      <div
        className={`w-full rounded-sm ${baseColor} transition-colors duration-200`}
        style={{ height: LINE_HEIGHT }}
      />
    </div>
  ) : (
    <div className="relative flex items-center w-full" role="img">
      <div className="flex w-full items-center" style={{ gap: BROKEN_GAP }}>
        <div
          className={`flex-1 rounded-sm ${baseColor} transition-colors duration-200`}
          style={{ height: LINE_HEIGHT }}
        />
        <div
          className={`flex-1 rounded-sm ${baseColor} transition-colors duration-200`}
          style={{ height: LINE_HEIGHT }}
        />
      </div>
    </div>
  );

  return (
    <div
      className="flex items-center w-full"
      aria-label={`Hào ${lineNumber}: ${isYang ? 'Dương' : 'Âm'}${isMoving ? ' (Hào Động)' : ''}`}
    >
      {lineGraphic}
      {isMoving && <span className="text-amber-500 dark:text-amber-400 text-[10px] leading-none ml-1 shrink-0">●</span>}
    </div>
  );
}

/**
 * Renders a 6-line hexagram from bottom (line 1) to top (line 6).
 * Lines 1–3 = lower trigram, Lines 4–6 = upper trigram.
 * Clean visual only — no inline metadata.
 */
export default function HexagramLines({
  upperTrigramId,
  lowerTrigramId,
  movingLine,
  trigramDataMap,
}: HexagramLinesProps): React.ReactElement {
  const lower = trigramDataMap.get(lowerTrigramId);
  const upper = trigramDataMap.get(upperTrigramId);

  if (!lower || !upper) {
    return <div className="text-red-500 text-sm">Trigram data missing</div>;
  }

  // Build 6-line array: indices 0-2 = lower, indices 3-5 = upper
  const lines: boolean[] = [...lower.lines, ...upper.lines];

  // Render from top (line 6) to bottom (line 1) visually
  const reversedLines = [...lines]
    .map((isYang, idx) => ({
      isYang,
      lineNumber: idx + 1,
    }))
    .reverse();

  return (
    <div className="flex flex-col w-full" style={{ gap: LINE_GAP }} role="group" aria-label="Quẻ">
      {reversedLines.map(({ isYang, lineNumber }) => {
        const isMoving = movingLine === lineNumber;
        return <HexagramLine key={lineNumber} isYang={isYang} isMoving={isMoving} lineNumber={lineNumber} />;
      })}
    </div>
  );
}
