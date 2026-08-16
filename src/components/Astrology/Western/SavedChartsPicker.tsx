import React, { useState, useEffect } from 'react';
import type { WesternChartInput } from '../../../types/astrology';

const STORAGE_KEY = 'saved_western_charts_v1';

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
  createdAt: number;
}

interface SavedChartsPickerProps {
  currentInput: WesternChartInput;
  onSelectChart: (input: WesternChartInput) => void;
}

export const SavedChartsPicker: React.FC<SavedChartsPickerProps> = ({ currentInput, onSelectChart }) => {
  const [savedList, setSavedList] = useState<SavedChartEntry[]>([]);
  const [chartName, setChartName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedList(JSON.parse(raw));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const saveCurrentChart = () => {
    if (!chartName.trim()) return;
    const newEntry: SavedChartEntry = {
      id: String(Date.now()),
      name: chartName.trim(),
      birthDate: (currentInput.birthDate instanceof Date
        ? currentInput.birthDate
        : new Date(currentInput.birthDate)
      ).toISOString(),
      birthHour: currentInput.birthHour ?? 12,
      birthMinute: currentInput.birthMinute ?? 0,
      latitude: currentInput.latitude ?? 21.0285,
      longitude: currentInput.longitude ?? 105.8542,
      timezone: currentInput.timezone ?? 7,
      locationName: currentInput.locationName,
      createdAt: Date.now(),
    };

    const updated = [newEntry, ...savedList.filter((s) => s.name !== newEntry.name)];
    setSavedList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setChartName('');
    setShowSaveModal(false);
  };

  const _deleteChart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedList.filter((s) => s.id !== id);
    setSavedList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const found = savedList.find((s) => s.id === id);
    if (found) {
      onSelectChart({
        birthDate: new Date(found.birthDate),
        birthHour: found.birthHour,
        birthMinute: found.birthMinute,
        latitude: found.latitude,
        longitude: found.longitude,
        timezone: found.timezone,
        locationName: found.locationName,
      });
    }
  };

  return (
    <div className="bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-[200px] flex-1">
        <span className="material-icons-round text-amber-500 text-lg">star</span>
        <select
          aria-label="Lá số đã lưu"
          className="bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark text-xs sm:text-sm font-medium border border-border-light dark:border-border-dark/60 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-astral-primary w-full"
          onChange={handleSelect}
          defaultValue=""
        >
          <option value="">-- Chọn Lá Số Đã Lưu ({savedList.length}) --</option>
          {savedList.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name} ({new Date(entry.birthDate).toLocaleDateString('vi-VN')}{' '}
              {String(entry.birthHour).padStart(2, '0')}:{String(entry.birthMinute).padStart(2, '0')})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-astral-surface-light dark:bg-astral-surface-dark text-astral-primary dark:text-astral-primary-dark hover:bg-astral-primary/20 transition-colors border border-astral-border-light dark:border-astral-border-dark"
        >
          <span className="material-icons-round text-sm">bookmark_add</span>
          Lưu Lá Số
        </button>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-scale">
          <div className="surface-card rounded-2xl border border-border-light dark:border-border-dark/60 p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-astral-primary dark:text-astral-primary-dark">bookmark</span>
              Lưu Lá Số Trên Thiết Bị
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Nhập tên gợi nhớ để lưu thông tin ngày giờ sinh vào bộ nhớ thiết bị.
            </p>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A, Bạn bè..."
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark/60 bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-astral-primary"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveCurrentChart}
                disabled={!chartName.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-astral-primary text-white hover:bg-astral-primary/90 disabled:opacity-50"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
