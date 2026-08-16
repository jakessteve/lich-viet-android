import React, { useState, useMemo } from 'react';
import type { SwissNatalChartResult } from '../../../services/astrology/swissNatalChart';
import {
  generateZodiacalReleasingReport,
  type ZodiacalPeriod,
} from '../../../services/astrology/zodiacalReleasingService';

interface ZodiacalReleasingViewProps {
  natalResult: SwissNatalChartResult;
  birthDate: Date;
}

export const ZodiacalReleasingView: React.FC<ZodiacalReleasingViewProps> = ({ natalResult, birthDate }) => {
  const [sourceLot, setSourceLot] = useState<'spirit' | 'fortune'>('spirit');
  const [expandedL1Index, setExpandedL1Index] = useState<number | null>(0);

  const report = useMemo(() => {
    return generateZodiacalReleasingReport(natalResult, birthDate);
  }, [natalResult, birthDate]);

  const periods = sourceLot === 'spirit' ? report.releasingFromSpirit : report.releasingFromFortune;

  return (
    <div className="space-y-6">
      {/* Header & Source Lot Picker */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light dark:border-border-dark/40 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-astral-primary dark:text-astral-primary-dark">timeline</span>
              Chu Kỳ Vận Hạn Hy Lạp (Zodiacal Releasing)
            </h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Hệ thống Chúa Tể Thời Gian (Time-Lords) theo Vettius Valens.
            </p>
          </div>
          <div className="flex bg-surface-container-lowest border border-border-light/40 dark:border-border-dark/40 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSourceLot('spirit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sourceLot === 'spirit'
                  ? 'bg-astral-primary text-white shadow-sm'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              Lot of Spirit (Sự Nghiệp & Danh Vọng)
            </button>
            <button
              type="button"
              onClick={() => setSourceLot('fortune')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sourceLot === 'fortune'
                  ? 'bg-astral-primary text-white shadow-sm'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              Lot of Fortune (Thân Thể & Sức Khỏe)
            </button>
          </div>
        </div>

        <div className="astral-card p-3.5 text-xs">
          <p className="font-bold text-astral-primary dark:text-astral-primary-dark mb-1">
            {sourceLot === 'spirit' ? 'Khởi điểm: Lot of Spirit' : 'Khởi điểm: Lot of Fortune'} tại{' '}
            {sourceLot === 'spirit' ? report.lotOfSpirit.signVi : report.lotOfFortune.signVi} (
            {sourceLot === 'spirit'
              ? Math.floor(report.lotOfSpirit.longitude % 30)
              : Math.floor(report.lotOfFortune.longitude % 30)}
            °)
          </p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {sourceLot === 'spirit'
              ? 'Phân tích các bước ngoặt sự nghiệp, danh tiếng, thăng tiến và dấu ấn cống hiến lớn trong cuộc đời.'
              : 'Phân tích các chu kỳ sinh lực, thay đổi môi trường sống, sự kiện thể chất và tài sản vật chất.'}
          </p>
        </div>

        {/* Periods List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase">
            Cấp Độ 1: Các Đại Vận Thập Niên (Level 1 Decades)
          </h4>

          <div className="space-y-2">
            {periods.map((p, idx) => {
              const isExpanded = expandedL1Index === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all ${
                    p.isPeak
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-border-light dark:border-border-dark/40 bg-surface-subtle-light dark:bg-surface-elevated-dark'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedL1Index(isExpanded ? null : idx)}
                    className="w-full text-left p-3.5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-astral-surface-light dark:bg-astral-surface-dark text-astral-primary dark:text-astral-primary-dark font-bold shrink-0 inline-flex items-center justify-center text-center leading-none select-none text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mr-2">
                          {p.signVi}
                        </span>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {p.startYear} - {p.endYear} (Tuổi {p.startAge} - {p.endAge})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.isPeak && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30">
                          {p.peakType || 'Cung Đỉnh Cao'}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10">
                        {p.durationYears} năm
                      </span>
                      <span className="material-icons-round text-base text-text-secondary-light">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                  </button>

                  {/* Level 2 Sub-periods */}
                  {isExpanded && p.subPeriods && (
                    <div className="p-3.5 border-t border-border-light dark:border-border-dark/40 bg-white/50 dark:bg-black/20 space-y-2">
                      <h5 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                        Tiểu Vận Cấp 2 (Level 2 Sub-Periods):
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {p.subPeriods.map((sub: ZodiacalPeriod, sIdx: number) => (
                          <div
                            key={sIdx}
                            className={`p-2.5 rounded-lg border ${
                              sub.isPeak
                                ? 'border-amber-500/40 bg-amber-500/10'
                                : 'border-border-light dark:border-border-dark/30 bg-surface-subtle-light dark:bg-white/5'
                            } flex justify-between items-center`}
                          >
                            <div>
                              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {sub.signVi}
                              </span>
                              <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark block">
                                {sub.startYear} - {sub.endYear} ({sub.startAge} - {sub.endAge}t)
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-text-secondary-light">{sub.durationMonths} tháng</span>
                              {sub.isLoosingOfHelm && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold">
                                  Bẻ Lái (Loosing of Helm)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
