/**
 * Executive Snapshot Cards Component ("Bản Mệnh Trong 30 Giây") — Lịch Việt v3
 *
 * Renders 3 executive cards summarizing the native's core superpower, psychological knot,
 * and 2026 actionable guidance with interactive micro-animations and 9:16 story export trigger.
 */

import React from 'react';

interface ExecutiveSnapshotCardsProps {
  name: string;
  superpowerTitle: string;
  superpowerDesc: string;
  knotTitle: string;
  knotDesc: string;
  year2026CompassTitle: string;
  year2026CompassDesc: string;
  onOpenStoryExport?: () => void;
}

export const ExecutiveSnapshotCards: React.FC<ExecutiveSnapshotCardsProps> = ({
  name,
  superpowerTitle,
  superpowerDesc,
  knotTitle,
  knotDesc,
  year2026CompassTitle,
  year2026CompassDesc,
  onOpenStoryExport,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-light/70 dark:border-border-dark/70 bg-gradient-to-br from-surface-card via-surface-container-low to-surface-card p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header with name and story button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light/40 dark:border-border-dark/40 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-amber-500 text-lg">auto_awesome</span>
            <h3 className="text-base sm:text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              Bản Mệnh Trong 30 Giây
            </h3>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-light dark:text-gold-dark uppercase tracking-wider">
              {name}
            </span>
          </div>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Tóm lược bản sắc cốt lõi và kim chỉ nam hành động
          </p>
        </div>

        {onOpenStoryExport && (
          <button
            type="button"
            onClick={onOpenStoryExport}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-gold/20 hover:from-amber-500/30 hover:to-gold/30 border border-gold/30 px-3 py-1.5 text-xs font-bold text-gold-light dark:text-gold-dark transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
          >
            <span className="material-icons-round text-sm">share</span>
            Xuất Thẻ Bài Story 9:16
          </button>
        )}
      </div>

      {/* 3 Executive Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* 1. Superpower Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/[0.03] p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <span className="material-icons-round text-base">military_tech</span>
            Siêu Năng Lực
          </div>
          <h4 className="mt-2 text-sm font-bold text-text-primary-light dark:text-text-primary-dark leading-snug">
            {superpowerTitle}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {superpowerDesc}
          </p>
        </div>

        {/* 2. Psychological Knot Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/[0.03] p-4 transition-all duration-300 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
            <span className="material-icons-round text-base">bolt</span>
            Nút Thắt Tâm Lý
          </div>
          <h4 className="mt-2 text-sm font-bold text-text-primary-light dark:text-text-primary-dark leading-snug">
            {knotTitle}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {knotDesc}
          </p>
        </div>

        {/* 3. 2026 Actionable Compass Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/[0.03] p-4 transition-all duration-300 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs uppercase tracking-wider">
            <span className="material-icons-round text-base">explore</span>
            Kim Chỉ Nam 2026
          </div>
          <h4 className="mt-2 text-sm font-bold text-text-primary-light dark:text-text-primary-dark leading-snug">
            {year2026CompassTitle}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {year2026CompassDesc}
          </p>
        </div>
      </div>

      {/* Micro-Onboarding Chart Exploration Hint */}
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-low/60 px-3 py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark/90 border border-border-light/40 dark:border-border-dark/40 select-none">
        <span className="material-icons-round text-amber-500 text-sm animate-bounce">touch_app</span>
        <span>
          <strong className="text-gold-light dark:text-gold-dark">Mẹo tương tác:</strong> Chạm vào bất kỳ Cung hoặc Ngôi sao nào trên biểu đồ phía dưới để mở ngăn kéo luận giải chuyên sâu đa tầng.
        </span>
      </div>
    </section>
  );
};
