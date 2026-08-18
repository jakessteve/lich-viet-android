import React, { useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton, SavedChartsPicker } from '../../shared';
import { ExecutiveSnapshotCards } from '../../shared/ExecutiveSnapshotCards';
import { VedicChartDisplay } from './VedicChartDisplay';

export const VedicChartView: React.FC = () => {
  const { input, setInput, runCalc, isCalculating, error, result } = useAstrologyStore(
    useShallow((state) => ({
      input: state.vedicInput,
      setInput: state.setVedicInput,
      runCalc: state.calculateVedic,
      isCalculating: state.isCalculating,
      error: state.error,
      result: state.vedicResult,
    })),
  );

  const snapshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && !isCalculating) {
      const timer = setTimeout(() => {
        snapshotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [result, isCalculating]);

  const ascHouse = result?.houses?.[0];
  const lagnaSign = ascHouse?.sign || 'Karka';
  const moonPlanet = result?.planets?.find((p) => p.body === 'moon');
  const moonNakshatra = moonPlanet?.nakshatra || 'Shravana';
  const atmakaraka = 'Sao Chủ Linh Hồn';
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Saved Charts Quick Picker */}
      <SavedChartsPicker
        storageKey="saved_vedic_charts_v1"
        tone="purple"
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
            superpowerTitle={`Lagna ${lagnaSign} · Nakshatra ${moonNakshatra}`}
            superpowerDesc={`Cốt cách linh hồn dẫn dắt bởi ${atmakaraka}, hội tụ chiều sâu tâm thức, trực giác nhạy bén và khả năng thấu suốt vạn vật.`}
            knotTitle={`Bài Học Tiến Hóa Linh Hồn (${atmakaraka})`}
            knotDesc={`Học cách nuôi dưỡng nội lực tĩnh tại, buông bỏ sự phán xét và hướng tâm thức về sự an lạc nguyên bản.`}
            year2026CompassTitle={`Năm Bính Ngọ ${currentYear}`}
            year2026CompassDesc={`Năm thuận lợi cho việc học hỏi chiều sâu, mở rộng tu dưỡng tâm thức và vun đắp các mối quan hệ chân thành.`}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}
      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
            Thông Tin Người Xem
          </h3>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <BirthDataInput value={input} onChange={setInput} showName={false} />
          <div className="pt-2">
            <ActionButton
              onClick={() => {
                void runCalc();
              }}
              disabled={isCalculating}
              icon={isCalculating ? 'hourglass_empty' : 'bubble_chart'}
              variant="primary"
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Lập Lá Số Ấn Độ
            </ActionButton>
          </div>
        </div>
      </div>

      {result && !isCalculating && <VedicChartDisplay result={result} />}
    </div>
  );
};
