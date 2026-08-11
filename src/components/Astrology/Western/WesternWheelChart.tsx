import React, { useEffect, useMemo, useState } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const SIZE = 460;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_RING = SIZE / 2 - 2;
const DEGREE_RING = OUTER_RING - 14;
const SIGN_OUTER = DEGREE_RING - 16;
const SIGN_INNER = SIGN_OUTER - 34;
const CUSP_INNER = SIGN_INNER - 12;
const RING_GAP = 16;
const PLANET_R = CUSP_INNER - RING_GAP - 4;
const INNER_R = 62;

const ZODIAC_GLYPHS = [
  '\u2648', '\u2649', '\u264A', '\u264B',
  '\u264C', '\u264D', '\u264E', '\u264F',
  '\u2650', '\u2651', '\u2652', '\u2653',
];

const ZODIAC_NAMES = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư',
];

const ELEMENT_COLORS = {
  fire: { light: '#e74c3c', dark: '#ef5350' },
  earth: { light: '#27ae60', dark: '#2ecc71' },
  air: { light: '#f39c12', dark: '#f1c40f' },
  water: { light: '#3498db', dark: '#5dade2' },
};

const ZODIAC_ELEMENTS: Array<keyof typeof ELEMENT_COLORS> = [
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
];

const BODY_GLYPH: Record<string, string> = {
  sun: '\u2609', moon: '\u263D', mercury: '\u263F',
  venus: '\u2640', mars: '\u2642', jupiter: '\u2643',
  saturn: '\u2644', uranus: '\u2645', neptune: '\u2646',
  pluto: '\u2647',
};

const BODY_COLOR_LIGHT: Record<string, string> = {
  sun: '#e67e22', moon: '#8e44ad', mercury: '#f1c40f',
  venus: '#1abc9c', mars: '#e74c3c', jupiter: '#d35400',
  saturn: '#555', uranus: '#2980b9', neptune: '#8e44ad',
  pluto: '#c0392b',
};

const BODY_COLOR_DARK: Record<string, string> = {
  sun: '#f0a04b', moon: '#b381c3', mercury: '#f5dc5a',
  venus: '#36d9b8', mars: '#f0625c', jupiter: '#e67e30',
  saturn: '#888', uranus: '#5dade2', neptune: '#b381c3',
  pluto: '#e07060',
};

const ASP_COLOR: Record<string, string> = {
  conjunction: '#e74c3c', opposition: '#e74c3c',
  trine: '#27ae60', square: '#e74c3c',
  sextile: '#3498db', quincunx: '#95a5a6',
};

const BODY_NAME: Record<string, string> = {
  sun: 'Mặt Trời', moon: 'Mặt Trăng', mercury: 'Sao Thủy',
  venus: 'Sao Kim', mars: 'Sao Hỏa', jupiter: 'Sao Mộc',
  saturn: 'Sao Thổ', uranus: 'Thiên Vương', neptune: 'Hải Vương',
  pluto: 'Diêm Vương',
};

function lonA(l: number): number {
  return ((180 + ((l % 360) + 360) % 360) % 360) * Math.PI / 180;
}
function pt(r: number, a: number) {
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function getC(dark: boolean) {
  return {
    stroke: dark ? '#aaa' : '#555',
    bg: dark ? '#1a1a2e' : '#fdfdfd',
    text: dark ? '#ccc' : '#333',
    soft: dark ? '#666' : '#bbb',
    innerBg: dark ? '#16213e' : '#f0f4f8',
    innerText: dark ? '#99b' : '#667',
    subtleStroke: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    degreeBg: dark ? '#1e1e30' : '#fafafa',
  };
}

interface PlanetInfo {
  body: string;
  a: number;
  degInSign: number;
  sign: string;
  house: number;
  offsetR: number;
  offsetA: number;
}

function resolvePlanetCollisions(planets: PlanetInfo[]): PlanetInfo[] {
  const result = planets.map((p) => ({ ...p }));
  const thresholdR = 10;
  const thresholdA = 0.15;
  for (let i = 0; i < result.length; i++) {
    let shiftCount = 0;
    let offsetR = 0;
    let offsetA = 0;
    for (let j = 0; j < i; j++) {
      const effectiveA = result[j].a + (result[j].offsetA || 0);
      const dA = Math.abs(((result[i].a - effectiveA + Math.PI) % (2 * Math.PI)) - Math.PI);
      if (dA < thresholdA) {
        shiftCount++;
        offsetA = (shiftCount % 2 === 0 ? 1 : -1) * thresholdA * Math.floor((shiftCount + 1) / 2);
        offsetR = shiftCount > 1 ? thresholdR * Math.floor(shiftCount / 2) : thresholdR;
      }
    }
    result[i].offsetR = (result[i].offsetR || 0) + offsetR;
    result[i].offsetA = (result[i].offsetA || 0) + offsetA;
  }
  return result;
}

interface TickData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeW: number;
  strokeO: number;
  isLabel: boolean;
  labelX?: number;
  labelY?: number;
  labelText?: string;
  labelColor?: string;
}

export const WesternWheelChart: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  const c = useMemo(() => getC(dark), [dark]);
  const bColor = dark ? BODY_COLOR_DARK : BODY_COLOR_LIGHT;

  const planets: PlanetInfo[] = useMemo(() => {
    const raw = result.planets
      .filter((p) => BODY_GLYPH[p.body])
      .map((p) => ({
        body: p.body,
        a: lonA(p.tropicalLongitude),
        degInSign: p.degreeInSign,
        sign: p.sign,
        house: p.house,
        offsetR: 0,
        offsetA: 0,
      }));
    return resolvePlanetCollisions(raw);
  }, [result]);

  const cusps = useMemo(
    () =>
      result.houses.map((h) => ({
        idx: h.index,
        a: lonA(h.longitude),
        out: pt(SIGN_OUTER, lonA(h.longitude)),
        inn: pt(CUSP_INNER, lonA(h.longitude)),
      })),
    [result],
  );

  const ascA = lonA(result.ascendant);
  const mcA = lonA(result.midheaven);
  const ascIdx = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);

  const alines = useMemo(() => {
    const maj = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
    return result.aspects
      .filter((a) => maj.includes(a.type) && BODY_GLYPH[a.planetA] && BODY_GLYPH[a.planetB])
      .slice(0, 14)
      .map((asp) => {
        const pA = planets.find((p) => p.body === asp.planetA);
        const pB = planets.find((p) => p.body === asp.planetB);
        if (!pA || !pB) return null;
        const rA = PLANET_R + pA.offsetR;
        const rB = PLANET_R + pB.offsetR;
        const aA = pA.a + pA.offsetA;
        const aB = pB.a + pB.offsetA;
        const a = pt(rA, aA);
        const b = pt(rB, aB);
        return { ty: asp.type, x1: a.x, y1: a.y, x2: b.x, y2: b.y, orb: asp.orb };
      })
      .filter(Boolean);
  }, [result, planets]);

  const degreeTicks: TickData[] = useMemo(() => {
    return Array.from({ length: 360 }, (_, i) => {
      const a = lonA(i);
      const isLabel = i % 10 === 0;
      const isMajor = i % 5 === 0;
      const innerR = DEGREE_RING - (isLabel ? 10 : isMajor ? 6 : 3);
      const p1 = pt(DEGREE_RING, a);
      const p2 = pt(innerR, a);
      const tick: TickData = {
        x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        stroke: c.stroke,
        strokeW: isLabel ? 0.6 : 0.25,
        strokeO: isLabel ? 0.7 : 0.3,
        isLabel,
      };
      if (isLabel) {
        const labelR = DEGREE_RING - 13;
        const lp = pt(labelR, a);
        tick.labelX = lp.x;
        tick.labelY = lp.y;
        tick.labelText = i % 30 === 0 ? '0' : `${i % 30}`;
        tick.labelColor = c.text;
      }
      return tick;
    });
  }, [c.stroke, c.text]);

  const signSegments = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const a1 = lonA(i * 30);
      const a2 = lonA((i + 1) * 30);
      const p1 = pt(SIGN_OUTER, a1);
      const p2 = pt(SIGN_OUTER, a2);
      const p3 = pt(SIGN_INNER, a2);
      const p4 = pt(SIGN_INNER, a1);
      const d = `M${p1.x},${p1.y}A${SIGN_OUTER},${SIGN_OUTER}0,0,1,${p2.x},${p2.y}L${p3.x},${p3.y}A${SIGN_INNER},${SIGN_INNER}0,0,0,${p4.x},${p4.y}Z`;
      const midR = (SIGN_OUTER + SIGN_INNER) / 2;
      const midA = (a1 + a2) / 2;
      const mid = pt(midR, midA);
      const el = ZODIAC_ELEMENTS[i];
      const color = dark ? ELEMENT_COLORS[el].dark : ELEMENT_COLORS[el].light;
      return {
        pathD: d,
        midX: mid.x,
        midY: mid.y,
        glyph: ZODIAC_GLYPHS[i],
        name: ZODIAC_NAMES[i],
        color,
        el,
        index: i,
      };
    });
  }, [dark]);

  const chartShapeLabel = (result.chartShape?.shape || 'BIRTH CHART').toUpperCase();

  return (
    <div className="flex justify-center" data-western-chart-export>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE }} role="img" aria-label="Western Birth Chart">
        <defs aria-hidden="true">
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={dark ? '#1e2a3a' : '#f8fafc'} />
            <stop offset="100%" stopColor={c.bg} />
          </radialGradient>
          {ZODIAC_NAMES.map((_, i) => {
            const el = ZODIAC_ELEMENTS[i];
            const color = dark ? ELEMENT_COLORS[el].dark : ELEMENT_COLORS[el].light;
            return (
              <linearGradient key={`grad${i}`} id={`signGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={dark ? 0.18 : 0.12} />
                <stop offset="100%" stopColor={color} stopOpacity={dark ? 0.08 : 0.04} />
              </linearGradient>
            );
          })}
        </defs>
        <rect width={SIZE} height={SIZE} fill="url(#chartBg)" rx="8" />

        <circle cx={CX} cy={CY} r={OUTER_RING} fill={c.degreeBg} stroke={c.stroke} strokeWidth="0.6" strokeOpacity={0.3} />
        <circle cx={CX} cy={CY} r={DEGREE_RING} fill="none" stroke={c.stroke} strokeWidth="0.3" strokeOpacity={0.2} />

        {/* Degree ticks */}
        <g aria-hidden="true">
          {degreeTicks.map((t, i) => (
            <g key={`dt${i}`}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.stroke} strokeWidth={t.strokeW} strokeOpacity={t.strokeO} />
              {t.isLabel && t.labelX != null && (
                <text
                  x={t.labelX} y={t.labelY}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="4.5" fontWeight="600" fill={t.labelColor} opacity={0.5}
                >
                  {t.labelText}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* Zodiac sign segments */}
        {signSegments.map((seg) => (
          <g key={`s${seg.index}`} aria-hidden="true">
            <path d={seg.pathD} fill={`url(#signGrad${seg.index})`} stroke={seg.color} strokeWidth="0.6" strokeOpacity={0.35} />
            <text x={seg.midX} y={seg.midY - 7} textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="800" fill={seg.color} opacity={dark ? 0.9 : 0.75}>
              {seg.glyph}
            </text>
            <text x={seg.midX} y={seg.midY + 7} textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="700" fill={c.text} opacity={0.6}>
              {seg.name.toUpperCase()}
            </text>
          </g>
        ))}

        {/* Sign separator lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = lonA(i * 30);
          const po = pt(SIGN_OUTER, a);
          const pi = pt(SIGN_INNER, a);
          return <line key={`sep${i}`} x1={po.x} y1={po.y} x2={pi.x} y2={pi.y} stroke={c.stroke} strokeWidth="0.6" strokeOpacity={0.35} aria-hidden="true" />;
        })}

        <circle cx={CX} cy={CY} r={SIGN_OUTER} fill="none" stroke={c.stroke} strokeWidth="0.8" strokeOpacity={0.35} aria-hidden="true" />
        <circle cx={CX} cy={CY} r={SIGN_INNER} fill="none" stroke={c.stroke} strokeWidth="0.5" strokeOpacity={0.3} aria-hidden="true" />

        {/* House cusp lines */}
        {cusps.map((h) => {
          const midR = (SIGN_INNER + CUSP_INNER) / 2;
          const pm = pt(midR, h.a);
          return (
            <g key={`c${h.idx}`} aria-hidden="true">
              <line x1={h.out.x} y1={h.out.y} x2={h.inn.x} y2={h.inn.y} stroke={c.stroke} strokeWidth="0.8" strokeOpacity={0.5} />
              <text x={pm.x} y={pm.y} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fontWeight="800" fill={c.text} opacity={0.7}>
                {h.idx}
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={CUSP_INNER} fill="none" stroke={c.stroke} strokeWidth="0.4" strokeOpacity={0.25} aria-hidden="true" />

        {/* ASC & MC axes */}
        <g aria-hidden="true">
          <line
            x1={pt(PLANET_R + 6, ascA).x} y1={pt(PLANET_R + 6, ascA).y}
            x2={pt(PLANET_R + 6, ascA + Math.PI).x} y2={pt(PLANET_R + 6, ascA + Math.PI).y}
            stroke="#e74c3c" strokeWidth="1.6" strokeOpacity={0.45}
          />
          <line
            x1={pt(PLANET_R + 6, ascA).x} y1={pt(PLANET_R + 6, ascA).y}
            x2={pt(PLANET_R + 6, ascA + Math.PI).x} y2={pt(PLANET_R + 6, ascA + Math.PI).y}
            stroke="#e74c3c" strokeWidth="0.4" strokeOpacity={0.7}
          />
          <text
            x={pt(PLANET_R + 14, ascA).x} y={pt(PLANET_R + 14, ascA).y}
            textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="800" fill="#e74c3c" opacity={0.8}
          >
            AC
          </text>
          <text
            x={pt(PLANET_R + 14, ascA + Math.PI).x} y={pt(PLANET_R + 14, ascA + Math.PI).y}
            textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="800" fill="#e74c3c" opacity={0.8}
          >
            DC
          </text>
        </g>
        <g aria-hidden="true">
          <line
            x1={pt(PLANET_R + 6, mcA).x} y1={pt(PLANET_R + 6, mcA).y}
            x2={pt(PLANET_R + 6, mcA + Math.PI).x} y2={pt(PLANET_R + 6, mcA + Math.PI).y}
            stroke="#2980b9" strokeWidth="1" strokeOpacity={0.4} strokeDasharray="5,3"
          />
          <text
            x={pt(PLANET_R + 14, mcA).x} y={pt(PLANET_R + 14, mcA).y}
            textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="800" fill="#2980b9" opacity={0.8}
          >
            MC
          </text>
          <text
            x={pt(PLANET_R + 14, mcA + Math.PI).x} y={pt(PLANET_R + 14, mcA + Math.PI).y}
            textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="800" fill="#2980b9" opacity={0.8}
          >
            IC
          </text>
        </g>

        {/* Aspect lines */}
        <g aria-hidden="true">
          {alines.map((l, i) => {
            if (!l) return null;
            const color = ASP_COLOR[l.ty] || '#999';
            const dash = l.ty === 'opposition' ? '4,2' : l.ty === 'trine' ? undefined : l.ty === 'sextile' ? '3,3' : '2,2';
            return (
              <line
                key={`al${i}`}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={color} strokeWidth="0.9" strokeOpacity={0.45}
                strokeDasharray={dash}
              />
            );
          })}
        </g>

        {/* Planet ring circle */}
        <circle cx={CX} cy={CY} r={PLANET_R} fill="none" stroke={c.subtleStroke} strokeWidth="0.4" aria-hidden="true" />

        {/* Planet glyphs with degree labels */}
        {planets.map((p) => {
          const effR = PLANET_R + p.offsetR;
          const effA = p.a + p.offsetA;
          const pos = pt(effR, effA);
          const isLuminary = ['sun', 'moon'].includes(p.body);
          const fs = isLuminary ? 17 : 13;
          const dg = Math.floor(p.degInSign);
          const mn = Math.floor((p.degInSign - dg) * 60)
            .toString()
            .padStart(2, '0');
          const color = bColor[p.body] || (dark ? '#aaa' : '#333');
          const isRetrograde = result.planets.find((rp) => rp.body === p.body)?.retrograde;
          const retroPos = pt(effR + 9, effA);
          return (
            <g key={p.body} role="listitem" aria-label={`${BODY_NAME[p.body] || p.body} ${dg}°${mn}' ${p.sign}`}>
              {isRetrograde && (
                <text x={retroPos.x} y={retroPos.y - 1} fontSize="7" fontStyle="italic" fill={color} opacity={0.65} textAnchor="middle" dominantBaseline="central">
                  ℞
                </text>
              )}
              <text
                x={pos.x} y={pos.y - 5.5}
                textAnchor="middle" dominantBaseline="central"
                fontSize={fs} fill={color} fontWeight="800"
                style={{ userSelect: 'none', textShadow: dark ? '0 0 3px rgba(0,0,0,0.6)' : '0 0 3px rgba(255,255,255,0.8)' }}
              >
                {BODY_GLYPH[p.body]}
              </text>
              <text
                x={pos.x} y={pos.y + 9}
                textAnchor="middle" dominantBaseline="central"
                fontSize="5.8" fontWeight="600" fill={c.text} opacity={0.55}
              >
                {dg}°{mn}
              </text>
            </g>
          );
        })}

        {/* Inner circle */}
        <circle cx={CX} cy={CY} r={INNER_R} fill={c.innerBg} stroke={c.soft} strokeWidth="0.8" strokeOpacity={0.4} aria-hidden="true" />

        <text x={CX} y={CY - 11} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="800" fill={c.text} opacity={0.65}>
          {ZODIAC_NAMES[ascIdx] ?? ''}
        </text>
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize="7.5" fontWeight="700" fill={c.text} opacity={0.45}>
          thăng
        </text>
        <text x={CX} y={CY + 11} textAnchor="middle" dominantBaseline="central" fontSize="5.5" fontWeight="600" fill={c.innerText} opacity={0.5}>
          {chartShapeLabel}
        </text>
      </svg>
    </div>
  );
};

export default WesternWheelChart;
