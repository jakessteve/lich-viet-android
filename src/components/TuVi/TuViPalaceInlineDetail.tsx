/**
 * Tu Vi Palace Inline Detail & Compact Zoom HUD — Lịch Việt v3
 *
 * Hybrid Adaptive Display:
 * - Normal Mode: Clean, static inline card positioned directly below the Tu Vi chart table.
 * - Zoom-in Mode: Ultra-compact bottom dock (44px) to preserve 95% screen real estate,
 *   with an on-demand expandable sheet for full reading.
 */

import React, { useState } from 'react';
import type { PalaceInterpretationResult } from '@/services/tuvi/palaceInterpretation';

interface TuViPalaceInlineDetailProps {
  interpretation: PalaceInterpretationResult | null;
  onClose: () => void;
  isZoomed?: boolean;
}

export const TuViPalaceInlineDetail: React.FC<TuViPalaceInlineDetailProps> = ({
  interpretation,
  onClose,
  isZoomed = false,
}) => {
  const [isZoomDrawerExpanded, setIsZoomDrawerExpanded] = useState(false);

  if (!interpretation) return null;

  const {
    palaceName,
    palaceBranch,
    isMenh,
    isThan,
    coreThemeVi,
    majorStarsAnalysisVi,
    cachCucAnalysisVi,
    tuHoaAnalysisVi,
    auxiliaryAndMaleficVi,
    tuanTrietAnalysisVi,
    tamPhuongTuChinhVi,
    actionableGuidanceVi,
  } = interpretation;

  const roleBadge = isMenh ? 'Cung Mệnh' : isThan ? 'Thân Cư' : `Cung ${palaceName}`;

  // ── 1. ZOOM-IN MODE: COMPACT PILL HUD DOCK ─────────────────────
  if (isZoomed) {
    return (
      <>
        {/* Fixed Ultra-Compact Bottom Dock (44px) */}
        <div className="fixed inset-x-2 bottom-3 z-40 sm:hidden">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface-card/95 backdrop-blur-md border border-gold/40 px-3.5 py-2 shadow-2xl animate-fade-scale">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-icons-round text-amber-500 text-base flex-shrink-0 animate-pulse">
                auto_awesome
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                    {roleBadge} ({palaceBranch})
                  </span>
                  {cachCucAnalysisVi && (
                    <span className="rounded-full bg-gold/15 px-1.5 py-0.2 text-[9px] font-semibold text-gold-light dark:text-gold-dark truncate">
                      {cachCucAnalysisVi.name}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate">
                  {cachCucAnalysisVi?.description || majorStarsAnalysisVi.slice(0, 50)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsZoomDrawerExpanded(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/40 px-2.5 py-1 text-[11px] font-bold text-gold-light dark:text-gold-dark transition-all active:scale-95"
              >
                Chi tiết
                <span className="material-icons-round text-xs">unfold_more</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark"
                title="Đóng"
              >
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Reading Sheet in Zoom Mode */}
        {isZoomDrawerExpanded && (
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] flex flex-col bg-surface-card border-t border-border-light/80 dark:border-border-dark/80 rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-container-low/90">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-amber-500 text-lg">auto_awesome</span>
                <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                  Luận Giải {roleBadge} ({palaceBranch})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomDrawerExpanded(false)}
                className="p-1.5 rounded-lg text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark"
              >
                <span className="material-icons-round text-base">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-text-primary-light dark:text-text-primary-dark leading-relaxed">
              {/* Blended Cách Cục */}
              {cachCucAnalysisVi && (
                <div className="rounded-xl bg-amber-500/10 border border-gold/30 p-3 space-y-1">
                  <div className="font-bold text-gold-light dark:text-gold-dark flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="material-icons-round text-sm">account_balance</span>
                      Cách Cục: {cachCucAnalysisVi.name}
                    </span>
                    <span className="text-[10px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      {cachCucAnalysisVi.purity}
                    </span>
                  </div>
                  <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{cachCucAnalysisVi.description}</p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/20">{cachCucAnalysisVi.synthesisVi}</p>
                </div>
              )}

              <div className="rounded-xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20 p-3 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">stars</span>
                  Chính Tinh & Cốt Cách
                </div>
                <p>{majorStarsAnalysisVi}</p>
              </div>

              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 space-y-1">
                <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">hub</span>
                  Tam Phương Tứ Chính & Hội Chiếu
                </div>
                <p>{tamPhuongTuChinhVi}</p>
              </div>

              {tuHoaAnalysisVi.length > 0 && (
                <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 space-y-1">
                  <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <span className="material-icons-round text-sm">bolt</span>
                    Tứ Hóa Tác Động
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {tuHoaAnalysisVi.map((th, i) => (
                      <li key={i}>{th}</li>
                    ))}
                  </ul>
                </div>
              )}

              {tuanTrietAnalysisVi && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 space-y-1">
                  <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <span className="material-icons-round text-sm">shield</span>
                    Ảnh Hưởng Tuần / Triệt
                  </div>
                  <p>{tuanTrietAnalysisVi}</p>
                </div>
              )}

              <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 space-y-1">
                <div className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">lightbulb</span>
                  Định Hướng Ứng Dụng Thực Tế
                </div>
                <p>{actionableGuidanceVi}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── 2. NORMAL MODE: INLINE CARD DIRECTLY BELOW CHART ───────────
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/40 bg-surface-card p-4 sm:p-6 shadow-xl space-y-4 animate-fade-scale">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light/40 dark:border-border-dark/40 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="material-icons-round text-amber-500 text-lg">auto_awesome</span>
          <h3 className="text-base sm:text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Luận Giải Chi Tiết {roleBadge} ({palaceBranch})
          </h3>
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-gold-light dark:text-gold-dark">
            {coreThemeVi}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-xl text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark hover:bg-surface-container-low transition-colors"
          title="Thu gọn"
        >
          <span className="material-icons-round text-base">close</span>
        </button>
      </div>

      {/* Blended Cách Cục Highlight if present */}
      {cachCucAnalysisVi && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold/10 to-amber-500/10 border border-gold/40 p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-amber-500 text-base">account_balance</span>
              <h4 className="text-sm font-bold text-gold-light dark:text-gold-dark">
                Cách Cục Tọa Thủ: {cachCucAnalysisVi.name}
              </h4>
            </div>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-light dark:text-gold-dark">
              {cachCucAnalysisVi.purity}
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
            {cachCucAnalysisVi.description}
          </p>
          <p className="text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/30 dark:border-border-dark/30">
            {cachCucAnalysisVi.synthesisVi}
          </p>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs leading-relaxed text-text-primary-light dark:text-text-primary-dark">
        {/* 1. Chính Tinh */}
        <div className="rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20 p-3.5 space-y-1.5">
          <div className="font-bold text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
            <span className="material-icons-round text-sm">stars</span>
            Chính Tinh Tọa Thủ
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {majorStarsAnalysisVi}
          </p>
        </div>

        {/* 2. Tam Phương Tứ Chính */}
        <div className="rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/[0.03] border border-indigo-500/20 p-3.5 space-y-1.5">
          <div className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
            <span className="material-icons-round text-sm">hub</span>
            Tam Phương Tứ Chính & Hội Chiếu
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {tamPhuongTuChinhVi}
          </p>
        </div>

        {/* 3. Tứ Hóa & Tuần Triệt */}
        {(tuHoaAnalysisVi.length > 0 || tuanTrietAnalysisVi) && (
          <div className="rounded-2xl bg-purple-500/5 dark:bg-purple-500/[0.03] border border-purple-500/20 p-3.5 space-y-1.5 sm:col-span-2">
            <div className="font-bold text-purple-700 dark:text-purple-300 text-xs flex items-center gap-1.5">
              <span className="material-icons-round text-sm">bolt</span>
              Tác Động Tứ Hóa & Biến Chuyển Thời Vận
            </div>
            {tuHoaAnalysisVi.map((th, i) => (
              <p key={i} className="text-text-secondary-light dark:text-text-secondary-dark">
                ✦ {th}
              </p>
            ))}
            {tuanTrietAnalysisVi && (
              <p className="text-rose-700 dark:text-rose-300 font-medium pt-1">
                🛡️ {tuanTrietAnalysisVi}
              </p>
            )}
          </div>
        )}

        {/* 4. Lời Khuyên Hành Động */}
        <div className="rounded-2xl bg-sky-500/5 dark:bg-sky-500/[0.03] border border-sky-500/20 p-3.5 space-y-1.5 sm:col-span-2">
          <div className="font-bold text-sky-700 dark:text-sky-300 text-xs flex items-center gap-1.5">
            <span className="material-icons-round text-sm">lightbulb</span>
            Định Hướng & Lời Khuyên Hành Động
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {actionableGuidanceVi}
          </p>
        </div>
      </div>
    </section>
  );
};
