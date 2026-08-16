import React, { useState, useMemo } from 'react';
import type { SwissNatalChartResult } from '../../../services/astrology/swissNatalChart';
import { analyzeHuberChart } from '../../../services/astrology/huberAstrology';

interface HuberChartViewProps {
  natalResult: SwissNatalChartResult;
  birthDate: Date;
}

export const HuberChartView: React.FC<HuberChartViewProps> = ({ natalResult, birthDate }) => {
  const currentAge = useMemo(() => {
    const now = new Date();
    return Math.max(0, (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000));
  }, [birthDate]);

  const [selectedAge, setSelectedAge] = useState<number>(Math.round(currentAge * 10) / 10);

  const huberAnalysis = useMemo(() => {
    return analyzeHuberChart(natalResult, selectedAge);
  }, [natalResult, selectedAge]);

  const { agePoint, figures, colorBalance } = huberAnalysis;

  return (
    <div className="space-y-6">
      {/* 1. 72-Year Life Clock Interactive Controller */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-light dark:border-border-dark/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-astral-primary dark:text-astral-primary-dark text-lg">
              schedule
            </span>
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              Đồng Hồ Cuộc Đời Huber 72 Năm (Lebensuhr)
            </h3>
          </div>
          <span className="badge-astral">
            Vòng Chu Kỳ {agePoint.cycle} (Tuổi hiện tại: {Math.round(currentAge * 10) / 10})
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
            <span>
              Tuổi Khảo Sát:{' '}
              <strong className="text-text-primary-light dark:text-text-primary-dark text-sm">
                {selectedAge} tuổi
              </strong>
            </span>
            <span>
              Đang qua Cung <strong>{agePoint.houseNumber}</strong> ({agePoint.progressPercent}% tiến trình cung)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="84"
            step="0.5"
            value={selectedAge}
            onChange={(e) => setSelectedAge(parseFloat(e.target.value))}
            className="w-full accent-astral-primary h-2 bg-surface-container-low dark:bg-surface-elevated-dark rounded-lg cursor-pointer"
          />
        </div>

        {/* Dynamic Zone Banner */}
        <div className="astral-card p-3.5 text-xs space-y-1">
          <p className="font-bold text-astral-primary dark:text-astral-primary-dark">{agePoint.zone}</p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">{agePoint.zoneDescription}</p>
        </div>

        {/* Active Aspects triggered by Age Point */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase">
            Góc Chiếu Điểm Tuổi Kích Hoạt Tại Mốc {selectedAge} Tuổi:
          </h4>
          {agePoint.activeAspects.length === 0 ? (
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
              Thời điểm nội tâm tĩnh lặng, không có góc chiếu hành tinh trực tiếp lên Điểm Tuổi.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agePoint.activeAspects.map((asp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span
                      className={
                        asp.energy === 'red'
                          ? 'text-rose-500'
                          : asp.energy === 'blue'
                            ? 'text-sky-500'
                            : 'text-emerald-500'
                      }
                    >
                      {asp.planet} • {asp.aspect}
                    </span>
                    <span className="text-[10px] text-text-secondary-light/70 dark:text-text-secondary-dark/70">
                      Orb {asp.orb.toFixed(1)}°
                    </span>
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">{asp.insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Color Polarity Balance */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <span className="material-icons-round text-indigo-500 text-lg">palette</span>
          Cân Bằng Năng Lượng Màu Sắc Huber (Color Polarity)
        </h3>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-xs font-bold text-rose-500 block">Đỏ (Động lực)</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{colorBalance.redCount}</span>
            <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark block">
              Góc Vuông/Xung
            </span>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <span className="text-xs font-bold text-sky-500 block">Xanh Dương (Tài năng)</span>
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400">{colorBalance.blueCount}</span>
            <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark block">
              Góc Tam/Lục hợp
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-bold text-emerald-500 block">Xanh Lá (Tâm thức)</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{colorBalance.greenCount}</span>
            <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark block">
              Góc Bất đồng
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <strong className="text-text-primary-light dark:text-text-primary-dark block mb-1">
            Tổng kết: {colorBalance.dominantEnergy}
          </strong>
          {colorBalance.interpretation}
        </div>
      </div>

      {/* 3. Huber Aspect Figures */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <span className="material-icons-round text-indigo-500 text-lg">interests</span>
          Mô Hình Cấu Trúc Góc Huber (Aspect Figures)
        </h3>

        {figures.length === 0 ? (
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
            Lá số sở hữu các đường góc đơn lẻ, tạo nên phong cách tự do và phân tán linh hoạt.
          </p>
        ) : (
          <div className="space-y-3">
            {figures.map((fig, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{fig.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10">
                    {fig.colorType}
                  </span>
                </div>
                {fig.planets.length > 0 && (
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Các đỉnh hành tinh:{' '}
                    <strong className="text-text-primary-light dark:text-text-primary-dark">
                      {fig.planets.join(', ')}
                    </strong>
                  </p>
                )}
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{fig.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
