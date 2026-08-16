import { useEffect, useRef, useState } from 'react';
import { Calendar, CalendarCheck, Sparkles, Globe, Dices, type LucideIcon } from 'lucide-react';

/**
 * Landing Page Data & Utilities
 *
 * Feature data and helper functions
 * extracted from LandingPage.tsx to reduce file size.
 */

// ══════════════════════════════════════════════════════════
// Feature Data
// ══════════════════════════════════════════════════════════

export interface FeatureItem {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  highlight: string;
  glowColor: string;
  iconBg: string;
  iconColor: string;
  tier: string;
}

export const FEATURES: FeatureItem[] = [
  {
    id: 'am-lich',
    icon: Calendar,
    title: 'Âm Lịch',
    desc: 'Tra cứu ngày âm lịch chính xác, giờ hoàng đạo, hướng xuất hành, tiết khí, can chi và tab Dụng Sự.',
    highlight: '24 tiết khí',
    glowColor: 'from-blue-400/20 to-blue-600/10',
    iconBg: 'bg-blue-500/12 dark:bg-blue-400/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    tier: 'Cơ bản',
  },
  {
    id: 'ngay-tot',
    icon: CalendarCheck,
    title: 'Ngày Tốt',
    desc: 'Tìm ngày giờ tốt cho hôn lễ, khai trương, xây dựng — dựa trên chấm điểm Đông-Tây-Ấn.',
    highlight: '3 hệ chấm điểm',
    glowColor: 'from-emerald-400/20 to-teal-600/10',
    iconBg: 'bg-emerald-500/12 dark:bg-emerald-400/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tier: 'Cơ bản',
  },
  {
    id: 'tu-vi',
    icon: Sparkles,
    title: 'Tử Vi',
    desc: 'Lập lá số Tử Vi Đẩu Số theo trường phái Thiên Lương, Phi Tinh, Nam Phái với bố cục trực quan.',
    highlight: '12 cung & phi tinh',
    glowColor: 'from-amber-400/20 to-orange-600/10',
    iconBg: 'bg-amber-500/12 dark:bg-amber-400/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tier: 'Cơ bản',
  },
  {
    id: 'chiem-tinh',
    icon: Globe,
    title: 'Chiêm Tinh',
    desc: 'Chiêm tinh Tây phương, Vedic (Jyotish) và so sánh lá số hợp duyên — đa hệ, toàn diện.',
    highlight: 'Đa hệ chiêm tinh',
    glowColor: 'from-indigo-400/20 to-violet-600/10',
    iconBg: 'bg-indigo-500/12 dark:bg-indigo-400/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    tier: 'Cơ bản',
  },
  {
    id: 'gieo-que',
    icon: Dices,
    title: 'Gieo Quẻ',
    desc: 'Mai Hoa Dịch Số & Tam Thức — giải quẻ toàn diện với Thể Dụng, Hỗ Quái và Nạp Giáp.',
    highlight: '64 quẻ dịch',
    glowColor: 'from-purple-400/20 to-purple-600/10',
    iconBg: 'bg-purple-500/12 dark:bg-purple-400/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
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

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return () => {};
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      return () => {};
    }

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
