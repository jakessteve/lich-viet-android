import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { ActionButton } from '../../shared';
import CollapsibleCard from '../../CollapsibleCard';
import { WesternChartDisplay } from './WesternChartDisplay';

const BODY_LABELS: Record<string, string> = {
  sun: 'Mặt Trời',
  moon: 'Mặt Trăng',
  mercury: 'Sao Thủy',
  venus: 'Sao Kim',
  mars: 'Sao Hỏa',
  jupiter: 'Sao Mộc',
  saturn: 'Sao Thổ',
  uranus: 'Thiên Vương',
  neptune: 'Hải Vương',
  pluto: 'Diêm Vương',
};

const BODY_ICONS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

const ASPECT_LABELS: Record<string, { label: string; cls: string }> = {
  conjunction: { label: 'Hợp', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  opposition: { label: 'Xung', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  trine: { label: 'Tam hợp', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  square: { label: 'Vuông', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  sextile: { label: 'Lục hợp', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
};

export const ForecastView: React.FC = () => {
  const {
    westernInput,
    forecastYear,
    setForecastYear,
    forecastResult,
    isCalculating,
    error,
    calculateForecast,
    selectLunarReturn,
  } = useAstrologyStore(
    useShallow((state) => ({
      westernInput: state.westernInput,
      forecastYear: state.forecastYear,
      setForecastYear: state.setForecastYear,
      forecastResult: state.forecastResult,
      isCalculating: state.isCalculating,
      error: state.error,
      calculateForecast: state.calculateForecast,
      selectLunarReturn: state.selectLunarReturn,
    }))
  );
  const [yearStr, setYearStr] = useState(String(forecastYear));
  const hasBirthInput = Boolean(
    westernInput.latitude && westernInput.longitude && !Number.isNaN(westernInput.birthDate?.getTime()),
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-indigo-500 dark:text-indigo-400 text-base">event</span>
            Chọn Năm Xem Vận Hạn
          </h3>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setYearStr(String(year))}
                className={`flex-1 min-w-[56px] py-2 px-3 rounded-xl text-sm font-semibold transition-all shrink-0 sm:shrink ${
                  yearStr === String(year)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark hover:bg-indigo-50 dark:hover:bg-white/15'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <ActionButton
            onClick={() => {
              const year = Number(yearStr);
              if (Number.isFinite(year)) setForecastYear(year);
              void calculateForecast();
            }}
            disabled={isCalculating || !hasBirthInput}
            icon={isCalculating ? 'hourglass_empty' : 'wb_twilight'}
            variant="primary"
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Xem Vận Hạn {yearStr}
          </ActionButton>
          {!hasBirthInput && (
            <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
              Vui lòng nhập ngày giờ sinh và nơi sinh ở mục Lá Số Gốc trước.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {forecastResult && !isCalculating && !error && (
        <div className="space-y-4 animate-fade-in-up">
          <CollapsibleCard
            title={`Quá Cảnh — ${forecastResult.transits.dateLabel}`}
            icon="radar"
            defaultOpen
            collapseOnMobile={false}
          >
            <div className="p-4 space-y-3">
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Góc chiếu giữa các hành tinh đang di chuyển trên trời và hành tinh trong lá số gốc của bạn hôm nay.
              </p>
              {forecastResult.transits.aspects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {forecastResult.transits.aspects.slice(0, 16).map((aspect, i) => {
                    const meta = ASPECT_LABELS[aspect.type] ?? { label: aspect.type, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <span
                        key={`${aspect.transitBody}-${aspect.natalBody}-${aspect.type}-${i}`}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${meta.cls}`}
                      >
                        {BODY_ICONS[aspect.transitBody] ?? '●'} {BODY_LABELS[aspect.transitBody] ?? aspect.transitBody}
                        <span className="opacity-70">{meta.label}</span>
                        {BODY_ICONS[aspect.natalBody] ?? '●'} {BODY_LABELS[aspect.natalBody] ?? aspect.natalBody}
                        <span className="opacity-60 font-mono">{aspect.orb.toFixed(1)}°</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Không có góc chiếu lớn nào đáng kể hôm nay.</p>
              )}
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Tiến Trình (Secondary Progressions)"
            icon="trending_up"
            collapseOnMobile
            defaultOpen={false}
          >
            <div className="space-y-3 p-2">
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2">
                1 ngày sau khi sinh = 1 năm cuộc đời. Ngày tiến trình hiện tại:{' '}
                <strong>{forecastResult.progressions.dateLabel}</strong> (tuổi {forecastResult.progressions.ageYears.toFixed(1)}).
              </p>
              <WesternChartDisplay result={forecastResult.progressions.chart} />
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title={`Mặt Trời Hồi Vị ${forecastResult.year} (Tuế Vận)`}
            icon="wb_sunny"
            collapseOnMobile
            defaultOpen={false}
          >
            {forecastResult.solarReturn ? (
              <div className="space-y-3 p-2">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2">
                  Mặt Trời trở về đúng vị trí ngày sinh vào <strong>{forecastResult.solarReturn.dateLabel}</strong> —
                  mở ra chủ đề của cả năm {forecastResult.year}.
                </p>
                <WesternChartDisplay result={forecastResult.solarReturn.chart} />
              </div>
            ) : (
              <p className="p-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Không tìm thấy thời điểm Mặt Trời Hồi Vị trong năm {forecastResult.year}.
              </p>
            )}
          </CollapsibleCard>

          <CollapsibleCard
            title={`Mặt Trăng Hồi Vị ${forecastResult.year} (Nguyệt Vận)`}
            icon="nightlight"
            collapseOnMobile
            defaultOpen={false}
          >
            {forecastResult.lunarReturns.length > 0 ? (
              <div className="space-y-3 p-2">
                <div className="flex flex-wrap gap-2 px-2">
                  {forecastResult.lunarReturns.map((entry) => {
                    const active = forecastResult.selectedLunarReturn &&
                      Math.abs(forecastResult.selectedLunarReturn.julianDay - entry.julianDay) < 0.5;
                    return (
                      <button
                        key={entry.julianDay}
                        type="button"
                        onClick={() => selectLunarReturn(entry.julianDay)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          active
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark hover:bg-indigo-50 dark:hover:bg-white/15'
                        }`}
                      >
                        Chu kỳ {entry.index} · {entry.dateLabel}
                      </button>
                    );
                  })}
                </div>
                {forecastResult.selectedLunarReturn && (
                  <WesternChartDisplay result={forecastResult.selectedLunarReturn.chart} />
                )}
              </div>
            ) : (
              <p className="p-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Không tìm thấy chu kỳ Trăng Hồi Vị nào trong năm {forecastResult.year}.
              </p>
            )}
          </CollapsibleCard>
        </div>
      )}
    </div>
  );
};

export default ForecastView;
