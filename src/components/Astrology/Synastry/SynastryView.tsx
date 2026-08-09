import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton } from '../../shared';

export const SynastryView: React.FC = () => {
  const { input, setInput, runCalc, isCalculating, error, result } = useAstrologyStore(
    useShallow((state) => ({
      input: state.synastryInput,
      setInput: state.setSynastryInput,
      runCalc: state.calculateSynastry,
      isCalculating: state.isCalculating,
      error: state.error,
      result: state.synastryResult,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <div className="card-header bg-rose-50 dark:bg-rose-900/10">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-rose-500 text-base">face</span>
              Người Nam (A)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <BirthDataInput
              value={input.profileA}
              onChange={(val) => setInput({ profileA: { ...val, name: val.name || '' } })}
              showName={true}
            />
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header bg-pink-50 dark:bg-pink-900/10">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-pink-500 text-base">face_3</span>
              Người Nữ (B)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <BirthDataInput
              value={input.profileB}
              onChange={(val) => setInput({ profileB: { ...val, name: val.name || '' } })}
              showName={true}
            />
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <ActionButton
          onClick={() => {
            void runCalc();
          }}
          disabled={isCalculating}
          icon={isCalculating ? "hourglass_empty" : "favorite"}
          variant="primary"
          className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white"
        >
          Chấm Điểm Hợp Duyên
        </ActionButton>
      </div>

      {/* Placeholder for results */}
      {result && !isCalculating && (
        <div className="glass-card p-6 text-center animate-fade-in-up">
          <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600 mb-2">construction</span>
          <p className="text-text-primary-light dark:text-text-primary-dark font-semibold">Kết quả Hợp Lá Số đang được xây dựng</p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">Dữ liệu từ OMCE v2 đã sẵn sàng.</p>
        </div>
      )}
    </div>
  );
};
