// ── SummaryCard.tsx ───────────────────────────────────────────
// Epic 5 (US_MH_12): Summary card for the divination
// conclusion. Includes temporal context and category predictions.

import React from 'react';
import type { DivineReadingSummary, DivinationContext } from '../../types/maiHoa';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Sparkles,
  BookOpen,
  ArrowLeftRight,
  Sunset,
  Brain,
  DollarSign,
  Briefcase,
  Heart,
  Lightbulb,
  Disc,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  readonly icon: React.ReactElement;
  readonly bannerClass: string;
  readonly textClass: string;
}

const VERDICT_STYLE_MAP: Readonly<Record<'Cát' | 'Hung' | 'Bình', VerdictStyle>> = {
  Cát: {
    text: 'Tốt lành',
    icon: <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    bannerClass: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  Hung: {
    text: 'Bất lợi',
    icon: <XCircle className="h-7 w-7 text-red-600 dark:text-red-400 shrink-0" />,
    bannerClass: 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    textClass: 'text-red-700 dark:text-red-300',
  },
  Bình: {
    text: 'Trung bình',
    icon: <MinusCircle className="h-7 w-7 text-amber-800 dark:text-amber-300 shrink-0" />,
    bannerClass: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-800 dark:text-amber-300',
  },
};

// ── Helper sub-components ──────────────────────────────────────

/** A labeled detail row with icon, heading, and description. */
function DetailRow({
  icon,
  heading,
  children,
}: {
  readonly icon: React.ReactElement;
  readonly heading: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-text-secondary-light dark:text-text-secondary-dark">{icon}</div>
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
      <span className={cn('font-bold', valueClass ?? 'text-text-primary-light dark:text-text-primary-dark')}>
        {value}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function SummaryCard({
  summary,
  theLabel,
  dungLabel,
  movingLine,
  context,
}: SummaryCardProps): React.ReactElement {
  const verdict = VERDICT_STYLE_MAP[summary.overallVerdict as 'Cát' | 'Hung' | 'Bình'] ?? VERDICT_STYLE_MAP.Bình;

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* ── Verdict Banner ─────────────────────────────── */}
      <Card
        className={cn(
          'flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300',
          verdict.bannerClass,
        )}
      >
        {verdict.icon}
        <div className="min-w-0 flex-1">
          <span className={cn('text-lg font-bold', verdict.textClass)}>{verdict.text}</span>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 leading-snug">
            {summary.theDungAssessment.relationship}
          </p>
        </div>
        {/* Moving line badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-light/80 dark:bg-black/30 border border-black/5 dark:border-white/10 shrink-0">
          <Disc className="h-3.5 w-3.5 text-accent-moving dark:text-accent-moving-dark" />
          <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
            Hào {movingLine}
          </span>
        </div>
      </Card>

      {/* ── Prophecy (Lời Triệu) ────────────────────────── */}
      {summary.prophecy && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-700/30">
          <Sparkles className="h-4 w-4 text-accent-moving dark:text-accent-moving-dark shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 italic">{summary.prophecy}</p>
        </div>
      )}

      {/* ── Details Card ───────────────────────────────── */}
      <Card className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden">
        {/* ── Temporal Context Bar (merged from ResultHeader) ─── */}
        {context && (
          <div className="px-4 sm:px-5 py-3 border-b border-border-light/50 dark:border-border-dark/50 bg-surface-subtle-light dark:bg-surface-subtle-dark">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <InfoChip label="Giờ" value={context.canChi.hour} />
              <InfoChip label="Ngày" value={context.canChi.day} />
              <InfoChip label="Tháng" value={context.canChi.month} />
              <InfoChip label="Năm" value={context.canChi.year} />
              <span className="hidden sm:block w-px h-3 bg-border-light/60 dark:border-border-dark/60" />
              <InfoChip label="Nhật Thần" value={context.nhatThan} valueClass="text-amber-800 dark:text-gold-dark" />
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
            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/40">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500 dark:text-blue-400 block mb-0.5">
                Thể ({theLabel})
              </span>
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                {summary.elementBreakdown.theElement}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/40">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 dark:text-orange-400 block mb-0.5">
                Dụng ({dungLabel})
              </span>
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                {summary.elementBreakdown.dungElement}
              </span>
            </div>
          </div>

          {/* ── Thoán Từ Classical Quote ─── */}
          {summary.thoanTu && (
            <div className="card-quote">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-4 w-4 text-accent-moving dark:text-accent-moving-dark" />
                <span className="label-standard text-accent-moving dark:text-accent-moving-dark">
                  Khẩu Quyết Thoán Từ (Văn Vương)
                </span>
              </div>
              {summary.thoanTu.hanViet && (
                <p className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200 tracking-tight mb-1">
                  &ldquo;{summary.thoanTu.hanViet}&rdquo;
                </p>
              )}
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                <span className="font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Dịch nghĩa:{' '}
                </span>
                {summary.thoanTu.meaning}
              </p>
              {summary.thoanTu.application && (
                <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-700/30">
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    <span className="font-bold">Ứng dụng thực tiễn: </span>
                    {summary.thoanTu.application}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Detail Rows ───────────────────────── */}
          <div className="space-y-3">
            <DetailRow icon={<ArrowLeftRight className="h-4 w-4" />} heading="Quan hệ Ngũ Hành">
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {summary.theDungAssessment.meaning}
              </p>
            </DetailRow>

            <DetailRow icon={<Sunset className="h-4 w-4" />} heading="Ảnh hưởng thời gian">
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {summary.temporalInfluence.description}
              </p>
            </DetailRow>

            <DetailRow icon={<Brain className="h-4 w-4" />} heading="Ý nghĩa quẻ">
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark font-semibold">
                {summary.hexagramMeaning.name}
                {summary.fullChineseName && (
                  <span className="ml-1.5 text-xs opacity-75 font-normal">({summary.fullChineseName})</span>
                )}
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 italic">
                "{summary.hexagramMeaning.image}"
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
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-800/30">
                  <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="label-standard text-emerald-600/80 dark:text-emerald-400/80 block">Tài lộc</span>
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark">
                      {summary.categoryPredictions.taiLoc}
                    </span>
                  </div>
                </div>
              )}
              {summary.categoryPredictions.suNghiep && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-800/30">
                  <Briefcase className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="label-standard text-blue-600/80 dark:text-blue-400/80 block">Sự nghiệp</span>
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark">
                      {summary.categoryPredictions.suNghiep}
                    </span>
                  </div>
                </div>
              )}
              {summary.categoryPredictions.tinhYeu && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/50 dark:border-pink-800/30">
                  <Heart className="h-4 w-4 text-pink-500 dark:text-pink-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="label-standard text-pink-600/80 dark:text-pink-400/80 block">Tình yêu</span>
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark">
                      {summary.categoryPredictions.tinhYeu}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Full Explanation (Formatted with design tokens) ── */}
          <FormattedDetailedExplanation text={summary.detailedExplanation} />
        </div>
      </Card>
    </div>
  );
}

function FormattedDetailedExplanation({ text }: { text: string }): React.ReactElement {
  const sections = React.useMemo(() => {
    if (!text) return [];
    const regex = /【([^】]+)】:?\s*([\s\S]*?)(?=(?:【|$))/g;
    const result: Array<{ title: string; content: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      if (title && content) {
        result.push({ title, content });
      }
    }

    if (result.length === 0) {
      return [{ title: 'Tổng Kết Luận Giải', content: text }];
    }
    return result;
  }, [text]);

  const getSectionTheme = (title: string) => {
    if (title.includes('Thoán Từ') || title.includes('Khẩu Quyết')) {
      return {
        icon: <BookOpen className="h-3.5 w-3.5" />,
        cardClass: 'bg-gold/5 dark:bg-gold-dark/5 border-gold/25 dark:border-gold-dark/25',
        titleClass: 'text-gold dark:text-gold-dark',
      };
    }
    if (title.includes('Tượng Quẻ') || title.includes('Ý Nghĩa')) {
      return {
        icon: <Brain className="h-3.5 w-3.5" />,
        cardClass: 'bg-purple/5 dark:bg-purple-dark/5 border-purple/25 dark:border-purple-dark/25',
        titleClass: 'text-purple dark:text-purple-dark',
      };
    }
    if (title.includes('Thể - Dụng') || title.includes('Thời Vận')) {
      return {
        icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
        cardClass: 'bg-info/5 dark:bg-info-dark/5 border-info/25 dark:border-info-dark/25',
        titleClass: 'text-info dark:text-info-dark',
      };
    }
    return {
      icon: <Lightbulb className="h-3.5 w-3.5" />,
      cardClass: 'bg-good/5 dark:bg-good-dark/5 border-good/25 dark:border-good-dark/25',
      titleClass: 'text-good dark:text-good-dark',
    };
  };

  return (
    <div className="space-y-2.5 pt-1 border-t border-border-light/40 dark:border-border-dark/40">
      <div className="flex items-center gap-1.5 pt-1">
        <BookOpen className="h-4 w-4 text-gold dark:text-gold-dark" />
        <h4 className="label-standard text-text-primary-light dark:text-text-primary-dark font-bold text-xs uppercase tracking-wider">
          Tổng kết luận giải
        </h4>
      </div>
      <div className="space-y-2.5">
        {sections.map((sec, idx) => {
          const theme = getSectionTheme(sec.title);
          return (
            <div key={idx} className={cn('rounded-xl p-3.5 border transition-colors', theme.cardClass)}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className={cn('flex items-center gap-1.5 font-bold text-xs', theme.titleClass)}>
                  {theme.icon}
                  <span>{sec.title}</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed whitespace-pre-line">
                {sec.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
