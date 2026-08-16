import React, { useMemo } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { synthesizeVedicReading } from '../../../services/astrology/vedicSynthesisEngine';

export const VedicInterpretationPanel: React.FC<{
  result: WesternChartResult;
  mode?: 'simple' | 'advanced';
}> = ({ result, mode = 'simple' }) => {
  const reading = useMemo(() => synthesizeVedicReading(result), [result]);

  return (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
      <div className="card-header bg-purple-50/50 dark:bg-purple-900/10 flex items-center justify-between">
        <h3 className="section-title text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold">
          <span className="material-icons-round text-base">psychology</span>
          {mode === 'advanced'
            ? 'Diễn Giải Toàn Diện (Jyotish Synthesis & Kỹ Thuật)'
            : 'Luận Giải Cốt Cách & Bản Mệnh (Vedic)'}
        </h3>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          {mode === 'advanced' ? 'Chuyên Sâu (Sidereal Lahiri)' : 'Cơ Bản (Sidereal Lahiri)'}
        </span>
      </div>
      <div className="p-4 space-y-4">
        {/* Lagna & Moon Nakshatra */}
        <div className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-center leading-none select-none text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            AS
          </div>
          <div>
            <h4 className="font-semibold text-sm">Lagna (Cung Mọc Vệ Đà)</h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              {reading.lagnaReadingVi}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-center leading-none select-none text-indigo-600 dark:text-indigo-400 text-xl font-bold">
            ☽
          </div>
          <div>
            <h4 className="font-semibold text-sm">Tâm Trí & Janma Nakshatra (Chòm Sao Sinh)</h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              {reading.moonNakshatraReadingVi}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-center leading-none select-none text-rose-600 dark:text-rose-400 font-bold text-sm">
            AK
          </div>
          <div>
            <h4 className="font-semibold text-sm">Atmakaraka (Chủ Tinh Linh Hồn & Nghiệp Lực)</h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              {reading.atmakarakaReadingVi}
            </p>
          </div>
        </div>

        {/* Active Yogas */}
        {reading.activeYogasSummaryVi.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-surface-card border border-border-light/60 dark:border-border-dark/60 space-y-2">
            <h4 className="font-semibold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <span className="material-icons-round text-sm">stars</span>
              {mode === 'advanced'
                ? `Cát Cách & Thế Trận Đặc Biệt (Yogas & Formations - ${reading.activeYogasSummaryVi.length})`
                : 'Thế Trận Nổi Bật'}
            </h4>
            <div className="space-y-1.5">
              {(mode === 'advanced'
                ? reading.activeYogasSummaryVi
                : reading.activeYogasSummaryVi.slice(0, 2)
              ).map((y, idx) => (
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

        {/* Active Dasha & Bhava Matrix (Detailed in Advanced Mode) */}
        {reading.activeDashaReadingVi && (
          <div className="p-3.5 rounded-2xl bg-surface-card border border-border-light/60 dark:border-border-dark/60 space-y-1.5">
            <h4 className="font-semibold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="material-icons-round text-sm">timeline</span>
              {mode === 'advanced'
                ? 'Thời Vận Hiện Tại (Vimshottari Dasha Activation & Bhava Dynamics)'
                : 'Đại Vận Đang Kích Hoạt'}
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {reading.activeDashaReadingVi}
            </p>
            {mode === 'advanced' && (
              <p className="text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark mt-1 border-t border-border-light/30 dark:border-border-dark/30 pt-1.5">
                ✦ {reading.bhavaMatrixReadingVi}
              </p>
            )}
          </div>
        )}

        {/* Actionable Guidance */}
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
          <span className="font-bold flex items-center gap-1 mb-1">
            <span className="material-icons-round text-sm">tips_and_updates</span>
            Kim Chỉ Nam Vệ Đà
          </span>
          {reading.actionableGuidanceVi}
        </div>
      </div>
    </div>
  );
};
