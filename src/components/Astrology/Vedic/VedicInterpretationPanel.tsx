import React, { useMemo } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { synthesizeVedicReading } from '../../../services/astrology/vedicSynthesisEngine';

export const VedicInterpretationPanel: React.FC<{
  result: WesternChartResult;
  mode?: 'simple' | 'advanced';
}> = ({ result, mode = 'simple' }) => {
  const reading = useMemo(() => synthesizeVedicReading(result), [result]);

  if (mode === 'simple') {
    return (
      <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
        <div className="card-header bg-purple-50/50 dark:bg-purple-900/10 flex items-center justify-between gap-3 border-b border-border-light/40 dark:border-border-dark/40">
          <h3 className="section-title text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold m-0">
            <span className="material-icons-round text-base shrink-0">psychology</span>
            Luận Giải Cốt Cách & Bản Mệnh (Vedic)
          </h3>
          <span className="inline-flex items-center justify-center shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-200/60 dark:border-purple-800/60 bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 leading-none">
            Cơ Bản (Sidereal Lahiri)
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* 3 Core Highlights in Accessible Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Lagna */}
            <div className="p-3.5 rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/50 dark:border-border-dark/50 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                  AS
                </span>
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                  Cung Mọc (Lagna)
                </span>
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {reading.lagnaReadingVi}
              </p>
            </div>

            {/* Moon / Janma Nakshatra */}
            <div className="p-3.5 rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/50 dark:border-border-dark/50 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  ☽
                </span>
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                  Tâm Trí (Nakshatra)
                </span>
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {reading.moonNakshatraReadingVi}
              </p>
            </div>

            {/* Atmakaraka */}
            <div className="p-3.5 rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/50 dark:border-border-dark/50 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
                  AK
                </span>
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                  Chủ Tinh Linh Hồn (AK)
                </span>
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {reading.atmakarakaReadingVi}
              </p>
            </div>
          </div>

          {/* Active Yogas (Top 2 Highlights) */}
          {reading.activeYogasSummaryVi.length > 0 && (
            <div className="p-3.5 rounded-xl bg-surface-card border border-border-light/60 dark:border-border-dark/60 space-y-2">
              <h4 className="font-semibold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <span className="material-icons-round text-sm">stars</span>
                Thế Trận Cát Tinh Tiêu Biểu
              </h4>
              <div className="space-y-1.5">
                {reading.activeYogasSummaryVi.slice(0, 2).map((y, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed"
                  >
                    • {y}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Active Dasha Summary */}
          {reading.activeDashaReadingVi && (
            <div className="p-3.5 rounded-xl bg-surface-card border border-border-light/60 dark:border-border-dark/60 space-y-1">
              <h4 className="font-semibold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="material-icons-round text-sm">timeline</span>
                Đại Vận Đang Kích Hoạt (Vimshottari Dasha)
              </h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {reading.activeDashaReadingVi}
              </p>
            </div>
          )}

          {/* Actionable Guidance */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
            <span className="font-bold flex items-center gap-1 mb-1">
              <span className="material-icons-round text-sm">tips_and_updates</span>
              Kim Chỉ Nam Vệ Đà
            </span>
            {reading.actionableGuidanceVi}
          </div>
        </div>
      </div>
    );
  }

  // MODE 2: Chuyên Sâu (Advanced Technical & Comprehensive Jyotish Synthesis)
  return (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
      <div className="card-header bg-purple-50/50 dark:bg-purple-900/10 flex items-center justify-between gap-3 border-b border-border-light/40 dark:border-border-dark/40">
        <h3 className="section-title text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold m-0">
          <span className="material-icons-round text-base shrink-0">psychology</span>
          Diễn Giải Toàn Diện (Jyotish Synthesis & Kỹ Thuật)
        </h3>
        <span className="inline-flex items-center justify-center shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-200/60 dark:border-purple-800/60 bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 leading-none">
          Chuyên Sâu (Sidereal Lahiri)
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Lagna Detail */}
        <div className="flex gap-3.5 items-start">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-center leading-none select-none text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-xs border border-emerald-300/40 dark:border-emerald-700/40">
            AS
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
              Tanu Bhava — Lagna (Cung Mọc Vệ Đà & Cốt Cách Nhập Thế)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {reading.lagnaReadingVi}
            </p>
          </div>
        </div>

        {/* Janma Nakshatra Detail */}
        <div className="flex gap-3.5 items-start">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-center leading-none select-none text-indigo-600 dark:text-indigo-400 text-2xl font-bold shadow-xs border border-indigo-300/40 dark:border-indigo-700/40">
            ☽
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
              Chandra Kundali — Janma Nakshatra & Thế Giới Nội Tâm (Manas)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {reading.moonNakshatraReadingVi}
            </p>
          </div>
        </div>

        {/* Atmakaraka Soul Lesson */}
        <div className="flex gap-3.5 items-start">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-center leading-none select-none text-rose-600 dark:text-rose-400 font-bold text-sm shadow-xs border border-rose-300/40 dark:border-rose-700/40">
            AK
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
              Chara Karaka — Atmakaraka (Chủ Tinh Linh Hồn & Bài Học Nghiệp Quả)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {reading.atmakarakaReadingVi}
            </p>
          </div>
        </div>

        {/* Bhava Distribution Matrix */}
        {reading.bhavaMatrixReadingVi && (
          <div className="p-4 rounded-2xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/60 dark:border-border-dark/60 space-y-2">
            <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="material-icons-round text-sm">dashboard_customize</span>
              Ma Trận Cấu Trúc Cung Vị (Bhava Distribution Matrix)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {reading.bhavaMatrixReadingVi}
            </p>
          </div>
        )}

        {/* Complete Yogas & Formations */}
        {reading.activeYogasSummaryVi.length > 0 && (
          <div className="p-4 rounded-2xl bg-surface-card border border-border-light/60 dark:border-border-dark/60 space-y-3">
            <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="material-icons-round text-sm">stars</span>
              Toàn Bộ Cát Cách & Hung Cách (Yogas & Formations — {reading.activeYogasSummaryVi.length})
            </h4>
            <div className="space-y-2">
              {reading.activeYogasSummaryVi.map((y, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed"
                >
                  {y}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Dasha & Time Activation */}
        {reading.activeDashaReadingVi && (
          <div className="p-4 rounded-2xl bg-surface-card border border-border-light/60 dark:border-border-dark/60 space-y-2">
            <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="material-icons-round text-sm">timeline</span>
              Thời Vận Kích Hoạt (Vimshottari Dasha Dynamics)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {reading.activeDashaReadingVi}
            </p>
          </div>
        )}

        {/* Actionable Guidance & Remedial Philosophy */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium space-y-1.5">
          <span className="font-bold flex items-center gap-1.5 text-sm text-purple-800 dark:text-purple-300">
            <span className="material-icons-round text-base">tips_and_updates</span>
            Kim Chỉ Nam & Pháp Tu Tập Vệ Đà (Jyotish Remedial Guidance)
          </span>
          <p>{reading.actionableGuidanceVi}</p>
        </div>
      </div>
    </div>
  );
};
