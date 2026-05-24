// ── SummaryCard.tsx ───────────────────────────────────────────
// Epic 5 (US_MH_12): Apple-styled summary card for the divination
// conclusion. Now includes temporal context (from former ResultHeader).

import React from 'react';
import type { DivineReadingSummary, DivinationContext } from '../../types/maiHoa';

// ── Types ──────────────────────────────────────────────────────

interface SummaryCardProps {
  /** The fully computed reading summary from the interpretation engine. */
  readonly summary: DivineReadingSummary;
  /** Which position is Thể (upper or lower), for display labeling. */
  readonly theLabel: string;
  /** Which position is Dụng, for display labeling. */
  readonly dungLabel: string;
  /** The moving line position (1–6). */
  readonly movingLine: number;
  /** Divination context with temporal data (merged from ResultHeader). */
  readonly context?: DivinationContext;
}

// ── Verdict styling map ────────────────────────────────────────

interface VerdictStyle {
  readonly text: string;
  readonly icon: string;
  readonly bannerClass: string;
  readonly iconClass: string;
  readonly textClass: string;
}

const VERDICT_STYLE_MAP: Readonly<Record<'Cát' | 'Hung' | 'Bình', VerdictStyle>> = {
  Cát: {
    text: 'Tốt lành',
    icon: 'check_circle',
    bannerClass: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  Hung: {
    text: 'Bất lợi',
    icon: 'cancel',
    bannerClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    textClass: 'text-red-700 dark:text-red-300',
  },
  Bình: {
    text: 'Trung bình',
    icon: 'remove_circle',
    bannerClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
};

// ── Helper sub-components ──────────────────────────────────────

/** A labeled detail row with icon, heading, and description. */
function DetailRow({
  icon,
  heading,
  children,
}: {
  readonly icon: string;
  readonly heading: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex items-start gap-3">
      <span className="material-icons-round text-base text-text-secondary-light dark:text-text-secondary-dark mt-0.5 shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
          {heading}
        </span>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/** Compact info chip for temporal context data. */
function InfoChip({
  label,
  value,
  valueClass,
}: {
  readonly label: string;
  readonly value: string;
  readonly valueClass?: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">{label}</span>
      <span className={`font-bold ${valueClass ?? 'text-text-primary-light dark:text-text-primary-dark'}`}>
        {value}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

/**
 * Apple-styled summary card for the divination conclusion.
 * Includes temporal context (Can Chi, Nhật Thần, Nguyệt Lệnh).
 */
export default function SummaryCard({
  summary,
  theLabel,
  dungLabel,
  movingLine,
  context,
}: SummaryCardProps): React.ReactElement {
  const verdict = VERDICT_STYLE_MAP[summary.overallVerdict];

  return (
    <div className="space-y-3 animate-fade-in-up animate-delay-2">
      {/* ── Verdict Banner ─────────────────────────────── */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${verdict.bannerClass}`}
      >
        <span className={`material-icons-round text-3xl ${verdict.iconClass}`}>{verdict.icon}</span>
        <div className="min-w-0 flex-1">
          <span className={`text-lg font-bold ${verdict.textClass}`}>{verdict.text}</span>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 leading-snug">
            {summary.theDungAssessment.relationship}
          </p>
        </div>
        {/* Moving line badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 shrink-0">
          <span className="material-icons-round text-accent-moving dark:text-accent-moving-dark text-sm">
            radio_button_checked
          </span>
          <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
            Hào {movingLine}
          </span>
        </div>
      </div>

      {/* ── Prophecy (Lời Triệu) ────────────────────────── */}
      {summary.prophecy && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-900/15 border border-amber-200/50 dark:border-amber-700/30">
          <span className="material-icons-round text-sm text-accent-moving dark:text-accent-moving-dark shrink-0">
            auto_awesome
          </span>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 italic">{summary.prophecy}</p>
        </div>
      )}

      {/* ── Details Card ───────────────────────────────── */}
      <div className="card-surface animate-fade-in-up animate-delay-3">
        {/* ── Temporal Context Bar (merged from ResultHeader) ─── */}
        {context && (
          <div className="px-4 sm:px-5 py-3 border-b border-border-light/50 dark:border-border-dark/50 bg-surface-subtle-light dark:bg-surface-subtle-dark">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <InfoChip label="Giờ" value={context.canChi.hour} />
              <InfoChip label="Ngày" value={context.canChi.day} />
              <InfoChip label="Tháng" value={context.canChi.month} />
              <InfoChip label="Năm" value={context.canChi.year} />
              <span className="hidden sm:block w-px h-3 bg-border-light/60 dark:bg-border-dark/60" />
              <InfoChip label="Nhật Thần" value={context.nhatThan} valueClass="text-amber-600 dark:text-amber-400" />
              <InfoChip label="Nguyệt Lệnh" value={context.nguyetLenh} valueClass="text-blue-600 dark:text-blue-400" />
            </div>
            {context.query && (
              <div className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Việc xem:{' '}
                <span className="font-semibold text-text-primary-light dark:text-text-primary-dark italic">
                  "{context.query}"
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          {/* ── Thể / Dụng Element Badges ─────────── */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500 dark:text-blue-400 block mb-0.5">
                Thể ({theLabel})
              </span>
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                {summary.elementBreakdown.theElement}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 dark:text-orange-400 block mb-0.5">
                Dụng ({dungLabel})
              </span>
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                {summary.elementBreakdown.dungElement}
              </span>
            </div>
          </div>

          {/* ── Detail Rows ───────────────────────── */}
          <div className="space-y-3">
            <DetailRow icon="sync_alt" heading="Quan hệ Ngũ Hành">
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {summary.theDungAssessment.meaning}
              </p>
            </DetailRow>

            <DetailRow icon="wb_twilight" heading="Ảnh hưởng thời gian">
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {summary.temporalInfluence.description}
              </p>
            </DetailRow>

            <DetailRow icon="menu_book" heading="Ý nghĩa quẻ">
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
                {summary.hexagramMeaning.name}
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                {summary.hexagramMeaning.image}
              </p>
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark mt-1">
                {summary.hexagramMeaning.meaning}
              </p>
            </DetailRow>
          </div>

          {/* ── Key Category Predictions (inline) ──── */}
          {summary.categoryPredictions && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {summary.categoryPredictions.taiLoc && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/15 border border-emerald-100/50 dark:border-emerald-800/30">
                  <span className="material-icons-round text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">
                    payments
                  </span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600/80 dark:text-emerald-400/80 block">
                      Tài lộc
                    </span>
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark">
                      {summary.categoryPredictions.taiLoc}
                    </span>
                  </div>
                </div>
              )}
              {summary.categoryPredictions.suNghiep && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-900/15 border border-blue-100/50 dark:border-blue-800/30">
                  <span className="material-icons-round text-xs text-blue-500 dark:text-blue-400 mt-0.5">work</span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600/80 dark:text-blue-400/80 block">
                      Sự nghiệp
                    </span>
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark">
                      {summary.categoryPredictions.suNghiep}
                    </span>
                  </div>
                </div>
              )}
              {summary.categoryPredictions.tinhYeu && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-pink-50/50 dark:bg-pink-900/15 border border-pink-100/50 dark:border-pink-800/30">
                  <span className="material-icons-round text-xs text-pink-500 dark:text-pink-400 mt-0.5">favorite</span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-pink-600/80 dark:text-pink-400/80 block">
                      Tình yêu
                    </span>
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark">
                      {summary.categoryPredictions.tinhYeu}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Full Explanation ────────────────────── */}
          <div className="bg-gray-50/80 dark:bg-white/5 rounded-xl p-4 border border-border-light/30 dark:border-border-dark/30">
            <span className="label-standard block mb-2">Tổng kết</span>
            <p className="text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed whitespace-pre-line">
              {summary.detailedExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
