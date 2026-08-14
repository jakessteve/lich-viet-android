import React from 'react';
import type { AspectPattern } from '@/services/astrology/aspectPatterns';

export const AspectPatternsCard: React.FC<{ patterns: AspectPattern[] }> = ({ patterns }) => {
  if (patterns.length === 0) return null;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-border-light/50 pb-3 dark:border-border-dark/50">
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <span className="material-icons-round text-base text-amber-500">stars</span>
            Mô Hình Góc Chiếu Đặc Biệt
          </h4>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Các cấu trúc hình học hành tinh tạo nên năng lực vượt trội hoặc thử thách lớn
          </p>
        </div>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
          {patterns.length} mô hình
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="rounded-xl border border-border-light/50 bg-surface-container-lowest/70 p-3 dark:border-border-dark/50 dark:bg-surface-container-lowest/40 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h5 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                  {pattern.nameVi}
                </h5>
                {pattern.elementOrModality && (
                  <span className="shrink-0 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                    {pattern.elementOrModality}
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
                {pattern.descriptionVi}
              </p>
            </div>

            <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/40 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-text-secondary-light/80 dark:text-text-secondary-dark/80">Hành tinh:</span>
              {pattern.planets.map((p) => (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                    pattern.apexPlanet?.id === p.id
                      ? 'bg-rose-500/15 text-rose-700 font-bold dark:text-rose-300 border border-rose-500/30'
                      : 'bg-surface-container text-text-primary-light dark:text-text-primary-dark'
                  }`}
                >
                  <span>{p.symbol}</span>
                  <span>{p.nameVi}</span>
                  {pattern.apexPlanet?.id === p.id && <span className="text-[9px] text-rose-600 dark:text-rose-400">(Đỉnh)</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
