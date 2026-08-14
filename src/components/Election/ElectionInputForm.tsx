import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useElectionStore } from '../../stores/electionStore';
import { ActionButton, SegmentedControl, type SegmentedOption } from '../shared';
import type { ElectionActivityType, ElectionInput } from '../../types/election';

const ACTIVITY_OPTIONS: readonly SegmentedOption<ElectionActivityType>[] = [
  { id: 'cuoi-hoi', label: 'Cưới hỏi', icon: 'favorite' },
  { id: 'khai-truong', label: 'Khai trương', icon: 'storefront' },
  { id: 'xay-dung', label: 'Xây dựng', icon: 'architecture' },
  { id: 'nhap-trach', label: 'Nhập trạch', icon: 'home' },
  { id: 'xuat-hanh', label: 'Xuất hành', icon: 'flight_takeoff' },
  { id: 'khac', label: 'Khác', icon: 'more_horiz' },
];

export const ElectionInputForm: React.FC = () => {
  const location = useLocation();
  const initializedFromUrl = useRef(false);
  const { input, setInput, runScan, isScanning } = useElectionStore(
    useShallow((state) => ({
      input: state.input,
      setInput: state.setInput,
      runScan: state.runScan,
      isScanning: state.isScanning,
    })),
  );

  // Local state for dates
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');

  // Handle URL query parameters for seamless deep linking from Am Lich
  useEffect(() => {
    if (initializedFromUrl.current) return;
    const params = new URLSearchParams(location.search);
    const startParam = params.get('start') || params.get('from');
    const endParam = params.get('end') || params.get('to');
    const actParam = params.get('activity') as ElectionActivityType | null;

    if (startParam || endParam || actParam) {
      const nextUpdates: Partial<ElectionInput> = {};
      if (startParam) {
        const d = new Date(startParam);
        if (!isNaN(d.getTime())) {
          d.setHours(0, 0, 0, 0);
          nextUpdates.startDate = d;
        }
      }
      if (endParam) {
        const d = new Date(endParam);
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          nextUpdates.endDate = d;
        }
      }
      if (actParam && ACTIVITY_OPTIONS.some((opt) => opt.id === actParam)) {
        nextUpdates.activityType = actParam;
      }
      setInput(nextUpdates);
      initializedFromUrl.current = true;
      setTimeout(() => {
        void runScan();
      }, 100);
    }
  }, [location.search, setInput, runScan]);

  useEffect(() => {
    // Format YYYY-MM-DD for date input
    const toIsoDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    setStartStr(toIsoDate(input.startDate));
    setEndStr(toIsoDate(input.endDate));
  }, [input.startDate, input.endDate]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartStr(val);
    if (val) {
      const d = new Date(val);
      d.setHours(0, 0, 0, 0);
      setInput({ startDate: d });
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndStr(val);
    if (val) {
      const d = new Date(val);
      d.setHours(23, 59, 59, 999);
      setInput({ endDate: d });
    }
  };

  const handleActivityChange = (val: ElectionActivityType) => {
    setInput({ activityType: val });
  };

  return (
    <div className="glass-card">
      <div className="p-4 sm:p-5 space-y-5">
        
        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-standard mb-1.5 block">Từ ngày</label>
            <input 
              type="date"
              className="surface-control w-full p-3 font-medium text-text-primary-light dark:text-text-primary-dark"
              value={startStr}
              onChange={handleStartChange}
            />
          </div>
          <div>
            <label className="label-standard mb-1.5 block">Đến ngày</label>
            <input 
              type="date"
              className="surface-control w-full p-3 font-medium text-text-primary-light dark:text-text-primary-dark"
              value={endStr}
              onChange={handleEndChange}
              min={startStr}
            />
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label className="label-standard mb-2.5 block">Mục đích (Sự kiện)</label>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
            <SegmentedControl
              options={ACTIVITY_OPTIONS}
              value={input.activityType}
              onChange={handleActivityChange}
              ariaLabel="Chọn loại sự kiện"
              className="w-max sm:w-full min-w-full"
            />
          </div>
        </div>

        {/* Optional Birth Year */}
        <div>
          <label className="label-standard mb-1.5 block">Năm sinh người chủ sự (Tùy chọn)</label>
          <input
            type="number"
            min="1900"
            max="2100"
            className="surface-control w-full p-3 font-medium transition-colors"
            placeholder="Nhập năm sinh (VD: 1990) để xem tuổi xung khắc"
            value={input.birthYear || ''}
            onChange={(e) => setInput({ birthYear: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div className="pt-2">
          <ActionButton
            onClick={() => {
              void runScan();
            }}
            disabled={isScanning}
            icon={isScanning ? "hourglass_empty" : "search"}
            variant="primary"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Tìm Ngày Tốt
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
