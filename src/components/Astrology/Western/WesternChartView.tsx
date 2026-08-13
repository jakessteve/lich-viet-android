import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { BirthDataInput, ActionButton } from '../../shared';
import { WesternChartDisplay } from './WesternChartDisplay';

export const WesternChartView: React.FC = () => {
  const { input, setInput, runCalc, isCalculating, error, result } = useAstrologyStore(
    useShallow((state) => ({
      input: state.westernInput,
      setInput: state.setWesternInput,
      runCalc: state.calculateWestern,
      isCalculating: state.isCalculating,
      error: state.error,
      result: state.westernResult,
    }))
  );

  return (
    <div className="space-y-6">
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
          <div className="pt-2">
            <ActionButton
              onClick={() => {
                void runCalc();
              }}
              disabled={isCalculating}
              icon={isCalculating ? "hourglass_empty" : "auto_graph"}
              variant="primary"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Lập Lá Số Tây Phương
            </ActionButton>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {result && !isCalculating && !error && <WesternChartDisplay result={result} />}
    </div>
  );
};
