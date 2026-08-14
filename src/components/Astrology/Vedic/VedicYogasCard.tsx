import React from 'react';
import type { VedicYogaDoshaItem } from '@/services/astrology/vedicYogas';

export const VedicYogasCard: React.FC<{ items: VedicYogaDoshaItem[] }> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-border-light/50 pb-3 dark:border-border-dark/50">
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <span className="material-icons-round text-base text-emerald-600 dark:text-emerald-400">spa</span>
            Cách Cục Yogas & Khắc Kỵ Doshas
          </h4>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Các cấu trúc tương tác hành tinh đặc biệt theo triết lý Chiêm tinh Vệ Đà (Jyotish)
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          {items.length} cấu trúc
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const isYoga = item.type === 'yoga';
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 space-y-2 flex flex-col justify-between ${
                isYoga
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/15'
                  : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/15'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h5 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                    {item.nameVi}
                  </h5>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      isYoga
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.categoryVi}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
                  {item.descriptionVi}
                </p>
              </div>

              <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/40 space-y-1.5 text-[10px]">
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-text-secondary-light/80 dark:text-text-secondary-dark/80">Hành tinh:</span>
                  {item.planetsInvolved.map((p) => (
                    <span key={p} className="rounded bg-surface-container px-1.5 py-0.2 font-medium text-text-primary-light dark:text-text-primary-dark">
                      {p}
                    </span>
                  ))}
                </div>
                {item.remedyOrAdviceVi && (
                  <p className="text-text-secondary-light dark:text-text-secondary-dark italic">
                    💡 <strong className="font-medium not-italic text-text-primary-light dark:text-text-primary-dark">Lời khuyên Vệ Đà:</strong> {item.remedyOrAdviceVi}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
