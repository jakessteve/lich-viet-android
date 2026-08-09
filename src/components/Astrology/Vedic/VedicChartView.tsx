import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton } from '../../shared';

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

  return (
    <div className="space-y-6">
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

      {/* Placeholder for results */}
      {result && !isCalculating && (
        <div className="glass-card p-6 text-center animate-fade-in-up">
          <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600 mb-2">construction</span>
          <p className="text-text-primary-light dark:text-text-primary-dark font-semibold">Lá số Vedic đang được xây dựng</p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">Dữ liệu từ OMCE v2 đã sẵn sàng.</p>
        </div>
      )}
    </div>
  );
};
