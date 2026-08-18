import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayDetailsData } from '../types/calendar';
import {
  renderWithItalics,
  formatNapAm,
  formatXungHop,
  getStatusLabel,
} from '../utils/formatHelpers';
import { normalizeDungSuBuckets } from '../utils/dungSuDisplay';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import {
  calculatePersonalDayScore,
  calculatePersonalHourModifier,
  getPersonalDungSu,
} from '../services/personalization';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import CollapsibleCard from './CollapsibleCard';
import {
  Sparkles,
  Smile,
  Frown,
  Meh,
  ArrowRight,
  Clock,
  TrendingUp,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Star,
  ChevronDown,
} from 'lucide-react';
import { Badge } from './shared';
import TermTooltip from './shared/TermTooltip';
import StoryShareModal from './shared/StoryShareModal';

interface DetailedDayViewProps {
  date: Date;
  data: DayDetailsData;
}

const DetailedDayView: React.FC<DetailedDayViewProps> = ({ date, data }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isPersonalized = useAppStore((s) => s.isPersonalized);
  const togglePersonalization = useAppStore((s) => s.togglePersonalization);
  const [sortByScore, setSortByScore] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNghiOpen, setIsNghiOpen] = useState(false);
  const [isKyOpen, setIsKyOpen] = useState(false);
  const [isXungHopOpen, setIsXungHopOpen] = useState(false);

  const computedProfile = useMemo(() => {
    return getUserBirthProfile(user);
  }, [user]);

  const dayChi = data.canChi?.day?.chi;

  // Personal day score
  const personalScore = useMemo(() => {
    if (!isPersonalized || !computedProfile?.birthYear || !dayChi) return null;
    return calculatePersonalDayScore(computedProfile.birthYear, dayChi, computedProfile);
  }, [isPersonalized, computedProfile, dayChi]);

  // Personalized hours with modifier overlay
  const personalizedHours = useMemo(() => {
    if (!isPersonalized || !computedProfile?.birthYear) return data.allHours;
    return data.allHours.map((h) => {
      const hour = { ...h, advancedInfo: [...(h.advancedInfo || [])] };
      const modifier = calculatePersonalHourModifier(
        computedProfile.birthYear,
        computedProfile.birthMonth,
        computedProfile.birthDay,
        h.canChi,
        data.canChi.day,
        date,
        computedProfile,
      );
      if (modifier) {
        hour.score = Math.min(100, Math.max(0, hour.score + modifier.totalModifier));
        modifier.breakdowns.forEach((b) => {
          if (!hour.advancedInfo!.some((info) => info.includes(b))) {
            hour.advancedInfo!.push(`Cá nhân: ${b}`);
          }
        });
      }
      return hour;
    });
  }, [isPersonalized, data.allHours, data.canChi.day, date, computedProfile]);

  // Personalized Dụng Sự
  const personalDungSu = useMemo(() => {
    if (!isPersonalized || !computedProfile?.birthYear || !data.canChi?.day?.chi || !data.dungSu?.suitable) return null;
    return getPersonalDungSu(computedProfile.birthYear, data.canChi.day.chi, data.dungSu.suitable, computedProfile);
  }, [isPersonalized, computedProfile, data.canChi.day.chi, data.dungSu.suitable]);

  const sortedHours = useMemo(() => {
    if (!sortByScore) return personalizedHours;
    return [...personalizedHours].sort((a, b) => b.score - a.score);
  }, [personalizedHours, sortByScore]);

  // Identify top 3 best hours for visual highlighting
  const topHourIndices = useMemo(() => {
    const sorted = [...personalizedHours].map((h, i) => ({ score: h.score, idx: i })).sort((a, b) => b.score - a.score);
    return new Set(sorted.slice(0, 3).map((h) => h.idx));
  }, [personalizedHours]);

  const top3HoursList = useMemo(() => {
    const sorted = [...personalizedHours].sort((a, b) => b.score - a.score);
    return sorted.slice(0, 3).map((h) => `${h.timeRange.replace(/:00/g, '')} (${h.canChi.chi})`);
  }, [personalizedHours]);

  const solarDateStr = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const dayOfWeekAbbr = data.dayOfWeek === 'Chủ Nhật' ? 'Chủ Nhật' : `Thứ ${date.getDay() + 1}`;

  // Helper to deduplicate and clean bracket descriptions
  const formatDungSu = (items: string[], focusWord: string) => {
    if (!items || items.length === 0) return { focus: false, rest: [] };
    const cleanedItems = items.map((item) => item.split(' (')[0].trim());
    const uniqueItems = Array.from(new Set(cleanedItems));
    const hasFocus = uniqueItems.includes(focusWord);
    const rest = uniqueItems.filter((item) => item !== focusWord);
    return { focus: hasFocus, rest };
  };

  const normalizedDungSu = useMemo(
    () => normalizeDungSuBuckets(data.dungSu.suitable, data.dungSu.unsuitable),
    [data.dungSu.suitable, data.dungSu.unsuitable],
  );

  const formattedNghi = useMemo(() => formatDungSu(normalizedDungSu.nghi, 'Tốt mọi việc'), [normalizedDungSu.nghi]);
  const formattedKy = useMemo(() => formatDungSu(normalizedDungSu.ky, 'Xấu mọi việc'), [normalizedDungSu.ky]);

  const getSignedModifierTotalBySign = (breakdowns: string[], sign: '+' | '-'): number | null => {
    if (breakdowns.length === 0) return null;

    const total = breakdowns.reduce((sum, entry) => {
      const match = entry.match(/\(([+-]\d+)%\)/);
      if (!match || !match[1].startsWith(sign)) return sum;
      return sum + Number(match[1]);
    }, 0);

    return Number.isFinite(total) ? total : null;
  };

  const getBreakdownToneClass = (text: string): string => {
    if (/\(\+\d+%\)/.test(text)) {
      return 'text-good dark:text-good-dark';
    }
    if (/\(-\d+%\)/.test(text)) {
      return 'text-bad dark:text-bad-dark';
    }
    return 'text-text-secondary-light dark:text-text-secondary-dark';
  };

  const renderTextWithPercents = (text: string) => {
    const percentPattern = /\((\d+)%\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = percentPattern.exec(text)) !== null) {
      const [matchedText, percentValue] = match;
      const start = match.index;

      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }

      parts.push(
        <span
          key={`${start}-${matchedText}`}
          className={Number(percentValue) >= 50 ? 'text-good dark:text-good-dark font-medium' : 'text-bad dark:text-bad-dark font-medium'}
        >
          {matchedText}
        </span>,
      );

      lastIndex = start + matchedText.length;
    }

    if (parts.length === 0) return text;
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const renderTextListWithPercents = (items: string[] | undefined, emptyText: string) => {
    if (!items || items.length === 0) {
      return <span>{emptyText}</span>;
    }

    return (
      <>
        {items.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            {index > 0 && ', '}
            {renderTextWithPercents(item)}
          </React.Fragment>
        ))}
      </>
    );
  };

  const renderNormalizedDungSu = (nghi: string[] = [], ky: string[] = []) => {
    const normalized = normalizeDungSuBuckets(nghi, ky);
    return {
      nghi: renderTextListWithPercents(normalized.nghi, 'không có việc gì tốt'),
      ky: renderTextListWithPercents(normalized.ky, 'không có việc gì kỵ đặc biệt'),
    };
  };

  const dayVerdict = useMemo(() => {
    if (formattedNghi.focus) return 'Ngày đại cát · Tốt cho mọi việc khởi sự';
    if (formattedKy.focus) return 'Ngày đại hung · Nên giữ tĩnh, kiêng việc lớn';
    if (formattedNghi.rest.length > 0) return `Vượng khí · Thuận cho ${formattedNghi.rest.slice(0, 2).join(', ')}`;
    return 'Ngày bình hòa · Khởi sự cần cẩn trọng đúng giờ hoàng đạo';
  }, [formattedNghi, formattedKy]);

  return (
    <div className="w-full space-y-4 animate-fade-scale" data-testid="detailed-day-view">
      {/* ── 1. Hero 3-Second Actionable Advice Card ────────────────────────── */}
      <div
        id="tour-day-summary"
        className="rounded-3xl bg-gradient-to-br from-surface-light via-amber-50/40 to-gold/5 dark:from-surface-dark dark:via-[#141426] dark:to-gold-dark/10 border border-gold/20 dark:border-gold-dark/20 p-4 sm:p-5 shadow-sm space-y-3.5 relative overflow-hidden"
      >
        {/* Date & Verdict */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold/15 text-amber-950 dark:text-gold-dark font-sans">
              {dayOfWeekAbbr} · {solarDateStr}
            </span>
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
              Âm lịch: Ngày {data.lunarDate?.day}/{data.lunarDate?.month} ({data.canChi?.day?.can} {data.canChi?.day?.chi})
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold dark:text-gold-dark shrink-0" />
            <span>{dayVerdict}</span>
          </h3>
        </div>

        {/* Golden Hours Top Pills */}
        <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/30 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
            Khung giờ vàng:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {top3HoursList.map((h, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark font-semibold text-text-primary-light dark:text-text-primary-dark border border-border-light/60 dark:border-border-dark/60 text-[11px]"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Action Bar: Cá nhân hóa (left full width) & Share (round button on right) */}
        <div className="pt-3 border-t border-border-light/40 dark:border-border-dark/30 flex items-center gap-2 w-full">
          {computedProfile?.birthYear ? (
            <button
              onClick={togglePersonalization}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all spring-press cursor-pointer ${
                isPersonalized
                  ? 'bg-purple/15 text-purple dark:text-purple-dark border border-purple/30 shadow-xs'
                  : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low'
              }`}
              title={isPersonalized ? 'Tắt cá nhân hoá' : 'Bật cá nhân hoá theo tuổi'}
            >
              <span className="indicator-pip-sm bg-purple animate-glow-breathe" aria-hidden="true" />
              <span>{isPersonalized ? 'Đã cá nhân hóa' : 'Cá nhân hóa'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/app/cai-dat')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low transition-colors spring-press cursor-pointer"
              title="Cập nhật ngày sinh trong Cài đặt để cá nhân hoá"
            >
              <span className="indicator-pip-sm bg-text-secondary-light/40" aria-hidden="true" />
              <span>Cá nhân hóa</span>
            </button>
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark/40 hover:bg-gold/15 hover:border-gold/40 transition-all shrink-0 spring-press cursor-pointer shadow-2xs"
            title="Tạo ảnh chia sẻ Story 9:16 hoặc Vuông 1:1"
            aria-label="Chia sẻ ngày này"
          >
            <Share2 className="w-4 h-4 text-gold dark:text-gold-dark" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <StoryShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${data.canChi?.day?.can} ${data.canChi?.day?.chi}`}
        solarDateStr={solarDateStr}
        lunarDateStr={`Ngày ${data.lunarDate?.day}/${data.lunarDate?.month}`}
        verdict={dayVerdict}
        goodHours={top3HoursList}
      />

      {/* ── 2. Collapsible Grid: Nghi & Ky ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Việc Nên Làm (Nghi) */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/15 p-4 space-y-2.5 flex flex-col justify-between overflow-hidden">
          <button
            type="button"
            onClick={() => setIsNghiOpen(!isNghiOpen)}
            className="w-full flex items-center justify-between text-left interactive-press rounded-xl"
            aria-expanded={isNghiOpen}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Việc Nên Làm (Nghi)
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {formattedNghi.focus ? (
                <Badge variant="good" pip={true}>
                  Tốt Mọi Việc
                </Badge>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {formattedNghi.rest.length} việc
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 shrink-0 ${
                  isNghiOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-250 ease-out ${
              isNghiOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formattedNghi.rest.length > 0 ? (
                  formattedNghi.rest.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-light dark:bg-surface-elevated-dark text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 shadow-2xs"
                    >
                      {item}
                    </span>
                  ))
                ) : !formattedNghi.focus ? (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
                    Không có việc nghi đặc biệt hôm nay
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Việc Cần Kiêng (Kỵ) */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/15 p-4 space-y-2.5 flex flex-col justify-between overflow-hidden">
          <button
            type="button"
            onClick={() => setIsKyOpen(!isKyOpen)}
            className="w-full flex items-center justify-between text-left interactive-press rounded-xl"
            aria-expanded={isKyOpen}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Việc Cần Kiêng (Kỵ)
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {formattedKy.focus ? (
                <Badge variant="bad" pip={true}>
                  Xấu Mọi Việc
                </Badge>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold">
                  {formattedKy.rest.length} việc
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-rose-600 dark:text-rose-400 transition-transform duration-200 shrink-0 ${
                  isKyOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-250 ease-out ${
              isKyOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formattedKy.rest.length > 0 ? (
                  formattedKy.rest.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-light dark:bg-surface-elevated-dark text-rose-800 dark:text-rose-200 border border-rose-500/20 shadow-2xs"
                    >
                      {item}
                    </span>
                  ))
                ) : !formattedKy.focus ? (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
                    Không có việc kỵ đặc biệt hôm nay
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bento Bottom: Trực/Tú & Xung Hợp Collapsible Card ──────────────── */}
      <div className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 bg-surface-light dark:bg-surface-elevated-dark p-4 space-y-3 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsXungHopOpen(!isXungHopOpen)}
          className="w-full flex items-center justify-between text-left interactive-press rounded-xl"
          aria-expanded={isXungHopOpen}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Compass className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
              Trực · Tú & Xung Hợp Chi
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="text-[11px] px-2.5 py-1 rounded-xl bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark font-semibold text-right leading-tight flex flex-col items-end border border-border-light/40 dark:border-border-dark/40 shrink-0">
              <span>Trực {data.modifyingLayer.trucDetail.name}</span>
              <span className="opacity-80 font-medium">Sao {data.modifyingLayer.tuDetail.name}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 shrink-0 ${
                isXungHopOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-250 ease-out ${
            isXungHopOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-light/40 dark:border-border-dark/40">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Trực {data.modifyingLayer.trucDetail.name} · Sao {data.modifyingLayer.tuDetail.name}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {data.modifyingLayer.trucDetail.description}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {formatXungHop(data.canChiXungHop || '')}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Nạp âm: <TermTooltip term="Nạp âm">{formatNapAm(data.napAmInteraction || '')}</TermTooltip>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Personal Score & Dụng Sự (When active) ────────────────────── */}
      {isPersonalized && personalScore && (
        <div
          className={`rounded-2xl border px-5 py-4 page-enter-smooth ${
            personalScore.actionScore >= 2
              ? 'bg-purple/5 dark:bg-purple-dark/5 border-purple/30 dark:border-purple-dark/30'
              : personalScore.actionScore < 0
                ? 'bg-orange/5 dark:bg-orange-dark/5 border-orange/30 dark:border-orange-dark/30'
                : 'bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/60 border-border-light/60 dark:border-border-dark/60'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
            <div className="mt-0.5 shrink-0">
              {personalScore.actionScore >= 2 ? (
                <Smile className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              ) : personalScore.actionScore < 0 ? (
                <Frown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              ) : (
                <Meh className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
              )}
            </div>
            <div className="text-sm leading-relaxed flex-1">
              <div className="font-bold text-text-primary-light dark:text-text-primary-dark">
                Điểm cá nhân hoá:{' '}
                <span
                  className={
                    personalScore.actionScore >= 2
                      ? 'text-purple dark:text-purple-dark'
                      : personalScore.actionScore < 0
                        ? 'text-orange dark:text-orange-dark'
                        : 'text-text-primary-light dark:text-text-primary-dark'
                  }
                >
                  {personalScore.label}
                </span>
              </div>
              <div className="text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                {personalScore.description}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {personalScore.isTamHop && <Badge variant="purple">Tam Hợp</Badge>}
                {personalScore.isLucHop && <Badge variant="purple">Lục Hợp</Badge>}
                {personalScore.isThaiTue && <Badge variant="gold">Trị Thái Tuế</Badge>}
                {personalScore.isTuongXung && <Badge variant="orange">Lục Xung</Badge>}
                {personalScore.isTuongHai && <Badge variant="orange">Lục Hại</Badge>}
                {personalScore.isTuongHinh && <Badge variant="bad">Tương Hình</Badge>}
                {personalScore.isTuongPha && <Badge variant="bad">Tương Phá</Badge>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Dụng Sự */}
      {isPersonalized && personalDungSu && (
        <CollapsibleCard title="Dụng sự theo tuổi của bạn" defaultOpen={false} collapseOnMobile={true}>
          <div className="divide-y divide-border-light dark:divide-border-dark text-sm px-4 sm:px-6 py-3">
            {personalDungSu.recommended.length > 0 && (
              <div className="py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple dark:text-purple-dark mb-1.5">
                  Nên làm
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {personalDungSu.recommended.map((act, i) => (
                    <Badge key={i} variant="purple" className="cursor-help">
                      {act.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {personalDungSu.regular.length > 0 && (
              <div className="py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
                  Bình thường
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {personalDungSu.regular.map((act, i) => (
                    <Badge key={i} variant="neutral">
                      {act.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {personalDungSu.warned.length > 0 && (
              <div className="py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-orange dark:text-orange-dark mb-1.5">
                  Cẩn thận
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {personalDungSu.warned.map((act, i) => (
                    <Badge key={i} variant="orange" className="cursor-help">
                      {act.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-border-light dark:border-border-dark text-right">
            <button
              onClick={() => {
                const d = new Date(date);
                const startStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const end = new Date(date);
                end.setDate(end.getDate() + 7);
                const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
                navigate(`/app/ngay-tot?start=${startStr}&end=${endStr}`);
              }}
              className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Tìm ngày tốt quanh ngày này
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CollapsibleCard>
      )}

      {/* ── 5. Giờ Tốt & Xấu Trong Ngày (Always Shown) ─────────────────── */}
      <CollapsibleCard
        title="Giờ tốt và xấu trong ngày"
        defaultOpen={true}
        collapseOnMobile={false}
        headerRight={
          <button
            onClick={() => setSortByScore((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low transition-[background-color,color,transform] duration-150 spring-press motion-gpu cursor-pointer"
          >
            {sortByScore ? <Clock className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {sortByScore ? 'Theo giờ' : 'Giờ tốt trước'}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse border-0">
            <thead className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/50 tracking-wider border-b border-border-light/40 dark:border-border-dark/30">
              <tr>
                <th className="hidden sm:table-cell px-6 py-3 w-24 border-0" scope="col">
                  Khung Giờ
                </th>
                <th className="px-3 sm:px-6 py-3 w-[90px] sm:w-32 text-center border-0" scope="col">
                  Can Chi
                </th>
                <th className="px-3 sm:px-6 py-3 border-0" scope="col">
                  Nghi / Kỵ
                </th>
                <th className="px-3 sm:px-6 py-3 text-right w-[70px] sm:w-28 align-middle border-0" scope="col">
                  Điểm Số
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/40 dark:divide-border-dark/30 border-0">
              {sortedHours.map((h, idx) => {
                const advanced = h.advancedInfo || [];
                const statusIndex = advanced.findIndex((s) => s.startsWith('Trạng thái:'));
                let statusInfo = '';
                if (statusIndex !== -1) {
                  statusInfo = advanced[statusIndex].replace('Trạng thái:', '').trim();
                }

                const personalBreakdowns = advanced.filter((s) => s.startsWith('Cá nhân:'));
                const positiveBreakdowns = personalBreakdowns.filter(
                  (s) => s.includes('Tương hợp') && /\(\+\d+%\)/.test(s),
                );
                const negativeBreakdowns = personalBreakdowns.filter(
                  (s) => s.includes('Tương khắc') && /\(-\d+%\)/.test(s),
                );

                const statusLabel = getStatusLabel(statusInfo);
                const isHoangDao = statusLabel === 'HOÀNG ĐẠO';

                const originalIndex = personalizedHours.findIndex((orig) => orig.timeRange === h.timeRange);
                const isTop3 = topHourIndices.has(originalIndex);

                const currentScore = h.score;
                const isWeak = currentScore < 40;
                const isAuspiciousCurrent = currentScore >= 60;
                const positiveModifierTotal = getSignedModifierTotalBySign(personalBreakdowns, '+');
                const negativeModifierTotal = getSignedModifierTotalBySign(personalBreakdowns, '-');
                const scoreToneClass =
                  currentScore >= 50 ? 'text-good dark:text-good-dark' : 'text-bad dark:text-bad-dark';
                const normalizedHourDungSu = renderNormalizedDungSu(h.nghi, h.ky);

                return (
                  <tr
                    key={idx}
                    className={`transition-colors border-0 ${
                      isTop3
                        ? 'bg-gold/10 dark:bg-gold-dark/10 hover:bg-gold/15'
                        : isWeak
                          ? 'opacity-60 hover:opacity-100 hover:bg-surface-subtle-light dark:hover:bg-white/5'
                          : isAuspiciousCurrent
                            ? 'bg-info/5 dark:bg-info-dark/5 hover:bg-surface-subtle-light dark:hover:bg-white/5'
                            : 'hover:bg-surface-subtle-light dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="hidden sm:table-cell px-6 py-4 font-medium whitespace-nowrap align-top border-0">
                      {h.timeRange.replace(/:00/g, '').replace(' - ', '–')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center align-top border-0">
                      <div className="sm:hidden text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium">
                        {h.timeRange.replace(/:00/g, '').replace(' - ', '–')}
                      </div>
                      <div
                        className={`font-bold text-sm sm:text-base mt-0.5 ${
                          h.isAuspicious ? 'text-good dark:text-good-dark' : 'text-text-primary-light dark:text-text-primary-dark'
                        }`}
                      >
                        {h.canChi.can} {h.canChi.chi}
                      </div>
                      <div className="text-[11px] mt-0.5 tracking-tight font-semibold">
                        {isHoangDao ? (
                          <span className="text-good dark:text-good-dark">HOÀNG ĐẠO</span>
                        ) : (
                          <span className="text-text-secondary-light dark:text-text-secondary-dark">HẮC ĐẠO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-text-primary-light dark:text-text-primary-dark space-y-1.5 align-top">
                      <div className="leading-relaxed">
                        <span className="font-bold text-good dark:text-good-dark mr-1">Nghi:</span>
                        <span>{normalizedHourDungSu.nghi}</span>
                      </div>
                      <div className="leading-relaxed">
                        <span className="font-bold text-bad dark:text-bad-dark mr-1">Kỵ:</span>
                        <span>{normalizedHourDungSu.ky}</span>
                      </div>
                      {isPersonalized && personalBreakdowns.length > 0 && (
                        <div className="space-y-0.5 mt-1">
                          {personalBreakdowns.map((b, i) => (
                            <div key={i} className={`text-xs font-normal ${getBreakdownToneClass(b)}`}>
                              {b.replace('Cá nhân:', '').trim()}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm align-top flex flex-col items-end space-y-0.5 text-text-primary-light dark:text-text-primary-dark">
                      <div className={scoreToneClass}>{currentScore}%</div>
                      {isPersonalized && (positiveBreakdowns.length > 0 || negativeBreakdowns.length > 0) && (
                        <div className="space-y-0.5 mt-1">
                          {positiveModifierTotal !== null && positiveModifierTotal > 0 && (
                            <div className="text-xs font-normal text-good dark:text-good-dark">
                              Tương hợp +{positiveModifierTotal}%
                            </div>
                          )}
                          {negativeModifierTotal !== null && negativeModifierTotal < 0 && (
                            <div className="text-xs font-normal text-bad dark:text-bad-dark">
                              Tương khắc {negativeModifierTotal}%
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* ── 6. Chi Tiết Ngày Âm (Deep Dive Academic Accordion) ───────────── */}
      <CollapsibleCard title="Chi tiết học thuật ngày âm" defaultOpen={false} collapseOnMobile={true}>
        <div className="divide-y divide-border-light dark:divide-border-dark text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Ngũ hành
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.nguHanhInteraction || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Nạp âm">Nạp âm</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {formatNapAm(data.napAmInteraction || '')}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Tam Hợp">Xung hợp</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {formatXungHop(data.canChiXungHop || '')}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Cát thần
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.goodStars.join(', ') || 'Không có'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Hung thần
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.badStars.join(', ') || 'Không có'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              <TermTooltip term="Bành tổ bách kỵ">Bành tổ bách kỵ</TermTooltip>
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed space-y-1.5">
              {renderWithItalics(data.banhTo.can)}
              {renderWithItalics(data.banhTo.chi)}
            </div>
          </div>
          <div className="px-4 sm:px-6 py-3 border-t border-border-light dark:border-border-dark text-right">
            <button
              onClick={() => {
                const d = new Date(date);
                const startStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const end = new Date(date);
                end.setDate(end.getDate() + 14);
                const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
                navigate(`/app/ngay-tot?start=${startStr}&end=${endStr}`);
              }}
              className="text-sm font-semibold text-good dark:text-good-dark hover:underline inline-flex items-center gap-1 interactive-press"
            >
              Tìm ngày giờ tốt trong 14 ngày tới
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
};

export default React.memo(DetailedDayView);
