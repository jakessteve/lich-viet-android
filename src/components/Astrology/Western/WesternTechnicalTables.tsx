import React, { useState } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { getSignInterpretation, getPlanetInSignInterpretation, getHouseInterpretation, getPlanetInHouseInterpretation } from '../../../services/astrology/interpretations';

const BODY_LABELS: Record<string, string> = {
  sun: 'Mặt Trời', moon: 'Mặt Trăng', mercury: 'Sao Thủy', venus: 'Sao Kim',
  mars: 'Sao Hỏa', jupiter: 'Sao Mộc', saturn: 'Sao Thổ', uranus: 'Thiên Vương Tinh',
  neptune: 'Hải Vương Tinh', pluto: 'Diêm Vương Tinh',
  northnode: 'La Hầu (Bắc Giao)', southnode: 'Kế Đô (Nam Giao)',
  chiron: 'Chiron'
};

const BODY_ICONS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀',
  mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅',
  neptune: '♆', pluto: '♇', northnode: '☊', southnode: '☋',
  chiron: '⚷'
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'Trùng Tụ (Conjunction)',
  opposition: 'Đối Đỉnh (Opposition)',
  trine: 'Tam Hợp (Trine)',
  square: 'Vuông Góc (Square)',
  sextile: 'Lục Hợp (Sextile)',
};

const ASPECT_ICONS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹',
};

export const WesternTechnicalTables: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'planets' | 'houses'>('planets');
  const mainPlanets = result.planets.filter(p => BODY_LABELS[p.body]);
  
  const formattedDeg = (deg: number, min: number) => `${deg}°${min.toString().padStart(2, '0')}'`;

  return (
    <div className="space-y-6 mt-6">
      {/* Vị trí hành tinh */}
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-blue-500 dark:text-blue-400 text-base">language</span>
            Vị trí Hành Tinh (Planetary Positions)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-light/60 dark:border-border-dark/60 text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                <th className="py-2 px-3">Hành tinh</th>
                <th className="py-2 px-3 text-center">Cung Hoàng Đạo</th>
                <th className="py-2 px-3 text-center">Tọa độ</th>
                <th className="py-2 px-3 text-center">Nhà</th>
                <th className="py-2 px-3 text-center">Retrograde</th>
              </tr>
            </thead>
            <tbody>
              {mainPlanets.map((p) => {
                const deg = Math.floor(p.degreeInSign);
                const min = Math.floor((p.degreeInSign - deg) * 60);
                return (
                  <tr key={p.body} className="border-b border-border-light/40 dark:border-border-dark/40">
                    <td className="py-2 px-3 text-sm">
                      <span className="mr-1.5 font-bold">{BODY_ICONS[p.body] || '●'}</span>
                      <span className="font-semibold">{BODY_LABELS[p.body] || p.body}</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-center font-medium">{p.sign}</td>
                    <td className="py-2 px-3 text-sm text-center font-mono">{formattedDeg(deg, min)}</td>
                    <td className="py-2 px-3 text-sm text-center font-mono">Nhà {p.house}</td>
                    <td className="py-2 px-3 text-sm text-center">{p.retrograde ? 'Rx' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nhà */}
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-blue-500 dark:text-blue-400 text-base">home</span>
            Hệ thống Nhà (House Cusps - Placidus/Porphyry)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-light/60 dark:border-border-dark/60 text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                <th className="py-2 px-3">Đỉnh Nhà</th>
                <th className="py-2 px-3 text-center">Cung Hoàng Đạo</th>
                <th className="py-2 px-3 text-center">Tọa độ</th>
              </tr>
            </thead>
            <tbody>
              {result.houses.map((h) => {
                const hdeg = Math.floor(h.longitude % 30);
                const hmin = Math.floor(((h.longitude % 30) - hdeg) * 60);
                const label = h.index === 1 ? 'Nhà 1 (Ascendant)' : h.index === 10 ? 'Nhà 10 (Midheaven)' : `Nhà ${h.index}`;
                return (
                  <tr key={h.index} className="border-b border-border-light/40 dark:border-border-dark/40">
                    <td className="py-2 px-3 text-sm font-semibold">{label}</td>
                    <td className="py-2 px-3 text-sm text-center">{h.sign}</td>
                    <td className="py-2 px-3 text-sm text-center font-mono">{formattedDeg(hdeg, hmin)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Góc hợp */}
      {result.aspects.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="card-header">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-blue-500 dark:text-blue-400 text-base">share</span>
              Các góc chiếu (Aspects)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-light/60 dark:border-border-dark/60 text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  <th className="py-2 px-3">Hành Tinh 1</th>
                  <th className="py-2 px-3 text-center">Góc Hợp</th>
                  <th className="py-2 px-3 text-center">Hành Tinh 2</th>
                  <th className="py-2 px-3 text-center">Sai số (Orb)</th>
                </tr>
              </thead>
              <tbody>
                {result.aspects.filter(a => ASPECT_LABELS[a.type]).map((a, i) => (
                  <tr key={i} className="border-b border-border-light/40 dark:border-border-dark/40">
                    <td className="py-2 px-3 text-sm">
                      <span className="mr-1.5 font-bold">{BODY_ICONS[a.planetA]}</span>
                      {BODY_LABELS[a.planetA] || a.planetA}
                    </td>
                    <td className="py-2 px-3 text-sm text-center font-semibold text-blue-500">
                      <span className="mr-1.5 font-bold text-lg leading-none">{ASPECT_ICONS[a.type]}</span>
                      {ASPECT_LABELS[a.type]}
                    </td>
                    <td className="py-2 px-3 text-sm text-center">
                      <span className="mr-1.5 font-bold">{BODY_ICONS[a.planetB]}</span>
                      {BODY_LABELS[a.planetB] || a.planetB}
                    </td>
                    <td className="py-2 px-3 text-sm text-center font-mono">{a.orb.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diễn giải cơ bản */}
      <div className="glass-card overflow-hidden">
        <div className="card-header border-b border-border-light/40 dark:border-border-dark/40">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-blue-500 dark:text-blue-400 text-base">menu_book</span>
              Luận Giải Chi Tiết
            </h3>
            <div className="flex bg-surface-light dark:bg-surface-dark rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('planets')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'planets' ? 'bg-blue-500 text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                Hành Tinh
              </button>
              <button 
                onClick={() => setActiveTab('houses')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'houses' ? 'bg-blue-500 text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                12 Nhà
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {activeTab === 'planets' && (
            <>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  Cung Mọc (Ascendant) - {result.houses.find(h => h.index === 1)?.sign}
                </h4>
                <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                  {getSignInterpretation(result.houses.find(h => h.index === 1)?.sign || '') || 'Cung Mọc là vỏ bọc, cách bạn tiếp cận thế giới và ấn tượng đầu tiên bạn tạo ra với người khác.'}
                </p>
              </div>

              {mainPlanets.map(p => {
                const inSign = getPlanetInSignInterpretation(p.body, p.sign);
                const inHouse = getPlanetInHouseInterpretation(p.body, p.house);
                if (!inSign && !inHouse) return null;
                return (
                  <div key={p.body + 'interp'} className="space-y-3 bg-surface-light dark:bg-surface-dark p-3 rounded-xl">
                    <h4 className="font-bold text-md text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <span>{BODY_ICONS[p.body]}</span>
                      {BODY_LABELS[p.body]}
                    </h4>
                    
                    {inSign && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark tracking-wider">
                          Ở Cung {p.sign}:
                        </p>
                        <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                          {inSign}
                        </p>
                      </div>
                    )}
                    
                    {inHouse && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark tracking-wider">
                          Ở Nhà {p.house}:
                        </p>
                        <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                          {inHouse}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'houses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.houses.map(h => {
                const meaning = getHouseInterpretation(h.index);
                if (!meaning) return null;
                return (
                  <div key={'house' + h.index} className="bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-border-light/20 dark:border-border-dark/20">
                    <h4 className="font-bold text-md text-blue-600 dark:text-blue-400 mb-2">
                      Nhà {h.index} ({h.sign})
                    </h4>
                    <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                      {meaning}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
