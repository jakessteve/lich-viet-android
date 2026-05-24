/**
 * VerdictBanner — Hero result component for Dụng Sự
 * Large score + Vietnamese verdict + key context facts
 * Replaces small donut chart as the primary visual output.
 */

import React, { useEffect, useRef, useState } from 'react';

interface VerdictBannerProps {
  percentage: number;
  label: string;
  activityName: string;
  date: Date;
  hourChi?: string;
  dayType?: string; // "Hoàng Đạo" | "Hắc Đạo" | etc.
  lunarDateStr?: string; // e.g. "3/2/2026 — Giáp Ngọ"
  bestHourChi?: string; // e.g. "Mão"
  bestHourScore?: number;
  isBachSuHung?: boolean;
}

function getVerdict(pct: number): { text: string; emoji: string; bgGrad: string; textColor: string } {
  if (pct >= 80)
    return {
      text: 'Đại Cát',
      emoji: '✨',
      bgGrad:
        'from-emerald-500/15 via-emerald-400/10 to-green-400/5 dark:from-emerald-500/10 dark:via-emerald-600/8 dark:to-green-900/5',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    };
  if (pct >= 60)
    return {
      text: 'Tốt',
      emoji: '👍',
      bgGrad:
        'from-green-400/15 via-lime-400/10 to-emerald-300/5 dark:from-green-500/10 dark:via-lime-600/8 dark:to-emerald-900/5',
      textColor: 'text-green-600 dark:text-green-400',
    };
  if (pct >= 40)
    return {
      text: 'Bình thường',
      emoji: '⚖️',
      bgGrad:
        'from-amber-400/15 via-yellow-400/10 to-amber-300/5 dark:from-amber-500/10 dark:via-yellow-600/8 dark:to-amber-900/5',
      textColor: 'text-amber-600 dark:text-amber-400',
    };
  if (pct >= 20)
    return {
      text: 'Xấu',
      emoji: '⚠️',
      bgGrad:
        'from-orange-400/15 via-amber-400/10 to-orange-300/5 dark:from-orange-500/10 dark:via-amber-600/8 dark:to-orange-900/5',
      textColor: 'text-orange-600 dark:text-orange-400',
    };
  return {
    text: 'Đại Kỵ',
    emoji: '🚫',
    bgGrad: 'from-red-400/15 via-rose-400/10 to-red-300/5 dark:from-red-500/10 dark:via-rose-600/8 dark:to-red-900/5',
    textColor: 'text-red-600 dark:text-red-400',
  };
}

function getStrokeColor(pct: number): string {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return '#22c55e';
  if (pct >= 40) return '#f59e0b';
  if (pct >= 20) return '#f97316';
  return '#ef4444';
}

const VerdictBanner: React.FC<VerdictBannerProps> = ({
  percentage,
  label: _label,
  activityName,
  date,
  hourChi,
  dayType,
  lunarDateStr,
  bestHourChi,
  bestHourScore,
  isBachSuHung,
}) => {
  const [animatedPct, setAnimatedPct] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const delta = percentage - start;
    if (delta === 0) return;
    const duration = 800;
    const startTime = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedPct(Math.round(start + delta * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        prevRef.current = percentage;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  const verdict = getVerdict(percentage);
  const strokeColor = getStrokeColor(percentage);
  const dateStr = date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  // SVG ring
  const size = 120;
  const sw = 8;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (animatedPct / 100) * c;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border-light/50 dark:border-border-dark/50 bg-gradient-to-br ${verdict.bgGrad} animate-fade-in-up`}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${strokeColor}40, transparent)` }}
      />

      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
        {/* Left: Score ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={sw}
              className="text-gray-200/50 dark:text-gray-700/50"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={strokeColor}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
              style={{ filter: `drop-shadow(0 0 8px ${strokeColor}50)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl sm:text-4xl font-black tabular-nums ${verdict.textColor}`}>{animatedPct}%</span>
          </div>
        </div>

        {/* Right: Verdict info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {/* Verdict label */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-xl">{verdict.emoji}</span>
            <span className={`text-2xl sm:text-3xl font-black ${verdict.textColor}`}>{verdict.text}</span>
          </div>

          {/* Activity + date context */}
          <p className="text-sm text-text-primary-light dark:text-text-primary-dark font-medium mb-2">
            {activityName}
            {hourChi ? ` · Giờ ${hourChi}` : ''}
          </p>

          {/* Info badges row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/60 dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark">
              📅 {dateStr}
            </span>
            {dayType && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  dayType === 'Hoàng Đạo'
                    ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-gray-100/80 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400'
                }`}
              >
                {dayType === 'Hoàng Đạo' ? '🌟' : '🌑'} {dayType}
              </span>
            )}
            {bestHourChi && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 dark:bg-gold-dark/10 text-gold dark:text-gold-dark">
                ⏰ Giờ tốt nhất: {bestHourChi}
                {bestHourScore ? ` (${bestHourScore}%)` : ''}
              </span>
            )}
          </div>

          {lunarDateStr && (
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Âm lịch: {lunarDateStr}
            </p>
          )}

          {isBachSuHung && (
            <p className="text-xs text-red-500 dark:text-red-400 font-semibold mt-1.5 flex items-center gap-1">
              ⚠️ Ngày Bách Sự Hung — điểm bị giới hạn
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerdictBanner;
