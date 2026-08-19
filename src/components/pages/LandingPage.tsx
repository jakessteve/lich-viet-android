import React, { useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
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
import StatsSection from './LandingPage/StatsSection';
import { FEATURES, getMoonPhaseName } from './LandingPage/landingPageData';
import MoonPhaseSVG from './LandingPage/MoonPhaseSVG';
import HeroAuspiciousArt from './LandingPage/HeroAuspiciousArt';
import MysticBackgroundPattern from './LandingPage/MysticBackgroundPattern';
import LandingNav from './LandingPage/LandingNav';
import { ActionButton } from '../shared';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Crown,
  ArrowRight,
  Calendar,
  Clock,
  Sun,
  ChevronDown,
  Compass,
  Atom,
  AlertTriangle,
  Info,
} from 'lucide-react';

const TRUST_VALUES = [
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: 'Chuẩn học thuật',
    desc: 'Thuật toán được đối chiếu với các tài liệu cổ học uy tín — đảm bảo chính xác từng con số.',
    accent: 'from-blue-400/25 to-blue-600/10',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Tôn trọng trải nghiệm',
    desc: 'Không popup, không banner, không theo dõi. Trải nghiệm sạch sẽ như ứng dụng bạn xứng đáng.',
    accent: 'from-emerald-400/25 to-emerald-600/10',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Dữ liệu không rời thiết bị',
    desc: 'Ngày sinh, lá số, kết quả — tất cả chỉ nằm trên trình duyệt. Không gửi đến máy chủ nào.',
    accent: 'from-purple-400/25 to-purple-600/10',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
] as const;

export default function LandingPage() {
  usePageTitle('Tra cứu Âm Lịch, Gieo Quẻ & Tử Vi');
  const navigate = useNavigate();

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
  const qualityLabel = isGoodDay ? 'Ngày Hoàng Đạo' : today.quality === 'Bad' ? 'Ngày Hắc Đạo' : 'Ngày Bình Thường';
  const QualityIconComponent = isGoodDay ? CheckCircle2 : today.quality === 'Bad' ? AlertTriangle : Info;
  const qualityColor = isGoodDay
    ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-400/8 border-emerald-500/15 dark:border-emerald-400/15'
    : today.quality === 'Bad'
      ? 'text-red-500 dark:text-red-400 bg-red-500/8 dark:bg-red-400/8 border-red-500/15 dark:border-red-400/15'
      : 'text-amber-800 dark:text-amber-300 bg-amber-500/8 dark:bg-amber-400/8 border-amber-500/15 dark:border-amber-400/15';

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* ──── Subtle hero texture ──── */}
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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
                willChange: 'transform',
              }}
            />
          ))}
        </div>
      </div>

      {/* ──── Floating Nav ──── */}
      <LandingNav />

      {/* ════════════════════════════════════════════════════════
           §1 HERO — Benefit-driven headline + 3-card grid
         ════════════════════════════════════════════════════════ */}
      <section className="relative px-5 pt-28 pb-8 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-gold/5 dark:from-gold/3 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-amber-500/4 dark:bg-mystery-purple/6 rounded-full blur-3xl" />
        </div>

        {/* Auspicious Art Background (Shifted 1/3 width to the right) */}
        <div className="absolute top-2 right-0 translate-x-1/3 h-[560px] w-[560px] opacity-[0.24] dark:opacity-[0.26] pointer-events-none z-[1] sm:top-0 sm:h-[720px] sm:w-[720px] sm:opacity-[0.6] lg:h-[900px] lg:w-[900px] lg:opacity-[0.8] lg:dark:opacity-[0.7]">
          <HeroAuspiciousArt />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* ── Headline block ── */}
          <div className="text-left max-w-3xl mb-16 relative z-10">
            {/* Authority badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low dark:bg-gold-dark/6 mb-5 backdrop-blur-sm">
              <Atom className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
              <span className="text-xs font-medium text-gold dark:text-gold-dark tracking-wide">
                Tính toán thiên văn chính xác
              </span>
            </div>

            {/* Main semantic h1 */}
            <h1 className="text-display font-serif mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-text-primary-light to-text-secondary-light dark:from-white dark:to-gray-400">
                Khám phá
              </span>
              <br />
              <span className="mystery-text-glow bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300">
                vận mệnh của bạn
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-8 max-w-xl">
              5 phân hệ cốt lõi trong một ứng dụng.
              <br className="hidden sm:block" />
              Âm Lịch (kèm Dụng Sự), Ngày Tốt, Tử Vi, Chiêm Tinh và Gieo Quẻ —{' '}
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                chính xác theo chuẩn học thuật.
              </span>
            </p>

            {/* CTA buttons */}
            <div className="relative z-20 isolate space-y-3">
              <div className="flex flex-wrap items-center justify-start gap-4">
                <ActionButton
                  onClick={() => navigate('/app/am-lich')}
                  className="px-6 py-3.5 text-sm font-bold shadow-lg shadow-gold/20 hover:shadow-gold/30 cursor-pointer"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Khám phá ngay
                </ActionButton>
                <ActionButton
                  onClick={() => navigate('/app/nang-cap')}
                  variant="secondary"
                  className="px-5 py-3.5 text-sm font-semibold cursor-pointer border border-border-light dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                  icon={<Crown className="h-4 w-4" />}
                >
                  Xem các gói
                </ActionButton>
              </div>

              {/* Trust signals & privacy badge */}
              <div className="flex items-center gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark flex-wrap pt-1">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-good dark:text-good-dark" />
                  <span>Miễn phí 100%</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-info dark:text-info-dark" />
                  <span>Không cần đăng ký</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-purple dark:text-purple-dark" />
                  <span>Bảo mật offline</span>
                </span>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════
               Symmetric 3-card grid: Today | Birthday | Cosmic
             ══════════════════════════════════════════════════════ */}
          <div id="cosmic-section" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ── Card 1: Today's Details ── */}
            <button
              onClick={() => navigate('/app/am-lich')}
              className="group glass-card glass-noise p-5 text-left hover-lift cursor-pointer flex flex-col rounded-2xl border border-border-light/60 dark:border-border-dark/60"
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
                    <QualityIconComponent className="h-3 w-3" />
                    {qualityLabel}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary-light/60 dark:text-text-secondary-dark/60 group-hover:text-gold dark:group-hover:text-gold-dark transition-colors" />
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
                  <Calendar className="h-3.5 w-3.5 text-gold/50 dark:text-gold-dark/40" />
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
                  <Clock className="h-3.5 w-3.5 text-gold/50 dark:text-gold-dark/40" />
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    {today.auspiciousHoursCount} giờ hoàng đạo
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Sun className="h-3.5 w-3.5 text-gold/50 dark:text-gold-dark/40" />
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    {today.solarTerm || 'Tiết khí đang cập nhật'}
                  </span>
                </div>
              </div>
            </button>

            {/* ── Card 2: Vận Khí Vũ Trụ (Cosmic Weather) ── */}
            <CosmicWeatherCard navigate={navigate} today={today} />

            {/* ── Card 3: Khám Phá Nhanh (Birthday Input) ── */}
            <div className="flex flex-col">
              <HeroBirthdayInput onNavigate={navigate} />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-10 sm:mt-12 py-2">
            <button
              type="button"
              onClick={() => document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1.5 text-text-secondary-light/70 dark:text-text-secondary-dark/70 hover:text-text-primary-light dark:hover:text-gold-dark transition-colors cursor-pointer select-none group"
              aria-label="Cuộn xuống để xem thêm"
            >
              <span className="text-xs font-semibold tracking-wider uppercase">Khám phá thêm</span>
              <ChevronDown className="h-4 w-4 animate-bounce group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §2 STATS — Trust counters
         ════════════════════════════════════════════════════════ */}
      <StatsSection />

      {/* ════════════════════════════════════════════════════════
           §3 FEATURES & TRUST — Core modules with emotional value
         ════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 relative z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-20%] md:right-[0%] w-[800px] h-[800px] opacity-40 dark:opacity-60 pointer-events-none z-0">
          <MysticBackgroundPattern variant="luoshu" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold dark:text-gold-dark mb-2">
              Phân Hệ Tính Năng
            </p>
            <h2 className="text-h2 mystery-text-glow mb-3">5 phân hệ trong một ứng dụng</h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-lg mx-auto">
              Hội tụ Lịch Âm & Dụng Sự, Ngày Tốt Tam Hệ, Tử Vi Đẩu Số, Chiêm Tinh Học và Gieo Quẻ Mai Hoa.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/app/${f.id}`)}
                className="surface-interactive group relative w-full h-full flex flex-col justify-start items-start text-left p-6 bg-surface-container-lowest dark:bg-surface-dark hover:bg-surface-bright rounded-2xl border border-border-light/60 dark:border-border-dark/60"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.glowColor} dark:opacity-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none`}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold">{f.title}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-gold/8 dark:bg-gold-dark/6 text-[10px] font-bold text-gold dark:text-gold-dark uppercase tracking-wider">
                        {f.highlight}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="absolute top-4 right-3 h-4 w-4 text-text-secondary-light/60 dark:text-text-secondary-dark/60 group-hover:text-gold dark:group-hover:text-gold-dark group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          {/* Trust Values Sub-section */}
          <div className="pt-8 border-t border-border-light/20 dark:border-border-dark/20">
            <div className="text-center mb-8">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">Được xây dựng vì người dùng</h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Quyền riêng tư và độ chính xác là ưu tiên hàng đầu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TRUST_VALUES.map((v) => (
                <div
                  key={v.title}
                  className="surface-interactive group p-6 bg-surface-container-lowest dark:bg-surface-dark hover:bg-surface-bright rounded-2xl border border-border-light/60 dark:border-border-dark/60"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 ${v.iconColor}`}
                  >
                    {v.icon}
                  </div>
                  <h4 className="text-sm font-bold mb-1.5">{v.title}</h4>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
           §4 TESTIMONIALS — Social proof
         ════════════════════════════════════════════════════════ */}
      <TestimonialSection />

      {/* ════════════════════════════════════════════════════════
           §5 CLOSING CTA — Urgency & action
         ════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="surface-card rounded-3xl p-10 sm:p-12 relative overflow-hidden border border-border-light/60 dark:border-border-dark/60">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-mystery-purple/8 dark:from-mystery-purple/12 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-gold/6 dark:from-gold/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 dark:bg-gold-dark/8 flex items-center justify-center mx-auto mb-4">
                <Compass className="h-6 w-6 text-gold dark:text-gold-dark" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Sẵn sàng khám phá vận mệnh?</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                Trải nghiệm lịch âm, gieo quẻ và nhiều công cụ ngay bây giờ.
              </p>
              {isGoodDay && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hôm nay là ngày Hoàng Đạo — thời điểm tốt để bắt đầu!
                </p>
              )}
              <div className="relative z-20 isolate flex justify-center">
                <ActionButton
                  onClick={() => navigate('/app/am-lich')}
                  className="px-8 py-3.5 font-bold cursor-pointer"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Mở Lịch Việt
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── §6 FOOTER — Multi-column SEO-rich ──── */}
      <footer className="border-t border-border-light/40 dark:border-mystery-purple/10 relative z-10 bg-surface-subtle-light dark:bg-mystery-deep">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-400">
                LỊCH VIỆT
              </span>
              <p className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-1.5 leading-relaxed">
                Ứng dụng tra cứu âm lịch, Dụng Sự, gieo quẻ và Tử Vi toàn diện.
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
                  { label: 'Ngày Tốt', path: '/app/ngay-tot' },
                  { label: 'Tử Vi', path: '/app/tu-vi' },
                  { label: 'Chiêm Tinh', path: '/app/chiem-tinh' },
                  { label: 'Gieo Quẻ', path: '/app/gieo-que' },
                ].map((f) => (
                  <li key={f.label}>
                    <button
                      onClick={() => navigate(f.path)}
                      className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-gold-dark transition-colors"
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
                      className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-gold-dark transition-colors"
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
                    className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-gold-dark transition-colors"
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
              v1.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
