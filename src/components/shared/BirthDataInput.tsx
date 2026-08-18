import React, { useState, useEffect } from 'react';
import { TuViLocationPicker } from '../TuVi/TuViLocationPicker';

export interface BirthDataInputProps {
  value: {
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
  };
  onChange: (value: BirthDataInputProps['value']) => void;
  showName?: boolean;
  showGender?: boolean;
}

const clampTimePart = (value: string, max: number) => {
  if (value.trim() === '') return 0;
  return Math.min(max, Math.max(0, Number(value)));
};

export const BirthDataInput: React.FC<BirthDataInputProps> = ({
  value,
  onChange,
  showName = false,
  showGender = false,
}) => {
  const [dayStr, setDayStr] = useState(String(value.birthDate.getDate()));
  const [monthStr, setMonthStr] = useState(String(value.birthDate.getMonth() + 1));
  const [yearStr, setYearStr] = useState(String(value.birthDate.getFullYear()));
  const [hourStr, setHourStr] = useState(String(value.birthHour ?? 0));
  const [minuteStr, setMinuteStr] = useState(String(value.birthMinute ?? 0));
  const [nameStr, setNameStr] = useState(value.name || '');

  useEffect(() => {
    setDayStr(String(value.birthDate.getDate()));
    setMonthStr(String(value.birthDate.getMonth() + 1));
    setYearStr(String(value.birthDate.getFullYear()));
    setHourStr(String(value.birthHour ?? 0));
    setMinuteStr(String(value.birthMinute ?? 0));
    if (showName) setNameStr(value.name || '');
  }, [value, showName]);

  const commitDate = () => {
    const d = parseInt(dayStr, 10);
    const m = parseInt(monthStr, 10);
    const y = parseInt(yearStr, 10);
    if (!d || !m || !y) return;

    const normalizedHour = clampTimePart(hourStr, 23);
    const normalizedMinute = clampTimePart(minuteStr, 59);

    const date = new Date(y, m - 1, d, normalizedHour, normalizedMinute);

    setDayStr(String(date.getDate()));
    setMonthStr(String(date.getMonth() + 1));
    setYearStr(String(date.getFullYear()));
    setHourStr(String(normalizedHour));
    setMinuteStr(String(normalizedMinute));

    onChange({
      ...value,
      birthDate: date,
      birthHour: normalizedHour,
      birthMinute: normalizedMinute,
      name: nameStr,
    });
  };

  const commitTime = commitDate;

  return (
    <div className="space-y-4">
      {(showName || showGender) && (
        <div className={`grid grid-cols-1 ${showName && showGender ? 'sm:grid-cols-2' : ''} gap-4`}>
          {showName && (
            <div>
              <label className="label-standard mb-1.5 block">Họ và tên</label>
              <input
                type="text"
                className="surface-control w-full p-3 font-medium transition-colors"
                placeholder="Nhập họ và tên..."
                value={nameStr}
                onChange={(e) => setNameStr(e.target.value)}
                onBlur={commitDate}
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
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                    (value.gender ?? 'nam') === 'nam' || value.gender === 'male'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40 ring-2 ring-blue-500/20'
                      : 'bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark'
                  }`}
                >
                  Nam
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, gender: 'nu' })}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                    value.gender === 'nu' || value.gender === 'female'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 ring-2 ring-rose-500/20'
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-standard mb-1.5 block">Dương lịch</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label="Ngày sinh dương lịch"
                min="1"
                max="31"
                className="surface-control w-full p-3 text-center font-bold transition-colors"
                placeholder="Ng"
                value={dayStr}
                onChange={(e) => setDayStr(e.target.value)}
                onBlur={commitDate}
              />
              <div className="absolute inset-x-0 -bottom-5 text-center">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Ngày
                </span>
              </div>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label="Tháng sinh dương lịch"
                min="1"
                max="12"
                className="surface-control w-full p-3 text-center font-bold transition-colors"
                placeholder="Th"
                value={monthStr}
                onChange={(e) => setMonthStr(e.target.value)}
                onBlur={commitDate}
              />
              <div className="absolute inset-x-0 -bottom-5 text-center">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Tháng
                </span>
              </div>
            </div>
            <div className="relative flex-[1.5]">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label="Năm sinh dương lịch"
                min="1900"
                max="2100"
                className="surface-control w-full p-3 text-center font-bold transition-colors"
                placeholder="Năm"
                value={yearStr}
                onChange={(e) => setYearStr(e.target.value)}
                onBlur={commitDate}
              />
              <div className="absolute inset-x-0 -bottom-5 text-center">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Năm
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="label-standard mb-1.5 block">Giờ sinh</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label="Giờ sinh"
                min="0"
                max="23"
                className="surface-control w-full p-3 text-center font-bold transition-colors"
                placeholder="Giờ"
                value={hourStr}
                onChange={(e) => setHourStr(e.target.value)}
                onBlur={commitTime}
              />
              <div className="absolute inset-x-0 -bottom-5 text-center">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Giờ
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center font-bold text-gray-400 pb-1">:</div>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label="Phút sinh"
                min="0"
                max="59"
                className="surface-control w-full p-3 text-center font-bold transition-colors"
                placeholder="Phút"
                value={minuteStr}
                onChange={(e) => setMinuteStr(e.target.value)}
                onBlur={commitTime}
              />
              <div className="absolute inset-x-0 -bottom-5 text-center">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Phút
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <label className="label-standard mb-1.5 block">Nơi sinh</label>
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
    </div>
  );
};
