import React, { useEffect, useState, useMemo, useRef } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  getLunarDate,
  getCanChiDay,
  getCanChiYear,
  getCanChiMonth,
  getDayQuality,
  getSolarTerm,
  getAuspiciousHours,
  parseCanChi,
} from '@lich-viet/core/calendar';
import { getJDN } from '@lich-viet/core/calendar';
import { NAP_AM_MAPPING } from '@lich-viet/core';
import CosmicWeatherCard from './LandingPage/CosmicWeatherCard';
import HeroBirthdayInput from './LandingPage/HeroBirthdayInput';
import TestimonialSection from './LandingPage/TestimonialSection';
import { FEATURES, getMoonPhaseName, useCountUp, useInView } from './LandingPage/landingPageData';
import MoonPhaseSVG from './LandingPage/MoonPhaseSVG';
import HeroAuspiciousArt from './LandingPage/HeroAuspiciousArt';
import MysticBackgroundPattern from './LandingPage/MysticBackgroundPattern';
import { ActionButton, IconButton } from '../shared';

const TRUST_VALUES = [
  {
    icon: 'verified',
    title: 'Chuẩn học thuật',
    desc: 'Thuật toán được đối chiếu với các tài liệu cổ học uy tín — đảm bảo chính xác từng con số.',
    accent: 'from-blue-400/25 to-blue-600/10',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    icon: 'block',
    title: 'Tôn trọng trải nghiệm',
    desc: 'Không popup, không banner, không theo dõi. Trải nghiệm sạch sẽ như ứng dụng bạn xứng đáng.',
    accent: 'from-emerald-400/25 to-emerald-600/10',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    icon: 'lock',
    title: 'Dữ liệu không rời thiết bị',
    desc: 'Ngày sinh, lá số, kết quả — tất cả chỉ nằm trên trình duyệt. Không gửi đến máy chủ nào.',
    accent: 'from-purple-400/25 to-purple-600/10',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
] as const;

// ══════════════════════════════════════════════════════════
// Landing Page — Revamped with interactive hero, social proof,
// story cards, emotional trust, pricing cards, and SEO footer
// ══════════════════════════════════════════════════════════

export default function LandingPage() {
  usePageTitle('Tra cứu Âm Lịch, Gieo Quẻ & Tử Vi');
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setUserMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDark = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isNowDark ? 'dark' : 'light';
    setIsDark(isNowDark);
  };

  // ── Live "Today" data from calendarEngine ──
  const today = useMemo(() => {
    const now = new Date();
    const lunar = getLunarDate(now);
    const canChiDay = getCanChiDay(now);
    const canChiYear = getCanChiYear(lunar.year);
    const canChiMonth = getCanChiMonth(lunar.month, lunar.year);
    const quality = getDayQuality(now);
    const jd = getJDN(now.getDate(), now.getMonth() + 1, now.getFullYear());
    const solarTerm = getSolarTerm(jd);

    const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][now.getDay()];

    const canChiDayParsed = parseCanChi(canChiDay);
    const napAm = canChiDayParsed ? NAP_AM_MAPPING[`${canChiDayParsed.can} ${canChiDayParsed.chi}`] || '' : '';
    const auspiciousHoursCount = getAuspiciousHours(now).length;

    return {
      lunar,
      canChiDay,
      canChiYear,
      canChiMonth,
      quality,
      solarTerm,
      dayOfWeek,
      solarDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      moonPhase: getMoonPhaseName(lunar.day),
      auspiciousHoursCount,
      napAm,
    };
  }, []);

  const isGoodDay = today.quality === 'Good';
  const statsSection = useInView(0.3);
  const lookupCount = useCountUp(12480, 1800, statsSection.inView);
  const dataCount = useCountUp(85000, 2000, statsSection.inView);
  const toolsCount = useCountUp(3, 1200, statsSection.inView);
  const stats = useMemo(
    () => [
      {
        value: lookupCount.toLocaleString('vi-VN'),
        suffix: '+',
        label: 'Lượt tra cứu',
        icon: 'search',
        iconTint: 'text-blue-500/60 dark:text-blue-400/50',
        accentColor: 'text-blue-500 dark:text-blue-400',
      },
      {
        value: dataCount.toLocaleString('vi-VN'),
        suffix: '+',
        label: 'Dữ liệu thiên văn',
        icon: 'database',
        iconTint: 'text-teal-500/60 dark:text-teal-400/50',
        accentColor: 'text-teal-500 dark:text-teal-400',
      },
      {
        value: toolsCount.toLocaleString('vi-VN'),
        suffix: ' công cụ',
        label: 'Đang hoạt động',
        icon: 'auto_awesome',
        iconTint: 'text-purple-500/60 dark:text-purple-400/50',
        accentColor: 'text-purple-500 dark:text-purple-400',
      },
    ],
    [dataCount, lookupCount, toolsCount],
  );
  const qualityLabel = isGoodDay ? 'Ngày Hoàng Đạo' : today.quality === 'Bad' ? 'Ngày Hắc Đạo' : 'Ngày Bình Thường';
  const qualityIcon = isGoodDay ? 'verified' : today.quality === 'Bad' ? 'dangerous' : 'info';
  const qualityColor = isGoodDay
    ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-400/8 border-emerald-500/15 dark:border-emerald-400/15'
    : today.quality === 'Bad'
      ? 'text-red-500 dark:text-red-400 bg-red-500/8 dark:bg-red-400/8 border-red-500/15 dark:border-red-400/15'
      : 'text-amber-500 dark:text-amber-400 bg-amber-500/8 dark:bg-amber-400/8 border-amber-500/15 dark:border-amber-400/15';

  return (
    <div className="min-h-screen transition-colors duration-300 overflow-x-hidden relative">
      {/* ──── Base Global Background ──── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-mystery-deep via-[#0f0a24] to-mystery-deep" />
      </div>

      {/* ──── Subtle hero texture from the legacy landing page ──── */}
      <div
        className="absolute top-0 left-0 right-0 h-[1180px] pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.16]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(212,168,67,0.35) 1px, transparent 1px),
              radial-gradient(circle at 70% 20%, rgba(124,58,237,0.28) 1px, transparent 1px),
              radial-gradient(circle at 55% 70%, rgba(59,130,246,0.18) 1px, transparent 1px)
            `,
            backgroundSize: '46px 46px, 78px 78px, 112px 112px',
          }}
        />
        <div className="absolute inset-0">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-gold/10 dark:border-gold-dark/10"
              style={{
                width: `${420 + i * 220}px`,
                height: `${420 + i * 220}px`,
                top: `${90 - i * 60}px`,
                right: `${-180 - i * 95}px`,
                animation: `spin ${120 + i * 28}s linear infinite ${i % 2 ? 'reverse' : ''}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ──── Floating Nav ──── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300 tracking-tight">
            LỊCH VIỆT
          </h1>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={toggleDark}
              className="rounded-full text-gray-400 dark:text-gray-500"
              icon={isDark ? 'light_mode' : 'dark_mode'}
              label="Chuyển chế độ sáng/tối"
            />
            <div className="relative" ref={userMenuRef}>
              <IconButton
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="rounded-full text-gray-400 dark:text-gray-500"
                icon="person"
                label="Menu người dùng"
              />

              {userMenuOpen ? (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border-light bg-white py-1.5 shadow-xl dark:border-mystery-purple/15 dark:bg-mystery-surface/90 dark:backdrop-blur-xl">
                  <div className="border-b border-border-light px-4 py-3 dark:border-border-dark">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mystery-purple/20 to-mystery-blue/20 dark:from-mystery-purple/25 dark:to-mystery-blue/15">
                            <span className="text-xs font-bold text-mystery-purple dark:text-mystery-purple-light">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                              {user.displayName}
                            </p>
                            <p className="truncate text-xs text-text-secondary-light dark:text-text-secondary-dark">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Khách</p>
                        <p className="mt-0.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          Phiên bản miễn phí
                        </p>
                      </>
                    )}
                  </div>

                  <div className="py-1">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => {
                            navigate('/app/cai-dat');
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                        >
                          <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                            settings
                          </span>
                          Cài đặt
                        </button>
                        <button
                          onClick={() => {
                            navigate('/');
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                        >
                          <span className="material-icons-round text-lg text-text-secondary-light dark:text-text-secondary-dark">
                            info
                          </span>
                          Giới thiệu
                        </button>
                        <div className="mt-1 border-t border-border-light/50 pt-1 dark:border-border-dark/30">
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/15"
                          >
                            <span className="material-icons-round text-lg">logout</span>
                            Đăng xuất
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate('/app/dang-nhap');
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                        >
                          <span className="material-icons-round text-lg text-gold dark:text-gold-dark">login</span>
                          Đăng nhập
                        </button>
                        <button
                          onClick={() => {
                            navigate('/app/dang-ky');
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light transition-colors hover:bg-gray-50 dark:text-text-primary-dark dark:hover:bg-gray-700/50"
                        >
                          <span className="material-icons-round text-lg text-mystery-purple dark:text-mystery-purple-light">
                            person_add
                          </span>
                          Đăng ký
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
           §1 HERO — Centered headline + symmetric 3-card grid
         ════════════════════════════════════════════════════════ */}
      <section className="relative px-5 pt-28 pb-8 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-gold/5 dark:from-gold/3 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-amber-500/4 dark:bg-mystery-purple/6 rounded-full blur-3xl" />
        </div>

        {/* Auspicious Art Background (Scaled to 90% of original massive size) */}
        <div className="absolute top-6 right-[-55%] h-[520px] w-[520px] opacity-[0.22] dark:opacity-[0.24] pointer-events-none z-[1] sm:top-0 sm:right-[-20%] sm:h-[720px] sm:w-[720px] sm:opacity-[0.6] md:right-[-10%] lg:right-[0%] lg:h-[900px] lg:w-[900px] lg:opacity-[0.8] lg:dark:opacity-[0.7]">
          <HeroAuspiciousArt />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* ── Asymmetric headline block ── */}
          <div className="text-left max-w-3xl mb-16 relative z-10">
            {/* Authority badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low dark:bg-gold-dark/6 mb-5 backdrop-blur-sm animate-fade-in-up">
              <span className="material-icons-round text-xs text-gold dark:text-gold-dark">science</span>
              <span className="text-xs sm:text-xs font-medium text-gold dark:text-gold-dark tracking-wide">
                Tính toán thiên văn chính xác
              </span>
            </div>

            {/* Hook headline — benefit-driven, more breathing room */}
            <h2 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-serif font-bold leading-[1.1] tracking-tight mb-6 animate-fade-in-up animate-delay-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-text-primary-light to-text-secondary-light dark:from-white dark:to-gray-400">
                Khám phá
              </span>
              <br />
              <span className="mystery-text-glow bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300">
                vận mệnh của bạn
              </span>
            </h2>

            <p className="text-base sm:text-lg text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-8 max-w-xl animate-fade-in-up animate-delay-2">
              3 công cụ cốt lõi trong một ứng dụng.
              <br className="hidden sm:block" />
              Âm Lịch có tab Dụng Sự, cùng Gieo Quẻ và Tử Vi —{' '}
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                chính xác theo chuẩn học thuật.
              </span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center justify-start gap-4 animate-fade-in-up animate-delay-3">
              <ActionButton
                onClick={() => navigate('/app/am-lich')}
                className="px-5 py-3 font-medium"
                icon="arrow_forward"
              >
                Trải nghiệm ngay
              </ActionButton>
              <ActionButton
                onClick={() => navigate('/app/nang-cap')}
                variant="secondary"
                className="px-5 py-3 font-medium"
              >
                <span className="material-icons-round text-sm">workspace_premium</span>
                Xem các gói
              </ActionButton>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
               Symmetric 3-card grid: Today | Birthday | Cosmic
             ══════════════════════════════════════════════════════ */}
          <div id="cosmic-section" className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up animate-delay-5">
            {/* ── Card 1: Today's Details ── */}
            <button
              onClick={() => navigate('/app/am-lich')}
              className="group glass-card glass-noise p-5 text-left hover-lift cursor-pointer flex flex-col"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                    Hôm nay
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${qualityColor}`}
                  >
                    <span className="material-icons-round text-xs">{qualityIcon}</span>
                    {qualityLabel}
                  </span>
                </div>
                <span className="material-icons-round text-sm text-text-secondary-light/60 dark:text-text-secondary-dark/60 group-hover:text-gold dark:group-hover:text-gold-dark transition-colors">
                  arrow_forward
                </span>
              </div>

              {/* Moon + date */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="shrink-0 rounded-full moon-glow animate-float">
                  <MoonPhaseSVG lunarDay={today.lunar.day} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug">
                    {today.dayOfWeek}, {today.solarDate}
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Âm lịch {today.lunar.day}/{today.lunar.month} · {today.moonPhase}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="mt-auto space-y-2 pt-3 border-t border-border-light/15 dark:border-white/[0.04]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-icons-round text-xs text-gold/50 dark:text-gold-dark/40">
                    calendar_today
                  </span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    {today.canChiDay}
                    {today.napAm && (
                      <span className="text-text-secondary-light/60 dark:text-text-secondary-dark/60 ml-1">
                        ({today.napAm})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-icons-round text-xs text-gold/50 dark:text-gold-dark/40">schedule</span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    {today.auspiciousHoursCount} giờ hoàng đạo
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-icons-round text-xs text-gold/50 dark:text-gold-dark/40">wb_sunny</span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    {today.solarTerm || 'Tiết khí đang cập nhật'}
                  </span>
                </div>
              </div>
            </button>

            {/* ── Card 2: Vận Khí Vũ Trụ (Cosmic Weather) — center ── */}
            <CosmicWeatherCard navigate={navigate} today={today} />

            {/* ── Card 3: Khám Phá Nhanh (Birthday Input) — right ── */}
            <div className="flex flex-col">
              <HeroBirthdayInput onNavigate={navigate} />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-12 animate-fade-in-up animate-delay-6">
            <button
              onClick={() => document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-gold dark:hover:text-gold-dark transition-colors"
              aria-label="Cuộn xuống để xem thêm"
            >
              <span className="text-xs font-medium tracking-wider uppercase">Khám phá thêm</span>
              <span className="material-icons-round text-lg animate-bounce">expand_more</span>
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §3 STATS — Trust counters
         ════════════════════════════════════════════════════════ */}
      <section id="stats-section" ref={statsSection.ref} className="py-10 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-6 px-4 glass-card glass-noise">
                <span className={`material-icons-round text-lg ${s.iconTint} mb-1.5 block`}>{s.icon}</span>
                <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {s.value}
                  <span className={s.accentColor}>{s.suffix}</span>
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §4 FEATURES — Story cards (benefit-first with tiers)
         ════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 relative z-10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-[-10%] right-[-20%] md:right-[0%] w-[800px] h-[800px] opacity-40 dark:opacity-60 pointer-events-none z-0">
          <MysticBackgroundPattern variant="compass" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold dark:text-gold-dark mb-2">
              Tính năng
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 mystery-text-glow">
              3 công cụ trong một ứng dụng
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-lg mx-auto">
              Kết hợp lịch âm, Dụng Sự, gieo quẻ và Tử Vi trong một không gian gọn gàng.
            </p>
          </div>

          {/* Basic tier features */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/8 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Cơ bản
              </span>
              <div className="flex-1 h-px bg-border-light/20 dark:bg-border-dark/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.filter((f) => f.tier === 'Cơ bản').map((f) => (
                <button
                  key={f.id}
                  onClick={() => navigate(`/app/${f.id}`)}
                  className="surface-interactive group relative w-full h-full flex flex-col justify-start items-start text-left p-6 bg-surface-container-lowest dark:bg-surface-dark hover:bg-surface-bright transition-colors duration-500"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.glowColor} dark:opacity-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
                  />
                  <div className="relative flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className={`material-icons-round text-lg ${f.iconColor}`}>{f.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold">{f.title}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-gold/8 dark:bg-gold-dark/6 text-xs font-bold text-gold dark:text-gold-dark uppercase tracking-wider">
                          {f.highlight}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                  <span className="absolute top-4 right-3 material-icons-round text-sm text-text-secondary-light/60 dark:text-text-secondary-dark/60 group-hover:text-gold dark:group-hover:text-gold-dark group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §5 TESTIMONIALS — Social proof
         ════════════════════════════════════════════════════════ */}
      <TestimonialSection />

      {/* ════════════════════════════════════════════════════════
           §6 WHY LỊCH VIỆT — Emotional trust section
         ════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 px-5 relative z-10 bg-surface-subtle-light dark:bg-background-dark overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 dark:opacity-60 pointer-events-none z-0">
          <MysticBackgroundPattern variant="dipper" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold dark:text-gold-dark mb-2">
              Tại sao chọn Lịch Việt
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Được xây dựng vì người dùng</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRUST_VALUES.map((v) => (
              <div
                key={v.title}
                className="surface-interactive group p-6 bg-surface-container-lowest dark:bg-surface-dark hover:bg-surface-bright transition-colors duration-500"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}
                >
                  <span className={`material-icons-round text-xl ${v.iconColor}`}>{v.icon}</span>
                </div>
                <h4 className="text-sm font-bold mb-1.5">{v.title}</h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §7 ROADMAP
         ════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 relative z-10 overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold dark:text-gold-dark mb-2">
              Gói nâng cao
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Sắp ra mắt</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-md mx-auto mb-8">
              Các tiện ích nâng cao đang được phát triển. Hãy dùng thử các công cụ cơ bản ngay hôm nay.
            </p>
            <ActionButton
              onClick={() => navigate('/app/am-lich')}
              className="px-8 py-3.5"
              icon="arrow_forward"
            >
              Khám phá ngay
            </ActionButton>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §8 CLOSING CTA — Urgency-based with moon phase
         ════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="surface-card rounded-3xl p-10 sm:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-mystery-purple/8 dark:from-mystery-purple/12 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-gold/6 dark:from-gold/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 dark:bg-gold-dark/8 flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-2xl text-gold dark:text-gold-dark">explore</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Sẵn sàng khám phá vận mệnh?</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Trải nghiệm lịch âm, gieo quẻ và nhiều công cụ ngay. Nâng cấp để mở khóa toàn bộ.
              </p>
              {isGoodDay && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4 inline-flex items-center gap-1">
                  <span className="material-icons-round text-xs">verified</span>
                  Hôm nay là ngày Hoàng Đạo — thời điểm tốt để bắt đầu!
                </p>
              )}
              {!isGoodDay && (
                <p className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60 mb-6">
                  Hoạt động trên mọi thiết bị — desktop, tablet và điện thoại.
                </p>
              )}
              <ActionButton
                onClick={() => navigate('/app/am-lich')}
                className="px-8 py-3.5"
                icon="arrow_forward"
              >
                Mở Lịch Việt
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      {/* ──── §9 FOOTER — Multi-column SEO-rich ──── */}
      <footer className="border-t border-border-light/40 dark:border-mystery-purple/10 relative z-10 bg-surface-subtle-light dark:bg-mystery-deep">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-400">
                LỊCH VIỆT
              </span>
              <p className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-1.5 leading-relaxed">
                Ứng dụng tra cứu âm lịch, Dụng Sự, gieo quẻ và Tử Vi toàn diện nhất.
              </p>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Tính năng
              </p>
              <ul className="space-y-1.5">
                {[
                  { label: 'Âm Lịch', path: '/app/am-lich' },
                  { label: 'Dụng Sự', path: '/app/am-lich' },
                  { label: 'Gieo Quẻ', path: '/app/gieo-que' },
                ].map((f) => (
                  <li key={f.label}>
                    <button
                      onClick={() => navigate(f.path)}
                      className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/60 hover:text-gold dark:hover:text-gold-dark transition-colors"
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* More */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Thêm
              </p>
              <ul className="space-y-1.5">
                {[
                  { label: 'Nâng cấp', path: '/app/nang-cap' },
                  { label: 'Cài đặt', path: '/app/cai-dat' },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/60 hover:text-gold dark:hover:text-gold-dark transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Hỗ trợ
              </p>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => navigate('/app/nang-cap')}
                    className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/60 hover:text-gold dark:hover:text-gold-dark transition-colors"
                  >
                    Nâng cấp tài khoản
                  </button>
                </li>
                <li>
                  <span className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                    Liên hệ: support@lichviet.app
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-border-light/20 dark:border-border-dark/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60">
              © {new Date().getFullYear()} Lịch Việt. Tất cả tính toán chạy trên trình duyệt — dữ liệu riêng tư của bạn.
            </span>
            <span className="text-text-secondary-light/60 dark:text-text-secondary-dark/60 text-xs font-medium">
              v3.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
