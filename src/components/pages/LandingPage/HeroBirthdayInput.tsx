/**
 * HeroBirthdayInput — Interactive "Try Now" mini-demo for the hero section.
 * Lets users enter birth data to see the same core summary produced by
 * the Tử Vi engine, then continue into the full chart.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { generateChart } from '@/services/tuvi';
import { useTuViStore } from '@/stores/tuviStore';
import { useAuthStore } from '@/stores/authStore';
import type { TuViChart, TuViGender, TuViInput } from '@/types/tuvi';
import { getUserBirthProfile } from '@/utils/userBirthProfile';

const getChiHourFromClockHour = (hour: number) => (hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12);
const clampTimePart = (value: string, max: number) => {
  if (value.trim() === '') return 0;
  return Math.min(max, Math.max(0, Number(value)));
};
const DEFAULT_BIRTH_LOCATION = {
  locationName: 'Hà Nội, Việt Nam',
  lat: 21.028511,
  lng: 105.804817,
  timezone: 7,
};

const HeroBirthdayInput: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { setInput, calculateChart } = useTuViStore();
  const { user } = useAuthStore();
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);
  const didPrefill = useRef(false);
  const [birthDate, setBirthDate] = useState('');
  const [birthHour, setBirthHour] = useState('0');
  const [birthMinute, setBirthMinute] = useState('0');
  const [gender, setGender] = useState<TuViGender>('nam');
  const [result, setResult] = useState<TuViChart | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^\d]/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
    else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    setBirthDate(v);
  }, []);

  useEffect(() => {
    if (didPrefill.current || !userBirthProfile) return;

    if (userBirthProfile.birthYear && userBirthProfile.birthMonth && userBirthProfile.birthDay) {
      const dd = String(userBirthProfile.birthDay).padStart(2, '0');
      const mm = String(userBirthProfile.birthMonth).padStart(2, '0');
      const yyyy = String(userBirthProfile.birthYear);
      setBirthDate(`${dd}/${mm}/${yyyy}`);
    }

    if (typeof userBirthProfile.birthHour === 'number') {
      setBirthHour(String(userBirthProfile.birthHour));
    }

    if (typeof userBirthProfile.birthMinute === 'number') {
      setBirthMinute(String(userBirthProfile.birthMinute));
    }

    if (userBirthProfile.gender) {
      setGender(userBirthProfile.gender === 'male' ? 'nam' : 'nữ');
    }

    didPrefill.current = true;
  }, [userBirthProfile]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!birthDate || birthDate.length < 10) return;

      const [dd, mm, yyyy] = birthDate.split('/').map(Number);
      const normalizedHour = clampTimePart(birthHour, 23);
      const normalizedMinute = clampTimePart(birthMinute, 59);
      setBirthHour(String(normalizedHour));
      setBirthMinute(String(normalizedMinute));

      const date = new Date(yyyy, mm - 1, dd, normalizedHour, normalizedMinute);
      const isValidDate =
        dd &&
        mm &&
        yyyy &&
        yyyy >= 1900 &&
        yyyy <= new Date().getFullYear() &&
        date.getDate() === dd &&
        date.getMonth() === mm - 1 &&
        date.getFullYear() === yyyy;

      if (!isValidDate) {
        setError('Ngày sinh chưa hợp lệ.');
        return;
      }

      setIsAnimating(true);
      const input: TuViInput = {
        name: '',
        solarDate: date,
        birthHour: getChiHourFromClockHour(normalizedHour),
        birthClockHour: normalizedHour,
        birthMinute: normalizedMinute,
        gender,
        timezone: 'Asia/Ho_Chi_Minh',
        birthLocation: userBirthProfile?.birthLocation ?? DEFAULT_BIRTH_LOCATION,
      };

      setTimeout(() => {
        try {
          setResult(generateChart(input));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Không thể tính lá số.');
        } finally {
          setIsAnimating(false);
        }
      }, 600);
    },
    [birthDate, birthHour, birthMinute, gender, userBirthProfile],
  );

  const openTuViChart = useCallback(() => {
    if (!result) return;
    setInput(result.input);
    calculateChart(result.input);
    onNavigate('/app/tu-vi');
  }, [calculateChart, onNavigate, result, setInput]);

  return (
    <div className="w-full h-full flex flex-col">
      {!result ? (
        <form onSubmit={handleSubmit} className="glass-card-strong glass-shimmer glass-noise p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons-round text-base text-gold dark:text-gold-dark">auto_awesome</span>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary-light/60 dark:text-text-secondary-dark/60">
              Khám phá nhanh
            </span>
          </div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-4">
            Nhập ngày sinh để xem tóm tắt khớp với engine Tử Vi.
          </p>
          <div className="mt-auto space-y-3">
            <input
              type="text"
              inputMode="numeric"
              value={birthDate}
              onChange={handleDateChange}
              placeholder="dd/mm/yyyy"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-border-light/50 dark:border-white/10 text-sm text-center text-text-primary-light dark:text-text-primary-dark focus:border-gold dark:focus:border-gold-dark focus:ring-1 focus:ring-gold/20 dark:focus:ring-gold-dark/20 transition-all outline-none placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60"
              required
              maxLength={10}
              aria-label="Ngày sinh (dd/mm/yyyy)"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as TuViGender)}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-border-light/50 dark:border-white/10 text-sm text-text-primary-light dark:text-text-primary-dark focus:border-gold dark:focus:border-gold-dark focus:ring-1 focus:ring-gold/20 dark:focus:ring-gold-dark/20 transition-all outline-none"
                aria-label="Giới tính"
              >
                <option value="nam">Nam</option>
                <option value="nữ">Nữ</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={birthHour}
                  onChange={(event) => setBirthHour(event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  onBlur={() => setBirthHour(String(clampTimePart(birthHour, 23)))}
                  className="min-w-0 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-border-light/50 dark:border-white/10 text-sm text-text-primary-light dark:text-text-primary-dark focus:border-gold dark:focus:border-gold-dark focus:ring-1 focus:ring-gold/20 dark:focus:ring-gold-dark/20 transition-all outline-none"
                  aria-label="Giờ sinh"
                  placeholder="Giờ"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={birthMinute}
                  onChange={(event) => setBirthMinute(event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  onBlur={() => setBirthMinute(String(clampTimePart(birthMinute, 59)))}
                  className="min-w-0 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-border-light/50 dark:border-white/10 text-sm text-text-primary-light dark:text-text-primary-dark focus:border-gold dark:focus:border-gold-dark focus:ring-1 focus:ring-gold/20 dark:focus:ring-gold-dark/20 transition-all outline-none"
                  aria-label="Phút sinh"
                  placeholder="Phút"
                />
              </div>
            </div>
            {error && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isAnimating}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-mystery-deep to-indigo-950 text-gold-light dark:from-gold dark:to-amber-500 dark:text-indigo-950 font-bold text-sm shadow-lg shadow-mystery-deep/15 dark:shadow-gold-dark/20 hover:shadow-xl hover:shadow-mystery-deep/25 dark:hover:shadow-gold/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 ring-1 ring-gold/20 dark:ring-0"
            >
              {isAnimating ? (
                <>
                  <span className="material-icons-round text-sm animate-spin">autorenew</span>
                  Đang phân tích...
                </>
              ) : (
                <>
                  Xem kết quả
                  <span className="material-icons-round text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card-strong glass-shimmer glass-noise mystery-glow-border p-5 flex flex-col flex-1 animate-fade-scale">
          {/* Result Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-3xl text-gold dark:text-gold-dark">auto_awesome</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                  Lá số Tử Vi
                </p>
                <p className="text-lg font-bold tracking-tight">{result.centerInfo.canChiYear}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 text-gold dark:text-gold-dark">
              {result.centerInfo.gioiTinh}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            {[
              { label: 'Mệnh', value: result.centerInfo.menhCung },
              { label: 'Cục', value: result.centerInfo.cuc },
              { label: 'Âm/Dương', value: result.centerInfo.amDuongLabel },
              { label: 'Giờ', value: result.centerInfo.canChiHour },
            ].map((item) => (
              <div
                key={item.label}
                className="p-2.5 rounded-xl bg-surface-subtle-light/50 dark:bg-white/[0.025] border border-border-light/10 dark:border-border-dark/10"
              >
                <p className="text-[10px] uppercase tracking-widest text-text-secondary-light/60 dark:text-text-secondary-dark/60 font-bold mb-0.5">
                  {item.label}
                </p>
                <p className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark leading-snug">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* CTA to full chart */}
          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={openTuViChart}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-mystery-deep to-indigo-950 text-gold-light dark:from-gold dark:to-amber-500 dark:text-indigo-950 font-bold text-sm shadow-lg shadow-mystery-deep/15 dark:shadow-gold-dark/20 hover:shadow-xl hover:shadow-mystery-deep/25 dark:hover:shadow-gold/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 ring-1 ring-gold/20 dark:ring-0"
            >
              Mở lá số Tử Vi
              <span className="material-icons-round text-sm">arrow_forward</span>
            </button>
            <button
              onClick={() => {
                setResult(null);
                setBirthDate('');
                setBirthHour('0');
                setBirthMinute('0');
                setError('');
              }}
              className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-white transition-colors"
            >
              Thử ngày sinh khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HeroBirthdayInput);
