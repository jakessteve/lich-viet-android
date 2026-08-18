import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton, SegmentedControl, SavedChartsPicker } from '../../shared';
import { ExecutiveSnapshotCards } from '../../shared/ExecutiveSnapshotCards';
import { WesternNatalChartDisplay } from './WesternNatalChartDisplay';
import { TraditionalChartView } from './TraditionalChartView';
import { HuberChartView } from './HuberChartView';
import { ZodiacalReleasingView } from './ZodiacalReleasingView';
import { ThematicChartView } from './ThematicChartView';

const VIEW_TABS = [
  { id: 'natal', label: 'Bản Đồ Gốc', shortLabel: 'Lá Số' },
  { id: 'thematic', label: 'Chủ Đề & Sứ Mệnh', shortLabel: 'Chủ Đề' },
  { id: 'traditional', label: 'Cổ Điển & Lots', shortLabel: 'Cổ Điển' },
  { id: 'huber', label: 'Tâm Lý Huber 72n', shortLabel: 'Huber' },
  { id: 'releasing', label: 'Vận Hạn Hy Lạp', shortLabel: 'Hy Lạp' },
] as const;

type ViewTab = (typeof VIEW_TABS)[number]['id'];

export const WesternChartView: React.FC = () => {
  const { input, setInput, runCalc, isCalculating, error, result } = useAstrologyStore(
    useShallow((state) => ({
      input: state.westernInput,
      setInput: state.setWesternInput,
      runCalc: state.calculateWestern,
      isCalculating: state.isCalculating,
      error: state.error,
      result: state.westernNatalResult,
    })),
  );

  const [activeTab, setActiveTab] = useState<ViewTab>('natal');
  const snapshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && !isCalculating) {
      const timer = setTimeout(() => {
        snapshotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [result, isCalculating]);

  const sunObj = result?.objects?.find((o) => o.id === 'planet:sun');
  const moonObj = result?.objects?.find((o) => o.id === 'planet:moon');
  const sunSign = sunObj?.signVi || sunObj?.sign || 'Bạch Dương';
  const moonSign = moonObj?.signVi || moonObj?.sign || 'Bảo Bình';
  const ascSign = result?.angles?.Ascendant?.signVi || result?.angles?.Ascendant?.sign || 'Sư Tử';
  const currentYear = new Date().getFullYear();
  const birthDateObj = input.birthDate instanceof Date ? input.birthDate : new Date(input.birthDate || Date.now());

  return (
    <div className="space-y-6">
      {/* Saved Charts Quick Picker */}
      <SavedChartsPicker
        storageKey="saved_western_charts_v1"
        tone="astral"
        currentInput={input}
        onSelectChart={(entry) => {
          setInput({
            name: entry.name,
            birthDate: new Date(entry.birthDate),
            birthHour: entry.birthHour,
            birthMinute: entry.birthMinute,
            latitude: entry.latitude,
            longitude: entry.longitude,
            timezone: entry.timezone,
            locationName: entry.locationName,
            countryCode: entry.countryCode,
            countryName: entry.countryName,
          });
          setTimeout(() => void runCalc(), 50);
        }}
      />

      {/* 30-Second Executive Snapshot Cards */}
      {result && !isCalculating && (
        <div ref={snapshotRef} className="animate-fade-scale scroll-mt-4">
          <ExecutiveSnapshotCards
            name={input.locationName ? `Lá Số (${input.locationName})` : 'Bản Thân'}
            superpowerTitle={`Mặt Trời ${sunSign} · Cung Mọc ${ascSign}`}
            superpowerDesc={`Sự kết hợp giữa lý tưởng ${sunSign} và khí chất ${ascSign} tạo nên bản sắc độc lập, phong thái tự tin và năng lực sáng tạo vượt trội.`}
            knotTitle={`Cảm Xúc & Nhu Cầu Nội Tâm (Mặt Trăng ${moonSign})`}
            knotDesc={`Cần chú ý lắng nghe thế giới nội tâm của Mặt Trăng ${moonSign}, tránh kìm nén cảm xúc để giữ sự cân bằng Thân - Tâm.`}
            year2026CompassTitle={`Năm Bính Ngọ ${currentYear}`}
            year2026CompassDesc={`Năm thuận lợi cho việc bứt phá năng lực chuyên môn, mở rộng giao thiệp xã hội và thiết lập các mục tiêu lớn.`}
          />
        </div>
      )}

      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2 text-astral-primary dark:text-astral-primary-dark">
            <span className="material-icons-round text-base">person</span>
            Thông Tin Người Xem & Cài Đặt Hệ Thống
          </h3>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <BirthDataInput value={input} onChange={setInput} showName={false} />

          {/* House System & Zodiac Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="font-semibold text-text-primary-light dark:text-text-primary-dark block mb-1">
                Hệ Thống Cung Địa Bàn (House System):
              </label>
              <select
                aria-label="Hệ Thống Cung Địa Bàn"
                value={input.houseSystem || 'placidus'}
                onChange={(e) => setInput({ houseSystem: e.target.value as NonNullable<typeof input.houseSystem> })}
                className="w-full bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-astral-primary font-medium"
              >
                <option value="placidus">Placidus (Chuẩn Hiện Đại & Tâm Lý)</option>
                <option value="wholesign">Whole Sign (Cung Toàn Phần - Hy Lạp Cổ)</option>
                <option value="koch">Koch (Địa Bàn Sinh Nhật)</option>
                <option value="equal">Equal (Cung Đều 30°)</option>
                <option value="regiomontanus">Regiomontanus</option>
                <option value="campanus">Campanus (Không gian Thấu Kính)</option>
                <option value="porphyry">Porphyry (Chia Đều Góc)</option>
                <option value="morinus">Morinus (Hệ Thống Xích Đạo)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-text-primary-light dark:text-text-primary-dark block mb-1">
                Hệ Tọa Độ Hoàng Đạo (Zodiac Mode):
              </label>
              <select
                aria-label="Hệ Tọa Độ Hoàng Đạo"
                value={input.zodiacMode || 'tropical'}
                onChange={(e) => setInput({ zodiacMode: e.target.value as NonNullable<typeof input.zodiacMode> })}
                className="w-full bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-astral-primary font-medium"
              >
                <option value="tropical">Tropical (Nhiệt Đới - Xuân Phân 0° Bạch Dương)</option>
                <option value="draconic">Draconic (Linh Hồn - La Hầu 0° Bạch Dương)</option>
                <option value="sidereal">Sidereal (Thiên Văn Thực - Lahiri)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <ActionButton
              onClick={() => {
                void runCalc();
              }}
              disabled={isCalculating}
              icon={isCalculating ? 'hourglass_empty' : 'auto_graph'}
              variant="primary"
              className="flex-1 h-12 bg-astral-primary hover:bg-astral-primary/90 text-white shadow-md"
            >
              Lập Bản Đồ Sao
            </ActionButton>
            <ActionButton
              onClick={() => {
                const now = new Date();
                setInput({
                  ...input,
                  birthDate: now,
                  birthHour: now.getHours(),
                  birthMinute: now.getMinutes(),
                });
                setTimeout(() => void runCalc(), 50);
              }}
              disabled={isCalculating}
              icon="wb_sunny"
              variant="secondary"
              className="h-12 border-astral-border-light dark:border-astral-border-dark text-astral-primary dark:text-astral-primary-dark hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark"
            >
              Bầu Trời Hiện Tại
            </ActionButton>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/40 dark:border-border-dark/40">
            <span>
              Độ chính xác cao: <strong>Swiss Ephemeris (WASM)</strong>
            </span>
            <span>
              Hệ thống: <strong>{input.houseSystem || 'Placidus'} · True Node</strong>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Result Display with Modular Sub-views */}
      {result && !isCalculating && !error && (
        <div className="space-y-6">
          <SegmentedControl
            options={VIEW_TABS}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="Phân hệ chiêm tinh chuyên sâu"
            tone="astral"
          />

          {activeTab === 'natal' && <WesternNatalChartDisplay />}
          {activeTab === 'thematic' && <ThematicChartView natalResult={result} />}
          {activeTab === 'traditional' && <TraditionalChartView natalResult={result} birthDate={birthDateObj} />}
          {activeTab === 'huber' && <HuberChartView natalResult={result} birthDate={birthDateObj} />}
          {activeTab === 'releasing' && <ZodiacalReleasingView natalResult={result} birthDate={birthDateObj} />}
        </div>
      )}
    </div>
  );
};
