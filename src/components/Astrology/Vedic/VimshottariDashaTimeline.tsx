import React, { useState } from 'react';
import { TrendingUp, Sliders } from 'lucide-react';
import type { VimshottariDashaResult, DashaPeriod } from '@/services/astrology/vedicDasha';

export const VimshottariDashaTimeline: React.FC<{ dasha: VimshottariDashaResult }> = ({ dasha }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<DashaPeriod | null>(dasha.currentPeriod);

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-light/50 pb-3 dark:border-border-dark/50">
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
            Đại Vận Vimshottari Dasha (Chu Kỳ 120 Năm)
          </h4>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            9 chu kỳ hành tinh chi phối năng lượng và vận hội cuộc đời theo chiêm tinh Vệ Đà
          </p>
        </div>
        {dasha.currentPeriod && (
          <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            Đang ở vận: {dasha.currentPeriod.lordVi}
          </span>
        )}
      </div>

      {/* Interactive Timeline Bar */}
      <div className="space-y-2">
        <div className="flex rounded-xl overflow-hidden h-4 bg-border-light/40 dark:bg-border-dark/40 shadow-inner">
          {dasha.periods.map((p) => (
            <button
              key={p.lord}
              type="button"
              onClick={() => setSelectedPeriod(p)}
              style={{
                width: `${(p.durationYears / 120) * 100}%`,
                backgroundColor: p.color,
              }}
              className={`h-full transition-all relative hover:opacity-100 hover:scale-y-125 focus:outline-none ${
                selectedPeriod?.lord === p.lord ? 'opacity-100 ring-2 ring-white dark:ring-black z-10' : 'opacity-75'
              }`}
              title={`${p.lordVi} (${p.startYear} - ${p.endYear})`}
              aria-label={`${p.lordVi}: ${p.startYear} đến ${p.endYear}`}
            />
          ))}
        </div>

        {/* Timeline Labels Scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {dasha.periods.map((p) => (
            <button
              key={p.lord}
              type="button"
              onClick={() => setSelectedPeriod(p)}
              className={`shrink-0 rounded-xl px-2.5 py-1.5 text-left border transition-all ${
                selectedPeriod?.lord === p.lord
                  ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-900/30 shadow-sm'
                  : p.isCurrent
                    ? 'border-purple-300 dark:border-purple-700 bg-surface-container-lowest/80'
                    : 'border-border-light/40 bg-surface-container-lowest/40 dark:border-border-dark/40 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: p.color }}>
                  {p.symbol}
                </span>
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                  {p.lordVi.split(' ')[0]}
                </span>
                {p.isCurrent && (
                  <span className="rounded bg-purple-500 text-micro font-bold text-white px-1">Hiện tại</span>
                )}
              </div>
              <div className="text-micro text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                {p.startYear} - {p.endYear} ({p.ageRange})
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Period Details */}
      {selectedPeriod && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 dark:bg-purple-900/10 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xl" style={{ color: selectedPeriod.color }}>
                {selectedPeriod.symbol}
              </span>
              <h5 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                Đại Vận {selectedPeriod.lordVi}
              </h5>
              {selectedPeriod.isCurrent && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-micro font-bold text-emerald-700 dark:text-emerald-300">
                  Giai đoạn hiện tại
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              Năm {selectedPeriod.startYear} ➔ {selectedPeriod.endYear} · Thời lượng: {selectedPeriod.durationYears} năm
            </span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {selectedPeriod.descriptionVi}
          </p>

          {/* ── 9 Antardasha (Bhukti) Sub-Periods ─────────────────── */}
          {selectedPeriod.antardashas && selectedPeriod.antardashas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  9 Phân Kỳ Tiểu Vận (Antardasha / Bhukti)
                </span>
                <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                  Tiến trình chi tiết
                </span>
              </div>

              <div className="space-y-2">
                {selectedPeriod.antardashas.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                      sub.isCurrent
                        ? 'border-purple-500 bg-purple-500/15 dark:bg-purple-900/30 shadow-sm ring-1 ring-purple-500'
                        : 'border-border-light/40 bg-surface-container-lowest/60 dark:border-border-dark/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1">
                        <span style={{ color: sub.color }}>{sub.symbol}</span>
                        {sub.subLordVi.split(' ')[0]}
                      </span>
                      {sub.isCurrent && (
                        <span className="rounded bg-purple-500 text-white text-micro font-bold px-1.5 py-0.2">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-between">
                      <span>
                        {sub.startYear} – {sub.endYear}
                      </span>
                      <span>({sub.durationMonths} thg)</span>
                    </div>
                    <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark leading-tight pt-0.5">
                      {sub.descriptionVi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
