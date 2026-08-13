import React from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const PLANET_ORDER = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'chiron', 'lilith', 'northnode', 'southnode', 'partOfFortune', 'vertex', 'ascendant', 'midheaven'
];

const BODY_LABELS: Record<string, string> = {
  sun: 'Mặt Trời', moon: 'Mặt Trăng', mercury: 'Thủy Tinh', venus: 'Kim Tinh',
  mars: 'Hỏa Tinh', jupiter: 'Mộc Tinh', saturn: 'Thổ Tinh', uranus: 'Thiên Vương Tinh',
  neptune: 'Hải Vương Tinh', pluto: 'Diêm Vương Tinh',
  chiron: 'Chiron', lilith: 'Lilith',
  northnode: 'La Hầu', southnode: 'Kế Đô',
  partOfFortune: 'P. of Fortune', vertex: 'Vertex',
  ascendant: 'Điểm Mọc', midheaven: 'Thiên Đỉnh'
};

const BODY_ICONS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀',
  mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅',
  neptune: '♆', pluto: '♇', 
  chiron: '⚷', lilith: '⚸',
  northnode: '☊', southnode: '☋',
  partOfFortune: '⊗', vertex: '⪫',
  ascendant: 'AC', midheaven: 'MC'
};

const BODY_COLORS: Record<string, string> = {
  sun: '#e74c3c', moon: '#bdc3c7', mercury: '#2ecc71', venus: '#e67e22',
  mars: '#e74c3c', jupiter: '#9b59b6', saturn: '#e67e22', uranus: '#2ecc71',
  neptune: '#3498db', pluto: '#bdc3c7', chiron: '#bdc3c7', lilith: '#bdc3c7',
  northnode: '#9b59b6', southnode: '#9b59b6', partOfFortune: '#bdc3c7', vertex: '#bdc3c7',
  ascendant: '#bdc3c7', midheaven: '#3498db'
};

const ASPECT_ICONS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹', quincunx: '⚻'
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#bdc3c7',
  opposition: '#e74c3c',
  trine: '#3498db',
  square: '#e056fd',
  sextile: '#2ecc71',
  quincunx: '#f39c12',
};

function formatDegMin(longitude: number) {
  const deg = Math.floor(longitude % 30);
  const min = Math.floor(((longitude % 30) - deg) * 60);
  const sec = Math.floor((((longitude % 30) - deg) * 60 - min) * 60);
  return `${deg.toString().padStart(2, '0')}° ${min.toString().padStart(2, '0')}' ${sec.toString().padStart(2, '0')}"`;
}

export const WesternAspectGrid: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const availableBodies: { id: string; longitude: number; sign: string; signIndex: number; retrograde?: boolean }[] = [];
  
  result.planets.forEach(p => {
    availableBodies.push({
      id: p.body,
      longitude: p.tropicalLongitude,
      sign: p.sign,
      signIndex: p.signIndex,
      retrograde: p.retrograde
    });
  });

  if (result.partOfFortune) {
    availableBodies.push({
      id: 'partOfFortune',
      longitude: result.partOfFortune.longitude,
      sign: result.partOfFortune.sign,
      signIndex: result.partOfFortune.signIndex
    });
  }

  if (result.ascendant !== undefined) {
    const acIndex = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
    const signs = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];
    availableBodies.push({
      id: 'ascendant',
      longitude: result.ascendant,
      sign: signs[acIndex],
      signIndex: acIndex
    });
  }

  if (result.midheaven !== undefined) {
    const mcIndex = Math.floor(((result.midheaven % 360) + 360) % 360 / 30);
    const signs = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];
    availableBodies.push({
      id: 'midheaven',
      longitude: result.midheaven,
      sign: signs[mcIndex],
      signIndex: mcIndex
    });
  }

  availableBodies.sort((a, b) => {
    let ia = PLANET_ORDER.indexOf(a.id);
    let ib = PLANET_ORDER.indexOf(b.id);
    if (ia === -1) ia = 999;
    if (ib === -1) ib = 999;
    return ia - ib;
  });

  const uniqueBodies = availableBodies.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

  const cellSize = 22;
  const n = uniqueBodies.length;
  const gridWidth = n * cellSize;
  const gridHeight = n * cellSize;

  return (
    <div className="glass-card overflow-hidden mt-6 p-4 rounded-xl shadow-lg border border-[#374e68]/40" style={{ backgroundColor: '#152336', color: '#fff' }}>
      <div className="card-header border-b border-[#374e68]/40 pb-2 mb-4">
        <h3 className="section-title text-sm flex items-center gap-2">
          Góc hợp & Tọa độ
        </h3>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-none overflow-x-auto max-w-full">
          <svg width={gridWidth} height={gridHeight} viewBox={`0 0 ${gridWidth} ${gridHeight}`}>
            {uniqueBodies.map((rowBody, rowIndex) => {
              if (rowIndex === 0) return null;
              return uniqueBodies.map((colBody, colIndex) => {
                if (colIndex >= rowIndex) return null;

                const x = colIndex * cellSize;
                const y = rowIndex * cellSize;
                
                const aspect = result.aspects.find(a => 
                  (a.planetA === rowBody.id && a.planetB === colBody.id) ||
                  (a.planetA === colBody.id && a.planetB === rowBody.id)
                );

                return (
                  <g key={`${rowBody.id}-${colBody.id}`} transform={`translate(${x}, ${y})`}>
                    <rect x="0" y="0" width={cellSize} height={cellSize} fill="transparent" stroke="#374e68" strokeWidth="0.5" />
                    {aspect && ASPECT_ICONS[aspect.type] && (
                      <text
                        x={cellSize / 2}
                        y={cellSize / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="14"
                        fill={ASPECT_COLORS[aspect.type] || '#bdc3c7'}
                      >
                        {ASPECT_ICONS[aspect.type]}
                      </text>
                    )}
                  </g>
                );
              });
            })}
            
            {uniqueBodies.map((body, i) => {
              if (i === n - 1) return null;
              const x = i * cellSize;
              const y = i * cellSize;
              return (
                <text
                  key={`col-head-${body.id}`}
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="14"
                  fill={BODY_COLORS[body.id] || '#fff'}
                >
                  {BODY_ICONS[body.id] || body.id}
                </text>
              );
            })}

            {uniqueBodies.map((body, i) => {
              if (i === 0) return null;
              const x = i * cellSize;
              const y = i * cellSize;
              return (
                <text
                  key={`row-head-${body.id}`}
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="14"
                  fill={BODY_COLORS[body.id] || '#fff'}
                >
                  {BODY_ICONS[body.id] || body.id}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="flex-1 overflow-x-auto min-w-[300px]">
          <table className="w-full text-left text-sm border-collapse">
            <tbody>
              {uniqueBodies.map((body) => (
                <tr key={`legend-${body.id}`} className="border-b border-[#374e68]/50 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-1 px-2 w-8 text-center text-lg font-bold" style={{ color: BODY_COLORS[body.id] || '#fff' }}>
                    {BODY_ICONS[body.id] || body.id.substring(0, 2)}
                  </td>
                  <td className="py-1 px-2 text-[#8eb0d1]">
                    {BODY_LABELS[body.id] || body.id}
                  </td>
                  <td className="py-1 px-2 font-medium" style={{ color: '#8eb0d1' }}>
                    {body.sign} {formatDegMin(body.longitude)}{body.retrograde ? ' R' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WesternAspectGrid;
