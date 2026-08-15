import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton } from '../../shared';
import { ExecutiveSnapshotCards } from '../../shared/ExecutiveSnapshotCards';
import { StoryCardExportModal } from '../../shared/StoryCardExportModal';
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

  const ascHouse = result?.houses?.[0];
  const lagnaSign = ascHouse?.sign || 'Karka';
  const moonPlanet = result?.planets?.find((p) => p.body === 'moon');
  const moonNakshatra = moonPlanet?.nakshatra || 'Shravana';
  const atmakaraka = 'Sao Chủ Linh Hồn';
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
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
          westernArchetype="Chiêm Tinh Tây Phương"
          tuViArchetype="Tử Vi Đẩu Số"
          vedicArchetype={`Lagna ${lagnaSign} · Nakshatra ${moonNakshatra}`}
          superpower={`Cốt cách linh hồn dẫn dắt bởi ${atmakaraka}, trực giác nhạy bén và tâm thức thâm sâu.`}
          actionCompass={`Năm ${currentYear}: Tĩnh tâm nuôi dưỡng nội lực, phát huy trí tuệ và lòng trắc ẩn.`}
        />
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}
      <div className="glass-card">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-purple-500 dark:text-purple-400 text-base">person</span>
            Thông Tin Người Xem
          </h3>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <BirthDataInput
            value={input}
            onChange={setInput}
            showName={false}
          />
          <div className="pt-2">
            <ActionButton
              onClick={() => {
                void runCalc();
              }}
              disabled={isCalculating}
              icon={isCalculating ? "hourglass_empty" : "bubble_chart"}
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
