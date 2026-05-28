import { useEffect, useRef, useState } from 'react';

/**
 * Landing Page Data & Utilities
 *
 * Feature data and helper functions
 * extracted from LandingPage.tsx to reduce file size.
 */

// ══════════════════════════════════════════════════════════
// Feature Data
// ══════════════════════════════════════════════════════════

export const FEATURES = [
  {
    id: 'am-lich',
    icon: 'calendar_month',
    title: 'Âm Lịch',
    desc: 'Tra cứu ngày âm lịch chính xác, giờ hoàng đạo, hướng xuất hành, tiết khí, can chi và tab Dụng Sự.',
    highlight: '24 tiết khí',
    glowColor: 'from-blue-400/20 to-blue-600/10',
    iconBg: 'bg-blue-500/12 dark:bg-blue-400/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    tier: 'Cơ bản',
  },
  {
    id: 'la-ban',
    icon: 'explore',
    title: 'La bàn',
    desc: 'La bàn Phong Thủy Việt Nam với 24 Sơn, Phi Tinh, hướng thật và cảm biến điện thoại trên mobile.',
    highlight: '24 sơn',
    glowColor: 'from-emerald-400/20 to-cyan-600/10',
    iconBg: 'bg-emerald-500/12 dark:bg-emerald-400/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tier: 'Cơ bản',
  },
  {
    id: 'gieo-que',
    icon: 'casino',
    title: 'Gieo Quẻ',
    desc: 'Mai Hoa Dịch Số — giải quẻ toàn diện với Thể Dụng, Hỗ Quái và Nạp Giáp.',
    highlight: '64 quẻ dịch',
    glowColor: 'from-purple-400/20 to-purple-600/10',
    iconBg: 'bg-purple-500/12 dark:bg-purple-400/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    tier: 'Cơ bản',
  },
  {
    id: 'tu-vi',
    icon: 'auto_awesome',
    title: 'Tử Vi',
    desc: 'Lập lá số Tử Vi Đẩu Số theo trường phái Thiên Lương với bố cục dễ đọc.',
    highlight: '12 cung',
    glowColor: 'from-amber-400/20 to-orange-600/10',
    iconBg: 'bg-amber-500/12 dark:bg-amber-400/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tier: 'Cơ bản',
  },
];

// ══════════════════════════════════════════════════════════
// Moon phase name helper
// ══════════════════════════════════════════════════════════

export function getMoonPhaseName(lunarDay: number): string {
  if (lunarDay <= 2 || lunarDay >= 29) return 'Trăng non';
  if (lunarDay <= 7) return 'Trăng lưỡi liềm đầu';
  if (lunarDay <= 9) return 'Bán nguyệt đầu';
  if (lunarDay <= 13) return 'Trăng khuyết đầu';
  if (lunarDay <= 16) return 'Trăng tròn';
  if (lunarDay <= 21) return 'Trăng khuyết sau';
  if (lunarDay <= 23) return 'Bán nguyệt cuối';
  return 'Trăng lưỡi liềm cuối';
}

// ══════════════════════════════════════════════════════════
// Landing Motion Helpers
// ══════════════════════════════════════════════════════════

export function useCountUp(target: number, duration = 1800, start = false): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let frameId = 0;
    const startTime = performance.now();

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [duration, start, target]);

  return count;
}

export function useInView(threshold = 0.25) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
