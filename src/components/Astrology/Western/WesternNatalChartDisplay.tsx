import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { renderWesternNatalSvg } from '@/services/astrology/westernNatalExport';
import { MoonPhaseBadge } from './MoonPhaseBadge';
import { ElementBalanceCard } from './ElementBalanceCard';
import { AspectPatternsCard } from './AspectPatternsCard';
import { WesternSimplifiedExplanation } from './WesternSimplifiedExplanation';
import { WesternNatalTechnicalDisplay } from './WesternNatalTechnicalDisplay';
import { WesternMarkdownExport } from '../WesternMarkdownExport';
import { SegmentedControl, type SegmentedOption } from '../../shared';

type WesternViewMode = 'simple' | 'advanced';

const ZOOM_LEVELS = [1, 1.25, 1.5, 2] as const;

const WESTERN_VIEW_MODES: readonly SegmentedOption<WesternViewMode>[] = [
  { id: 'simple', label: 'Luận Giải Cơ Bản', shortLabel: 'Cơ bản', icon: 'menu_book' },
  { id: 'advanced', label: 'Chuyên Sâu & Kỹ Thuật', shortLabel: 'Chuyên sâu', icon: 'psychology' },
];

export const WesternNatalChartDisplay: React.FC = () => {
  const result = useAstrologyStore((state) => state.westernNatalResult);
  const isDark = useAppStore((state) => state.isDark);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [viewMode, setViewMode] = useState<WesternViewMode>('simple');

  const zoom = ZOOM_LEVELS[zoomIndex];
  const svg = useMemo(() => {
    if (!result) return '';
    const rendered = renderWesternNatalSvg(result, { theme: isDark ? 'dark' : 'light', size: 1180 });
    return rendered.replace(
      '<svg ',
      '<svg class="block h-auto w-full max-w-none" preserveAspectRatio="xMidYMid meet" ',
    );
  }, [isDark, result]);

  useEffect(() => {
    setZoomIndex(0);
    const viewport = viewportRef.current;
    if (viewport && typeof viewport.scrollTo === 'function') viewport.scrollTo({ left: 0, top: 0 });
  }, [result]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof viewport.scrollTo !== 'function') return;
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        left: zoom === 1 ? 0 : Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2),
        top: zoom === 1 ? 0 : Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2),
        behavior: 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [zoom]);

  const zoomOut = useCallback(() => setZoomIndex((current) => Math.max(0, current - 1)), []);
  const zoomIn = useCallback(() => setZoomIndex((current) => Math.min(ZOOM_LEVELS.length - 1, current + 1)), []);
  const fitChart = useCallback(() => setZoomIndex(0), []);
  const toggleDetailZoom = useCallback(() => setZoomIndex((current) => (current === 0 ? 2 : 0)), []);

  if (!result) return null;

  return (
    <section className="space-y-5 animate-fade-in-up" aria-label="Lá số chiêm tinh Tây phương">
      <div className="surface-card overflow-hidden rounded-2xl border border-border-light/60 shadow-sm dark:border-border-dark/60">
        <header className="flex items-center justify-between gap-3 border-b border-border-light/50 px-3 py-2.5 dark:border-border-dark/50 sm:px-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">Bản đồ sao</h3>
            <p className="truncate text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Chạm hai lần để xem chi tiết
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1" aria-label="Điều khiển thu phóng">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              className="surface-control inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary-light transition-colors hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-text-secondary-dark dark:hover:text-indigo-300"
              aria-label="Thu nhỏ lá số"
            >
              <span className="material-icons-round text-xl" aria-hidden="true">
                zoom_out
              </span>
            </button>
            <button
              type="button"
              onClick={fitChart}
              disabled={zoomIndex === 0}
              className="surface-control inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-2 text-xs font-semibold text-text-secondary-light transition-colors hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-text-secondary-dark dark:hover:text-indigo-300"
              aria-label="Vừa màn hình"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="surface-control inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary-light transition-colors hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-text-secondary-dark dark:hover:text-indigo-300"
              aria-label="Phóng to lá số"
            >
              <span className="material-icons-round text-xl" aria-hidden="true">
                zoom_in
              </span>
            </button>
          </div>
        </header>
        <div
          ref={viewportRef}
          data-western-chart-viewport
          data-zoom={zoom}
          className={`mx-auto aspect-square w-full max-w-[1180px] bg-[#FBFAF7] dark:bg-[#151722] ${zoom > 1 ? 'overflow-auto overscroll-contain' : 'overflow-hidden'}`}
          style={{ touchAction: zoom > 1 ? 'pan-x pan-y' : 'manipulation' }}
          onDoubleClick={toggleDetailZoom}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleDetailZoom();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Lá số ở mức thu phóng ${Math.round(zoom * 100)}%`}
        >
          <div data-western-chart-stage className="aspect-square origin-top-left" style={{ width: `${zoom * 100}%` }}>
            <div
              data-western-natal-chart
              data-western-chart-export
              className="h-full w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-none"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Mức thu phóng {Math.round(zoom * 100)}%
      </p>

      {/* Action buttons immediately below chart */}
      <WesternMarkdownExport system="western" />

      {/* Dual Tier Interpretation Selector */}
      <div className="space-y-2.5 pt-2 border-t border-border-light/40 dark:border-border-dark/40">
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            Luận Giải Bản Đồ Sao
          </h4>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Chọn chế độ xem phù hợp với nhu cầu của bạn.
          </p>
        </div>
        <SegmentedControl
          options={WESTERN_VIEW_MODES}
          value={viewMode}
          onChange={setViewMode}
          ariaLabel="Chế độ xem luận giải Tây phương"
          tone="indigo"
          className="w-full"
        />
      </div>

      {/* MODE 1: Cơ bản (Simple) */}
      {viewMode === 'simple' && (
        <div className="space-y-5 animate-fade-in">
          {/* Moon Phase Badge */}
          {result.moonPhase && <MoonPhaseBadge moonPhase={result.moonPhase} />}

          {/* Element & Modality Balance Card */}
          {result.elementBalance && <ElementBalanceCard balance={result.elementBalance} />}

          {/* Simplified Interpretations (The Big Three, Personal Drivers, Karma/Growth, Life Spheres) */}
          <WesternSimplifiedExplanation result={result} mode="simple" />
        </div>
      )}

      {/* MODE 2: Chuyên sâu (Advanced) */}
      {viewMode === 'advanced' && (
        <div className="space-y-5 animate-fade-in">
          {/* Special Aspect Patterns Card */}
          {result.aspectPatterns && result.aspectPatterns.length > 0 && (
            <AspectPatternsCard patterns={result.aspectPatterns} />
          )}

          {/* Deep Technical Data Accordion */}
          <WesternNatalTechnicalDisplay result={result} />

          {/* Advanced Multi-Dimensional Interpretations */}
          <WesternSimplifiedExplanation result={result} mode="advanced" />
        </div>
      )}
    </section>
  );
};

export default WesternNatalChartDisplay;
