import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTuViStore } from '../../stores/tuviStore';
import { useAuthStore } from '../../stores/authStore';
import type { TuViGender } from '../../types/tuvi';
import { TuViLocationPicker } from './TuViLocationPicker';
import { getUserBirthProfile } from '@/utils/userBirthProfile';

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
  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const didPrefill = useRef(false);
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);

  // Local string state for date inputs — allows free typing without
  // intermediate invalid Date construction
  const [dayStr, setDayStr] = useState(String(input.solarDate.getDate()));
  const [monthStr, setMonthStr] = useState(String(input.solarDate.getMonth() + 1));
  const [yearStr, setYearStr] = useState(String(input.solarDate.getFullYear()));
  const [hourStr, setHourStr] = useState(String(input.birthClockHour ?? 0));
  const [minuteStr, setMinuteStr] = useState(String(input.birthMinute ?? 0));

  // Sync local strings when the store date changes externally (e.g. prefill)
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
    if (!d || !m || !y) return; // incomplete — don't commit
    const normalizedHour = clampTimePart(hourStr, 23);
    const normalizedMinute = clampTimePart(minuteStr, 59);
    const date = new Date(y, m - 1, d, normalizedHour, normalizedMinute);
    // If the Date auto-corrected (e.g. Feb 31 → Mar 3), sync back
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
      setError('Vui lòng chọn đầy đủ ngày, tháng, năm sinh.');
      return;
    }

    // Commit the date before calculating
    const normalizedHour = clampTimePart(hourStr, 23);
    const normalizedMinute = clampTimePart(minuteStr, 59);
    const date = new Date(y, m - 1, d, normalizedHour, normalizedMinute);
    const nextInput = {
      solarDate: date,
      birthClockHour: normalizedHour,
      birthMinute: normalizedMinute,
      birthHour: getChiHourFromClockHour(normalizedHour),
    };
    setHourStr(String(normalizedHour));
    setMinuteStr(String(normalizedMinute));
    setInput(nextInput);
    calculateChart(nextInput);
  };

  useEffect(() => {
    if (didPrefill.current || !user) return;

    const updates: Parameters<typeof setInput>[0] = {};
    const birthProfile = userBirthProfile;

    if (user.displayName && !input.name) {
      updates.name = user.displayName;
    }

    if (birthProfile?.birthYear && birthProfile.birthMonth && birthProfile.birthDay) {
      const hourValue = typeof birthProfile.birthHour === 'number' ? birthProfile.birthHour : 0;
      const minuteValue = typeof birthProfile.birthMinute === 'number' ? birthProfile.birthMinute : 0;
      updates.solarDate = new Date(
        birthProfile.birthYear,
        birthProfile.birthMonth - 1,
        birthProfile.birthDay,
        hourValue,
        minuteValue,
      );
    }

    if (typeof birthProfile?.birthHour === 'number') {
      updates.birthClockHour = birthProfile.birthHour;
      updates.birthHour = getChiHourFromClockHour(birthProfile.birthHour);
    }

    if (typeof birthProfile?.birthMinute === 'number') {
      updates.birthMinute = birthProfile.birthMinute;
    }

    if (birthProfile?.gender) {
      updates.gender = birthProfile.gender === 'male' ? 'nam' : 'nữ';
    }

    if (birthProfile?.birthLocation) {
      updates.birthLocation = birthProfile.birthLocation;
      updates.timezone = getTimezoneForLocation(birthProfile.birthLocation.timezone);
    }

    if (Object.keys(updates).length > 0) {
      setInput(updates);
    }

    didPrefill.current = true;
  }, [input.name, setInput, user, userBirthProfile]);

  const labelBase =
    'block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 tracking-wide';
  const infoLabelBase = 'block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1 tracking-wide';
  const profileDateControl =
    'surface-control px-3 py-2.5 text-sm text-center focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none';

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div>
        <label htmlFor="tuvi-name" className={labelBase}>
          Họ và tên (Tuỳ chọn)
        </label>
        <input
          id="tuvi-name"
          type="text"
          value={input.name ?? ''}
          onChange={(e) => setInput({ name: e.target.value })}
          placeholder="VD: Nguyễn Văn A"
          className="surface-control w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 placeholder:text-gray-400 dark:placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className={labelBase}>Ngày giờ sinh (Dương lịch)</label>
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
            className={`${profileDateControl} col-span-2 sm:col-span-1`}
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
        <p className="mt-1.5 text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/70">
          Giờ Tử Vi được tự động quy đổi từ giờ đồng hồ.
        </p>
      </div>

      <div>
        <label className={labelBase}>Giới tính</label>
        <div className="surface-panel grid grid-cols-2 gap-2 rounded-2xl p-1">
          {(['nam', 'nữ'] as TuViGender[]).map((g) => (
            <label
              key={g}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                input.gender === g
                  ? 'bg-white text-gold shadow-sm dark:bg-white/15 dark:text-gold-light'
                  : 'text-text-secondary-light hover:bg-surface-container-lowest dark:text-text-secondary-dark dark:hover:bg-white/10'
              }`}
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

      <div>
        <label className={labelBase}>Nơi sinh</label>
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

      <div className="surface-panel rounded-2xl p-3">
        <div className="flex items-start gap-2">
          <span className="material-icons-round mt-0.5 text-base text-gold">schedule</span>
          <div className="min-w-0">
            <p className={infoLabelBase}>Cách tính giờ</p>
            <p className="text-xs leading-5 text-text-secondary-light/75 dark:text-text-secondary-dark/75">
              Giờ Tử Vi được quy đổi tự động theo lịch sử Việt Nam, với lớp Swiss engine hỗ trợ hiệu chỉnh true solar khi khả dụng.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isCalculating}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold via-gold-light to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCalculating ? (
          <>
            <span className="material-icons-round text-base animate-spin">auto_awesome</span>
            Đang tính lá số...
          </>
        ) : (
          <>
            <span className="material-icons-round text-base">auto_awesome</span>
            Xem Lá Số
          </>
        )}
      </button>
    </form>
  );
};
