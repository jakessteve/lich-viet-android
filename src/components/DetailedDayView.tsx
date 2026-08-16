import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayDetailsData } from '../types/calendar';
import {
  renderWithItalics,
  formatNapAm,
  formatXungHop,
  getStatusLabel,
  renderStatusParts,
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
import { Sparkles, Smile, Frown, Meh, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { Badge } from './shared';

interface DetailedDayViewProps {
  date: Date;
  data: DayDetailsData;
}

const DetailedDayView: React.FC<DetailedDayViewProps> = ({ date, data }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isPersonalized = useAppStore((s) => s.isPersonalized);
  const togglePersonalization = useAppStore((s) => s.togglePersonalization);
  const [sortByScore, setSortByScore] = useState(false);

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

  const solarDateStr = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const dayOfWeekAbbr = data.dayOfWeek === 'Chủ Nhật' ? 'CN' : `T${date.getDay() + 1}`;

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
          className={Number(percentValue) >= 50 ? 'text-good dark:text-good-dark' : 'text-bad dark:text-bad-dark'}
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

  return (
    <div className="w-full space-y-4 animate-fade-scale" data-testid="detailed-day-view">
      {/* At-a-glance summary (A5) */}
      <div
        id="tour-day-summary"
        className="rounded-2xl bg-gradient-to-r from-gold/5 via-amber-50/50 to-gold/5 dark:from-gold-dark/5 dark:via-amber-900/10 dark:to-gold-dark/5 border border-gold/15 dark:border-gold-dark/15 px-5 py-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
          <Sparkles className="h-5 w-5 text-gold dark:text-gold-dark mt-0.5 shrink-0" />
          <div className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark flex-1 space-y-0.5">
            <div className="font-bold">
              {dayOfWeekAbbr}, {solarDateStr}
            </div>
            <div>
              {formattedNghi.focus ? (
                <span className="text-good dark:text-good-dark font-semibold">Ngày tốt mọi việc.</span>
              ) : formattedNghi.rest.length > 0 ? (
                <span className="text-good dark:text-good-dark">
                  Tốt cho <span className="font-medium">{formattedNghi.rest.slice(0, 3).join(', ')}</span>.
                </span>
              ) : (
                <span>Không có việc nghi đặc biệt.</span>
              )}
            </div>
            <div>
              {formattedKy.focus ? (
                <span className="text-bad dark:text-bad-dark font-semibold">Kỵ làm mọi việc.</span>
              ) : formattedKy.rest.length > 0 ? (
                <span className="text-bad dark:text-bad-dark">
                  Kỵ <span className="font-medium">{formattedKy.rest.slice(0, 2).join(', ')}</span>.
                </span>
              ) : (
                <span>Không có việc kỵ đặc biệt.</span>
              )}
            </div>
          </div>
          {computedProfile?.birthYear ? (
            <button
              onClick={togglePersonalization}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 w-full sm:w-auto transition-[background-color,color,border-color,box-shadow] duration-200 spring-press motion-gpu ${
                isPersonalized
                  ? 'bg-purple/15 text-purple dark:text-purple-dark border border-purple/30 shadow-sm'
                  : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low'
              }`}
              title={isPersonalized ? 'Tắt cá nhân hoá' : 'Bật cá nhân hoá theo tuổi của bạn'}
            >
              <span className="indicator-pip-sm bg-purple animate-glow-breathe" aria-hidden="true" />
              {isPersonalized ? 'Đã CNH' : 'Chưa CNH'}
            </button>
          ) : (
            <span
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 w-full sm:w-auto bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40"
              title="Cập nhật ngày sinh để cá nhân hoá"
            >
              <span className="indicator-pip-sm bg-text-secondary-light/40" aria-hidden="true" />
              Chưa CNH
            </span>
          )}
        </div>
      </div>

      {/* Personal Score Card */}
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
            <div className="text-sm leading-relaxed">
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
                {personalScore.isTamHop && (
                  <Badge variant="purple">Tam Hợp</Badge>
                )}
                {personalScore.isLucHop && (
                  <Badge variant="purple">Lục Hợp</Badge>
                )}
                {personalScore.isThaiTue && (
                  <Badge variant="gold">Trị Thái Tuế</Badge>
                )}
                {personalScore.isTuongXung && (
                  <Badge variant="orange">Lục Xung</Badge>
                )}
                {personalScore.isTuongHai && (
                  <Badge variant="orange">Lục Hại</Badge>
                )}
                {personalScore.isTuongHinh && (
                  <Badge variant="bad">Tương Hình</Badge>
                )}
                {personalScore.isTuongPha && (
                  <Badge variant="bad">Tương Phá</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Dụng Sự */}
      {isPersonalized && personalDungSu && (
        <CollapsibleCard title="Dụng sự theo tuổi" defaultOpen={true} collapseOnMobile={true}>
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

      {/* Chi tiết ngày âm — Collapsible */}
      <CollapsibleCard title="Chi tiết ngày âm" defaultOpen={true} collapseOnMobile={true}>
        <div className="divide-y divide-border-light dark:divide-border-dark text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Ngũ hành
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.nguHanhInteraction || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Nạp âm
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {formatNapAm(data.napAmInteraction || '')}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Xung hợp
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {formatXungHop(data.canChiXungHop || '')}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Trực/Tú
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed space-y-1.5">
              <p>
                Trực {data.modifyingLayer.trucDetail.name}: {data.modifyingLayer.trucDetail.description}
              </p>
              <p>
                Sao {data.modifyingLayer.tuDetail.name}: {data.modifyingLayer.tuDetail.description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Cát thần
            </div>
            <div className="sm:col-span-3 text-text-primary-light dark:text-text-primary-dark mt-1 sm:mt-0 leading-relaxed">
              {data.goodStars.join(', ') || 'Không có'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Nghi
            </div>
            <div className="sm:col-span-3 mt-1 sm:mt-0 leading-relaxed">
              {formattedNghi.focus || formattedNghi.rest.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formattedNghi.focus && (
                    <Badge variant="good" pip={true}>
                      Tốt mọi việc
                    </Badge>
                  )}
                  {formattedNghi.rest.map((item, i) => (
                    <Badge key={i} variant="good">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Không có</span>
              )}
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
              Kỵ
            </div>
            <div className="sm:col-span-3 mt-1 sm:mt-0 leading-relaxed">
              {formattedKy.focus || formattedKy.rest.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formattedKy.focus && (
                    <Badge variant="bad" pip={true}>
                      Xấu mọi việc
                    </Badge>
                  )}
                  {formattedKy.rest.map((item, i) => (
                    <Badge key={i} variant="bad">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Không có</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-subtle-light/60 dark:hover:bg-white/5 transition-colors">
            <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium sm:col-span-1 tracking-wide">
              Bành tổ bách kỵ
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

      {/* Giờ tốt và xấu trong ngày — Collapsible */}
      <CollapsibleCard
        title="Giờ tốt và xấu trong ngày"
        defaultOpen={true}
        collapseOnMobile={true}
        headerRight={
          <button
            onClick={() => setSortByScore((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark/40 hover:bg-surface-container-low transition-[background-color,color,transform] duration-150 spring-press motion-gpu"
          >
            {sortByScore ? <Clock className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {sortByScore ? 'Theo giờ' : 'Giờ tốt trước'}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs sm:text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase bg-surface-subtle-light dark:bg-surface-subtle-dark tracking-wider">
              <tr>
                <th className="hidden sm:table-cell px-6 py-3 w-20" scope="col">
                  Giờ
                </th>
                <th className="px-2 sm:px-6 py-3 w-[70px] sm:w-28 text-center" scope="col">
                  Can Chi
                </th>
                <th className="px-3 sm:px-6 py-3" scope="col">
                  Chi tiết
                </th>
                <th className="px-2 sm:px-6 py-3 text-right w-[60px] sm:w-24 align-middle" scope="col">
                  ĐIỂM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {sortedHours.map((h, idx) => {
                const advanced = h.advancedInfo || [];
                const statusIndex = advanced.findIndex((s) => s.startsWith('Trạng thái:'));
                let statusInfo = '';
                if (statusIndex !== -1) {
                  statusInfo = advanced[statusIndex].replace('Trạng thái:', '').trim();
                }

                // Find personalized breakdowns
                const personalBreakdowns = advanced.filter((s) => s.startsWith('Cá nhân:'));
                const positiveBreakdowns = personalBreakdowns.filter(
                  (s) => s.includes('Tương hợp') && /\(\+\d+%\)/.test(s),
                );
                const negativeBreakdowns = personalBreakdowns.filter(
                  (s) => s.includes('Tương khắc') && /\(-\d+%\)/.test(s),
                );

                const statusLabel = getStatusLabel(statusInfo);
                const statusColorClass =
                  statusLabel === 'HOÀNG ĐẠO'
                    ? 'text-good dark:text-good-dark'
                    : 'text-text-primary-light dark:text-text-primary-dark';

                // We need to find the original index in `personalizedHours`
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
                    className={`transition-colors ${
                      isTop3
                        ? 'bg-gold/5 dark:bg-gold-dark/5 border-l-2 border-l-gold dark:border-l-gold-dark hover:bg-gold/10 dark:hover:bg-gold-dark/10'
                        : isWeak
                          ? 'opacity-60 hover:opacity-100 hover:bg-surface-subtle-light dark:hover:bg-white/5'
                          : isAuspiciousCurrent
                            ? 'bg-info/5 dark:bg-info-dark/5 hover:bg-surface-subtle-light dark:hover:bg-white/5'
                            : 'hover:bg-surface-subtle-light dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="hidden sm:table-cell px-6 py-4 font-medium whitespace-nowrap align-top">
                      {h.timeRange.replace(/:00/g, '').replace(' - ', '–')}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-center align-top">
                      <div className="sm:hidden">
                        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                          {h.timeRange.replace(/:00/g, '').replace(' - ', '–')}
                        </div>
                        <div
                          className={`font-bold text-sm mt-0.5 ${h.isAuspicious ? 'text-good dark:text-good-dark' : 'text-text-primary-light dark:text-text-primary-dark'}`}
                        >
                          {h.canChi.can} {h.canChi.chi}
                        </div>
                        <div
                          className={`text-xs mt-0.5 tracking-tight leading-tight font-semibold ${statusColorClass}`}
                        >
                          {statusLabel}
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <div
                          className={`font-bold text-base ${h.isAuspicious ? 'text-good dark:text-good-dark' : 'text-text-primary-light dark:text-text-primary-dark'}`}
                        >
                          {h.canChi.can} {h.canChi.chi}
                        </div>
                        <div className="text-xs mt-1 tracking-tight leading-tight">{renderStatusParts(statusInfo)}</div>
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
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm align-top flex flex-col items-end space-y-0.5 text-text-primary-light dark:text-text-primary-dark">
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
    </div>
  );
};

export default React.memo(DetailedDayView);
