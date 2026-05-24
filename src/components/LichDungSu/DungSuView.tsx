/**
 * DungSuView — Wizard-based page orchestrator for Lịch Dụng Sự
 * UX Redesign: 3-step wizard → Intent → Activity → Results Dashboard
 * All 13 scoring engines preserved. Progressive disclosure with tabs.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DayDetailsData } from '../../types/calendar';
import type { Chi } from '../../types/calendar';
import { useAuthStore } from '../../stores/authStore';
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

// New UX components
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
  const { user } = useAuthStore();
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<Chi | null>(null);
  const [birthYear, setBirthYear] = useState<string>(() =>
    userBirthProfile?.birthYear ? String(userBirthProfile.birthYear) : '',
  );
  const [selectedIntent, setSelectedIntent] = useState<FAQIntent | null>(null);

  // Active tab state
  const [activeResultTab, setActiveResultTab] = useState('overview');

  // Date/time input fields — synced with selectedDate
  const [inputDay, setInputDay] = useState(selectedDate.getDate().toString());
  const [inputMonth, setInputMonth] = useState((selectedDate.getMonth() + 1).toString());
  const [inputYear, setInputYear] = useState(selectedDate.getFullYear().toString());
  const [inputHour, setInputHour] = useState('');
  const [now, setNow] = useState(() => new Date());

  // Ref for auto-scroll to results
  const resultRef = useRef<HTMLDivElement>(null);

  // Sync input fields when sidebar calendar changes the selectedDate
  useEffect(() => {
    setInputDay(selectedDate.getDate().toString());
    setInputMonth((selectedDate.getMonth() + 1).toString());
    setInputYear(selectedDate.getFullYear().toString());
  }, [selectedDate]);

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

  const effectiveBirthProfile: PersonalBirthDetails & { birthYear?: number } | null = useMemo(() => {
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

  // Apply date/time input — runs whenever fields change
  const applyDateInput = useCallback(() => {
    const d = parseInt(inputDay, 10);
    const m = parseInt(inputMonth, 10);
    const y = parseInt(inputYear, 10);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) return;

    const newDate = new Date(y, m - 1, d);
    if (newDate.getDate() !== d || newDate.getMonth() !== m - 1) return;

    if (newDate.getTime() !== selectedDate.getTime()) {
      onSelectDate(newDate);
    }

    const h = parseInt(inputHour, 10);
    if (!isNaN(h) && h >= 0 && h <= 23) {
      setSelectedHour(hourToChi(h));
    }
  }, [inputDay, inputMonth, inputYear, inputHour, selectedDate, onSelectDate]);

  useEffect(() => {
    const timer = setTimeout(applyDateInput, 300);
    return () => clearTimeout(timer);
  }, [applyDateInput]);

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
      if (effectiveBirthProfile?.birthYear && data.canChi?.day?.chi) {
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
    [data.allHours, data.canChi.day, effectiveBirthProfile, selectedDate],
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
    if (chi) {
      const idx = CHI_LIST.indexOf(chi);
      setInputHour(((idx * 2 + 23) % 24) + ''); // approximate start hour
    } else {
      setInputHour('');
    }
  }, []);

  // Determine Hoàng/Hắc Đạo
  const dayType = useMemo(() => {
    // Check from hour data — if more auspicious hours than not, it's likely Hoàng Đạo
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

  const inputFieldClass =
    'w-full px-2.5 py-2 text-center rounded-lg bg-surface-subtle-light dark:bg-white/10 border border-border-light dark:border-border-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-gold/50 dark:focus:ring-gold-dark/50 tabular-nums transition-all';

  // === RENDER ===
  return (
    <div className="w-full space-y-4 animate-fade-scale" data-testid="dung-su-view">
      {/* ══════════ Unified Input Section ══════════ */}
      <div className="space-y-4 transition-all duration-300">
        {/* ══════════ Combined Intent & Activity Selector ══════════ */}
        <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm bg-white dark:bg-black/20 transition-all duration-500">
          {/* Top Half: FAQ Intent Cards */}
          <div
            className={`p-4 sm:p-5 ${selectedIntent === 'xem-ngay' ? 'border-b border-border-light/30 dark:border-border-dark/30' : ''} bg-surface-subtle-light/30 dark:bg-white/5 transition-all duration-300`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons-round text-base text-gold dark:text-gold-dark">explore</span>
              <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                Bạn muốn tra cứu gì?
              </p>
            </div>
            <FAQIntentCards selectedIntent={selectedIntent} onSelectIntent={handleSelectIntent} />
          </div>

          {/* Bottom Half: Activity Picker (Contextually Hidden) */}
          {selectedIntent === 'xem-ngay' && (
            <div className="p-4 sm:p-5 animate-fade-scale">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-base text-gold dark:text-gold-dark">checklist</span>
                  <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Chọn việc cần làm cụ thể
                  </span>
                </div>
                {activityData && (
                  <span className="text-xs font-medium text-gold dark:text-gold-dark bg-gold/10 dark:bg-gold-dark/10 px-2 py-0.5 rounded-full">
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

        {/* Date & Time Input — compact inline */}
        <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-light/30 dark:border-border-dark/30 flex items-center gap-2">
            <span className="material-icons-round text-base text-gold dark:text-gold-dark">event</span>
            <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              Chọn ngày giờ dự kiến
            </span>
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-5 gap-2 items-end">
              {/* Day */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                  Ngày
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={inputDay}
                  onChange={(e) => setInputDay(e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              {/* Month */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                  Tháng
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={inputMonth}
                  onChange={(e) => setInputMonth(e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                  Năm
                </label>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={inputYear}
                  onChange={(e) => setInputYear(e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              {/* Hour */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                  Giờ
                </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  placeholder="--"
                  value={inputHour}
                  onChange={(e) => setInputHour(e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              {/* Birth Year */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                  Năm sinh
                </label>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  placeholder="--"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className={inputFieldClass}
                />
              </div>
            </div>

            {/* Lunar date summary — compact */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-subtle-light dark:bg-white/5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <span className="material-icons-round text-sm text-gold dark:text-gold-dark">today</span>
              <span className="capitalize">{solarDateStr}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>
                Âm: {data.lunarDate.day}/{data.lunarDate.month} — {data.canChi.day.can} {data.canChi.day.chi}
              </span>
              {selectedHour && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>Giờ {selectedHour}</span>
                </>
              )}
              {birthYearChi && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>Tuổi {birthYearChi}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* (Activity Picker moved to Top section) */}
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-surface-subtle-light dark:bg-black/20 border border-border-light/60 dark:border-white/5 relative overflow-hidden shadow-sm">
                  {/* Background ambient decoration */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/5 dark:bg-gold-dark/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Left Column: Quick Stats */}
                  <div className="flex flex-row sm:flex-col justify-around sm:justify-center w-full sm:w-1/3 gap-3 z-10">
                    {/* Best hour mini-card */}
                    {bestHourInfo && (
                      <div className="flex flex-col items-center justify-center p-3 sm:py-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm w-full transition-transform hover:scale-[1.02]">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {bestHourInfo.chi}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-bold mt-1">
                          Giờ tốt nhất
                        </p>
                        <p className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                          {bestHourInfo.score}%
                        </p>
                      </div>
                    )}

                    {/* Day type mini-card */}
                    <div className="flex flex-col items-center justify-center p-3 sm:py-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm w-full transition-transform hover:scale-[1.02]">
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
                  <div className="flex justify-center p-4 rounded-xl border border-border-light dark:border-border-dark">
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
          <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600 mb-2">auto_awesome</span>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-xs">
            Chọn mục đích hoặc một việc cần làm cụ thể để xem đánh giá tốt/xấu
          </p>
        </div>
      )}
    </div>
  );
};

export default DungSuView;
