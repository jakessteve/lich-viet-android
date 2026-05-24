// ── InputForm.tsx ──────────────────────────────────────────────
// Epic 4 (US_MH_10): Input selection form for Mai Hoa divination.
// Supports two modes:
//   1. "Current Time" — Uses the currently selected date's lunar data + current hour.
//   2. "Manual Numbers" — User enters two positive integers (num1, num2).

import React, { useState } from 'react';
import type { CalendarMode } from '../../types/maiHoa';

/** Which input method is selected. */
type InputMode = 'time' | 'numbers';

interface InputFormProps {
  /** Called when the user submits a time-based divination. */
  readonly onDivineByTime: (mode: CalendarMode, query: string) => void;
  /** Called when the user submits a number-based divination. */
  readonly onDivineByNumbers: (num1: number, num2: number, mode: CalendarMode, query: string) => void;
  /** Whether a divination is currently loading. */
  readonly isLoading?: boolean;
  /** Label for the submit button. */
  readonly submitLabel?: string;
  /** Label shown on the button while loading. */
  readonly loadingLabel?: string;
  /** Prefix for input element IDs (avoids DOM collisions). */
  readonly idPrefix?: string;
}

/** Minimum and maximum values for manual number inputs. */
const MIN_INPUT = 1;
const MAX_INPUT = 9999;

/**
 * Input form for Mai Hoa divination.
 * Provides two modes: time-based and number-based.
 */
export default function InputForm({
  onDivineByTime,
  onDivineByNumbers,
  isLoading = false,
  submitLabel = 'Gieo Quẻ Mai Hoa',
  loadingLabel = 'Đang gieo quẻ...',
  idPrefix = 'maiHoa',
}: InputFormProps): React.ReactElement {
  const [mode, setMode] = useState<InputMode>('time');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('lunar');
  const [query, setQuery] = useState('');
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError('');

    if (mode === 'time') {
      onDivineByTime(calendarMode, query.trim());
      return;
    }

    const parsedNum1 = parseInt(num1, 10);
    const parsedNum2 = parseInt(num2, 10);

    if (isNaN(parsedNum1) || isNaN(parsedNum2)) {
      setError('Vui lòng nhập hai số nguyên dương.');
      return;
    }
    if (parsedNum1 < MIN_INPUT || parsedNum1 > MAX_INPUT || parsedNum2 < MIN_INPUT || parsedNum2 > MAX_INPUT) {
      setError(`Số phải từ ${MIN_INPUT} đến ${MAX_INPUT}.`);
      return;
    }

    onDivineByNumbers(parsedNum1, parsedNum2, calendarMode, query.trim());
  }

  const tabBaseClass = 'flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200';
  const tabActiveClass = 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm';
  const tabInactiveClass =
    'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white';

  const pillBaseClass = 'px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200';
  const pillActiveClass = 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark';
  const pillInactiveClass =
    'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10';

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Mode Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('time');
              setError('');
            }}
            className={`${tabBaseClass} ${mode === 'time' ? tabActiveClass : tabInactiveClass}`}
          >
            Theo giờ hiện tại
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('numbers');
              setError('');
            }}
            className={`${tabBaseClass} ${mode === 'numbers' ? tabActiveClass : tabInactiveClass}`}
          >
            Nhập số
          </button>
        </div>
      </div>

      {/* Calendar Mode Toggle */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Hệ lịch tính tháng:
            </span>
            <span
              className="material-icons-round text-base text-text-secondary-light dark:text-text-secondary-dark cursor-help"
              title="Âm Lịch: tính tháng theo chu kỳ Mặt Trăng (phổ biến). Tiết Khí: tính tháng theo vị trí Mặt Trời trên hoàng đạo (chính xác hơn về mặt thiên văn)."
            >
              info_outline
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCalendarMode('lunar')}
              className={`${pillBaseClass} ${calendarMode === 'lunar' ? pillActiveClass : pillInactiveClass}`}
            >
              Âm Lịch
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('tietKhi')}
              className={`${pillBaseClass} ${calendarMode === 'tietKhi' ? pillActiveClass : pillInactiveClass}`}
            >
              Tiết Khí
            </button>
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div>
        <label
          htmlFor={`${idPrefix}Query`}
          className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1 tracking-wide"
        >
          Việc cần xem (Tuỳ chọn)
        </label>
        <input
          id={`${idPrefix}Query`}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="VD: Hỏi về công danh sự nghiệp..."
          className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-400"
        />
      </div>

      {/* Mode-specific content */}
      {mode === 'time' ? (
        <div className="flex items-center justify-center gap-2 text-base text-text-secondary-light dark:text-text-secondary-dark py-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <span className="material-icons-round text-xl text-blue-500 dark:text-blue-400 leading-none">
            access_time
          </span>
          <span>Sử dụng ngày giờ hiện tại để lấy quẻ.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor={`${idPrefix}Num1`}
                className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1 tracking-wide"
              >
                Số thứ nhất
              </label>
              <input
                id={`${idPrefix}Num1`}
                type="number"
                min={MIN_INPUT}
                max={MAX_INPUT}
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="VD: 42"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-center text-lg font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                required
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor={`${idPrefix}Num2`}
                className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1 tracking-wide"
              >
                Số thứ hai
              </label>
              <input
                id={`${idPrefix}Num2`}
                type="number"
                min={MIN_INPUT}
                max={MAX_INPUT}
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="VD: 7"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-center text-lg font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center" role="alert">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold via-gold-light to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}
