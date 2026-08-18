import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  CalendarCheck,
  X,
  Menu,
  Settings,
  Sliders,
  HelpCircle,
  Info,
  Heart,
  ArrowRight,
  ArrowLeft,
  User,
  ShieldCheck,
  Search,
  Download,
  Share2,
  Check,
  Copy,
  Sparkles,
  Compass,
  Sun,
  Moon,
  Zap,
  Award,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Camera,
  Lock,
  Unlock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  expand_more: ChevronDown,
  expand_less: ChevronUp,
  today: Calendar,
  calendar_today: Calendar,
  calendar_month: Calendar,
  event: CalendarCheck,
  event_available: CalendarCheck,
  close: X,
  menu: Menu,
  settings: Settings,
  tune: Sliders,
  help: HelpCircle,
  help_outline: HelpCircle,
  info: Info,
  info_outline: Info,
  favorite: Heart,
  favorite_border: Heart,
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  person: User,
  person_outline: User,
  account_circle: User,
  security: ShieldCheck,
  verified: ShieldCheck,
  verified_user: ShieldCheck,
  search: Search,
  download: Download,
  file_download: Download,
  share: Share2,
  check: Check,
  check_circle: Check,
  content_copy: Copy,
  auto_awesome: Sparkles,
  stars: Sparkles,
  sparkles: Sparkles,
  explore: Compass,
  public: Compass,
  wb_sunny: Sun,
  wb_twilight: Sun,
  nights_stay: Moon,
  bedtime: Moon,
  spa: Sparkles,
  bolt: Zap,
  military_tech: Award,
  error: AlertCircle,
  error_outline: AlertTriangle,
  warning: AlertTriangle,
  refresh: RotateCcw,
  autorenew: RotateCcw,
  photo_camera: Camera,
  lock: Lock,
  lock_open: Unlock,
};

export function renderDynamicIcon(icon: React.ReactNode | string | undefined, className?: string): React.ReactNode {
  if (!icon) return null;
  if (typeof icon !== 'string') return icon;

  const Matched = ICON_MAP[icon.trim()];
  if (Matched) {
    return <Matched className={cn('h-4 w-4 shrink-0', className)} aria-hidden="true" />;
  }

  return (
    <span className={cn('material-icons-round text-base shrink-0', className)} aria-hidden="true">
      {icon}
    </span>
  );
}
