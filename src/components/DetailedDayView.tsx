import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DayDetailsData, HourInfo } from '@/types/calendar';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore, toIsoDateString } from '@/stores/appStore';
import { useEventStore } from '@/stores/eventStore';
import { getEventsForDate } from '@/utils/eventEngine';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import {
  calculatePersonalDayScore,
  calculatePersonalHourModifier,
  getPersonalDungSu,
} from '@/services/personalization';
import { findActivityByName } from '@/utils/activityCatalog';
import { normalizeDungSuBuckets } from '@/utils/dungSuDisplay';
import { ContextualDrawer } from '@/components/shared/ContextualDrawer';
import { UnifiedBirthDataPicker, type UnifiedBirthData } from '@/components/shared/UnifiedBirthDataPicker';
import { getNapAmThemeColor } from '@/utils/formatHelpers';
import { formatDungSu } from '@/utils/dungSuFormatters';
import {
  SectionTabs,
  DayHeroCard,
  PersonalScoreCard,
  DungSuSection,
  HoursTimeline,
  AcademicSection,
  type DayViewSection,
} from '@/components/DayView';

interface DetailedDayViewProps {
  date: Date;
  data: DayDetailsData;
}

const DetailedDayView: React.FC<DetailedDayViewProps> = ({ date, data }) => {
  const navigate = useNavigate();

  const handleDungSuBadgeClick = (text: string) => {
    const cleaned = text.split(' (')[0].trim();
    const entry = findActivityByName(cleaned);
    const actParam = entry ? entry.id : encodeURIComponent(cleaned);
    const dateStr = toIsoDateString(date);
    navigate(`/app/ngay-tot?tab=dung-su&activity=${actParam}&date=${dateStr}`);
  };

  const handleNavigateToFindDays = (targetDate: Date) => {
    const startStr = toIsoDateString(targetDate);
    const end = new Date(targetDate);
    end.setDate(end.getDate() + 14);
    const endStr = toIsoDateString(end);
    navigate(`/app/ngay-tot?start=${startStr}&end=${endStr}`);
  };

  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isPersonalized = useAppStore((s) => s.isPersonalized);
  const togglePersonalization = useAppStore((s) => s.togglePersonalization);
  const isDark = useAppStore((s) => s.isDark);
  const [sortByScore, setSortByScore] = useState(false);
  const [isNghiOpen, setIsNghiOpen] = useState(false);
  const [isKyOpen, setIsKyOpen] = useState(false);
  const [isXungHopOpen, setIsXungHopOpen] = useState(false);
  const [isPersonalizationDrawerOpen, setIsPersonalizationDrawerOpen] = useState(false);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);
  const [activeSection, setActiveSection] = useState<DayViewSection>('tong-quan');

  const events = useEventStore((s) => s.events);
  const dayEvents = useMemo(() => {
    return getEventsForDate(events, date);
  }, [events, date]);

  const computedProfile = useMemo(() => {
    return getUserBirthProfile(user);
  }, [user, profileRefreshTrigger]);

  const [drawerBirthData, setDrawerBirthData] = useState<UnifiedBirthData>(() => {
    const p = getUserBirthProfile(user);
    const d =
      p?.birthYear && p?.birthMonth && p?.birthDay
        ? new Date(p.birthYear, p.birthMonth - 1, p.birthDay)
        : new Date(1995, 0, 1);
    return {
      birthDate: d,
      birthHour: p?.birthHour ?? 12,
      birthMinute: p?.birthMinute ?? 0,
      latitude: p?.birthLocation?.lat ?? 21.0285,
      longitude: p?.birthLocation?.lng ?? 105.8542,
      timezone: p?.birthLocation?.timezone ?? 7,
      gender: p?.gender ?? 'male',
      locationName: p?.birthLocation?.locationName || 'Hà Nội',
    };
  });

  const handleOpenPersonalizationDrawer = () => {
    const p = getUserBirthProfile(user);
    if (p?.birthYear && p?.birthMonth && p?.birthDay) {
      setDrawerBirthData({
        birthDate: new Date(p.birthYear, p.birthMonth - 1, p.birthDay),
        birthHour: p.birthHour ?? 12,
        birthMinute: p.birthMinute ?? 0,
        latitude: p.birthLocation?.lat ?? 21.0285,
        longitude: p.birthLocation?.lng ?? 105.8542,
        timezone: p.birthLocation?.timezone ?? 7,
        gender: p.gender ?? 'male',
        locationName: p.birthLocation?.locationName || 'Hà Nội',
      });
    }
    setIsPersonalizationDrawerOpen(true);
  };

  const handleSavePersonalProfile = async () => {
    const y = drawerBirthData.birthDate.getFullYear();
    const m = drawerBirthData.birthDate.getMonth() + 1;
    const d = drawerBirthData.birthDate.getDate();
    const g = drawerBirthData.gender === 'female' || drawerBirthData.gender === 'nu' ? 'female' : 'male';

    if (user) {
      await updateProfile({
        birthday: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        gender: g,
        birthHour: drawerBirthData.birthHour,
        birthMinute: drawerBirthData.birthMinute,
        birthLocation: {
          city: drawerBirthData.locationName || 'Việt Nam',
          lat: drawerBirthData.latitude,
          lng: drawerBirthData.longitude,
          countryCode: drawerBirthData.countryCode || 'VN',
          countryName: drawerBirthData.countryName || 'Việt Nam',
        },
      });
    }

    setProfileRefreshTrigger((prev) => prev + 1);

    if (!isPersonalized) {
      togglePersonalization();
    }

    setIsPersonalizationDrawerOpen(false);
  };

  const dayChi = data.canChi?.day?.chi;

  const dayNapAmColor = getNapAmThemeColor(data.fiveElements?.napAm, isDark);
  const monthNapAmColor = getNapAmThemeColor(data.fiveElements?.napAmMonth, isDark);
  const yearNapAmColor = getNapAmThemeColor(data.fiveElements?.napAmYear, isDark);

  // Personal day score
  const personalScore = useMemo(() => {
    if (!isPersonalized || !computedProfile?.birthYear || !dayChi) return null;
    return calculatePersonalDayScore(computedProfile.birthYear, dayChi, computedProfile);
  }, [isPersonalized, computedProfile, dayChi]);

  // Personalized hours with modifier overlay
  const personalizedHours = useMemo(() => {
    if (!isPersonalized || !computedProfile?.birthYear) return data.allHours;
    return data.allHours.map((h: HourInfo) => {
      const hour = { ...h, advancedInfo: [...(h.advancedInfo || [])] };
      const modifier = calculatePersonalHourModifier(
        computedProfile.birthYear!,
        computedProfile.birthMonth,
        computedProfile.birthDay,
        h.canChi,
        data.canChi.day,
        date,
        computedProfile,
      );
      if (modifier) {
        hour.score = Math.min(100, Math.max(0, hour.score + modifier.totalModifier));
        modifier.breakdowns.forEach((b: string) => {
          if (!hour.advancedInfo!.some((info: string) => info.includes(b))) {
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

  const normalizedDungSu = useMemo(
    () => normalizeDungSuBuckets(data.dungSu.suitable, data.dungSu.unsuitable),
    [data.dungSu.suitable, data.dungSu.unsuitable],
  );

  const formattedNghi = useMemo(() => formatDungSu(normalizedDungSu.nghi, 'Tốt mọi việc'), [normalizedDungSu.nghi]);
  const formattedKy = useMemo(() => formatDungSu(normalizedDungSu.ky, 'Xấu mọi việc'), [normalizedDungSu.ky]);

  return (
    <div className="w-full space-y-4 animate-fade-scale" data-testid="detailed-day-view">
      {/* ── Viewport Segmented Control for 3-Tier Progressive Disclosure ── */}
      <SectionTabs
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* ── Level 1: TỔNG QUAN (Hero + Bản Mệnh + Nghi/Kỵ) ──────────────── */}
      {(activeSection === 'tong-quan' || activeSection === 'tat-ca') && (
        <div className="space-y-4 page-enter-smooth">
          <DayHeroCard
            date={date}
            data={data}
            dayNapAmColor={dayNapAmColor}
            monthNapAmColor={monthNapAmColor}
            yearNapAmColor={yearNapAmColor}
            top3HoursList={top3HoursList}
            dayEvents={dayEvents}
            isPersonalized={isPersonalized}
            computedProfile={computedProfile}
            onTogglePersonalization={togglePersonalization}
            onOpenPersonalizationDrawer={handleOpenPersonalizationDrawer}
          />

          {isPersonalized && personalScore && (
            <PersonalScoreCard personalScore={personalScore} />
          )}

          <DungSuSection
            date={date}
            isPersonalized={isPersonalized}
            personalDungSu={personalDungSu}
            formattedNghi={formattedNghi}
            formattedKy={formattedKy}
            isNghiOpen={isNghiOpen}
            isKyOpen={isKyOpen}
            onToggleNghi={() => setIsNghiOpen(!isNghiOpen)}
            onToggleKy={() => setIsKyOpen(!isKyOpen)}
            onDungSuBadgeClick={handleDungSuBadgeClick}
            onNavigateToFindDays={handleNavigateToFindDays}
          />
        </div>
      )}

      {/* ── Level 2: GIỜ HOÀNG ĐẠO (12-Hour Timeline Table) ─────────────── */}
      {(activeSection === 'gio-hoang-dao' || activeSection === 'tat-ca') && (
        <HoursTimeline
          sortedHours={sortedHours}
          personalizedHours={personalizedHours}
          topHourIndices={topHourIndices}
          isPersonalized={isPersonalized}
          sortByScore={sortByScore}
          onToggleSort={() => setSortByScore((prev) => !prev)}
        />
      )}

      {/* ── Level 3: HỌC THUẬT CỔ (Trực · Tú + Chi Tiết Học Thuật) ───────── */}
      {(activeSection === 'hoc-thuat' || activeSection === 'tat-ca') && (
        <AcademicSection
          date={date}
          data={data}
          isXungHopOpen={isXungHopOpen}
          onToggleXungHop={() => setIsXungHopOpen(!isXungHopOpen)}
          onNavigateToFindDays={handleNavigateToFindDays}
        />
      )}

      {/* ── Contextual Personalization Drawer ────────────────────────── */}
      <ContextualDrawer
        isOpen={isPersonalizationDrawerOpen}
        onClose={() => setIsPersonalizationDrawerOpen(false)}
        title="Cá Nhân Hóa Bản Mệnh"
        subtitle="Tính điểm tương hợp ngũ hành, giờ xuất hành và việc nên làm theo tuổi"
        badge="Không rời trang"
      >
        <div className="space-y-4">
          <UnifiedBirthDataPicker
            value={drawerBirthData}
            onChange={setDrawerBirthData}
            showName={false}
            showGender={true}
            showLunarToggle={true}
            showLocation={true}
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light/40 dark:border-border-dark/30">
            <button
              type="button"
              onClick={() => setIsPersonalizationDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSavePersonalProfile}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-purple text-white hover:bg-purple/90 shadow-sm transition-colors cursor-pointer"
            >
              Lưu & Kích Hoạt
            </button>
          </div>
        </div>
      </ContextualDrawer>
    </div>
  );
};

export default React.memo(DetailedDayView);
