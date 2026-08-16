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
    })),
  );
  const [yearStr, setYearStr] = useState(String(forecastYear));
  const [selectedForecastMonth, setSelectedForecastMonth] = useState<number>(new Date().getMonth() + 1);

  const selectedMonthSummary = React.useMemo(() => {
    if (!forecastResult?.monthlyTimeline) return null;
    return (
      forecastResult.monthlyTimeline.months.find((m) => m.month === selectedForecastMonth) ??
      forecastResult.monthlyTimeline.months[0] ??
      null
    );
  }, [forecastResult?.monthlyTimeline, selectedForecastMonth]);

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
                    ? 'bg-astral-primary text-white shadow-md'
                    : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark'
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
            className="w-full h-12 bg-astral-primary hover:bg-astral-primary/90 text-white shadow-md"
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
          {/* ── 12-Month Transit Timeline & Heatmap ──────────────── */}
          {forecastResult.monthlyTimeline && (
            <CollapsibleCard
              title={`Tiến Trình Quá Cảnh 12 Tháng Năm ${forecastResult.year}`}
              icon="timeline"
              defaultOpen
              collapseOnMobile={false}
            >
              <div className="p-4 sm:p-5 space-y-4">
                {/* Year Overview Banner */}
                <div className="rounded-xl bg-astral-surface-light/80 dark:bg-astral-surface-dark border border-astral-border-light dark:border-astral-border-dark p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark block">
                      Toàn Cảnh Năng Lượng Chiêm Tinh Năm {forecastResult.year}
                    </span>
                    <p className="text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                      {forecastResult.monthlyTimeline.yearOverviewVi}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        forecastResult.monthlyTimeline.overallLuckTier === 'Đại Cát'
                          ? 'bg-good/15 text-good dark:text-good-dark border-good/40'
                          : forecastResult.monthlyTimeline.overallLuckTier === 'Khởi Sắc'
                            ? 'bg-info/15 text-info dark:text-info-dark border-info/40'
                            : forecastResult.monthlyTimeline.overallLuckTier === 'Bình Hòa'
                              ? 'bg-gold/15 text-gold dark:text-gold-dark border-gold/40'
                              : 'bg-orange/15 text-orange dark:text-orange-dark border-orange/40'
                      }`}
                    >
                      {forecastResult.monthlyTimeline.overallLuckTier} · {forecastResult.monthlyTimeline.overallYearScore}/10
                    </span>
                  </div>
                </div>

                {/* 12-Month Heatmap Carousel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                      <span className="material-icons-round text-sm text-astral-primary dark:text-astral-primary-dark">
                        calendar_view_month
                      </span>
                      Ma Trận Năng Lượng 12 Tháng
                    </span>
                    <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                      Chạm vào tháng để xem chi tiết
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory">
                    {forecastResult.monthlyTimeline.months.map((m) => {
                      const isSelected = selectedForecastMonth === m.month;
                      return (
                        <button
                          key={m.month}
                          type="button"
                          onClick={() => setSelectedForecastMonth(m.month)}
                          className={`snap-start shrink-0 w-24 sm:w-28 p-2.5 rounded-xl text-left border transition-all duration-normal ${
                            isSelected
                              ? 'border-astral-primary bg-astral-primary/10 dark:bg-astral-primary-dark/15 shadow-sm ring-1 ring-astral-primary'
                              : 'border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 hover:bg-surface-subtle-light dark:hover:bg-surface-elevated-dark'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                            <span>{m.monthLabel}</span>
                            <span className="text-micro text-astral-primary dark:text-astral-primary-dark">
                              {m.score}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                            <span className="text-good dark:text-good-dark">+{m.harmoniousCount}</span>
                            <span>/</span>
                            <span className="text-bad dark:text-bad-dark">-{m.tensionCount}</span>
                          </div>
                          <div className="mt-1.5">
                            <span
                              className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                m.luckTier === 'Đại Cát'
                                  ? 'bg-good/15 text-good dark:text-good-dark'
                                  : m.luckTier === 'Khởi Sắc'
                                    ? 'bg-info/15 text-info dark:text-info-dark'
                                    : m.luckTier === 'Bình Hòa'
                                      ? 'bg-gold/15 text-gold dark:text-gold-dark'
                                      : 'bg-orange/15 text-orange dark:text-orange-dark'
                              }`}
                            >
                              {m.luckTier}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Month Detail View */}
                {selectedMonthSummary && (
                  <div className="rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-3.5 border border-border-light/50 dark:border-border-dark/50 space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-border-light/30 dark:border-border-dark/30 pb-2">
                      <span className="text-xs font-bold text-astral-primary dark:text-astral-primary-dark flex items-center gap-1">
                        <span className="material-icons-round text-sm">insights</span>
                        Chi Tiết Góc Chiếu {selectedMonthSummary.monthLabel}/{selectedMonthSummary.year}
                      </span>
                      <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                        Đánh giá: <strong>{selectedMonthSummary.luckTier}</strong> ({selectedMonthSummary.score}/10)
                      </span>
                    </div>

                    <p className="text-xs text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                      {selectedMonthSummary.summaryVi}
                    </p>

                    {/* Prominent transit aspects */}
                    {selectedMonthSummary.dominantAspects.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-text-secondary-light dark:text-text-secondary-dark block">
                          Góc Chiếu Chủ Đạo Trong Tháng:
                        </span>
                        <div className="space-y-1">
                          {selectedMonthSummary.dominantAspects.map((asp, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-surface-container-lowest/80 dark:bg-surface-dark/80 border border-border-light/40 dark:border-border-dark/40 text-xs flex items-start gap-2"
                            >
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                                  asp.isHarmonious
                                    ? 'bg-good/15 text-good dark:text-good-dark'
                                    : 'bg-bad/15 text-bad dark:text-bad-dark'
                                }`}
                              >
                                {asp.aspectTypeVi.split(' ')[0]}
                              </span>
                              <div className="space-y-0.5">
                                <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                  {BODY_ICONS[asp.transitBody] ?? '●'} {asp.transitBodyVi} {asp.aspectTypeVi}{' '}
                                  {BODY_ICONS[asp.natalBody] ?? '●'} {asp.natalBodyVi} (orb {asp.orb}°)
                                </span>
                                <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                  {asp.interpretationVi}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable guidance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-info/5 dark:bg-info-dark/5 border border-info/20 text-xs space-y-0.5">
                        <span className="font-bold text-info dark:text-info-dark flex items-center gap-1">
                          💼 Sự Nghiệp & Tài Chính
                        </span>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                          {selectedMonthSummary.careerFinanceAdviceVi}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-purple/5 dark:bg-purple-dark/5 border border-purple/20 text-xs space-y-0.5">
                        <span className="font-bold text-purple dark:text-purple-dark flex items-center gap-1">
                          ❤️ Tình Cảm & Thể Trạng
                        </span>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                          {selectedMonthSummary.relationshipHealthAdviceVi}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          )}

          <CollapsibleCard
            title={`Góc Chiếu Quá Cảnh Hôm Nay — ${forecastResult.transits.dateLabel}`}
            icon="radar"
            defaultOpen={false}
            collapseOnMobile
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
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.cls}`}
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
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Không có góc chiếu lớn nào đáng kể hôm nay.
                </p>
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
                <strong>{forecastResult.progressions.dateLabel}</strong> (tuổi{' '}
                {forecastResult.progressions.ageYears.toFixed(1)}).
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
                  Mặt Trời trở về đúng vị trí ngày sinh vào <strong>{forecastResult.solarReturn.dateLabel}</strong> — mở
                  ra chủ đề của cả năm {forecastResult.year}.
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
                    const active =
                      forecastResult.selectedLunarReturn &&
                      Math.abs(forecastResult.selectedLunarReturn.julianDay - entry.julianDay) < 0.5;
                    return (
                      <button
                        key={entry.julianDay}
                        type="button"
                        onClick={() => selectLunarReturn(entry.julianDay)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          active
                            ? 'bg-astral-primary text-white shadow-md'
                            : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark'
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
