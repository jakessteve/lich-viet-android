import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton } from '../../shared';
import { ExecutiveSnapshotCards } from '../../shared/ExecutiveSnapshotCards';
import { StoryCardExportModal } from '../../shared/StoryCardExportModal';
import { WesternNatalChartDisplay } from './WesternNatalChartDisplay';

export const WesternChartView: React.FC = () => {
  const { input, setInput, runCalc, isCalculating, error, result } = useAstrologyStore(
    useShallow((state) => ({
      input: state.westernInput,
      setInput: state.setWesternInput,
      runCalc: state.calculateWestern,
      isCalculating: state.isCalculating,
      error: state.error,
      result: state.westernNatalResult,
    }))
  );

  const [showStoryModal, setShowStoryModal] = useState(false);
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

  return (
    <div className="space-y-6">
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
            onOpenStoryExport={() => setShowStoryModal(true)}
          />
        </div>
      )}

      {/* Story 9:16 Modal */}
      {result && (
        <StoryCardExportModal
          isOpen={showStoryModal}
          onClose={() => setShowStoryModal(false)}
          name="Bản Thân"
          solarDate={input.birthDate ? input.birthDate.toLocaleDateString('vi-VN') : '1995-05-15'}
          westernArchetype={`Mặt Trời ${sunSign} · Cung Mọc ${ascSign}`}
          tuViArchetype="Tử Vi Đẩu Số"
          vedicArchetype="Chiêm Tinh Vệ Đà"
          superpower={`Bản mệnh nổi bật với tư duy độc lập của ${sunSign} và phong thái ${ascSign}.`}
          actionCompass={`Năm ${currentYear}: Tận dụng tối đa năng lực lãnh đạo và tư duy đổi mới để kiến tạo thành công.`}
        />
      )}

      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-indigo-500 dark:text-indigo-400 text-base">person</span>
            Thông Tin Người Xem
          </h3>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <BirthDataInput
            value={input}
            onChange={setInput}
            showName={false}
          />
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <ActionButton
              onClick={() => {
                void runCalc();
              }}
              disabled={isCalculating}
              icon={isCalculating ? "hourglass_empty" : "auto_graph"}
              variant="primary"
              className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Lập Lá Số Gốc
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
              className="h-12 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              Bầu Trời Hiện Tại
            </ActionButton>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/40 dark:border-border-dark/40">
            <span>Độ chính xác cao: <strong>Swiss Ephemeris (WASM)</strong></span>
            <span>Hệ thống: <strong>Placidus · True Node</strong></span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {result && !isCalculating && !error && <WesternNatalChartDisplay />}
    </div>
  );
};
