import React from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const BODY_COLORS: Record<string, string> = {
  sun: '#e74c3c',
  moon: '#bdc3c7',
  mercury: '#2ecc71',
  venus: '#e67e22',
  mars: '#e74c3c',
  jupiter: '#9b59b6',
  saturn: '#e67e22',
  uranus: '#2ecc71',
  neptune: '#3498db',
  pluto: '#bdc3c7',
  chiron: '#3498db',
  lilith: '#bdc3c7',
  northnode: '#9b59b6',
  southnode: '#9b59b6',
  partOfFortune: '#e67e22',
  vertex: '#bdc3c7',
  ascendant: '#bdc3c7',
  midheaven: '#bdc3c7',
};

const BODY_ICONS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷',
  lilith: '⚸',
  northnode: '☊',
  southnode: '☋',
  partOfFortune: '⊗',
  vertex: '⪫',
  ascendant: 'AC',
  midheaven: 'MC',
};

export const WesternDeclinationChart: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const bodies: { id: string; dec: number; isNorth: boolean; absDec: number; labelPos: number }[] = [];

  result.planets.forEach((p) => {
    if (p.dec !== undefined) {
      bodies.push({
        id: p.body,
        dec: p.dec,
        isNorth: p.dec >= 0,
        absDec: Math.abs(p.dec),
        labelPos: p.dec >= 0 ? -1 : 1,
      });
    }
  });

  // Simple collision detection/adjustment for labels so they don't overlap horizontally
  // We'll sort by absolute declination and adjust vertical length of stems
  bodies.sort((a, b) => a.absDec - b.absDec);

  for (let i = 1; i < bodies.length; i++) {
    const prev = bodies[i - 1];
    const curr = bodies[i];
    // If they are too close on the x-axis and have the same direction
    if (Math.abs(curr.absDec - prev.absDec) < 1.0 && curr.isNorth === prev.isNorth) {
      // Offset the vertical position
      if (prev.labelPos === -1 || prev.labelPos === -2) curr.labelPos = prev.labelPos - 1;
      if (prev.labelPos === 1 || prev.labelPos === 2) curr.labelPos = prev.labelPos + 1;
    } else {
      curr.labelPos = curr.isNorth ? -1 : 1;
    }
  }

  const W = 900;
  const H = 240;
  const PAD_X = 60;
  const PAD_Y = 120;

  const scaleX = (dec: number) => PAD_X + (dec / 30) * (W - PAD_X * 2);

  return (
    <div
      className="glass-card overflow-hidden mt-6 p-4 rounded-xl shadow-lg border border-[#374e68]/40"
      style={{ backgroundColor: '#152336', color: '#fff' }}
    >
      <div className="card-header border-b border-[#374e68]/40 pb-2 mb-4 text-center">
        <h3 className="section-title text-sm flex items-center justify-center gap-2">Xích vĩ (Declination)</h3>
      </div>

      <div className="overflow-x-auto">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ minWidth: '600px' }}>
          {/* Main horizontal line */}
          <line x1={PAD_X} y1={PAD_Y} x2={W - PAD_X} y2={PAD_Y} stroke="#8eb0d1" strokeWidth="1" />

          {/* North/South Labels */}
          <text x={PAD_X - 15} y={PAD_Y - 40} textAnchor="end" dominantBaseline="central" fill="#8eb0d1" fontSize="14">
            Bắc
          </text>
          <text x={PAD_X - 15} y={PAD_Y + 40} textAnchor="end" dominantBaseline="central" fill="#8eb0d1" fontSize="14">
            Nam
          </text>

          {/* Tick marks 0 to 30 */}
          {[0, 5, 10, 15, 20, 25, 30].map((tick) => {
            const tx = scaleX(tick);
            return (
              <g key={`tick-${tick}`}>
                <line x1={tx} y1={PAD_Y - 6} x2={tx} y2={PAD_Y + 6} stroke="#8eb0d1" strokeWidth="1" opacity={0.6} />
                {/* Optional vertical guides */}
                <line x1={tx} y1={40} x2={tx} y2={H - 40} stroke="#8eb0d1" strokeWidth="0.5" opacity={0.1} />
                <text x={tx} y={30} textAnchor="middle" fill="#8eb0d1" fontSize="12">
                  {tick}°
                </text>
                <text x={tx} y={H - 25} textAnchor="middle" fill="#8eb0d1" fontSize="12">
                  {tick}°
                </text>
              </g>
            );
          })}

          {/* Planet stems and labels */}
          {bodies.map((body, i) => {
            const x = scaleX(body.absDec);
            const stemLen = 40 + Math.abs(body.labelPos) * 20 - 20; // 40, 60, 80...
            const dir = body.isNorth ? -1 : 1;
            const yEnd = PAD_Y + stemLen * dir;

            const deg = Math.floor(body.absDec);
            const min = Math.floor((body.absDec - deg) * 60);
            const decLabel = `${deg}°${min.toString().padStart(2, '0')}'${body.isNorth ? 'N' : 'S'}`;

            return (
              <g key={`dec-${body.id}-${i}`}>
                <line
                  x1={x}
                  y1={PAD_Y}
                  x2={x}
                  y2={yEnd}
                  stroke={BODY_COLORS[body.id] || '#fff'}
                  strokeWidth="1.5"
                  opacity={0.8}
                />
                <text
                  x={x}
                  y={yEnd + dir * 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={BODY_COLORS[body.id] || '#fff'}
                  fontSize="18"
                  fontWeight="bold"
                >
                  {BODY_ICONS[body.id] || body.id.substring(0, 2)}
                </text>
                <text
                  x={x}
                  y={yEnd + dir * 32}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={BODY_COLORS[body.id] || '#fff'}
                  fontSize="10"
                  opacity={0.8}
                >
                  {decLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default WesternDeclinationChart;
