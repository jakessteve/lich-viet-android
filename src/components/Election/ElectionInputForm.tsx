import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  Search,
  Loader2,
  Calendar,
  Sparkles,
  Heart,
  Store,
  Home,
  Hammer,
  Plane,
  FileSignature,
  MoreHorizontal,
  User,
  Clock,
} from 'lucide-react';
import { useElectionStore } from '../../stores/electionStore';
import type { ElectionActivityType, ElectionInput } from '../../types/election';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { parseIsoDate, toIsoDateString } from '../../stores/appStore';
import { getActivityById } from '@lich-viet/core/dungsu';

interface ActivityCardOption {
  id: ElectionActivityType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const WIZARD_ACTIVITIES: ActivityCardOption[] = [
  {
    id: 'cuoi-hoi',
    label: 'Cưới Hỏi',
    sublabel: 'Dạm ngõ, ăn hỏi, đón dâu',
    icon: <Heart className="h-5 w-5 text-rose-500" />,
  },
  {
    id: 'khai-truong',
    label: 'Khai Trương',
    sublabel: 'Mở cửa hàng, kinh doanh',
    icon: <Store className="h-5 w-5 text-amber-500" />,
  },
  {
    id: 'xay-dung',
    label: 'Động Thổ',
    sublabel: 'Khởi công, cất nóc, sửa chữa',
    icon: <Hammer className="h-5 w-5 text-orange-500" />,
  },
  {
    id: 'nhap-trach',
    label: 'Nhập Trạch',
    sublabel: 'Về nhà mới, an cư',
    icon: <Home className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: 'xuat-hanh',
    label: 'Xuất Hành',
    sublabel: 'Đi xa, nhận xe mới',
    icon: <Plane className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 'khac',
    label: 'Ký Kết & Khác',
    sublabel: 'Giao dịch, cầu tài, vạn sự',
    icon: <FileSignature className="h-5 w-5 text-purple-500" />,
  },
];

type TimePreset = '7days' | 'month' | '30days' | '90days' | 'custom';

export const ElectionInputForm: React.FC = () => {
  const location = useLocation();
  const initializedFromUrl = useRef(false);
  const user = useAuthStore((s) => s.user);
  const userProfile = useMemo(() => getUserBirthProfile(user), [user]);

  const { input, setInput, runScan, isScanning } = useElectionStore(
    useShallow((state) => ({
      input: state.input,
      setInput: state.setInput,
      runScan: state.runScan,
      isScanning: state.isScanning,
    })),
  );

  const [timePreset, setTimePreset] = useState<TimePreset>('30days');
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');

  // Auto-prefill birth year from profile if available and not yet set
  useEffect(() => {
    if (userProfile?.birthYear && !input.birthYear) {
      setInput({ birthYear: userProfile.birthYear });
    }
  }, [userProfile, input.birthYear, setInput]);

  // Handle URL query parameters for seamless deep linking
  useEffect(() => {
    if (initializedFromUrl.current) return;
    const params = new URLSearchParams(location.search);
    const startParam = params.get('start') || params.get('from');
    const endParam = params.get('end') || params.get('to');
    const actParam = (params.get('activity') || params.get('act')) as ElectionActivityType | null;

    if (startParam || endParam || actParam) {
      const nextUpdates: Partial<ElectionInput> = {};
      if (startParam) {
        const d = parseIsoDate(startParam);
        if (d) {
          d.setHours(0, 0, 0, 0);
          nextUpdates.startDate = d;
        }
      }
      if (endParam) {
        const d = parseIsoDate(endParam);
        if (d) {
          d.setHours(23, 59, 59, 999);
          nextUpdates.endDate = d;
        }
      }
      if (actParam && (WIZARD_ACTIVITIES.some((opt) => opt.id === actParam) || getActivityById(actParam))) {
        nextUpdates.activityType = actParam;
      }
      setInput(nextUpdates);
      setTimePreset('custom');
      initializedFromUrl.current = true;
      setTimeout(() => {
        void runScan();
      }, 100);
    }
  }, [location.search, setInput, runScan]);

  useEffect(() => {
    setStartStr(toIsoDateString(input.startDate));
    setEndStr(toIsoDateString(input.endDate));
  }, [input.startDate, input.endDate]);

  const applyTimePreset = (preset: TimePreset) => {
    setTimePreset(preset);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(now);
    const end = new Date(now);

    if (preset === '7days') {
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
    } else if (preset === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (preset === '30days') {
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
    } else if (preset === '90days') {
      end.setDate(end.getDate() + 90);
      end.setHours(23, 59, 59, 999);
    }

    if (preset !== 'custom') {
      setInput({ startDate: start, endDate: end });
    }
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartStr(val);
    setTimePreset('custom');
    if (val) {
      const d = new Date(val);
      d.setHours(0, 0, 0, 0);
      setInput({ startDate: d });
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndStr(val);
    setTimePreset('custom');
    if (val) {
      const d = new Date(val);
      d.setHours(23, 59, 59, 999);
      setInput({ endDate: d });
    }
  };

  return (
    <Card variant="glass" className="p-5 sm:p-7 rounded-3xl border border-border-light/70 dark:border-border-dark/70 shadow-sm space-y-6">
      {/* ── Step 1: Chọn việc cần làm (Activity Intent) ────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>1. Bạn cần chọn ngày cho việc gì?</span>
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {WIZARD_ACTIVITIES.map((act) => {
            const isSelected = input.activityType === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setInput({ activityType: act.id })}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/60 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-surface-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/60 hover:bg-surface-subtle-light/60'
                }`}
              >
                <div className="mt-0.5 shrink-0">{act.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark truncate">
                    {act.label}
                  </div>
                  <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark truncate mt-0.5">
                    {act.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Chọn khung thời gian (Timeframe Presets) ────────── */}
      <div className="space-y-3 pt-2 border-t border-border-light/40 dark:border-border-dark/30">
        <Label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-info" />
          <span>2. Khung thời gian tìm kiếm</span>
        </Label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyTimePreset('7days')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              timePreset === '7days'
                ? 'bg-info/10 text-info dark:text-info-dark border-info/50 shadow-xs'
                : 'bg-surface-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
            }`}
          >
            7 ngày tới
          </button>
          <button
            type="button"
            onClick={() => applyTimePreset('month')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              timePreset === 'month'
                ? 'bg-info/10 text-info dark:text-info-dark border-info/50 shadow-xs'
                : 'bg-surface-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
            }`}
          >
            Trong tháng này
          </button>
          <button
            type="button"
            onClick={() => applyTimePreset('30days')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              timePreset === '30days'
                ? 'bg-info/10 text-info dark:text-info-dark border-info/50 shadow-xs'
                : 'bg-surface-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
            }`}
          >
            30 ngày tới
          </button>
          <button
            type="button"
            onClick={() => applyTimePreset('90days')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              timePreset === '90days'
                ? 'bg-info/10 text-info dark:text-info-dark border-info/50 shadow-xs'
                : 'bg-surface-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
            }`}
          >
            3 tháng tới (Quý này)
          </button>
          <button
            type="button"
            onClick={() => applyTimePreset('custom')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              timePreset === 'custom'
                ? 'bg-info/10 text-info dark:text-info-dark border-info/50 shadow-xs'
                : 'bg-surface-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
            }`}
          >
            Tùy chọn ngày
          </button>
        </div>

        {/* Date Inputs (visible when custom or for fine adjustments) */}
        {timePreset === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 page-enter-smooth">
            <div className="space-y-1">
              <Label htmlFor="election-start-date" className="text-xs">Từ ngày</Label>
              <Input id="election-start-date" type="date" value={startStr} onChange={handleStartChange} className="h-10 text-xs sm:text-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="election-end-date" className="text-xs">Đến ngày</Label>
              <Input id="election-end-date" type="date" value={endStr} onChange={handleEndChange} min={startStr} className="h-10 text-xs sm:text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* ── Step 3: Bản mệnh chủ sự (Optional Personalization) ─────── */}
      <div className="space-y-2 pt-2 border-t border-border-light/40 dark:border-border-dark/30">
        <div className="flex items-center justify-between">
          <Label htmlFor="election-birth-year" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
            <User className="h-4 w-4 text-purple" />
            <span>3. Năm sinh chủ sự (Tính điểm tương hợp)</span>
          </Label>
          {userProfile?.birthYear && input.birthYear === userProfile.birthYear && (
            <span className="text-[11px] font-semibold text-purple dark:text-purple-dark">
              Đã lấy từ hồ sơ
            </span>
          )}
        </div>

        <Input
          id="election-birth-year"
          type="number"
          min="1900"
          max="2100"
          placeholder="Nhập năm sinh (VD: 1990) để lọc ngày hợp tuổi"
          value={input.birthYear || ''}
          onChange={(e) => setInput({ birthYear: e.target.value ? Number(e.target.value) : undefined })}
          className="h-11 text-xs sm:text-sm rounded-xl"
        />
      </div>

      {/* ── Search CTA ────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button
          onClick={() => {
            void runScan();
          }}
          disabled={isScanning}
          variant="default"
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tính toán & xếp hạng ngày tốt...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Tìm Ngày Hoàng Đạo Tốt Nhất</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
