import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useShallow } from 'zustand/react/shallow';
import { useTuViStore } from '../../stores/tuviStore';
import { TuViInputForm } from './TuViInputForm';
import { TuViChart } from './TuViChart';
import { TuViSummaryPanel } from './TuViSummaryPanel';
import { IconButton, SegmentedControl, SavedChartsPicker, type SegmentedOption } from '../shared';
import { TuViPalaceInlineDetail } from './TuViPalaceInlineDetail';
import { TuViMarkdownExport } from './TuViMarkdownExport';
import { ExecutiveSnapshotCards } from '../shared/ExecutiveSnapshotCards';
import { interpretPalace } from '@/services/tuvi/palaceInterpretation';
import type { TuViSchool, TuViInput } from '../../types/tuvi';
import {
  ArrowDown,
  Sparkles,
  ArrowUp,
  Network,
  History,
  Calendar,
  CalendarDays,
  Compass,
  ArrowLeftRight,
  Heart,
  User,
  AlertCircle,
  X,
} from 'lucide-react';
import './tuviChart.css';
import { getDatePartsInTimeZone, VIETNAM_TIME_ZONE } from '@/services/tuvi/timeNormalization';

const getChiHourFromClockHour = (hour: number) => (hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12);

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) => index + 1);
const SCHOOL_OPTIONS: readonly SegmentedOption<TuViSchool>[] = [
  { id: 'nam-phai', label: 'Nam phái', icon: (<ArrowDown className="h-4 w-4" />) as unknown as string },
  { id: 'thien-luong', label: 'Thiên Lương', icon: (<Sparkles className="h-4 w-4" />) as unknown as string },
  { id: 'bac-phai', label: 'Bắc phái', icon: (<ArrowUp className="h-4 w-4" />) as unknown as string },
  { id: 'phi-tinh', label: 'Phi Tinh', icon: (<Network className="h-4 w-4" />) as unknown as string },
];

const TUVI_VIEW_MODES: readonly SegmentedOption<'simple' | 'advanced'>[] = [
  { id: 'simple', label: 'Luận Giải Cơ Bản', shortLabel: 'Cơ bản' },
  { id: 'advanced', label: 'Chuyên Sâu & Kỹ Thuật', shortLabel: 'Chuyên sâu' },
];

export const TuViPage: React.FC = () => {
  usePageTitle('Tử Vi');
  const navigate = useNavigate();
  const {
    chart,
    selectedPalaceIndex,
    selectPalace,
    viewYear,
    viewMonth,
    setHanView,
    error,
    clearError,
    input,
    setInput,
    calculateChart,
    setSchool,
    interpretationMode,
    setInterpretationMode,
  } = useTuViStore(
    useShallow((state) => ({
      chart: state.chart,
      selectedPalaceIndex: state.selectedPalaceIndex,
      selectPalace: state.selectPalace,
      viewYear: state.viewYear,
      viewMonth: state.viewMonth,
      setHanView: state.setHanView,
      error: state.error,
      clearError: state.clearError,
      input: state.input,
      setInput: state.setInput,
      calculateChart: state.calculateChart,
      setSchool: state.setSchool,
      interpretationMode: state.interpretationMode,
      setInterpretationMode: state.setInterpretationMode,
    })),
  );
  const now = getDatePartsInTimeZone(new Date(), VIETNAM_TIME_ZONE);
  const currentYear = now.year;
  const currentMonth = now.month;

  const [isChartZoomed, setIsChartZoomed] = useState(false);

  const activePalaceInterpretation = useMemo(() => {
    if (!chart || selectedPalaceIndex === null) return null;
    const palace = chart.palaces[selectedPalaceIndex];
    if (!palace) return null;
    return interpretPalace(palace, chart.palaces, chart.centerInfo, chart.combinations);
  }, [chart, selectedPalaceIndex]);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const lastScrolledInputRef = useRef<string>('');

  const inputFingerprint = chart?.input
    ? `${chart.input.name || ''}_${chart.input.solarDate instanceof Date ? chart.input.solarDate.getTime() : String(chart.input.solarDate)}_${chart.input.birthHour}_${chart.input.gender}_${chart.input.birthMinute || 0}`
    : '';

  useEffect(() => {
    if (chart && inputFingerprint && inputFingerprint !== lastScrolledInputRef.current) {
      lastScrolledInputRef.current = inputFingerprint;
      const timer = setTimeout(() => {
        snapshotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [chart, inputFingerprint]);

  // Derive executive snapshot traits from chart
  const menhPalace = chart?.palaces.find((p) => p.isMenh);
  const menhStars = menhPalace?.chinhTinh.map((s) => s.name).join(', ') || 'Vô Chính Diệu';
  const superpowerDesc = menhPalace?.chinhTinh.length
    ? `Bản mệnh hội tụ khí chất của ${menhStars}, nổi bật với tư duy độc lập, ý chí quyết đoán và năng lực dẫn dắt công việc xuất sắc.`
    : `Bản mệnh Vô Chính Diệu mượn lực đối cung, sở hữu sự linh hoạt tuyệt vời, khả năng thích ứng cao và khéo léo nắm bắt thời cơ.`;

  const knotTitle =
    menhPalace?.hasTriet && menhPalace?.hasTuan
      ? 'Thử Thách Tiền Vận (Ngộ Tuần - Triệt)'
      : menhPalace?.hasTriet
        ? 'Thử Thách Tiền Vận (Ngộ Triệt)'
        : menhPalace?.hasTuan
          ? 'Vận Trình Bình Ổn (Ngộ Tuần)'
          : 'Áp Lực Hoàn Hảo & Trách Nhiệm';
  const knotDesc =
    menhPalace?.hasTriet && menhPalace?.hasTuan
      ? 'Giai đoạn tiền vận gặp nhiều thăng trầm thử thách nhưng hậu vận tôi luyện nội lực vững vàng.'
      : menhPalace?.hasTriet
        ? 'Giai đoạn trước 30 tuổi cần kiên nhẫn tích lũy nội lực, tránh nóng vội đốt cháy giai đoạn.'
        : menhPalace?.hasTuan
          ? 'Giữ phương châm chậm mà chắc, kiên trì tích lũy từng bước và bảo toàn thành quả.'
          : 'Cần học cách thả lỏng, ủy quyền công việc và tránh tự tạo áp lực quá tải cho bản thân.';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          Tử Vi Đẩu Số
        </h2>
      </div>

      {/* Saved Charts Quick Picker */}
      <SavedChartsPicker
        storageKey="saved_tuvi_charts_v1"
        tone="gold"
        currentInput={input}
        onSelectChart={(entry) => {
          const birthDate = new Date(entry.birthDate);
          const clockHour = entry.birthHour ?? 0;
          const minute = entry.birthMinute ?? 0;
          const nextInput: Partial<TuViInput> = {
            name: entry.name,
            solarDate: birthDate,
            birthClockHour: clockHour,
            birthMinute: minute,
            birthHour: getChiHourFromClockHour(clockHour),
            gender: entry.gender === 'nữ' || entry.gender === 'female' || entry.gender === 'nu' ? 'nữ' : 'nam',
            birthLocation: {
              locationName: entry.locationName || 'Hà Nội, Việt Nam',
              lat: entry.latitude || 21.028511,
              lng: entry.longitude || 105.804817,
              timezone: entry.timezone || 7,
              countryCode: entry.countryCode,
              countryName: entry.countryName,
            },
            ...(entry.school ? { school: entry.school as TuViSchool } : {}),
          };
          setInput(nextInput);
          calculateChart(nextInput);
        }}
      />

      {/* 30-Second Executive Snapshot Cards */}
      {chart && (
        <div ref={snapshotRef} className="animate-fade-scale scroll-mt-4">
          <ExecutiveSnapshotCards
            name={input.name || 'Bản Thân'}
            superpowerTitle={`Cung Mệnh ${menhStars} (${chart.centerInfo.menhNapAm})`}
            superpowerDesc={superpowerDesc}
            knotTitle={knotTitle}
            knotDesc={knotDesc}
            year2026CompassTitle={`Năm Bính Ngọ ${currentYear}`}
            year2026CompassDesc={`Tập trung mở rộng đối tác, củng cố vị thế chuyên môn và giữ vững kỷ luật tài chính trong năm ${currentYear}.`}
          />
        </div>
      )}

      {/* Input Form */}
      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-gold dark:text-gold-dark" />
            Thông Tin Lá Số
          </h3>
        </div>
        <div className="p-4 sm:p-5">
          <TuViInputForm />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-bad dark:text-bad-dark flex items-start gap-2"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            aria-label="Đóng lỗi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Chart */}
      {chart && (
        <div className="surface-panel flex flex-wrap items-end justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold dark:text-gold-dark" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                Xem hạn
              </p>
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">Năm và tháng đang xem</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <IconButton onClick={() => setHanView(viewYear - 1, viewMonth)} icon="chevron_left" label="Lùi một năm" />
            <label className="surface-control flex min-h-11 items-center gap-2 px-3 py-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-gold dark:text-gold-dark" />
              <input
                type="number"
                min={1}
                step={1}
                value={viewYear}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  if (!raw) return;
                  setHanView(Number(raw), viewMonth);
                }}
                className="w-24 bg-transparent text-sm font-semibold outline-none"
                aria-label="Năm xem hạn"
              />
            </label>
            <IconButton onClick={() => setHanView(viewYear + 1, viewMonth)} icon="chevron_right" label="Tăng một năm" />

            <select
              value={viewMonth}
              onChange={(event) => setHanView(viewYear, Number(event.target.value))}
              className="surface-control h-11 px-3 text-sm font-medium outline-none"
              aria-label="Tháng xem hạn"
            >
              {MONTH_LABELS.map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setHanView(currentYear, currentMonth)}
              className="surface-control inline-flex h-11 items-center gap-1.5 px-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gold/10 hover:text-text-primary-light dark:hover:text-gold-dark"
            >
              <Calendar className="h-4 w-4" />
              Hôm nay
            </button>
          </div>
        </div>
      )}

      {chart && (
        <div className="surface-panel flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-text-primary-light dark:text-gold-dark">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                Trường phái Tử Vi
              </p>
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                {chart.centerInfo.schoolLabel}
              </p>
            </div>
          </div>

          <div
            className="surface-card p-1.5 grid grid-cols-2 gap-1.5 w-full sm:w-auto sm:min-w-[320px]"
            role="tablist"
            aria-label="Trường phái Tử Vi"
          >
            {SCHOOL_OPTIONS.map((option) => {
              const active = (input.school ?? 'thien-luong') === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setSchool(option.id)}
                  className={`flex min-h-11 items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? 'bg-gradient-to-r from-gold via-gold-light to-amber-500 text-white shadow-md shadow-gold/20 font-semibold'
                      : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-container-low dark:hover:bg-white/5'
                  }`}
                >
                  {option.icon as unknown as React.ReactNode}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {chart && (
        <div className="animate-fade-scale">
          <TuViChart
            chart={chart}
            selectedPalaceIndex={selectedPalaceIndex}
            onSelectPalace={selectPalace}
            onZoomChange={setIsChartZoomed}
          />
        </div>
      )}

      {chart && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-light/40 dark:border-border-dark/40">
          <div>
            <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
              Luận Giải Lá Số Tử Vi
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Chọn mức độ chi tiết phù hợp với nhu cầu tra cứu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TuViMarkdownExport />
            <SegmentedControl
              options={TUVI_VIEW_MODES}
              value={interpretationMode}
              onChange={setInterpretationMode}
              ariaLabel="Chế độ xem luận giải Tử Vi"
              tone="gold"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      )}

      {/* Hybrid Palace Detail (Inline when fit, Compact HUD when zoomed) */}
      {activePalaceInterpretation && (
        <TuViPalaceInlineDetail
          interpretation={activePalaceInterpretation}
          onClose={() => selectPalace(null as unknown as number)}
          isZoomed={isChartZoomed}
          mode={interpretationMode}
        />
      )}

      {chart && <TuViSummaryPanel chart={chart} mode={interpretationMode} onModeChange={setInterpretationMode} />}

      {chart && (
        <div className="surface-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-border-light/50 dark:border-border-dark/40">
          <span className="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1.5 font-medium">
            <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
            Khám phá đa hệ cho lá số này:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/app/chiem-tinh/tay-phuong')}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
            >
              <Compass className="h-3.5 w-3.5" />
              Chiêm Tinh Tây Phương
            </button>
            <button
              onClick={() => navigate('/app/chiem-tinh/vedic')}
              className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Chiêm Tinh Ấn Độ
            </button>
            <button
              onClick={() => navigate('/app/chiem-tinh/hop-la')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
            >
              <Heart className="h-3.5 w-3.5" />
              Hợp Lá Số
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
