import React, { useMemo, useState } from 'react';
import { Globe, Home } from 'lucide-react';
import type { WesternChartResult, PlanetPosition } from '../../../services/astrology/westernCalculator';
import { VedicInterpretationPanel } from './VedicInterpretationPanel';
import { VedicSquareChart } from './VedicSquareChart';
import { VedicDiamondChart } from './VedicDiamondChart';
import { VedicTechnicalTables } from './VedicTechnicalTables';
import { VimshottariDashaTimeline } from './VimshottariDashaTimeline';
import { VedicYogasCard } from './VedicYogasCard';
import { VedicGocharCard } from './VedicGocharCard';
import { calculateVedicDashaTimeline } from '../../../services/astrology/vedicDasha';
import { detectVedicYogasAndDoshas } from '../../../services/astrology/vedicYogas';
import { calculateVedicGochar } from '../../../services/astrology/gocharAnalysis';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { useShallow } from 'zustand/react/shallow';
import { WesternMarkdownExport } from '../WesternMarkdownExport';
import { SegmentedControl, type SegmentedOption } from '../../shared';

type VedicViewMode = 'simple' | 'advanced';

const STYLE_OPTIONS = [
  { id: 'south', label: 'Nam Ấn (Vuông)', shortLabel: 'Nam Ấn' },
  { id: 'north', label: 'Bắc Ấn (Kim Cương)', shortLabel: 'Bắc Ấn' },
] as const;

const TYPE_OPTIONS = [
  { id: 'D1', label: 'D1 Rasi (Bản Mệnh)', shortLabel: 'D1 Rasi' },
  { id: 'D9', label: 'D9 Navamsha (Hậu Vận)', shortLabel: 'D9 Navamsha' },
] as const;

const VEDIC_VIEW_MODES: readonly SegmentedOption<VedicViewMode>[] = [
  { id: 'simple', label: 'Luận Giải Cơ Bản', shortLabel: 'Cơ bản' },
  { id: 'advanced', label: 'Chuyên Sâu & Kỹ Thuật', shortLabel: 'Chuyên sâu' },
];

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
      <td className="py-2 px-3 text-sm text-center">
        {deg}°{min.toString().padStart(2, '0')}&apos; {SIGNS_SIDEREAL[signIndex]}
      </td>
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
    })),
  );

  const [viewMode, setViewMode] = useState<VedicViewMode>('simple');

  const moon = result.planets.find((p) => p.body === 'moon');
  const birthYear =
    vedicInput.birthDate instanceof Date
      ? vedicInput.birthDate.getFullYear()
      : new Date(vedicInput.birthDate).getFullYear();

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

  const gocharReport = useMemo(() => {
    return calculateVedicGochar(vedicInput);
  }, [vedicInput]);

  const ascSignIndex = Math.floor((((result.ascendant % 360) + 360) % 360) / 30);
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
          <p className="label-standard">Lagna (Cung Mọc)</p>
          <p className="text-sm font-bold">
            {ascDeg}°{ascMin.toString().padStart(2, '0')}&apos; {SIGNS_SIDEREAL[ascSignIndex]}
          </p>
        </div>
        {moon && (
          <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
            <p className="label-standard">Mặt Trăng (Rasi)</p>
            <p className="text-sm font-bold">{moon.nakshatra || '—'}</p>
          </div>
        )}
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="label-standard">Tổng hành tinh</p>
          <p className="text-sm font-bold">{result.planets.length}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="label-standard">Góc chiếu</p>
          <p className="text-sm font-bold">{result.aspects.length}</p>
        </div>
      </div>

      {/* Dual Tier Interpretation Toggle (Simple vs Advanced) */}
      <div className="space-y-3 pt-3 border-t border-border-light/40 dark:border-border-dark/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              Luận Giải Chiêm Tinh Vệ Đà
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Chọn mức độ chi tiết phù hợp với nhu cầu tra cứu của bạn.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WesternMarkdownExport system="vedic" />
            <SegmentedControl
              options={VEDIC_VIEW_MODES}
              value={viewMode}
              onChange={setViewMode}
              ariaLabel="Chế độ xem luận giải Vệ Đà"
              tone="purple"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* MODE 1: Cơ bản (Simple) */}
      {viewMode === 'simple' && (
        <div className="space-y-5 animate-fade-in">
          <VedicInterpretationPanel result={result} mode="simple" />
          {gocharReport && <VedicGocharCard gochar={gocharReport} />}
          {yogasAndDoshas.length > 0 && <VedicYogasCard items={yogasAndDoshas.slice(0, 3)} />}
          {dashaTimeline && <VimshottariDashaTimeline dasha={dashaTimeline} />}
        </div>
      )}

      {/* MODE 2: Chuyên sâu (Advanced & Technical) */}
      {viewMode === 'advanced' && (
        <div className="space-y-5 animate-fade-in">
          <VedicInterpretationPanel result={result} mode="advanced" />

          {/* Sidereal Planets Table */}
          <div className="glass-card overflow-hidden">
            <div className="card-header">
              <h3 className="section-title text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
                Vị Trí Hành Tinh Chi Tiết (Sidereal Lahiri)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-light/60 dark:border-border-dark/60 label-standard">
                    <th className="py-2 px-3">Hành tinh</th>
                    <th className="py-2 px-3 text-center">Vị trí</th>
                    <th className="py-2 px-3 text-center">Nakshatra</th>
                    <th className="py-2 px-3 text-center">Pada</th>
                    <th className="py-2 px-3 text-center">Nhà</th>
                  </tr>
                </thead>
                <tbody>
                  {result.planets
                    .filter((p) =>
                      ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'].includes(p.body),
                    )
                    .map((planet) => (
                      <VedicPlanetRow key={planet.body} planet={planet} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Houses */}
          <div className="glass-card overflow-hidden">
            <div className="card-header">
              <h3 className="section-title text-sm flex items-center gap-2">
                <Home className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
                12 Bhava (Cung Vị Vệ Đà & Tọa Độ)
              </h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3">
              {result.houses.map((house) => {
                const deg = Math.floor(house.longitude % 30);
                const min = Math.floor(((house.longitude % 30) - deg) * 60);
                return (
                  <div
                    key={house.index}
                    className="surface-card p-2.5 rounded-xl text-center border border-border-light/40 dark:border-border-dark/40"
                  >
                    <p className="label-standard text-purple-700 dark:text-purple-400 font-semibold">
                      Bhava {house.index}
                    </p>
                    <p className="text-xs font-semibold mt-0.5">
                      {deg}°{min.toString().padStart(2, '0')}&apos; {house.sign}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <VedicTechnicalTables result={result} />
          {yogasAndDoshas.length > 0 && <VedicYogasCard items={yogasAndDoshas} />}
          {dashaTimeline && <VimshottariDashaTimeline dasha={dashaTimeline} />}
          {gocharReport && <VedicGocharCard gochar={gocharReport} />}
        </div>
      )}
    </div>
  );
};

export default VedicChartDisplay;
