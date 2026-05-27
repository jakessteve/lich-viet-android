import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useShallow } from 'zustand/react/shallow';
import { useTuViStore } from '../../stores/tuviStore';
import { TuViInputForm } from './TuViInputForm';
import { TuViChart } from './TuViChart';
import { TuViSummaryPanel } from './TuViSummaryPanel';
import { TuViMarkdownExport } from './TuViMarkdownExport';
import { IconButton, SegmentedControl, type SegmentedOption } from '../shared';
import type { TuViSchool } from '../../types/tuvi';
import './tuviChart.css';
import { getDatePartsInTimeZone, VIETNAM_TIME_ZONE } from '@/services/tuvi/timeNormalization';

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) => index + 1);
const SCHOOL_OPTIONS: readonly SegmentedOption<TuViSchool>[] = [
  { id: 'nam-phai', label: 'Nam phái', icon: 'south' },
  { id: 'thien-luong', label: 'Thiên Lương', icon: 'auto_awesome' },
  { id: 'bac-phai', label: 'Bắc phái', icon: 'north' },
];

export const TuViPage: React.FC = () => {
  usePageTitle('Tử Vi');
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
    setSchool,
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
      setSchool: state.setSchool,
    })),
  );
  const now = getDatePartsInTimeZone(new Date(), VIETNAM_TIME_ZONE);
  const currentYear = now.year;
  const currentMonth = now.month;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <span className="material-icons-round text-xl text-amber-500 dark:text-amber-400">auto_awesome</span>
          Tử Vi Đẩu Số
        </h2>
      </div>

      {/* Input Form */}
      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-gold-light dark:text-gold-dark text-base">person</span>
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
          <span className="material-icons-round text-base mt-0.5">error</span>
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            aria-label="Đóng lỗi"
          >
            <span className="material-icons-round text-sm">close</span>
          </button>
        </div>
      )}

      {/* Chart */}
      {chart && (
        <div className="surface-panel flex flex-wrap items-end justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">history</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                Xem hạn
              </p>
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">Năm và tháng đang xem</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <IconButton
              onClick={() => setHanView(viewYear - 1, viewMonth)}
              icon="chevron_left"
              label="Lùi một năm"
            />
            <label className="surface-control flex min-h-11 items-center gap-2 px-3 py-2 text-sm font-medium">
              <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">calendar_month</span>
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
            <IconButton
              onClick={() => setHanView(viewYear + 1, viewMonth)}
              icon="chevron_right"
              label="Tăng một năm"
            />

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
              className="surface-control inline-flex h-11 items-center gap-1.5 px-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gold/10 hover:text-gold-light dark:hover:text-gold-dark"
            >
              <span className="material-icons-round text-base">today</span>
              Hôm nay
            </button>
          </div>
        </div>
      )}

      {chart && (
        <div className="surface-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">account_tree</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                Trường phái
              </p>
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {chart.centerInfo.schoolLabel}
              </p>
            </div>
          </div>

          <SegmentedControl
            options={SCHOOL_OPTIONS}
            value={input.school ?? 'thien-luong'}
            onChange={setSchool}
            ariaLabel="Trường phái Tử Vi"
            className="w-full sm:w-auto"
          />
        </div>
      )}

      {chart && (
        <div className="animate-fade-scale">
          <TuViChart chart={chart} selectedPalaceIndex={selectedPalaceIndex} onSelectPalace={selectPalace} />
        </div>
      )}

      {chart && <TuViMarkdownExport />}

      {chart && <TuViSummaryPanel chart={chart} />}
    </div>
  );
};
