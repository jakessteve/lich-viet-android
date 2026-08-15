import React from 'react';
import type { AspectPattern } from '@/services/astrology/aspectPatterns';

export const AspectPatternsCard: React.FC<{ patterns: AspectPattern[] }> = ({ patterns }) => {
  if (patterns.length === 0) return null;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border-light/50 pb-3 dark:border-border-dark/50">
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <span className="material-icons-round text-base text-amber-500">stars</span>
            Mô Hình Góc Chiếu Đặc Biệt & Luận Giải Cá Nhân Hóa
          </h4>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Cấu trúc hình học hành tinh gắn liền với hệ thống Cung Địa Bàn (Nhà) và điểm hóa giải năng lượng
          </p>
        </div>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0">
          {patterns.length} mô hình
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="rounded-xl border border-border-light/50 bg-surface-container-lowest/70 p-3.5 dark:border-border-dark/50 dark:bg-surface-container-lowest/40 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                    {pattern.nameVi}
                  </h5>
                  <span className="text-micro text-text-secondary-light/80 dark:text-text-secondary-dark/80 italic">
                    {pattern.nameEn}
                  </span>
                </div>
                {pattern.elementOrModality && (
                  <span className="shrink-0 rounded-md bg-indigo-500/10 px-2 py-0.5 text-micro font-semibold text-indigo-700 dark:text-indigo-300">
                    {pattern.elementOrModality}
                  </span>
                )}
              </div>

              {/* Activated houses */}
              {pattern.lifeAreasVi && pattern.lifeAreasVi.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-micro font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Trục kích hoạt:
                  </span>
                  {pattern.lifeAreasVi.map((area, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-sky-500/10 px-1.5 py-0.5 text-micro font-medium text-sky-700 dark:text-sky-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              {/* Personalized 3-layer synthesis */}
              {pattern.personalizedSynthesis ? (
                <div className="space-y-1.5 pt-1 text-xs leading-relaxed">
                  <div className="rounded-lg bg-surface-container-low/60 p-2 space-y-1 border border-border-light/30 dark:border-border-dark/30">
                    <p className="text-text-primary-light dark:text-text-primary-dark font-medium">
                      <span className="text-amber-600 dark:text-amber-400 font-bold mr-1">✦ Thiên phú:</span>
                      {pattern.personalizedSynthesis.uniqueGiftVi}
                    </p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                      <span className="text-rose-600 dark:text-rose-400 font-bold mr-1">⚠ Thách thức:</span>
                      {pattern.personalizedSynthesis.coreChallengeVi}
                    </p>
                  </div>

                  {pattern.resolutionPoint && (
                    <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
                      <span className="font-bold flex items-center gap-1 mb-0.5">
                        <span className="material-icons-round text-xs">tune</span>
                        Điểm hóa giải (Resolution Point):
                        {pattern.resolutionPoint.oppositeHouse && (
                          <span className="underline ml-0.5">Nhà {pattern.resolutionPoint.oppositeHouse} ({pattern.resolutionPoint.oppositeSignVi})</span>
                        )}
                      </span>
                      <p>{pattern.resolutionPoint.adviceVi}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
                  {pattern.descriptionVi}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/40 flex flex-wrap items-center gap-1.5">
              <span className="text-micro font-semibold text-text-secondary-light/80 dark:text-text-secondary-dark/80">Hành tinh:</span>
              {pattern.planets.map((p) => (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-micro font-medium ${
                    pattern.apexPlanet?.id === p.id
                      ? 'bg-rose-500/15 text-rose-700 font-bold dark:text-rose-300 border border-rose-500/30'
                      : 'bg-surface-container text-text-primary-light dark:text-text-primary-dark'
                  }`}
                >
                  <span>{p.symbol}</span>
                  <span>{p.nameVi}</span>
                  {p.house && <span className="text-micro text-text-secondary-light/70 dark:text-text-secondary-dark/70">(N{p.house})</span>}
                  {pattern.apexPlanet?.id === p.id && <span className="text-micro text-rose-600 dark:text-rose-400 font-bold">(Đỉnh)</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

