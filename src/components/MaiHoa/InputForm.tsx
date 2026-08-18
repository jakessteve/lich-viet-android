// ── InputForm.tsx ──────────────────────────────────────────────
// Epic 4 (US_MH_10): Input selection form for Mai Hoa divination.
import type { CalendarMode } from '../../types/maiHoa';
import React, { useState } from 'react';
import { Clock, Info, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Which input method is selected. */
import { SubNavTabs, type SubNavTabItem } from '../shared';

type InputMode = 'time' | 'numbers';

const MAIHOA_MODES: readonly SubNavTabItem<InputMode>[] = [
  { id: 'time', label: 'Theo giờ hiện tại', icon: <Clock className="h-4 w-4" /> },
  { id: 'numbers', label: 'Nhập số', icon: <Hash className="h-4 w-4" /> },
];

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

export default function InputForm({
  onDivineByTime,
  onDivineByNumbers,
  isLoading = false,
  submitLabel = 'Gieo Quẻ Mai Hoa',
  loadingLabel = 'Đang gieo quẻ...',
  idPrefix = 'maiHoa',
}: InputFormProps): React.ReactElement {
  const [mode, setMode] = useState<InputMode>('time');
  const calendarMode: CalendarMode = 'lunar';
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

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Mode Selector */}
      <SubNavTabs
        tabs={MAIHOA_MODES}
        activeTab={mode}
        onChange={(newMode) => {
          setMode(newMode);
          setError('');
        }}
        fullWidth
      />

      {/* Calendar Mode Toggle */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Hệ lịch: Âm Lịch
          </span>
          <span
            className="text-text-secondary-light dark:text-text-secondary-dark cursor-help"
            title="Mai Hoa Dịch Số tính tháng theo chu kỳ Mặt Trăng (Âm Lịch)."
          >
            <Info className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Query Input */}
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}Query`}>Việc cần xem (Tuỳ chọn)</Label>
        <Input
          id={`${idPrefix}Query`}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="VD: Hỏi về công danh sự nghiệp..."
          className="w-full"
        />
      </div>

      {/* Mode-specific content */}
      {mode === 'time' ? (
        <div className="flex items-center justify-center gap-2 text-base text-text-secondary-light dark:text-text-secondary-dark py-4 bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 rounded-xl border border-border-light/60 dark:border-border-dark/40">
          <Clock className="h-5 w-5 text-gold dark:text-gold-dark shrink-0" />
          <span className="text-sm">Sử dụng ngày giờ hiện tại để lấy quẻ.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${idPrefix}Num1`}>Số thứ nhất</Label>
              <Input
                id={`${idPrefix}Num1`}
                type="number"
                min={MIN_INPUT}
                max={MAX_INPUT}
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="VD: 42"
                className="text-center text-lg font-semibold"
                required
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${idPrefix}Num2`}>Số thứ hai</Label>
              <Input
                id={`${idPrefix}Num2`}
                type="number"
                min={MIN_INPUT}
                max={MAX_INPUT}
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="VD: 7"
                className="text-center text-lg font-semibold"
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
      <Button
        type="submit"
        disabled={isLoading}
        variant="gold"
        className="w-full py-3.5 h-12 text-sm font-bold shadow-md hover:shadow-lg"
      >
        {isLoading ? loadingLabel : submitLabel}
      </Button>
    </form>
  );
}
