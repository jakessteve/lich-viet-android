import React from 'react';
import type { WesternChartResult, PlanetPosition, DignityResult, AspectResult } from '../../../services/astrology/westernCalculator';

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

function PlanetRow({ planet, dignity }: { planet: PlanetPosition; dignity?: DignityResult }) {
  const deg = Math.floor(planet.degreeInSign);
  const min = Math.floor((planet.degreeInSign - deg) * 60);
  return (
    <tr className="border-b border-border-light/40 dark:border-border-dark/40">
      <td className="py-2 px-3 text-sm">
        <span className="mr-1.5">{BODY_ICONS[planet.body] || '●'}</span>
        <span className="font-semibold">{BODY_LABELS[planet.body] || planet.body}</span>
      </td>
      <td className="py-2 px-3 text-sm text-center">{deg}°{min.toString().padStart(2, '0')}&apos; {planet.sign}</td>
      <td className="py-2 px-3 text-sm text-center font-mono">{planet.house}</td>
      <td className="py-2 px-3 text-sm text-center">
        {dignity ? (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
            dignity.domicile ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
            dignity.exaltation ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' :
            dignity.detriment ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
            dignity.fall ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
            ''
          }`}>
            {dignity.domicile ? 'Cư' : dignity.exaltation ? 'Vượng' : dignity.detriment ? 'Hãm' : dignity.fall ? 'Suy' : '—'}
          </span>
        ) : '—'}
      </td>
    </tr>
  );
}

function AspectBadge({ aspect }: { aspect: AspectResult }) {
  const typeColors: Record<string, string> = {
    conjunction: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    opposition: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    trine: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    square: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    sextile: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    quincunx: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    semisextile: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    semisquare: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };
  const typeLabels: Record<string, string> = {
    conjunction: 'Hợp',
    opposition: 'Xung',
    trine: 'Tam hợp',
    square: 'Vuông',
    sextile: 'Lục hợp',
    quincunx: '150°',
    semisextile: '30°',
    semisquare: '45°',
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${typeColors[aspect.type] || 'bg-gray-100 text-gray-600'}`}>
      {BODY_ICONS[aspect.planetA]}{aspect.planetA} {typeLabels[aspect.type] || aspect.type} {BODY_ICONS[aspect.planetB]}{aspect.planetB}
    </span>
  );
}

export const WesternChartDisplay: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const dignitiesByBody = Object.fromEntries(result.dignities.map((d) => [d.body, d]));
  const displayedAspects = result.aspects.filter((a) =>
    ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type)
  ).slice(0, 12);

  const { sign: ascSign, degree: ascDeg } = (() => {
    const deg = Math.floor((result.ascendant % 30));
    const min = Math.floor(((result.ascendant % 30) - deg) * 60);
    const idx = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
    const signs = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];
    return { sign: signs[idx], degree: `${deg}°${min.toString().padStart(2, '0')}'` };
  })();

  const { sign: mcSign } = (() => {
    const idx = Math.floor(((result.midheaven % 360) + 360) % 360 / 30);
    const signs = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];
    return { sign: signs[idx] };
  })();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Ascendant</p>
          <p className="text-sm font-bold">{ascDeg} {ascSign}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Midheaven</p>
          <p className="text-sm font-bold">{mcSign}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Cung Mọc</p>
          <p className="text-sm font-bold">{result.partOfFortune.sign}</p>
        </div>
        <div className="surface-card p-3 rounded-2xl border border-border-light/60 dark:border-border-dark/60 text-center">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Hình dáng</p>
          <p className="text-sm font-bold capitalize">{result.chartShape?.shape || '—'}</p>
        </div>
      </div>

      {/* Planets Table */}
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-indigo-500 dark:text-indigo-400 text-base">language</span>
            Vị Trí Hành Tinh
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-light/60 dark:border-border-dark/60 text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                <th className="py-2 px-3">Hành tinh</th>
                <th className="py-2 px-3 text-center">Vị trí</th>
                <th className="py-2 px-3 text-center">Nhà</th>
                <th className="py-2 px-3 text-center">Cường vị</th>
              </tr>
            </thead>
            <tbody>
              {result.planets.map((planet) => (
                <PlanetRow key={planet.body} planet={planet} dignity={dignitiesByBody[planet.body]} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Houses */}
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-indigo-500 dark:text-indigo-400 text-base">home</span>
            12 Cung Địa Bàn (Porphyry)
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3">
          {result.houses.map((house) => {
            const deg = Math.floor((house.longitude % 30));
            const min = Math.floor(((house.longitude % 30) - deg) * 60);
            return (
              <div key={house.index} className="surface-card p-2 rounded-xl text-center border border-border-light/40 dark:border-border-dark/40">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Nhà {house.index}</p>
                <p className="text-xs font-semibold">{deg}°{min.toString().padStart(2, '0')}&apos; {house.sign}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aspects */}
      {displayedAspects.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="card-header">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-indigo-500 dark:text-indigo-400 text-base">timeline</span>
              Góc Chiếu Chính
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            {displayedAspects.map((aspect, i) => (
              <AspectBadge key={`${aspect.planetA}-${aspect.planetB}-${aspect.type}-${i}`} aspect={aspect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WesternChartDisplay;
