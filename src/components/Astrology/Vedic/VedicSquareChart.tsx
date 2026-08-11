import React, { useEffect, useMemo, useState } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const SIZE = 360;
const PAD = 4;
const GAP = 4;
const CELL = (SIZE - PAD * 2 - GAP * 3) / 4;

const SIGN_SHORT = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const SIGN_COLORS = ['#e74c3c', '#27ae60', '#f39c12', '#3498db', '#e74c3c', '#27ae60', '#f39c12', '#3498db', '#e74c3c', '#27ae60', '#f39c12', '#3498db'];

const BODY_GLYPHS: Record<string, string> = { sun: 'Su', moon: 'Mo', mercury: 'Me', venus: 'Ve', mars: 'Ma', jupiter: 'Ju', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
const BODY_COLORS: Record<string, string> = { sun: '#e67e22', moon: '#8e44ad', mercury: '#1abc9c', venus: '#27ae60', mars: '#e74c3c', jupiter: '#f39c12', saturn: '#555', rahu: '#2c3e50', ketu: '#c0392b' };

// Standard North Indian chart: counter-clockwise from top center
// Row 0: [12] [1]  [2]  [3]
// Row 1: [11] [-]  [-]  [4]
// Row 2: [10] [-]  [-]  [5]
// Row 3: [9]  [8]  [7]  [6]
const HOUSE_POSITIONS = [
  { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 },
  { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 3, c: 0 },
  { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
];

function getColors(dark: boolean) {
  return {
    stroke: dark ? '#888' : '#555',
    bg: dark ? '#1a1a1a' : '#fff',
    text: dark ? '#ccc' : '#333',
    cellBg: dark ? '#222' : '#fafafa',
    centerBg: dark ? '#1a1a2e' : '#f0f0f4',
  };
}

const xForCol = (c: number) => PAD + c * (CELL + GAP);
const yForRow = (r: number) => PAD + r * (CELL + GAP);

export const VedicSquareChart: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const [dark, setDark] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const c = useMemo(() => getColors(dark), [dark]);

  const { housePlanets, moonHouse, moonNak } = useMemo(() => {
    const map: Record<number, Array<{ body: string; signIndex: number }>> = {};
    for (let i = 1; i <= 12; i++) map[i] = [];
    let mh = 0; let mn = '';
    result.planets.filter((p) => BODY_GLYPHS[p.body]).forEach((p) => {
      const h = p.house;
      if (h >= 1 && h <= 12) {
        const si = Math.floor(((p.siderealLongitude % 360) + 360) % 360 / 30);
        map[h].push({ body: p.body, signIndex: si });
        if (p.body === 'moon') { mh = h; mn = p.nakshatra || ''; }
      }
    });
    return { housePlanets: map, moonHouse: mh, moonNak: mn };
  }, [result]);

  const ascSi = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);

  return (
    <div className="flex justify-center" data-vedic-chart-export>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE }} aria-label="Vedic Birth Chart (North Indian)">
        <rect width={SIZE} height={SIZE} fill={c.bg} rx="4" />

        {HOUSE_POSITIONS.map((pos, i) => {
          const x = xForCol(pos.c), y = yForRow(pos.r);
          const hx = x + CELL / 2, hy = y + CELL / 2;
          const hNum = i + 1;
          const planets = housePlanets[hNum] || [];
          const signIndex = result.houses.find((h) => h.index === hNum)?.signIndex ?? 0;

          return (
            <g key={i}>
              <rect x={x} y={y} width={CELL} height={CELL} fill={c.cellBg} stroke={c.stroke} strokeWidth="1.2" strokeOpacity={0.6} rx="2" />
              <text x={x + 6} y={y + 12} fontSize="8" fontWeight="800" fill={c.text} opacity={0.4}>{hNum}</text>
              <text x={x + CELL - 6} y={y + 12} fontSize="7" fontWeight="700" fill={SIGN_COLORS[signIndex] || c.text} textAnchor="end" opacity={0.7}>{SIGN_SHORT[signIndex]}</text>

              {planets.map((planet, pi) => {
                const col = pi % 2; const row = Math.floor(pi / 2);
                const px = hx - 22 + col * 44; const py = hy + 9 + row * 13;
                return <text key={planet.body} x={px} y={py} fontSize="10" fontWeight="800" fill={BODY_COLORS[planet.body] || c.text} textAnchor="middle">
                  {BODY_GLYPHS[planet.body]}
                </text>;
              })}

              {planets.length === 0 && <text x={hx} y={hy + 9} fontSize="8" fill={c.text} opacity={0.1} textAnchor="middle">—</text>}

              {hNum === moonHouse && moonNak && (
                <text x={hx} y={y + CELL - 6} fontSize="6" fontWeight="700" fill="#8e44ad" textAnchor="middle" opacity={0.55}>
                  {moonNak.slice(0, 5)}
                </text>
              )}
            </g>
          );
        })}

        <rect x={xForCol(1)} y={yForRow(1)} width={CELL * 2 + GAP} height={CELL * 2 + GAP} fill={c.centerBg} stroke={c.stroke} strokeWidth="1" strokeOpacity={0.4} rx="2" />
        <text x={SIZE / 2} y={SIZE / 2 - 2} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="800" fill={c.text} opacity={0.45}>Asc</text>
        <text x={SIZE / 2} y={SIZE / 2 + 14} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="800" fill={SIGN_COLORS[ascSi] || '#7c3aed'}>{SIGN_SHORT[ascSi]}</text>
      </svg>
    </div>
  );
};

export default VedicSquareChart;
