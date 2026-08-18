import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTuViStore } from '../../stores/tuviStore';
import { useAuthStore } from '../../stores/authStore';
import type { TuViGender, TuViGioTyPolicy, TuViLeapMonthPolicy, TuViSchool, TuViTimePolicy } from '../../types/tuvi';
import { TuViLocationPicker } from './TuViLocationPicker';
import { buildTuViInputFromUser, getUserBirthProfile } from '@/utils/userBirthProfile';
import { Sparkles, Loader2, Clock, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const TIME_POLICY_OPTIONS: { id: TuViTimePolicy; label: string; description: string }[] = [
  {
    id: 'historical-vietnam',
    label: 'Lịch Vạn Niên (Chuẩn)',
    description: 'Giờ chuẩn Việt Nam (GMT+7) có bù trừ lịch sử 1955-1975',
  },
  {
    id: 'true-solar',
    label: 'Mặt Trời Thực',
    description: 'Hiệu chỉnh kinh độ địa lý & phương trình thời gian thiên văn',
  },
  {
    id: 'civil',
    label: 'Giờ Dân Sự',
    description: 'Giữ nguyên giờ đồng hồ theo múi giờ đã chọn',
  },
];

const SCHOOL_OPTIONS: { id: TuViSchool; label: string; description: string }[] = [
  { id: 'thien-luong', label: 'Thiên Lương', description: 'Kình Đà thuận nghịch theo Âm Dương, Lộc Tồn chuẩn' },
  { id: 'nam-phai', label: 'Nam Phái', description: 'Toàn Thư cổ truyền, Kình Đà cố định quanh Lộc Tồn' },
  { id: 'bac-phai', label: 'Bắc Phái', description: 'Khâm Thiên Môn, Tứ Hóa Trung Châu, tứ hóa phi cung' },
  { id: 'phi-tinh', label: 'Phi Tinh', description: 'Lương phái phi tinh, nhấn mạnh tự hóa và giao dịch' },
];

const GIO_TY_OPTIONS: { id: TuViGioTyPolicy; label: string; description: string }[] = [
  { id: 'next-day-standard', label: 'Chuyển ngày (23h)', description: 'Giờ Tý đêm (23h-24h) thuộc ngày hôm sau' },
  { id: 'da-ty-split', label: 'Dạ Tý phân biệt', description: 'Giờ Tý đêm (23h-24h) giữ nguyên Can Chi ngày cũ' },
];

const LEAP_MONTH_OPTIONS: { id: TuViLeapMonthPolicy; label: string; description: string }[] = [
  { id: 'split-15', label: 'Phân nửa (Split-15)', description: 'Nhuận trước ngày 15 tháng trước, sau ngày 15 tháng sau' },
  { id: 'raw', label: 'Giữ nguyên tháng', description: 'Cả tháng nhuận tính theo tháng chính' },
];

const getTimezoneForLocation = (utcOffset: number) => {
  if (utcOffset === 7) return 'Asia/Ho_Chi_Minh';
  return `Etc/GMT${utcOffset >= 0 ? '-' : '+'}${Math.abs(utcOffset)}`;
};

const getChiHourFromClockHour = (hour: number) => (hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12);
const clampTimePart = (value: string, max: number) => {
  if (value.trim() === '') return 0;
  return Math.min(max, Math.max(0, Number(value)));
};

export const TuViInputForm: React.FC = () => {
  const { input, setInput, calculateChart, isCalculating } = useTuViStore(
    useShallow((state) => ({
      input: state.input,
      setInput: state.setInput,
      calculateChart: state.calculateChart,
      isCalculating: state.isCalculating,
    })),
  );
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState('');
  const [showExpertSettings, setShowExpertSettings] = useState(false);
  const didPrefill = useRef(false);
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);

  // Local string state for date inputs
  const [dayStr, setDayStr] = useState(String(input.solarDate.getDate()));
  const [monthStr, setMonthStr] = useState(String(input.solarDate.getMonth() + 1));
  const [yearStr, setYearStr] = useState(String(input.solarDate.getFullYear()));
  const [hourStr, setHourStr] = useState(String(input.birthClockHour ?? 0));
  const [minuteStr, setMinuteStr] = useState(String(input.birthMinute ?? 0));

  // Sync local strings when the store date changes externally
  useEffect(() => {
    setDayStr(String(input.solarDate.getDate()));
    setMonthStr(String(input.solarDate.getMonth() + 1));
    setYearStr(String(input.solarDate.getFullYear()));
  }, [input.solarDate]);

  useEffect(() => {
    setHourStr(String(input.birthClockHour ?? 0));
    setMinuteStr(String(input.birthMinute ?? 0));
  }, [input.birthClockHour, input.birthMinute]);

  /** Commit local date strings into a real Date and push to store */
  const commitDate = () => {
    const d = parseInt(dayStr, 10);
    const m = parseInt(monthStr, 10);
    const y = parseInt(yearStr, 10);
    if (!d || !m || !y) return;
    const normalizedHour = clampTimePart(hourStr, 23);
    const normalizedMinute = clampTimePart(minuteStr, 59);
    const date = new Date(y, m - 1, d, normalizedHour, normalizedMinute);
    const actualDay = date.getDate();
    const actualMonth = date.getMonth() + 1;
    const actualYear = date.getFullYear();
    setDayStr(String(actualDay));
    setMonthStr(String(actualMonth));
    setYearStr(String(actualYear));
    setHourStr(String(normalizedHour));
    setMinuteStr(String(normalizedMinute));
    setInput({
      solarDate: date,
      birthClockHour: normalizedHour,
      birthMinute: normalizedMinute,
      birthHour: getChiHourFromClockHour(normalizedHour),
    });
  };

  const commitTime = () => {
    const normalizedHour = clampTimePart(hourStr, 23);
    const normalizedMinute = clampTimePart(minuteStr, 59);
    setHourStr(String(normalizedHour));
    setMinuteStr(String(normalizedMinute));
    setInput({
      birthClockHour: normalizedHour,
      birthMinute: normalizedMinute,
      birthHour: getChiHourFromClockHour(normalizedHour),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const d = parseInt(dayStr, 10);
    const m = parseInt(monthStr, 10);
    const y = parseInt(yearStr, 10);

    if (!d || !m || !y) {
      setError('Vui lòng nhập đầy đủ ngày, tháng, năm sinh hợp lệ.');
      return;
    }
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
      setError('Ngày tháng năm sinh không hợp lệ (1900 - 2100).');
      return;
    }

    const normalizedHour = clampTimePart(hourStr, 23);
    const normalizedMinute = clampTimePart(minuteStr, 59);
    const validatedDate = new Date(y, m - 1, d, normalizedHour, normalizedMinute);

    if (
      validatedDate.getFullYear() !== y ||
      validatedDate.getMonth() !== m - 1 ||
      validatedDate.getDate() !== d
    ) {
      setError('Ngày không tồn tại trong tháng này.');
      return;
    }

    setInput({
      solarDate: validatedDate,
      birthClockHour: normalizedHour,
      birthMinute: normalizedMinute,
      birthHour: getChiHourFromClockHour(normalizedHour),
    });

    calculateChart();
  };

  const handleApplySavedProfile = useCallback(() => {
    if (!user) return;
    const profileInput = buildTuViInputFromUser(user);
    if (!profileInput) return;
    setInput(profileInput);
    calculateChart();
  }, [user, setInput, calculateChart]);

  useEffect(() => {
    if (didPrefill.current) return;
    if (userBirthProfile?.birthYear) {
      handleApplySavedProfile();
      didPrefill.current = true;
    }
  }, [userBirthProfile?.birthYear, handleApplySavedProfile]);

  const profileDateControl =
    'surface-control w-full rounded-xl px-2.5 py-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold/40 border border-border-light/60 dark:border-border-dark/60';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {userBirthProfile?.birthYear && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold/25 bg-gold/10 p-3 text-xs text-gold dark:border-gold/30 dark:bg-gold/15 dark:text-gold-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-gold dark:text-gold-dark" />
            <span>
              Đang có hồ sơ: <strong>{user?.displayName || 'Tài khoản'}</strong>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplySavedProfile}
            className="h-7 text-xs font-semibold rounded-lg"
          >
            Điền nhanh hồ sơ
          </Button>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="tuviName">Họ và tên</Label>
        <Input
          id="tuviName"
          type="text"
          value={input.name}
          onChange={(e) => setInput({ name: e.target.value })}
          placeholder="VD: Nguyễn Văn A"
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Ngày giờ sinh (Dương lịch)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Ngày"
            placeholder="Ngày"
            value={dayStr}
            onChange={(e) => setDayStr(e.target.value)}
            onBlur={commitDate}
            className={profileDateControl}
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Tháng"
            placeholder="Tháng"
            value={monthStr}
            onChange={(e) => setMonthStr(e.target.value)}
            onBlur={commitDate}
            className={profileDateControl}
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Năm"
            placeholder="Năm"
            value={yearStr}
            onChange={(e) => setYearStr(e.target.value)}
            onBlur={commitDate}
            className={cn(profileDateControl, 'col-span-2 sm:col-span-1')}
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Giờ"
            placeholder="Giờ"
            value={hourStr}
            onChange={(e) => {
              setHourStr(e.target.value.replace(/[^\d]/g, '').slice(0, 2));
            }}
            onBlur={commitTime}
            className={profileDateControl}
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Phút"
            placeholder="Phút"
            value={minuteStr}
            onChange={(e) => {
              setMinuteStr(e.target.value.replace(/[^\d]/g, '').slice(0, 2));
            }}
            onBlur={commitTime}
            className={profileDateControl}
          />
        </div>
        <p className="mt-1 text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/70">
          Giờ Tử Vi được tự động quy đổi từ giờ đồng hồ.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Giới tính</Label>
        <div className="surface-panel grid grid-cols-2 gap-2 rounded-2xl p-1">
          {(['nam', 'nữ'] as TuViGender[]).map((g) => (
            <label
              key={g}
              className={cn(
                'flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200 spring-press',
                input.gender === g
                  ? 'bg-white text-gold shadow-sm dark:bg-white/15 dark:text-gold-light font-semibold'
                  : 'text-text-secondary-light hover:bg-surface-container-lowest dark:text-text-secondary-dark dark:hover:bg-white/10',
              )}
            >
              <input
                type="radio"
                name="tuvi-gender"
                value={g}
                checked={input.gender === g}
                onChange={() => setInput({ gender: g })}
                className="sr-only"
              />
              <span className="text-sm font-medium capitalize">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Nơi sinh</Label>
        <TuViLocationPicker
          value={input.birthLocation}
          onChange={(birthLocation) =>
            setInput({
              birthLocation,
              timezone: getTimezoneForLocation(birthLocation.timezone),
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <Clock className="h-3.5 w-3.5 text-gold" />
            Quy chuẩn giờ sinh
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          {TIME_POLICY_OPTIONS.map((opt) => {
            const isSelected = (input.timePolicy ?? 'historical-vietnam') === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setInput({ timePolicy: opt.id })}
                className={cn(
                  'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all spring-press',
                  isSelected
                    ? 'border-gold bg-gold/10 text-gold-dark dark:border-gold dark:bg-gold/20 dark:text-gold-light shadow-sm font-semibold'
                    : 'surface-control text-text-secondary-light hover:bg-surface-container-lowest dark:text-text-secondary-dark dark:hover:bg-white/10',
                )}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] opacity-75 line-clamp-1 mt-0.5">{opt.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gold/30 bg-gold/5 dark:bg-gold/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExpertSettings(!showExpertSettings)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-gold-dark dark:text-gold-light hover:bg-gold/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gold" />
            <span>Tùy chọn học thuật chuyên sâu (Trường phái & Quy tắc)</span>
          </div>
          {showExpertSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showExpertSettings && (
          <div className="p-3 pt-1 space-y-3 border-t border-gold/20 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Trường phái an sao & Tứ Hóa
              </Label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {SCHOOL_OPTIONS.map((opt) => {
                  const isSelected = (input.school ?? 'thien-luong') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setInput({ school: opt.id })}
                      className={cn(
                        'flex flex-col items-start p-2 rounded-lg border text-left transition-all',
                        isSelected
                          ? 'border-gold bg-gold/20 text-gold-dark dark:text-gold-light font-bold'
                          : 'surface-control text-text-secondary-light dark:text-text-secondary-dark opacity-80 hover:opacity-100',
                      )}
                    >
                      <span className="font-semibold text-[11px]">{opt.label}</span>
                      <span className="text-[9px] opacity-75 line-clamp-1">{opt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Quy ước Giờ Tý (23h - 01h)
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GIO_TY_OPTIONS.map((opt) => {
                    const isSelected = (input.gioTyPolicy ?? 'next-day-standard') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setInput({ gioTyPolicy: opt.id })}
                        className={cn(
                          'p-2 rounded-lg border text-left transition-all',
                          isSelected
                            ? 'border-gold bg-gold/20 text-gold-dark dark:text-gold-light font-bold'
                            : 'surface-control text-text-secondary-light dark:text-text-secondary-dark opacity-80 hover:opacity-100',
                        )}
                      >
                        <div className="font-semibold text-[11px]">{opt.label}</div>
                        <div className="text-[9px] opacity-75 line-clamp-1">{opt.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Quy ước Tháng Nhuận
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {LEAP_MONTH_OPTIONS.map((opt) => {
                    const isSelected = (input.leapMonthPolicy ?? 'split-15') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setInput({ leapMonthPolicy: opt.id })}
                        className={cn(
                          'p-2 rounded-lg border text-left transition-all',
                          isSelected
                            ? 'border-gold bg-gold/20 text-gold-dark dark:text-gold-light font-bold'
                            : 'surface-control text-text-secondary-light dark:text-text-secondary-dark opacity-80 hover:opacity-100',
                        )}
                      >
                        <div className="font-semibold text-[11px]">{opt.label}</div>
                        <div className="text-[9px] opacity-75 line-clamp-1">{opt.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isCalculating}
        variant="gold"
        className="w-full py-3.5 h-12 text-sm font-bold shadow-md hover:shadow-lg gap-2"
      >
        {isCalculating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tính lá số...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Xem Lá Số
          </>
        )}
      </Button>
    </form>
  );
};
