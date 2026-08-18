import React, { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTuViStore } from '../../stores/tuviStore';
import type { TuViGioTyPolicy, TuViLeapMonthPolicy, TuViSchool, TuViTimePolicy } from '../../types/tuvi';
import { UnifiedBirthDataPicker, type UnifiedBirthData } from '../shared/UnifiedBirthDataPicker';
import { Sparkles, Loader2, Clock, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  {
    id: 'split-15',
    label: 'Phân nửa (Split-15)',
    description: 'Nhuận trước ngày 15 tháng trước, sau ngày 15 tháng sau',
  },
  { id: 'raw', label: 'Giữ nguyên tháng', description: 'Cả tháng nhuận tính theo tháng chính' },
];

const getTimezoneForLocation = (utcOffset: number) => {
  if (utcOffset === 7) return 'Asia/Ho_Chi_Minh';
  return `Etc/GMT${utcOffset >= 0 ? '-' : '+'}${Math.abs(utcOffset)}`;
};

const getChiHourFromClockHour = (hour: number) => (hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12);

export const TuViInputForm: React.FC = () => {
  const { input, setInput, calculateChart, isCalculating } = useTuViStore(
    useShallow((state) => ({
      input: state.input,
      setInput: state.setInput,
      calculateChart: state.calculateChart,
      isCalculating: state.isCalculating,
    })),
  );
  const [error, setError] = useState('');
  const [showExpertSettings, setShowExpertSettings] = useState(false);

  // Map TuVi store input to UnifiedBirthData
  const unifiedData: UnifiedBirthData = useMemo(() => ({
    birthDate: input.solarDate,
    birthHour: input.birthClockHour ?? (input.birthHour ? (input.birthHour === 0 ? 0 : input.birthHour * 2 - 1) : 0),
    birthMinute: input.birthMinute ?? 0,
    latitude: input.birthLocation?.lat ?? 21.0285,
    longitude: input.birthLocation?.lng ?? 105.8542,
    timezone: input.birthLocation?.timezone ?? 7,
    name: input.name,
    gender: input.gender === 'nữ' ? 'nu' : 'nam',
    locationName: input.birthLocation?.locationName ?? 'Hà Nội',
    isLeapMonth: input.isLeapMonth,
  }), [input]);

  const handleUnifiedChange = (data: UnifiedBirthData) => {
    const chiHour = getChiHourFromClockHour(data.birthHour);
    setInput({
      solarDate: data.birthDate,
      birthClockHour: data.birthHour,
      birthHour: chiHour,
      birthMinute: data.birthMinute,
      timezone: getTimezoneForLocation(data.timezone),
      name: data.name ?? input.name,
      gender: (data.gender === 'nu' || data.gender === 'female') ? 'nữ' : 'nam',
      birthLocation: {
        locationName: data.locationName ?? 'Tùy chỉnh',
        lat: data.latitude,
        lng: data.longitude,
        timezone: data.timezone,
        countryCode: data.countryCode,
        countryName: data.countryName,
      },
      isLeapMonth: data.isLeapMonth,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!input.solarDate || isNaN(input.solarDate.getTime())) {
      setError('Vui lòng chọn ngày giờ sinh hợp lệ.');
      return;
    }

    calculateChart();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UnifiedBirthDataPicker
        value={unifiedData}
        onChange={handleUnifiedChange}
        showName={true}
        showGender={true}
        showLunarToggle={true}
        showLocation={true}
        showProfilePrefill={true}
      />

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark font-semibold">
            <Clock className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
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
                    ? 'border-gold bg-gold/10 text-text-primary-light dark:border-gold dark:bg-gold/20 dark:text-gold-light shadow-sm font-semibold'
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
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-text-primary-light dark:text-gold-light hover:bg-gold/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gold dark:text-gold-dark" />
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
                          ? 'border-gold bg-gold/20 text-text-primary-light dark:text-gold-light font-bold'
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
                            ? 'border-gold bg-gold/20 text-text-primary-light dark:text-gold-light font-bold'
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
                            ? 'border-gold bg-gold/20 text-text-primary-light dark:text-gold-light font-bold'
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
