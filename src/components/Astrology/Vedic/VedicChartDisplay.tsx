import React from 'react';
import type { WesternChartResult, PlanetPosition } from '../../../services/astrology/westernCalculator';
import { VedicInterpretationPanel } from './VedicInterpretationPanel';
import { VedicSquareChart } from './VedicSquareChart';
import { VedicDiamondChart } from './VedicDiamondChart';
import { VedicTechnicalTables } from './VedicTechnicalTables';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { useShallow } from 'zustand/react/shallow';

const BODY_LABELS: Record<string, string> = {
  sun: 'Mặt Trời',
  moon: 'Mặt Trăng',
  mercury: 'Sao Thủy',
  venus: 'Sao Kim',
  mars: 'Sao Hỏa',
  jupiter: 'Sao Mộc',
  saturn: 'Sao Thổ',
};

const BODY_ICONS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
};

const SIGNS_SIDEREAL = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư',
];

function VedicPlanetRow({ planet }: { planet: PlanetPosition }) {
  const normalizedLon = ((planet.siderealLongitude % 360) + 360) % 360;
  const deg = Math.floor(normalizedLon % 30);
  const min = Math.floor(((normalizedLon % 30) - deg) * 60);
  const signIndex = Math.floor(normalizedLon / 30);

  return (
    <tr className="border-b border-border-light/40 dark:border-border-dark/40">
      <td className="py-2 px-3 text-sm">
        <span className="mr-1.5">{BODY_ICONS[planet.body] || '●'}</span>
        <span className="font-semibold">{BODY_LABELS[planet.body] || planet.body}</span>
      </td>
      <td className="py-2 px-3 text-sm text-center">{deg}°{min.toString().padStart(2, '0')}&apos; {SIGNS_SIDEREAL[signIndex]}</td>
      <td className="py-2 px-3 text-sm text-center">{planet.nakshatra || '—'}</td>
      <td className="py-2 px-3 text-sm text-center">{planet.pada != null ? `Pada ${planet.pada + 1}` : '—'}</td>
      <td className="py-2 px-3 text-sm text-center font-mono">{planet.house}</td>
    </tr>
  );
}

export const VedicChartDisplay: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const { chartStyle, chartType, setChartStyle, setChartType } = useAstrologyStore(
    useShallow((state) => ({
      chartStyle: state.vedicChartStyle,
      chartType: state.vedicChartType,
      setChartStyle: state.setVedicChartStyle,
      setChartType: state.setVedicChartType,
    }))
  );

  const ascSignIndex = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
  const ascDeg = Math.floor(result.ascendant % 30);
  const ascMin = Math.floor(((result.ascendant % 30) - ascDeg) * 60);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
        <div className="bg-surface-light dark:bg-surface-dark p-1 rounded-xl flex items-center border border-border-light/60 dark:border-border-dark/60">
          <button
            onClick={() => setChartStyle('south')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartStyle === 'south'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            South (Square)
          </button>
          <button
            onClick={() => setChartStyle('north')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartStyle === 'north'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            North (Diamond)
          </button>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-1 rounded-xl flex items-center border border-border-light/60 dark:border-border-dark/60">
          <button
            onClick={() => setChartType('D1')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'D1'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            D1 Rasi
          </button>
          <button
            onClick={() => setChartType('D9')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'D9'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            D9 Navamsha
          </button>
        </div>
      </div>

      {chartStyle === 'south' ? (
        <VedicSquareChart result={result} type={chartType} />
      ) : (
        <VedicDiamondChart result={result} type={chartType} />
      )}
      
      <VedicInterpretationPanel result={result} />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Lagna</p>
          <p className="text-sm font-bold">{ascDeg}°{ascMin.toString().padStart(2, '0')}&apos; {SIGNS_SIDEREAL[ascSignIndex]}</p>
        </div>
        {result.planets.find((p) => p.body === 'moon') && (
          <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Mặt Trăng</p>
            <p className="text-sm font-bold">
              {result.planets.find((p) => p.body === 'moon')!.nakshatra || '—'}
            </p>
          </div>
        )}
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Tổng hành tinh</p>
          <p className="text-sm font-bold">{result.planets.length}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Góc chiếu</p>
          <p className="text-sm font-bold">{result.aspects.length}</p>
        </div>
      </div>

      {/* Sidereal Planets Table */}
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-purple-500 dark:text-purple-400 text-base">language</span>
            Vị Trí Hành Tinh (Sidereal Lahiri)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-light/60 dark:border-border-dark/60 text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                <th className="py-2 px-3">Hành tinh</th>
                <th className="py-2 px-3 text-center">Vị trí</th>
                <th className="py-2 px-3 text-center">Nakshatra</th>
                <th className="py-2 px-3 text-center">Pada</th>
                <th className="py-2 px-3 text-center">Nhà</th>
              </tr>
            </thead>
            <tbody>
              {result.planets
                .filter((p) => ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'].includes(p.body))
                .map((planet) => (
                  <VedicPlanetRow key={planet.body} planet={planet} />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <VedicTechnicalTables result={result} />

      {/* Houses */}
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-purple-500 dark:text-purple-400 text-base">home</span>
            12 Bhava (Nhà)
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3">
          {result.houses.map((house) => {
            const deg = Math.floor(house.longitude % 30);
            const min = Math.floor(((house.longitude % 30) - deg) * 60);
            return (
              <div key={house.index} className="surface-card p-2 rounded-xl text-center border border-border-light/40 dark:border-border-dark/40">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Bhava {house.index}</p>
                <p className="text-xs font-semibold">{deg}°{min.toString().padStart(2, '0')}&apos; {house.sign}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VedicChartDisplay;
