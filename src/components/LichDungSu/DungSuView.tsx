/**
 * DungSuView — Wizard-based page orchestrator for Lịch Dụng Sự
 * UX Redesign: Unified Date Selector, Design Tokens & Seamless Logic Connection
 * All 13 scoring engines preserved. Progressive disclosure with tabs.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DayDetailsData } from '../../types/calendar';
import type { Chi } from '../../types/calendar';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore, parseIsoDate, toIsoDateString } from '../../stores/appStore';
import { scoreActivity, ActivityScoreResult } from '@lich-viet/core/dungsu';
import { getActivityById, mapDungSuToActivityIds } from '@lich-viet/core/dungsu';
import CollapsibleCard from '../CollapsibleCard';
import ActivityPicker from './ActivityPicker';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import {
  calculatePersonalDayScore,
  calculatePersonalHourModifier,
  type PersonalBirthDetails,
} from '@/services/personalization';

import GroupedBreakdown from './GroupedBreakdown';
import BestTimesPanel from './BestTimesPanel';
import QmdjChartWidget from './QmdjChartWidget';
import FAQIntentCards, { type FAQIntent } from './FAQIntentCards';

import SynergyRadar, { type RadarData } from '../shared/SynergyRadar';

import {
  Compass,
  ListChecks,
  CalendarCheck,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';
import VerdictBanner from './VerdictBanner';
import ResultTabs from './ResultTabs';
import HourPickerGrid from './HourPickerGrid';

interface DungSuViewProps {
  selectedDate: Date;
  data: DayDetailsData;
  onSelectDate: (date: Date) => void;
}

const CHI_LIST: Chi[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as Chi[];

function hourToChi(hour: number): Chi {
  const chiIndex = Math.floor(((hour + 1) % 24) / 2);
  return CHI_LIST[chiIndex];
}

function yearToChi(year: number): Chi {
  const idx = (((year - 4) % 12) + 12) % 12;
  return CHI_LIST[idx];
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

const DungSuView: React.FC<DungSuViewProps> = ({ selectedDate, data, onSelectDate }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initializedFromUrl = useRef(false);

  const user = useAuthStore((s) => s.user);
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);
  const isPersonalized = useAppStore((s) => s.isPersonalized);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<Chi | null>(null);
  const [birthYear, setBirthYear] = useState<string>(() =>
    userBirthProfile?.birthYear ? String(userBirthProfile.birthYear) : '',
  );
  const [selectedIntent, setSelectedIntent] = useState<FAQIntent | null>(null);

  // Active tab state
  const [activeResultTab, setActiveResultTab] = useState('overview');
  const [now, setNow] = useState(() => new Date());

  // Ref for auto-scroll to results
  const resultRef = useRef<HTMLDivElement>(null);

  // Hydrate state from URL search params on mount
  useEffect(() => {
    if (initializedFromUrl.current) return;
    const actParam = searchParams.get('activity') || searchParams.get('act');
    const hourParam = searchParams.get('hour') as Chi | null;
    const intentParam = searchParams.get('intent') as FAQIntent | null;
    const dateParam = searchParams.get('date') || searchParams.get('d');

    if (actParam && getActivityById(actParam)) {
      setSelectedActivity(actParam);
    }
    if (hourParam && CHI_LIST.includes(hourParam)) {
      setSelectedHour(hourParam);
    }
    if (intentParam) {
      setSelectedIntent(intentParam);
    }
    if (dateParam) {
      const parsed = parseIsoDate(dateParam);
      if (
        parsed &&
        (parsed.getFullYear() !== selectedDate.getFullYear() ||
          parsed.getMonth() !== selectedDate.getMonth() ||
          parsed.getDate() !== selectedDate.getDate())
      ) {
        onSelectDate(parsed);
      }
    }
    initializedFromUrl.current = true;
  }, [searchParams, selectedDate, onSelectDate]);

  useEffect(() => {
    if (!birthYear && userBirthProfile?.birthYear) {
      setBirthYear(String(userBirthProfile.birthYear));
    }
  }, [birthYear, userBirthProfile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  const parsedBirthYear = useMemo(() => {
    const y = parseInt(birthYear, 10);
    if (!y || y < 1900 || y > 2100) return undefined;
    return y;
  }, [birthYear]);

  const effectiveBirthProfile: (PersonalBirthDetails & { birthYear?: number }) | null = useMemo(() => {
    if (!parsedBirthYear) return null;
    if (userBirthProfile?.birthYear === parsedBirthYear) {
      return userBirthProfile;
    }
    return { birthYear: parsedBirthYear };
  }, [parsedBirthYear, userBirthProfile]);

  // Compute birth year Chi for Kị Tuổi scoring
  const birthYearChi = useMemo(() => {
    if (!effectiveBirthProfile?.birthYear) return undefined;
    return yearToChi(effectiveBirthProfile.birthYear);
  }, [effectiveBirthProfile]);

  const activityData = useMemo(() => {
    if (!selectedActivity) return null;
    return getActivityById(selectedActivity);
  }, [selectedActivity]);

  // Map raw Nghi/Kỵ strings to catalog activity IDs
  const { suitableIds, unsuitableIds } = useMemo(
    () => mapDungSuToActivityIds(data.dungSu.suitable, data.dungSu.unsuitable),
    [data.dungSu.suitable, data.dungSu.unsuitable],
  );

  // === SCORING ===
  const result: ActivityScoreResult | null = useMemo(() => {
    if (!selectedActivity) return null;
    return scoreActivity(selectedActivity, data, selectedHour || undefined, birthYearChi);
  }, [selectedActivity, data, selectedHour, birthYearChi]);

  const applyPersonalOverlay = useCallback(
    (basePercentage: number, hourChi?: Chi): number => {
      let adjusted = basePercentage;
      if (isPersonalized && effectiveBirthProfile?.birthYear && data.canChi?.day?.chi) {
        const personalDayScore = calculatePersonalDayScore(
          effectiveBirthProfile.birthYear,
          data.canChi.day.chi,
          effectiveBirthProfile,
        );
        if (personalDayScore) {
          const dayBonus = Math.max(-8, Math.min(8, personalDayScore.actionScore * 2));
          adjusted += dayBonus;
        }
      }

      if (
        isPersonalized &&
        effectiveBirthProfile?.birthYear &&
        hourChi &&
        effectiveBirthProfile.birthMonth != null &&
        effectiveBirthProfile.birthDay != null
      ) {
        const hourInfo = data.allHours.find((h) => h.canChi.chi === hourChi);
        if (hourInfo) {
          const personalHourModifier = calculatePersonalHourModifier(
            effectiveBirthProfile.birthYear,
            effectiveBirthProfile.birthMonth,
            effectiveBirthProfile.birthDay,
            hourInfo.canChi,
            data.canChi.day,
            selectedDate,
            effectiveBirthProfile,
          );
          if (personalHourModifier) {
            const hourBonus = Math.max(-10, Math.min(10, Math.round(personalHourModifier.totalModifier / 5)));
            adjusted += hourBonus;
          }
        }
      }

      return clampPercentage(adjusted);
    },
    [isPersonalized, data.allHours, data.canChi.day, effectiveBirthProfile, selectedDate],
  );

  const personalizedPercentage = useMemo(() => {
    if (!result) return null;
    return applyPersonalOverlay(result.percentage, selectedHour || undefined);
  }, [applyPersonalOverlay, result, selectedHour]);

  // Compute radar data from breakdown
  const radarData: RadarData | null = useMemo(() => {
    if (!result) return null;
    const bd = result.breakdown;
    const sum = (factors: string[]) => {
      const items = bd.filter((b) => factors.includes(b.factor));
      if (items.length === 0) return 50;
      const total = items.reduce((s, i) => s + i.value, 0);
      const max = items.reduce((s, i) => s + Math.abs(i.maxValue), 0);
      return max > 0 ? Math.round(((total + max) / (2 * max)) * 100) : 50;
    };
    return {
      day: sum(['truc', 'stars', 'dayGrade', 'hour']),
      compat: sum(['kiTuoi', 'napAm']),
      cosmic: sum(['qmdj', 'thaiAt']),
      safety: 75,
      synergy: personalizedPercentage ?? result.percentage,
    };
  }, [personalizedPercentage, result]);

  // Compute all-hours scores for HourPickerGrid
  const allHourScores = useMemo(() => {
    if (!selectedActivity) return undefined;
    return data.allHours.map((h) => {
      const hResult = scoreActivity(selectedActivity, data, h.canChi.chi as Chi, birthYearChi);
      return { hourInfo: h, activityScore: applyPersonalOverlay(hResult.percentage, h.canChi.chi as Chi) };
    });
  }, [applyPersonalOverlay, selectedActivity, data, birthYearChi]);

  const currentHourChi = useMemo(() => hourToChi(now.getHours()), [now]);
  const highlightedCurrentHourChi = useMemo(
    () => (selectedDate.toDateString() === now.toDateString() ? currentHourChi : null),
    [currentHourChi, now, selectedDate],
  );

  // === HANDLERS ===
  const handleSelectActivity = useCallback((activityId: string) => {
    setSelectedActivity(activityId || null);
    if (activityId) {
      setActiveResultTab('overview');
      // Scroll to results after render
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  const handleSelectIntent = useCallback((intent: FAQIntent) => {
    setSelectedIntent((prev) => (prev === intent ? null : intent));
    // Auto-select a relevant activity for certain intents
    if (intent === 'chon-ngay-cuoi') setSelectedActivity('cuoi-hoi');
    else if (intent === 'tang-le') setSelectedActivity('chon-cat');
    else if (intent === 'xem-ngay') setSelectedActivity(null);
  }, []);

  const handleHourSelect = useCallback((chi: Chi | null) => {
    setSelectedHour(chi);
  }, []);

  // Determine Hoàng/Hắc Đạo
  const dayType = useMemo(() => {
    const auspicious = data.allHours.filter((h) => h.isAuspicious).length;
    return auspicious >= 6 ? 'Hoàng Đạo' : 'Hắc Đạo';
  }, [data.allHours]);

  const lunarDateStr = `${data.lunarDate.day}/${data.lunarDate.month}/${data.lunarDate.year} — ${data.canChi.day.can} ${data.canChi.day.chi}`;

  // Best hour info for verdict
  const bestHourInfo = useMemo(() => {
    if (allHourScores?.length) {
      const best = [...allHourScores].sort((a, b) => b.activityScore - a.activityScore)[0];
      if (best) {
        return {
          chi: best.hourInfo.canChi.chi,
          score: best.activityScore,
        };
      }
    }
    if (!result?.bestHours?.length) return undefined;
    return {
      chi: result.bestHours[0].hourInfo.canChi.chi,
      score: result.bestHours[0].activityScore,
    };
  }, [allHourScores, result]);

  const solarDateStr = selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // === RENDER ===
  return (
    <div className="w-full space-y-4 animate-fade-scale" data-testid="dung-su-view">
      {/* ══════════ Unified Input Section ══════════ */}
      <div className="space-y-4 transition-all duration-300">
        {/* ══════════ Combined Intent & Activity Selector ══════════ */}
        <div className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden shadow-sm bg-surface-light dark:bg-surface-dark transition-all duration-300">
          {/* Top Half: FAQ Intent Cards */}
          <div
            className={`p-4 sm:p-5 ${selectedIntent === 'xem-ngay' ? 'border-b border-border-light/40 dark:border-border-dark/40' : ''} bg-surface-subtle-light/30 dark:bg-surface-subtle-dark/30 transition-all duration-300`}
          >
            <div className="flex items-center gap-2 mb-3.5">
              <Compass className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
              <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                Bạn muốn tra cứu gì?
              </p>
            </div>
            <FAQIntentCards selectedIntent={selectedIntent} onSelectIntent={handleSelectIntent} />
          </div>

          {/* Bottom Half: Activity Picker (Contextually Hidden) */}
          {selectedIntent && !['chon-ngay-cuoi', 'tang-le'].includes(selectedIntent) && (
            <div className="p-4 sm:p-5 animate-fade-scale border-t border-border-light/40 dark:border-border-dark/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
                  <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Chọn việc cần làm cụ thể
                  </span>
                </div>
                {activityData && (
                  <span className="text-xs font-semibold text-gold dark:text-gold-dark bg-gold/10 dark:bg-gold-dark/15 px-2.5 py-0.5 rounded-full border border-gold/25 dark:border-gold-dark/25">
                    ✓ {activityData.nameVi}
                  </span>
                )}
              </div>
              <ActivityPicker
                selectedActivity={selectedActivity}
                onSelectActivity={handleSelectActivity}
                suitableActivities={suitableIds}
                unsuitableActivities={unsuitableIds}
                filterByIntent={selectedIntent}
              />
            </div>
          )}
        </div>

        {/* ══════════ Unified Date & Profile Control Bar ══════════ */}
        <div className="surface-card rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border-light/40 dark:border-border-dark/40 flex items-center justify-between gap-2 bg-surface-subtle-light/40 dark:bg-surface-subtle-dark/40">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                Ngày giờ dự kiến & Chủ sự
              </span>
            </div>
            {/* Quick date steppers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onSelectDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1),
                  )
                }
                className="p-1.5 rounded-lg border border-border-light/60 dark:border-border-dark/60 bg-surface-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white transition-colors interactive-press cursor-pointer"
                title="Ngày hôm trước"
                aria-label="Ngày hôm trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectDate(new Date())}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-border-light/60 dark:border-border-dark/60 bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark hover:bg-gold/10 hover:text-gold dark:hover:text-gold-dark transition-colors interactive-press cursor-pointer"
                title="Về hôm nay"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() =>
                  onSelectDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1),
                  )
                }
                className="p-1.5 rounded-lg border border-border-light/60 dark:border-border-dark/60 bg-surface-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white transition-colors interactive-press cursor-pointer"
                title="Ngày tiếp theo"
                aria-label="Ngày tiếp theo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              {/* Date selector */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
                  <span>Ngày tra cứu</span>
                </label>
                <input
                  type="date"
                  value={toIsoDateString(selectedDate)}
                  onChange={(e) => {
                    const parsed = parseIsoDate(e.target.value);
                    if (parsed) onSelectDate(parsed);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-gold-dark/40 transition-all"
                />
              </div>

              {/* Hour Selector */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
                    <span>Giờ thực hiện</span>
                  </span>
                  {selectedHour && (
                    <button
                      type="button"
                      onClick={() => setSelectedHour(null)}
                      className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-bad dark:hover:text-bad-dark transition-colors cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedHour || ''}
                    onChange={(e) => setSelectedHour((e.target.value || null) as Chi | null)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-gold-dark/40 transition-all cursor-pointer"
                  >
                    <option value="">Cả ngày (Chưa chọn giờ)</option>
                    {CHI_LIST.map((c) => (
                      <option key={c} value={c}>
                        Giờ {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Birth Year / Profile input */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
                    <span>Năm sinh chủ sự</span>
                  </span>
                  {birthYearChi && (
                    <span className="text-[11px] font-bold text-gold dark:text-gold-dark">Tuổi {birthYearChi}</span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="VD: 1990"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-gold-dark/40 transition-all"
                  />
                  {userBirthProfile?.birthYear && birthYear !== String(userBirthProfile.birthYear) && (
                    <button
                      type="button"
                      onClick={() => setBirthYear(String(userBirthProfile.birthYear))}
                      className="absolute right-1.5 px-2 py-0.5 rounded-lg bg-gold/15 dark:bg-gold-dark/15 text-gold dark:text-gold-dark text-xs font-bold hover:opacity-80 transition-opacity cursor-pointer"
                      title="Nạp năm sinh từ hồ sơ"
                    >
                      Nạp
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile banner if available */}
            {userBirthProfile?.birthYear && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/25 dark:border-gold-dark/25 text-xs text-text-primary-light dark:text-text-primary-dark">
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="h-3.5 w-3.5 text-gold dark:text-gold-dark shrink-0" />
                  <span className="truncate">
                    Hồ sơ: <strong>{user?.displayName || 'Người dùng'}</strong> (
                    {userBirthProfile.birthDay || '?'}/{userBirthProfile.birthMonth || '?'}/
                    {userBirthProfile.birthYear})
                  </span>
                </div>
                {birthYear !== String(userBirthProfile.birthYear) && (
                  <button
                    type="button"
                    onClick={() => setBirthYear(String(userBirthProfile.birthYear))}
                    className="font-bold text-gold dark:text-gold-dark hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    Dùng hồ sơ này
                  </button>
                )}
              </div>
            )}

            {/* Compact Lunar & Astrological Summary */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-surface-subtle-light/60 dark:bg-white/5 border border-border-light/40 dark:border-border-dark/40 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark capitalize">
                {solarDateStr}
              </span>
              <span className="text-border-light dark:text-border-dark">|</span>
              <span>
                Âm:{' '}
                <strong className="text-text-primary-light dark:text-text-primary-dark">
                  {data.lunarDate.day}/{data.lunarDate.month}
                </strong>{' '}
                — {data.canChi.day.can} {data.canChi.day.chi}
              </span>
              <span className="text-border-light dark:text-border-dark">|</span>
              <span>
                Tiết khí:{' '}
                <strong className="text-text-primary-light dark:text-text-primary-dark">{data.solarTerm}</strong>
              </span>
              <span className="text-border-light dark:text-border-dark">|</span>
              <span
                className={
                  dayType === 'Hoàng Đạo'
                    ? 'font-bold text-good dark:text-good-dark'
                    : 'font-semibold text-text-secondary-light dark:text-text-secondary-dark'
                }
              >
                {dayType === 'Hoàng Đạo' ? '🌟' : '🌑'} {dayType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Results Dashboard ══════════ */}
      {result && activityData && (
        <div ref={resultRef} className="space-y-4 animate-fade-in-up">
          {/* Verdict Banner — Hero result */}
          <VerdictBanner
            percentage={personalizedPercentage ?? result.percentage}
            label={result.label}
            activityName={activityData.nameVi}
            date={selectedDate}
            hourChi={selectedHour || undefined}
            dayType={dayType}
            lunarDateStr={lunarDateStr}
            bestHourChi={bestHourInfo?.chi}
            bestHourScore={bestHourInfo?.score}
            isBachSuHung={result.isBachSuHung}
          />

          {/* Quick Deep Link CTA to Tìm Ngày Tốt */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 shadow-sm">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Cần quét ngày hoàng đạo tốt nhất cho <strong>{activityData.nameVi}</strong>?
            </span>
            <button
              type="button"
              onClick={() => {
                const startStr = toIsoDateString(selectedDate);
                const end = new Date(selectedDate);
                end.setDate(end.getDate() + 30);
                const endStr = toIsoDateString(end);
                navigate(`/app/ngay-tot?tab=tim-ngay&activity=${selectedActivity}&start=${startStr}&end=${endStr}`);
              }}
              className="text-xs font-bold text-good dark:text-good-dark hover:underline inline-flex items-center gap-1.5 interactive-press"
            >
              <span>Tìm ngày tốt trong 30 ngày tới</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Result Tabs */}
          <ResultTabs
            activeTab={activeResultTab}
            onTabChange={setActiveResultTab}
            intent={selectedIntent}
            hasResult={true}
          />

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {/* === TAB: Tổng quan === */}
            {activeResultTab === 'overview' && (
              <div className="space-y-4 animate-fade-scale">
                {/* Unified Overview Card */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light/60 dark:border-border-dark/60 relative overflow-hidden shadow-sm">
                  {/* Background ambient decoration */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/5 dark:bg-gold-dark/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Left Column: Quick Stats */}
                  <div className="flex flex-row sm:flex-col justify-around sm:justify-center w-full sm:w-1/3 gap-3 z-10">
                    {/* Best hour mini-card */}
                    {bestHourInfo && (
                      <div className="flex flex-col items-center justify-center p-3 sm:py-4 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/50 dark:border-border-dark/50 shadow-sm w-full transition-transform hover:scale-[1.02]">
                        <p className="text-2xl font-bold text-good dark:text-good-dark">{bestHourInfo.chi}</p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-bold mt-1">
                          Giờ tốt nhất
                        </p>
                        <p className="text-xs font-medium text-good/70 dark:text-good-dark/70 mt-0.5">
                          {bestHourInfo.score}%
                        </p>
                      </div>
                    )}

                    {/* Day type mini-card */}
                    <div className="flex flex-col items-center justify-center p-3 sm:py-4 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/50 dark:border-border-dark/50 shadow-sm w-full transition-transform hover:scale-[1.02]">
                      <p className="text-2xl font-bold">{dayType === 'Hoàng Đạo' ? '🌟' : '🌑'}</p>
                      <p className="text-xs uppercase tracking-wider font-bold mt-1 text-text-secondary-light dark:text-text-secondary-dark">
                        {dayType}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Synergy Radar */}
                  {radarData && (
                    <div className="flex-1 flex justify-center items-center p-2 z-10 w-full">
                      <SynergyRadar data={radarData} size={220} />
                    </div>
                  )}
                </div>

                {/* Condensed Best Hours */}
                <BestTimesPanel bestHours={result.bestHours} activityName={activityData.nameVi} />
              </div>
            )}

            {/* === TAB: Chi tiết === */}
            {activeResultTab === 'details' && (
              <div className="animate-fade-scale">
                <GroupedBreakdown breakdown={result.breakdown} />
              </div>
            )}

            {/* === TAB: Giờ tốt === */}
            {activeResultTab === 'hours' && (
              <div className="space-y-4 animate-fade-scale">
                <HourPickerGrid
                  allHours={data.allHours}
                  selectedHour={selectedHour}
                  onSelectHour={handleHourSelect}
                  hourScores={allHourScores}
                  activityName={activityData.nameVi}
                  currentHourChi={highlightedCurrentHourChi}
                />
                <BestTimesPanel bestHours={result.bestHours} activityName={activityData.nameVi} />
              </div>
            )}

            {/* === TAB: Phân tích === */}
            {activeResultTab === 'analysis' && (
              <div className="space-y-4 animate-fade-scale">
                {radarData && (
                  <div className="flex justify-center p-4 rounded-2xl border border-border-light/60 dark:border-border-dark/60 bg-surface-light dark:bg-surface-dark">
                    <SynergyRadar data={radarData} size={240} />
                  </div>
                )}
                <CollapsibleCard title="Kỳ Môn Độn Giáp" defaultOpen={false}>
                  <div className="p-4">
                    <QmdjChartWidget date={selectedDate} hourChi={selectedHour || 'Tý'} />
                  </div>
                </CollapsibleCard>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-scale">
          <Sparkles className="h-10 w-10 text-text-secondary-light/40 dark:text-text-secondary-dark/40 mb-2 opacity-50" />
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-xs">
            Chọn mục đích hoặc một việc cần làm cụ thể để xem đánh giá tốt/xấu
          </p>
        </div>
      )}
    </div>
  );
};

export default DungSuView;
