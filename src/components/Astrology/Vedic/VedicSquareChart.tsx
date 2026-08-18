import React, { useMemo } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { useAppStore } from '../../../stores/appStore';
import { computeNavamsha } from '@lich-viet/core-logic';

const S = 360;
const P = 8;
const G = 6;
const C = (S - P * 2 - G * 3) / 4;

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
const SN = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const SZ = [
  '#e74c3c',
  '#27ae60',
  '#f39c12',
  '#3498db',
  '#e74c3c',
  '#27ae60',
  '#f39c12',
  '#3498db',
  '#e74c3c',
  '#27ae60',
  '#f39c12',
  '#3498db',
];

const HP = [
  { r: 0, c: 1 },
  { r: 0, c: 2 },
  { r: 0, c: 3 },
  { r: 1, c: 3 },
  { r: 2, c: 3 },
  { r: 3, c: 3 },
  { r: 3, c: 2 },
  { r: 3, c: 1 },
  { r: 3, c: 0 },
  { r: 2, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: 0 },
];

function col(d: boolean) {
  return {
    bg: d ? '#1b1b1b' : '#fcfcfc',
    ln: d ? '#999' : '#555',
    tx: d ? '#ddd' : '#333',
    cb: d ? '#252525' : '#fafafa',
    ct: d ? '#1e1e30' : '#f0f0f4',
  };
}

const xc = (c: number) => P + c * (C + G);
const yc = (r: number) => P + r * (C + G);

export const VedicSquareChart: React.FC<{ result: WesternChartResult; type: 'D1' | 'D9' }> = ({ result, type }) => {
  const dark = useAppStore((s) => s.isDark);
  const co = useMemo(() => col(dark), [dark]);

  const { hp, mh, mn } = useMemo(() => {
    const m: Record<number, Array<{ b: string; si: number }>> = {};
    for (let i = 1; i <= 12; i++) m[i] = [];
    let _mh = 0,
      _mn = '';

    result.planets
      .filter((p) => SI[p.body])
      .forEach((p) => {
        let si = p.signIndex;
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
          si = SIGNS.indexOf(navamshaSign);
        }

        const houseIndex = si + 1; // South Indian charts always map sign 1 (Aries) to box 1 (top second from left)
        m[houseIndex].push({ b: p.body, si });
        if (p.body === 'moon') {
          _mh = houseIndex;
          _mn = p.nakshatra || '';
        }
      });
    return { hp: m, mh: _mh, mn: _mn };
  }, [result, type]);

  let ai = Math.floor((((result.ascendant % 360) + 360) % 360) / 30);
  if (type === 'D9') {
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
    ai = SIGNS.indexOf(navamshaSign);
  }

  const ascendantHouseIndex = ai + 1;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${S} ${S}`} style={{ width: '100%', maxWidth: S }}>
        <rect width={S} height={S} fill={co.bg} rx="6" />

        {/* outer chart border */}
        <rect
          x={P}
          y={P}
          width={S - P * 2}
          height={S - P * 2}
          fill="none"
          stroke={co.ln}
          strokeWidth="2"
          strokeOpacity={0.7}
          rx="2"
        />

        {HP.map((p, i) => {
          const X = xc(p.c),
            Y = yc(p.r);
          const hx = X + C / 2,
            hy = Y + C / 2;
          const si = i; // In South Indian, box i corresponds to sign i (0=Aries, 1=Taurus...)
          const hn = si + 1;
          const planets = hp[hn] || [];

          return (
            <g key={'h' + i}>
              <rect
                x={X}
                y={Y}
                width={C}
                height={C}
                fill={co.cb}
                stroke={co.ln}
                strokeWidth="1.2"
                strokeOpacity={0.65}
                rx="2"
              />
              {/* Draw Ascendant marker if this sign is the ascendant */}
              {ascendantHouseIndex === hn && (
                <text x={X + 7} y={Y + 13} fontSize="9" fontWeight="800" fill={co.tx} opacity={0.6}>
                  Asc
                </text>
              )}
              <text
                x={X + C - 6}
                y={Y + 13}
                fontSize="8"
                fontWeight="700"
                fill={SZ[si] || co.tx}
                textAnchor="end"
                opacity={0.7}
              >
                {SN[si]}
              </text>

              {planets.map((pl, pi) => {
                const c = pi % 2,
                  r = Math.floor(pi / 2);
                const px = hx - 22 + c * 44,
                  py = hy + 11 + r * 14;
                return (
                  <text
                    key={pl.b}
                    x={px}
                    y={py}
                    fontSize="10"
                    fontWeight="800"
                    fill={SC[pl.b] || co.tx}
                    textAnchor="middle"
                  >
                    {SI[pl.b]}
                  </text>
                );
              })}

              {hn === mh && mn && (
                <text
                  x={hx}
                  y={Y + C - 6}
                  fontSize="6"
                  fontWeight="700"
                  fill="#8e44ad"
                  textAnchor="middle"
                  opacity={0.55}
                >
                  {mn.slice(0, 5)}
                </text>
              )}
            </g>
          );
        })}

        {/* center info */}
        <rect
          x={xc(1)}
          y={yc(1)}
          width={C * 2 + G}
          height={C * 2 + G}
          fill={co.ct}
          stroke={co.ln}
          strokeWidth="1.2"
          strokeOpacity={0.5}
          rx="2"
        />
        <text
          x={S / 2}
          y={S / 2 - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="12"
          fontWeight="800"
          fill={co.tx}
          opacity={0.45}
        >
          {type === 'D1' ? 'D1 Rasi' : 'D9 Navamsha'}
        </text>
        <text
          x={S / 2}
          y={S / 2 + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="600"
          fill={co.tx}
          opacity={0.6}
        >
          {type === 'D1' ? 'Sinh đạo (Lá số chính)' : 'Tâm đạo (Phụ tinh)'}
        </text>
      </svg>
    </div>
  );
};

export default VedicSquareChart;
