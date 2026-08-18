import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TuViLocationPicker } from '../TuVi/TuViLocationPicker';
import { getLunarDate } from '@/utils/calendarEngine';
import { useAuthStore } from '@/stores/authStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { Sparkles, Calendar, Clock, User, Compass } from 'lucide-react';

export interface UnifiedBirthData {
  birthDate: Date;
  birthHour: number;
  birthMinute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  name?: string;
  gender?: 'nam' | 'nu' | 'male' | 'female';
  locationName?: string;
  countryCode?: string;
  countryName?: string;
  isLunar?: boolean;
  isLeapMonth?: boolean;
}

export interface UnifiedBirthDataPickerProps {
  value: UnifiedBirthData;
  onChange: (value: UnifiedBirthData) => void;
  showName?: boolean;
  showGender?: boolean;
  showLunarToggle?: boolean;
  showLocation?: boolean;
  showProfilePrefill?: boolean;
  className?: string;
}

const CHI_HOURS = [
  'Tý (23:00 - 00:59)',
  'Sửu (01:00 - 02:59)',
  'Dần (03:00 - 04:59)',
  'Mão (05:00 - 06:59)',
  'Thìn (07:00 - 08:59)',
  'Tỵ (09:00 - 10:59)',
  'Ngọ (11:00 - 12:59)',
  'Mùi (13:00 - 14:59)',
  'Thân (15:00 - 16:59)',
  'Dậu (17:00 - 17:59)',
  'Tuất (19:00 - 20:59)',
  'Hợi (21:00 - 22:59)',
];

const getChiHourIndex = (hour: number) => (hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12);

const clamp = (val: string, min: number, max: number, fallback: number) => {
  if (val.trim() === '') return fallback;
  const num = parseInt(val, 10);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
};

export const UnifiedBirthDataPicker: React.FC<UnifiedBirthDataPickerProps> = ({
  value,
  onChange,
  showName = false,
  showGender = true,
  showLunarToggle = true,
  showLocation = true,
  showProfilePrefill = true,
  className = '',
}) => {
  const user = useAuthStore((s) => s.user);
  const userProfile = useMemo(() => getUserBirthProfile(user), [user]);

  const [dayStr, setDayStr] = useState(String(value.birthDate.getDate()));
  const [monthStr, setMonthStr] = useState(String(value.birthDate.getMonth() + 1));
  const [yearStr, setYearStr] = useState(String(value.birthDate.getFullYear()));
  const [hourStr, setHourStr] = useState(String(value.birthHour ?? 0));
  const [minuteStr, setMinuteStr] = useState(String(value.birthMinute ?? 0));
  const [nameStr, setNameStr] = useState(value.name || '');

  // Keep local strings in sync when value changes externally
  useEffect(() => {
    setDayStr(String(value.birthDate.getDate()));
    setMonthStr(String(value.birthDate.getMonth() + 1));
    setYearStr(String(value.birthDate.getFullYear()));
    setHourStr(String(value.birthHour ?? 0));
    setMinuteStr(String(value.birthMinute ?? 0));
    if (showName) setNameStr(value.name || '');
  }, [value, showName]);

  const currentChiHour = useMemo(() => {
    const h = parseInt(hourStr, 10) || 0;
    return CHI_HOURS[getChiHourIndex(h)];
  }, [hourStr]);

  const lunarConverted = useMemo(() => {
    try {
      const d = parseInt(dayStr, 10) || value.birthDate.getDate();
      const m = parseInt(monthStr, 10) || value.birthDate.getMonth() + 1;
      const y = parseInt(yearStr, 10) || value.birthDate.getFullYear();
      const date = new Date(y, m - 1, d);
      const lunar = getLunarDate(date);
      return `Âm lịch: Ngày ${lunar.day}/${lunar.month}/${lunar.year}${lunar.isLeap ? ' (Nhuận)' : ''}`;
    } catch {
      return '';
    }
  }, [dayStr, monthStr, value.birthDate, yearStr]);

  const commitData = useCallback(() => {
    const d = clamp(dayStr, 1, 31, value.birthDate.getDate());
    const m = clamp(monthStr, 1, 12, value.birthDate.getMonth() + 1);
    const y = clamp(yearStr, 1900, 2100, value.birthDate.getFullYear());
    const h = clamp(hourStr, 0, 23, value.birthHour ?? 0);
    const min = clamp(minuteStr, 0, 59, value.birthMinute ?? 0);

    const finalDate = new Date(y, m - 1, d, h, min);

    setDayStr(String(finalDate.getDate()));
    setMonthStr(String(finalDate.getMonth() + 1));
    setYearStr(String(finalDate.getFullYear()));
    setHourStr(String(h));
    setMinuteStr(String(min));

    onChange({
      ...value,
      birthDate: finalDate,
      birthHour: h,
      birthMinute: min,
      name: nameStr,
    });
  }, [dayStr, hourStr, minuteStr, monthStr, nameStr, onChange, value, yearStr]);

  const handleApplyProfile = () => {
    if (!userProfile || !userProfile.birthYear || !userProfile.birthMonth || !userProfile.birthDay) return;
    const bHour = userProfile.birthHour ?? 0;
    const bMin = userProfile.birthMinute ?? 0;
    const date = new Date(
      userProfile.birthYear,
      userProfile.birthMonth - 1,
      userProfile.birthDay,
      bHour,
      bMin,
    );
    setDayStr(String(userProfile.birthDay));
    setMonthStr(String(userProfile.birthMonth));
    setYearStr(String(userProfile.birthYear));
    setHourStr(String(bHour));
    setMinuteStr(String(bMin));
    const displayName = user?.displayName || value.name || '';
    if (displayName) setNameStr(displayName);

    const loc = userProfile.birthLocation;
    onChange({
      ...value,
      birthDate: date,
      birthHour: bHour,
      birthMinute: bMin,
      gender: userProfile.gender ?? value.gender,
      name: displayName || value.name,
      locationName: loc?.locationName || value.locationName,
      latitude: loc?.lat ?? value.latitude,
      longitude: loc?.lng ?? value.longitude,
      timezone: loc?.timezone ?? value.timezone,
      countryCode: loc?.countryCode || value.countryCode,
      countryName: loc?.countryName || value.countryName,
    });
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="unified-birth-data-picker">
      {/* Profile Prefill Banner */}
      {showProfilePrefill && userProfile && userProfile.birthYear && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/30 dark:border-gold-dark/30 text-xs">
          <div className="flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark min-w-0">
            <Sparkles className="h-4 w-4 text-gold dark:text-gold-dark shrink-0" />
            <span className="truncate">
              Đã có hồ sơ: <strong>{user?.displayName || 'Người dùng'}</strong> ({userProfile.birthDay}/{userProfile.birthMonth}/{userProfile.birthYear})
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyProfile}
            className="px-2.5 py-1 rounded-lg bg-gold dark:bg-gold-dark text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity spring-press cursor-pointer shrink-0 ml-2"
          >
            Nạp hồ sơ
          </button>
        </div>
      )}

      {/* Name & Gender */}
      {(showName || showGender) && (
        <div className={`grid grid-cols-1 ${showName && showGender ? 'sm:grid-cols-2' : ''} gap-3`}>
          {showName && (
            <div>
              <label className="label-standard mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
                <span>Họ và tên</span>
              </label>
              <input
                type="text"
                className="surface-control w-full p-2.5 font-medium transition-colors rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                placeholder="Nhập họ và tên..."
                value={nameStr}
                onChange={(e) => setNameStr(e.target.value)}
                onBlur={commitData}
              />
            </div>
          )}

          {showGender && (
            <div>
              <label className="label-standard mb-1.5 block">Giới tính</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...value, gender: 'nam' })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all spring-press cursor-pointer ${
                    (value.gender ?? 'nam') === 'nam' || value.gender === 'male'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30'
                      : 'bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark'
                  }`}
                >
                  Nam
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, gender: 'nu' })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all spring-press cursor-pointer ${
                    value.gender === 'nu' || value.gender === 'female'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30'
                      : 'bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark'
                  }`}
                >
                  Nữ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date & Time Picker */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date Part */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-standard flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
              <span>Ngày sinh Dương lịch</span>
            </label>
            {showLunarToggle && lunarConverted && (
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark truncate">
                {lunarConverted}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Ngày sinh"
                min="1"
                max="31"
                className="surface-control w-full p-2.5 text-center font-bold transition-colors rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                placeholder="Ngày"
                value={dayStr}
                onChange={(e) => setDayStr(e.target.value)}
                onBlur={commitData}
              />
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Tháng sinh"
                min="1"
                max="12"
                className="surface-control w-full p-2.5 text-center font-bold transition-colors rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                placeholder="Tháng"
                value={monthStr}
                onChange={(e) => setMonthStr(e.target.value)}
                onBlur={commitData}
              />
            </div>
            <div className="relative flex-[1.4]">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Năm sinh"
                min="1900"
                max="2100"
                className="surface-control w-full p-2.5 text-center font-bold transition-colors rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                placeholder="Năm"
                value={yearStr}
                onChange={(e) => setYearStr(e.target.value)}
                onBlur={commitData}
              />
            </div>
          </div>
        </div>

        {/* Time Part */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-standard flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
              <span>Giờ sinh</span>
            </label>
            <span className="text-[11px] font-semibold text-gold dark:text-gold-dark truncate">
              {currentChiHour}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Giờ"
                min="0"
                max="23"
                className="surface-control w-full p-2.5 text-center font-bold transition-colors rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                placeholder="00"
                value={hourStr}
                onChange={(e) => setHourStr(e.target.value)}
                onBlur={commitData}
              />
            </div>
            <div className="font-bold text-text-secondary-light dark:text-text-secondary-dark">:</div>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Phút"
                min="0"
                max="59"
                className="surface-control w-full p-2.5 text-center font-bold transition-colors rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light dark:bg-surface-elevated-dark"
                placeholder="00"
                value={minuteStr}
                onChange={(e) => setMinuteStr(e.target.value)}
                onBlur={commitData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Part */}
      {showLocation && (
        <div className="pt-1">
          <label className="label-standard mb-1.5 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
            <span>Nơi sinh (Tỉnh / Thành phố)</span>
          </label>
          <TuViLocationPicker
            value={{
              locationName: value.locationName || '',
              lat: value.latitude,
              lng: value.longitude,
              timezone: value.timezone,
              countryCode: value.countryCode || 'VN',
              countryName: value.countryName || 'Việt Nam',
            }}
            onChange={(loc) => {
              onChange({
                ...value,
                latitude: loc.lat,
                longitude: loc.lng,
                timezone: loc.timezone,
                locationName: loc.locationName,
                countryCode: loc.countryCode,
                countryName: loc.countryName,
              });
            }}
          />
        </div>
      )}
    </div>
  );
};
