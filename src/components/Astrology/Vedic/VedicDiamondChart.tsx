import React, { useMemo } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { useAppStore } from '../../../stores/appStore';
import { computeNavamsha } from '@omce/core-logic';

const S = 360; // Size of the SVG

const SI: Record<string, string> = {
  sun: 'Su',
  moon: 'Mo',
  mercury: 'Me',
  venus: 'Ve',
  mars: 'Ma',
  jupiter: 'Ju',
  saturn: 'Sa',
  rahu: 'Ra',
  ketu: 'Ke',
};
const SC: Record<string, string> = {
  sun: '#e67e22',
  moon: '#8e44ad',
  mercury: '#1abc9c',
  venus: '#27ae60',
  mars: '#e74c3c',
  jupiter: '#f39c12',
  saturn: '#555',
  rahu: '#2c3e50',
  ketu: '#c0392b',
};

function col(d: boolean) {
  return {
    bg: d ? '#1b1b1b' : '#fcfcfc',
    ln: d ? '#999' : '#555',
    tx: d ? '#ddd' : '#333',
    cb: d ? '#252525' : '#fafafa',
  };
}

export const VedicDiamondChart: React.FC<{ result: WesternChartResult; type: 'D1' | 'D9' }> = ({ result, type }) => {
  const dark = useAppStore((s) => s.isDark);
  const co = useMemo(() => col(dark), [dark]);

  // Ascendant calculation
  let ascSignIndex = 0;
  if (type === 'D1') {
    ascSignIndex = Math.floor((((result.ascendant % 360) + 360) % 360) / 30);
  } else {
    const navamshaSign = computeNavamsha(result.ascendant);
    const SIGNS = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];
    ascSignIndex = SIGNS.indexOf(navamshaSign);
  }

  // Calculate planets in houses
  const hp = useMemo(() => {
    const m: Record<number, Array<{ b: string }>> = {};
    for (let i = 1; i <= 12; i++) m[i] = [];

    result.planets
      .filter((p) => SI[p.body])
      .forEach((p) => {
        let planetSignIndex = p.signIndex;
        if (type === 'D9') {
          const navamshaSign = computeNavamsha(p.siderealLongitude);
          const SIGNS = [
            'aries',
            'taurus',
            'gemini',
            'cancer',
            'leo',
            'virgo',
            'libra',
            'scorpio',
            'sagittarius',
            'capricorn',
            'aquarius',
            'pisces',
          ];
          planetSignIndex = SIGNS.indexOf(navamshaSign);
        }

        // In North Indian chart, houses are counted from Ascendant = House 1
        const houseIndex = ((planetSignIndex - ascSignIndex + 12) % 12) + 1;
        m[houseIndex].push({ b: p.body });
      });
    return m;
  }, [result, ascSignIndex, type]);

  // Polygons for the 12 houses in a 360x360 square
  const H = [
    {
      i: 1,
      points: `${S / 2},0 ${S / 4},${S / 4} ${S / 2},${S / 2} ${(3 * S) / 4},${S / 4}`,
      tx: S / 2,
      ty: S / 4 + 10,
    },
    { i: 2, points: `0,0 ${S / 4},${S / 4} ${S / 2},0`, tx: S / 4, ty: S / 8 + 10 },
    { i: 3, points: `0,0 0,${S / 2} ${S / 4},${S / 4}`, tx: S / 8 + 5, ty: S / 4 + 10 },
    {
      i: 4,
      points: `0,${S / 2} ${S / 4},${(3 * S) / 4} ${S / 2},${S / 2} ${S / 4},${S / 4}`,
      tx: S / 4 + 10,
      ty: S / 2,
    },
    { i: 5, points: `0,${S} ${S / 4},${(3 * S) / 4} 0,${S / 2}`, tx: S / 8 + 5, ty: (3 * S) / 4 - 10 },
    { i: 6, points: `0,${S} ${S / 2},${S} ${S / 4},${(3 * S) / 4}`, tx: S / 4, ty: (7 * S) / 8 - 10 },
    {
      i: 7,
      points: `${S / 2},${S} ${(3 * S) / 4},${(3 * S) / 4} ${S / 2},${S / 2} ${S / 4},${(3 * S) / 4}`,
      tx: S / 2,
      ty: (3 * S) / 4 - 10,
    },
    { i: 8, points: `${S},${S} ${(3 * S) / 4},${(3 * S) / 4} ${S / 2},${S}`, tx: (3 * S) / 4, ty: (7 * S) / 8 - 10 },
    {
      i: 9,
      points: `${S},${S} ${S},${S / 2} ${(3 * S) / 4},${(3 * S) / 4}`,
      tx: (7 * S) / 8 - 5,
      ty: (3 * S) / 4 - 10,
    },
    {
      i: 10,
      points: `${S},${S / 2} ${(3 * S) / 4},${S / 4} ${S / 2},${S / 2} ${(3 * S) / 4},${(3 * S) / 4}`,
      tx: (3 * S) / 4 - 10,
      ty: S / 2,
    },
    { i: 11, points: `${S},0 ${S},${S / 2} ${(3 * S) / 4},${S / 4}`, tx: (7 * S) / 8 - 5, ty: S / 4 + 10 },
    { i: 12, points: `${S},0 ${(3 * S) / 4},${S / 4} ${S / 2},0`, tx: (3 * S) / 4, ty: S / 8 + 10 },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }} data-vedic-diamond-chart>
      <svg viewBox={`0 0 ${S} ${S}`} style={{ width: '100%', maxWidth: S }}>
        <rect width={S} height={S} fill={co.bg} stroke={co.ln} strokeWidth="2" />

        {/* Draw diagonals */}
        <line x1="0" y1="0" x2={S} y2={S} stroke={co.ln} strokeWidth="1.2" />
        <line x1="0" y1={S} x2={S} y2="0" stroke={co.ln} strokeWidth="1.2" />

        {/* Draw midpoints diamond */}
        <polygon
          points={`${S / 2},0 0,${S / 2} ${S / 2},${S} ${S},${S / 2}`}
          fill="none"
          stroke={co.ln}
          strokeWidth="1.2"
        />

        {H.map((h) => {
          const signForHouse = ((ascSignIndex + h.i - 1) % 12) + 1; // 1-12
          const planets = hp[h.i] || [];

          return (
            <g key={'h' + h.i}>
              <text
                x={h.tx}
                y={h.ty - 15}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={co.tx}
                opacity={0.4}
              >
                {signForHouse}
              </text>
              {planets.map((pl, pi) => {
                const c = pi % 2,
                  r = Math.floor(pi / 2);
                const px = h.tx - 10 + c * 20;
                const py = h.ty + r * 12;

                return (
                  <text
                    key={pl.b}
                    x={px}
                    y={py}
                    fontSize="11"
                    fontWeight="800"
                    fill={SC[pl.b] || co.tx}
                    textAnchor="middle"
                  >
                    {SI[pl.b]}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default VedicDiamondChart;
