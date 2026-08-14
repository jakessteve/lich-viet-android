import React from 'react';
import type { ElementModalityBalanceResult, ZodiacElement, ZodiacModality } from '@/services/astrology/elementBalance';

export const ElementBalanceCard: React.FC<{ balance: ElementModalityBalanceResult }> = ({ balance }) => {
  const elements = Object.values(balance.elements) as Array<{
    key: ZodiacElement;
    nameVi: string;
    nameEn: string;
    color: string;
    points: number;
    percentage: number;
    planets: Array<{ id: string; nameVi: string; symbol: string }>;
    traitsVi: string;
  }>;

  const modalities = Object.values(balance.modalities) as Array<{
    key: ZodiacModality;
    nameVi: string;
    nameEn: string;
    color: string;
    points: number;
    percentage: number;
    planets: Array<{ id: string; nameVi: string; symbol: string }>;
    traitsVi: string;
  }>;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-light/50 pb-3 dark:border-border-dark/50">
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <span className="material-icons-round text-base text-indigo-500">balance</span>
            Cân Bằng Nguyên Tố & Tính Chất
          </h4>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Phân bổ năng lượng tính cách và phong cách phản ứng
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
            Trội: {balance.dominantElementLabelVi}
          </span>
          <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
            {balance.dominantModalityLabelVi}
          </span>
        </div>
      </div>

      {/* Elements Bars */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          <span>4 Nguyên Tố (Elements)</span>
          <span className="text-[10px] lowercase text-text-secondary-light/70 dark:text-text-secondary-dark/70">tỷ lệ %</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {elements.map((elem) => (
            <div key={elem.key} className="rounded-xl bg-surface-container-lowest/60 dark:bg-surface-container-lowest/30 p-2.5 border border-border-light/40 dark:border-border-dark/40 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: elem.color }} />
                  {elem.nameVi}
                </span>
                <span className="text-xs font-semibold" style={{ color: elem.color }}>
                  {elem.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border-light/40 overflow-hidden dark:bg-border-dark/40 mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, elem.percentage)}%`, backgroundColor: elem.color }}
                />
              </div>
              <div className="flex flex-wrap gap-1 min-h-[20px]">
                {elem.planets.map((p) => (
                  <span key={p.id} className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark" title={`${p.nameVi}`}>
                    {p.symbol}
                  </span>
                ))}
                {elem.planets.length === 0 && <span className="text-[10px] text-text-secondary-light/50 italic">trống</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modalities Bars */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          <span>3 Tính Chất (Modalities)</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {modalities.map((mod) => (
            <div key={mod.key} className="rounded-xl bg-surface-container-lowest/60 dark:bg-surface-container-lowest/30 p-2.5 border border-border-light/40 dark:border-border-dark/40">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: mod.color }} />
                  {mod.nameVi}
                </span>
                <span className="text-xs font-semibold" style={{ color: mod.color }}>
                  {mod.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border-light/40 overflow-hidden dark:bg-border-dark/40 mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, mod.percentage)}%`, backgroundColor: mod.color }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {mod.planets.map((p) => (
                  <span key={p.id} className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark" title={`${p.nameVi}`}>
                    {p.symbol}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-indigo-500/5 p-3 text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark border border-indigo-500/10">
        💡 <strong>Tổng quan năng lượng:</strong> {balance.summaryVi}
      </div>
    </div>
  );
};
