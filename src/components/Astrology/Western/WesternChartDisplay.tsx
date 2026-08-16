import React from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { WesternInterpretationPanel } from './WesternInterpretationPanel';
import { WesternWheelChart } from './WesternWheelChart';
import { WesternAspectGrid } from './WesternAspectGrid';
import { WesternDeclinationChart } from './WesternDeclinationChart';
import { WesternTechnicalTables } from './WesternTechnicalTables';

export const WesternChartDisplay: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const { sign: ascSign, degree: ascDeg } = (() => {
    const deg = Math.floor(result.ascendant % 30);
    const min = Math.floor(((result.ascendant % 30) - deg) * 60);
    const idx = Math.floor((((result.ascendant % 360) + 360) % 360) / 30);
    const signs = [
      'Bạch Dương',
      'Kim Ngưu',
      'Song Tử',
      'Cự Giải',
      'Sư Tử',
      'Xử Nữ',
      'Thiên Bình',
      'Bọ Cạp',
      'Nhân Mã',
      'Ma Kết',
      'Bảo Bình',
      'Song Ngư',
    ];
    return { sign: signs[idx], degree: `${deg}°${min.toString().padStart(2, '0')}'` };
  })();

  const { sign: mcSign } = (() => {
    const idx = Math.floor((((result.midheaven % 360) + 360) % 360) / 30);
    const signs = [
      'Bạch Dương',
      'Kim Ngưu',
      'Song Tử',
      'Cự Giải',
      'Sư Tử',
      'Xử Nữ',
      'Thiên Bình',
      'Bọ Cạp',
      'Nhân Mã',
      'Ma Kết',
      'Bảo Bình',
      'Song Ngư',
    ];
    return { sign: signs[idx] };
  })();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <WesternWheelChart result={result} />

      {/* New Grid and Declination Charts */}
      <WesternAspectGrid result={result} />
      <WesternDeclinationChart result={result} />

      <WesternInterpretationPanel result={result} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="label-standard">Ascendant</p>
          <p className="text-sm font-bold">
            {ascDeg} {ascSign}
          </p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="label-standard">Midheaven</p>
          <p className="text-sm font-bold">{mcSign}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="label-standard">Điểm Phúc (PoF)</p>
          <p className="text-sm font-bold">{result.partOfFortune.sign}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="label-standard">Hình dáng</p>
          <p className="text-sm font-bold capitalize">{result.chartShape?.shape || '—'}</p>
        </div>
      </div>

      {/* Technical Tables and Details */}
      <WesternTechnicalTables result={result} />
    </div>
  );
};

export default WesternChartDisplay;
