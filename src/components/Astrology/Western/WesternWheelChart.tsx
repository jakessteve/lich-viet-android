import React, { useMemo } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { useAppStore } from '../../../stores/appStore';

const R = 180;
const PAD = 28;
const S = (R + PAD) * 2;
const CX = S / 2,
  CY = S / 2;

const R_SIGN_O = R;
const R_SIGN_I = R - 28;
const R_PLANET = R - 64;
const R_INNER = 42;

const Z = [
  '\u2648',
  '\u2649',
  '\u264A',
  '\u264B',
  '\u264C',
  '\u264D',
  '\u264E',
  '\u264F',
  '\u2650',
  '\u2651',
  '\u2652',
  '\u2653',
];
const SC = [
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
const SD = [
  '#ef5350',
  '#2ecc71',
  '#f1c40f',
  '#5dade2',
  '#ef5350',
  '#2ecc71',
  '#f1c40f',
  '#5dade2',
  '#ef5350',
  '#2ecc71',
  '#f1c40f',
  '#5dade2',
];

const G: Record<string, string> = {
  sun: '\u2609',
  moon: '\u263D',
  mercury: '\u263F',
  venus: '\u2640',
  mars: '\u2642',
  jupiter: '\u2643',
  saturn: '\u2644',
  uranus: '\u2645',
  neptune: '\u2646',
  pluto: '\u2647',
};
const GC: Record<string, string> = {
  sun: '#e67e22',
  moon: '#8e44ad',
  mercury: '#f1c40f',
  venus: '#1abc9c',
  mars: '#e74c3c',
  jupiter: '#d35400',
  saturn: '#555',
  uranus: '#2980b9',
  neptune: '#8e44ad',
  pluto: '#c0392b',
};
const AC: Record<string, string> = {
  conjunction: '#e74c3c',
  opposition: '#e74c3c',
  trine: '#27ae60',
  square: '#e74c3c',
  sextile: '#3498db',
};

const nd = (v: number) => ((v % 360) + 360) % 360;
export const longitudeToChartAngleDegrees = (longitude: number, ascendant: number) => nd(180 - (longitude - ascendant));
const la = (longitude: number, ascendant: number) =>
  (longitudeToChartAngleDegrees(longitude, ascendant) * Math.PI) / 180;
const xy = (r: number, a: number) => ({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });

function col(d: boolean) {
  return {
    bg: d ? '#1b1b1b' : '#fcfcfc',
    ln: d ? '#aaa' : '#555',
    tx: d ? '#ddd' : '#333',
    so: d ? '#666' : '#bbb',
    ib: d ? '#252525' : '#f5f5f5',
  };
}

export const WesternWheelChart: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const dark = useAppStore((s) => s.isDark);
  const co = useMemo(() => col(dark), [dark]);
  const si = dark ? SD : SC;

  const pl = useMemo(
    () =>
      result.planets
        .filter((p) => G[p.body])
        .map((p) => ({
          b: p.body,
          a: la(p.tropicalLongitude, result.ascendant),
          di: p.degreeInSign,
          sig: p.sign,
          h: p.house,
        })),
    [result],
  );

  const cu = useMemo(
    () =>
      result.houses.map((h, index) => {
        const a = la(h.longitude, result.ascendant);
        const next = result.houses[(index + 1) % result.houses.length];
        const midLongitude = nd(h.longitude + nd(next.longitude - h.longitude) / 2);
        return {
          i: h.index,
          a,
          o: xy(R_SIGN_I, a),
          n: xy(R_INNER, a),
          l: xy((R_INNER + R_PLANET) / 2, la(midLongitude, result.ascendant)),
        };
      }),
    [result],
  );

  const aa = la(result.ascendant, result.ascendant);
  const ma = la(result.midheaven, result.ascendant);
  const ai = Math.floor((((result.ascendant % 360) + 360) % 360) / 30);

  const al = useMemo(() => {
    const mt = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
    return result.aspects
      .filter((a) => mt.includes(a.type) && G[a.planetA] && G[a.planetB])
      .slice(0, 12)
      .map((asp) => {
        const pA = pl.find((p) => p.b === asp.planetA),
          pB = pl.find((p) => p.b === asp.planetB);
        if (!pA || !pB) return null;
        const a = xy(R_PLANET, pA.a),
          b = xy(R_PLANET, pB.a);
        return { t: asp.type, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      })
      .filter(Boolean);
  }, [result, pl]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }} data-western-chart-export>
      <svg viewBox={`0 0 ${S} ${S}`} style={{ width: '100%', maxWidth: S }} role="img" aria-label="Western Birth Chart">
        <rect x={0} y={0} width={S} height={S} fill={co.bg} rx="8" />

        <circle cx={CX} cy={CY} r={R} fill="none" stroke={co.ln} strokeWidth="1.5" strokeOpacity={0.5} />

        {/* degree ticks: every 5°, bolder every 30° */}
        {Array.from({ length: 72 }, (_, i) => {
          const a = la(i * 5, result.ascendant),
            mj = i % 6 === 0;
          const p1 = xy(R + 1, a),
            p2 = xy(R - (mj ? 7 : 3), a);
          return (
            <line
              key={'t' + i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={co.ln}
              strokeWidth={mj ? 0.6 : 0.3}
              strokeOpacity={mj ? 0.6 : 0.4}
            />
          );
        })}

        {/* 12 zodiac segments */}
        {Array.from({ length: 12 }, (_, i) => {
          const a1 = la(i * 30, result.ascendant),
            a2 = la((i + 1) * 30, result.ascendant);
          const p1 = xy(R_SIGN_O, a1),
            p2 = xy(R_SIGN_O, a2),
            p3 = xy(R_SIGN_I, a2),
            p4 = xy(R_SIGN_I, a1);
          const d = `M${p1.x},${p1.y} A${R_SIGN_O},${R_SIGN_O} 0 0 0 ${p2.x},${p2.y} L${p3.x},${p3.y} A${R_SIGN_I},${R_SIGN_I} 0 0 1 ${p4.x},${p4.y} Z`;
          const mid = xy((R_SIGN_O + R_SIGN_I) / 2, la((i + 0.5) * 30, result.ascendant));
          return (
            <g key={'sg' + i}>
              <path
                data-western-sign={i + 1}
                d={d}
                fill={si[i]}
                fillOpacity={0.12}
                stroke={co.so}
                strokeWidth="0.5"
                strokeOpacity={0.3}
              />
              <text
                x={mid.x}
                y={mid.y - 6}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="16"
                fontWeight="400"
                fill={si[i]}
              >
                {Z[i]}
              </text>
              <text
                x={mid.x}
                y={mid.y + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="7"
                fontWeight="700"
                fill={co.tx}
                opacity={0.5}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* house cusp lines: from the sign ring to the inner circle */}
        {cu.map((h) => {
          return (
            <g key={'h' + h.i} data-western-house={h.i}>
              <line x1={h.o.x} y1={h.o.y} x2={h.n.x} y2={h.n.y} stroke={co.ln} strokeWidth="1" strokeOpacity={0.65} />
              <text
                data-western-house-label={h.i}
                x={h.l.x}
                y={h.l.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="6.5"
                fontWeight="700"
                fill={co.tx}
                opacity={0.65}
              >
                {h.i}
              </text>
            </g>
          );
        })}

        {/* ASC & MC axes */}
        <line
          data-western-axis="asc-dsc"
          x1={xy(R_PLANET + 4, aa).x}
          y1={xy(R_PLANET + 4, aa).y}
          x2={xy(R_PLANET + 4, aa + Math.PI).x}
          y2={xy(R_PLANET + 4, aa + Math.PI).y}
          stroke="#e74c3c"
          strokeWidth="1.2"
          strokeOpacity={0.55}
        />
        <line
          data-western-axis="mc-ic"
          x1={xy(R_PLANET + 4, ma).x}
          y1={xy(R_PLANET + 4, ma).y}
          x2={xy(R_PLANET + 4, ma + Math.PI).x}
          y2={xy(R_PLANET + 4, ma + Math.PI).y}
          stroke="#2980b9"
          strokeWidth="0.9"
          strokeOpacity={0.45}
          strokeDasharray="4,2"
        />
        {[
          { k: 'asc', t: 'ASC', a: aa, c: '#e74c3c' },
          { k: 'dsc', t: 'DSC', a: aa + Math.PI, c: '#e74c3c' },
          { k: 'mc', t: 'MC', a: ma, c: '#2980b9' },
          { k: 'ic', t: 'IC', a: ma + Math.PI, c: '#2980b9' },
        ].map((label) => {
          const p = xy(R_PLANET + 12, label.a);
          return (
            <text
              key={label.k}
              data-western-axis-label={label.k}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="6"
              fontWeight="800"
              fill={label.c}
            >
              {label.t}
            </text>
          );
        })}

        <circle cx={CX} cy={CY} r={R_PLANET + 4} fill="none" stroke={co.so} strokeWidth="0.5" strokeOpacity={0.4} />
        <circle cx={CX} cy={CY} r={R_INNER} fill={co.ib} stroke={co.so} strokeWidth="0.8" strokeOpacity={0.5} />

        {/* aspect lines */}
        {al.map((l, i) => {
          if (!l) return null;
          return (
            <line
              key={'al' + i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={AC[l.t] || '#999'}
              strokeWidth="0.7"
              strokeOpacity={0.5}
              strokeDasharray={l.t === 'opposition' ? '4,2' : l.t === 'trine' ? undefined : '2,2'}
            />
          );
        })}

        {/* planets with degree labels */}
        {pl.map((p) => {
          const ps = xy(R_PLANET, p.a);
          const fs = ['sun', 'moon'].includes(p.b) ? 15 : 11;
          const d = Math.floor(p.di),
            m = Math.floor((p.di - d) * 60)
              .toString()
              .padStart(2, '0');
          return (
            <g key={p.b}>
              <text
                x={ps.x}
                y={ps.y - 5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fs}
                fill={GC[p.b] || '#333'}
                fontWeight="700"
                style={{ userSelect: 'none' }}
              >
                {G[p.b]}
              </text>
              <text
                x={ps.x}
                y={ps.y + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="5.5"
                fontWeight="600"
                fill={co.tx}
                opacity={0.5}
              >
                {d}°{m}
              </text>
              <title>
                {p.sig} {d}°{m}' — Nhà {p.h}
              </title>
            </g>
          );
        })}

        <text
          x={CX}
          y={CY + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fontWeight="700"
          fill={co.tx}
          opacity={0.45}
        >
          ASC {Z[ai]}
        </text>
      </svg>
    </div>
  );
};

export default WesternWheelChart;
