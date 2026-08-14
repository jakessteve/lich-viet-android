import React, { useMemo } from 'react';
import type { WesternChartResult, PlanetPosition } from '../../../services/astrology/westernCalculator';
import { VedicInterpretationPanel } from './VedicInterpretationPanel';
import { VedicSquareChart } from './VedicSquareChart';
import { VedicDiamondChart } from './VedicDiamondChart';
import { VedicTechnicalTables } from './VedicTechnicalTables';
import { VimshottariDashaTimeline } from './VimshottariDashaTimeline';
import { VedicYogasCard } from './VedicYogasCard';
import { calculateVedicDashaTimeline } from '../../../services/astrology/vedicDasha';
import { detectVedicYogasAndDoshas } from '../../../services/astrology/vedicYogas';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { useShallow } from 'zustand/react/shallow';
import { SegmentedControl } from '../../shared';

const STYLE_OPTIONS = [
  { id: 'south', label: 'Nam Ấn (Vuông)', icon: 'grid_view', shortLabel: 'Nam Ấn' },
  { id: 'north', label: 'Bắc Ấn (Kim Cương)', icon: 'crop_square', shortLabel: 'Bắc Ấn' },
] as const;

const TYPE_OPTIONS = [
  { id: 'D1', label: 'D1 Rasi (Bản Mệnh)', icon: 'auto_graph', shortLabel: 'D1 Rasi' },
  { id: 'D9', label: 'D9 Navamsha (Hậu Vận)', icon: 'favorite', shortLabel: 'D9 Navamsha' },
] as const;

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
  const { chartStyle, chartType, setChartStyle, setChartType, vedicInput } = useAstrologyStore(
    useShallow((state) => ({
      chartStyle: state.vedicChartStyle,
      chartType: state.vedicChartType,
      setChartStyle: state.setVedicChartStyle,
      setChartType: state.setVedicChartType,
      vedicInput: state.vedicInput,
    }))
  );

  const moon = result.planets.find((p) => p.body === 'moon');
  const birthYear = vedicInput.birthDate instanceof Date ? vedicInput.birthDate.getFullYear() : new Date(vedicInput.birthDate).getFullYear();

  const dashaTimeline = useMemo(() => {
    if (!moon) return null;
    return calculateVedicDashaTimeline(moon.siderealLongitude, birthYear || 2000);
  }, [moon, birthYear]);

  const yogasAndDoshas = useMemo(() => {
    const positions = result.planets.map((p) => ({
      body: p.body,
      siderealLongitude: p.siderealLongitude,
      house: p.house,
      signIndex: p.signIndex,
    }));
    return detectVedicYogasAndDoshas(positions, result.ascendant);
  }, [result]);

  const ascSignIndex = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
  const ascDeg = Math.floor(result.ascendant % 30);
  const ascMin = Math.floor(((result.ascendant % 30) - ascDeg) * 60);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <SegmentedControl
          options={STYLE_OPTIONS}
          value={chartStyle}
          onChange={setChartStyle}
          ariaLabel="Kiểu biểu đồ Vệ Đà"
          tone="purple"
        />
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={chartType}
          onChange={setChartType}
          ariaLabel="Loại lá số Vệ Đà"
          tone="purple"
        />
      </div>

      {chartStyle === 'south' ? (
        <VedicSquareChart result={result} type={chartType} />
      ) : (
        <VedicDiamondChart result={result} type={chartType} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Lagna (Cung Mọc)</p>
          <p className="text-sm font-bold">{ascDeg}°{ascMin.toString().padStart(2, '0')}&apos; {SIGNS_SIDEREAL[ascSignIndex]}</p>
        </div>
        {moon && (
          <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Mặt Trăng (Rasi)</p>
            <p className="text-sm font-bold">
              {moon.nakshatra || '—'}
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

      {dashaTimeline && <VimshottariDashaTimeline dasha={dashaTimeline} />}

      {yogasAndDoshas.length > 0 && <VedicYogasCard items={yogasAndDoshas} />}

      <VedicInterpretationPanel result={result} />

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
