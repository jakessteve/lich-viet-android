import React, { useState, useEffect } from 'react';
import { Star, BookmarkPlus, Bookmark, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SavedChartEntry {
  id: string;
  name: string;
  birthDate: string; // ISO string
  birthHour: number;
  birthMinute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  locationName?: string;
  countryCode?: string;
  countryName?: string;
  gender?: string;
  school?: string;
  createdAt: number;
}

export interface SavedChartInput {
  name?: string;
  birthDate?: Date | string;
  solarDate?: Date;
  birthHour?: number;
  birthClockHour?: number;
  birthMinute?: number;
  latitude?: number;
  longitude?: number;
  timezone?: number | string;
  locationName?: string;
  countryCode?: string;
  countryName?: string;
  gender?: string;
  school?: string;
  birthLocation?: {
    locationName?: string;
    lat?: number;
    lng?: number;
    timezone?: number;
    countryCode?: string;
    countryName?: string;
  };
}

export type SavedChartTone = 'astral' | 'gold' | 'purple';

interface SavedChartsPickerProps {
  storageKey?: string;
  currentInput: SavedChartInput;
  onSelectChart: (entry: SavedChartEntry) => void;
  tone?: SavedChartTone;
  label?: string;
}

const parseNumericTimezone = (tz: number | string | undefined, defaultTz = 7): number => {
  if (typeof tz === 'number') return tz;
  if (typeof tz === 'string') {
    const parsed = parseFloat(tz);
    if (!Number.isNaN(parsed)) return parsed;
    if (tz.includes('+')) {
      const match = tz.match(/\+(\d+)/);
      if (match) return parseInt(match[1], 10);
    } else if (tz.includes('-')) {
      const match = tz.match(/-(\d+)/);
      if (match) return -parseInt(match[1], 10);
    }
  }
  return defaultTz;
};

export const SavedChartsPicker: React.FC<SavedChartsPickerProps> = ({
  storageKey = 'saved_western_charts_v1',
  currentInput,
  onSelectChart,
  tone = 'astral',
  label = 'Lá số đã lưu',
}) => {
  const [savedList, setSavedList] = useState<SavedChartEntry[]>([]);
  const [chartName, setChartName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setSavedList(JSON.parse(raw));
      } else {
        setSavedList([]);
      }
    } catch {
      setSavedList([]);
    }
  }, [storageKey]);

  // Prepopulate chart name when modal opens
  useEffect(() => {
    if (showSaveModal) {
      setChartName(currentInput.name || '');
    }
  }, [showSaveModal, currentInput.name]);

  const saveCurrentChart = () => {
    if (!chartName.trim()) return;

    let bDate = new Date();
    if (currentInput.solarDate instanceof Date && !isNaN(currentInput.solarDate.getTime())) {
      bDate = currentInput.solarDate;
    } else if (currentInput.birthDate instanceof Date && !isNaN(currentInput.birthDate.getTime())) {
      bDate = currentInput.birthDate;
    } else if (typeof currentInput.birthDate === 'string') {
      const parsed = new Date(currentInput.birthDate);
      if (!isNaN(parsed.getTime())) bDate = parsed;
    }

    const loc = currentInput.birthLocation;
    const lat = currentInput.latitude ?? loc?.lat ?? 21.0285;
    const lng = currentInput.longitude ?? loc?.lng ?? 105.8542;
    const tz = parseNumericTimezone(currentInput.timezone ?? loc?.timezone, 7);

    const resolvedClockHour =
      currentInput.birthClockHour !== undefined
        ? currentInput.birthClockHour
        : currentInput.birthHour !== undefined
          ? currentInput.birthHour
          : 12;

    const newEntry: SavedChartEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: chartName.trim(),
      birthDate: bDate.toISOString(),
      birthHour: resolvedClockHour,
      birthMinute: currentInput.birthMinute ?? 0,
      latitude: lat,
      longitude: lng,
      timezone: tz,
      locationName: currentInput.locationName ?? loc?.locationName ?? 'Hà Nội, Việt Nam',
      countryCode: currentInput.countryCode ?? loc?.countryCode ?? 'VN',
      countryName: currentInput.countryName ?? loc?.countryName ?? 'Việt Nam',
      gender: currentInput.gender ?? 'male',
      school: currentInput.school,
      createdAt: Date.now(),
    };

    const updated = [newEntry, ...savedList.filter((e) => e.name !== newEntry.name)];
    setSavedList(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSelectedId(newEntry.id);
    setShowSaveModal(false);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) return;
    const found = savedList.find((entry) => entry.id === id);
    if (found) {
      onSelectChart(found);
    }
  };

  const deleteChart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedList.filter((entry) => entry.id !== id);
    setSavedList(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (selectedId === id) setSelectedId('');
  };

  const toneConfig = {
    astral: {
      starIcon: 'text-astral-primary dark:text-astral-primary-dark',
      bookmarkIcon: 'text-astral-primary dark:text-astral-primary-dark',
      focusRing: 'focus:ring-astral-primary/50',
      saveBtnBadge:
        'bg-astral-primary/10 text-astral-primary dark:text-astral-primary-dark hover:bg-astral-primary/20 border-astral-primary/25',
      modalSaveBtn: 'bg-astral-primary text-white hover:bg-astral-primary/90',
    },
    gold: {
      starIcon: 'text-gold dark:text-gold-dark',
      bookmarkIcon: 'text-gold dark:text-gold-dark',
      focusRing: 'focus:ring-gold/50',
      saveBtnBadge:
        'bg-amber-50 dark:bg-amber-900/20 text-gold dark:text-gold-dark hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-700/50',
      modalSaveBtn: 'bg-gradient-to-r from-gold via-gold-light to-amber-500 text-white hover:brightness-110',
    },
    purple: {
      starIcon: 'text-purple-500',
      bookmarkIcon: 'text-purple-500 dark:text-purple-400',
      focusRing: 'focus:ring-purple-500',
      saveBtnBadge:
        'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800/50',
      modalSaveBtn: 'bg-purple-600 text-white hover:bg-purple-700',
    },
  }[tone];

  return (
    <div className="bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-[200px] flex-1">
        <Star className={cn('h-4 w-4 shrink-0', toneConfig.starIcon)} />
        <select
          aria-label={label}
          className={cn(
            'bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark text-xs sm:text-sm font-medium border border-border-light dark:border-border-dark/60 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 w-full transition-colors',
            toneConfig.focusRing,
          )}
          onChange={handleSelect}
          value={selectedId}
        >
          <option value="">
            -- Chọn {label} ({savedList.length}) --
          </option>
          {savedList.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name} ({new Date(entry.birthDate).toLocaleDateString('vi-VN')}{' '}
              {String(entry.birthHour).padStart(2, '0')}:{String(entry.birthMinute).padStart(2, '0')})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowSaveModal(true)}
          className={cn('gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold h-8', toneConfig.saveBtnBadge)}
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          Lưu Lá Số
        </Button>
      </div>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="max-w-sm p-5 space-y-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <Bookmark className={cn('h-4 w-4', toneConfig.bookmarkIcon)} />
              Lưu Lá Số Trên Thiết Bị
            </DialogTitle>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Nhập tên gợi nhớ để lưu thông tin ngày giờ sinh vào bộ nhớ thiết bị.
            </p>
          </DialogHeader>

          <Input
            type="text"
            placeholder="VD: Nguyễn Văn A, Bạn bè..."
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            className="w-full"
            autoFocus
          />

          {savedList.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 border-t border-border-light/40 dark:border-border-dark/40 pt-2">
              <p className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Danh sách đã lưu ({savedList.length}):
              </p>
              {savedList.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-surface-subtle-light dark:bg-white/5"
                >
                  <span className="truncate max-w-[200px] text-text-primary-light dark:text-text-primary-dark">
                    {entry.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => deleteChart(entry.id, e)}
                    className="text-red-500 hover:text-red-600 p-0.5 rounded transition-colors"
                    title="Xóa lá số"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 pt-2 sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSaveModal(false)} className="text-xs">
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveCurrentChart}
              disabled={!chartName.trim()}
              className={cn('text-xs font-semibold', toneConfig.modalSaveBtn)}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
