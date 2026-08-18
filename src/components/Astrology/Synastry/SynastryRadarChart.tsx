import React from 'react';
import { Compass } from 'lucide-react';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import type { SynastryDimensions } from '../../../stores/astrologyStore';

interface SynastryRadarChartProps {
  dimensions: SynastryDimensions;
}

const DIMENSION_CONFIG = [
  { key: 'emotional', label: 'Tâm Hồn', icon: 'favorite', color: '#ec4899' },
  { key: 'chemistry', label: 'Hấp Dẫn', icon: 'local_fire_department', color: '#f43f5e' },
  { key: 'intellect', label: 'Trí Tuệ', icon: 'psychology', color: '#3b82f6' },
  { key: 'stability', label: 'Gia Đạo', icon: 'home', color: '#10b981' },
  { key: 'complement', label: 'Bổ Trợ', icon: 'all_inclusive', color: '#8b5cf6' },
] as const;

export const SynastryRadarChart: React.FC<SynastryRadarChartProps> = ({ dimensions }) => {
  const size = 300;
  const center = size / 2;
  const radius = 95;
  const numAxes = DIMENSION_CONFIG.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Calculate points for polygon
  const points = DIMENSION_CONFIG.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const value = Math.max(10, Math.min(100, dimensions[dim.key as keyof SynastryDimensions]?.score ?? 50));
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value, label: dim.label, key: dim.key };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  // Levels for background concentric polygons
  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="surface-card p-4 sm:p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-4">
      <div className="flex items-center justify-between border-b border-border-light/40 pb-2.5 dark:border-border-dark/40">
        <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <Compass className="h-4 w-4 text-rose-500 shrink-0" />
          Bản Đồ 5 Chiều Hòa Hợp (5D Relational Vector)
        </h4>
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          Đông · Tây · Vệ Đà
        </span>
      </div>

      <div className="relative w-full max-w-[320px] mx-auto aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-sm">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
            </radialGradient>
          </defs>

          {/* Concentric reference rings */}
          {levels.map((lvl) => {
            const ringPoints = Array.from({ length: numAxes }).map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = lvl * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            });
            return (
              <polygon
                key={lvl}
                points={ringPoints.join(' ')}
                fill="none"
                stroke="currentColor"
                strokeDasharray={lvl === 1 ? 'none' : '3 3'}
                className="stroke-gray-300/60 dark:stroke-white/10"
                strokeWidth={lvl === 1 ? '1.5' : '1'}
              />
            );
          })}

          {/* Axis lines */}
          {DIMENSION_CONFIG.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="stroke-gray-300/60 dark:stroke-white/15"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled polygon */}
          <path
            d={polygonPath}
            fill="url(#radarGlow)"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Vertices & Values */}
          {points.map((p, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 28;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);

            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />
                <text
                  x={lx}
                  y={ly - 4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-gray-700 dark:fill-gray-200 text-[11px] font-semibold tracking-tight"
                >
                  {p.label}
                </text>
                <text
                  x={lx}
                  y={ly + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-rose-500 dark:fill-rose-400 text-[10px] font-bold"
                >
                  {p.value}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dimensional Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {DIMENSION_CONFIG.map(({ key, label, icon, color }) => {
          const dim = dimensions[key as keyof SynastryDimensions];
          if (!dim) return null;
          return (
            <div
              key={key}
              className="rounded-xl border border-border-light/40 bg-surface-container-lowest/60 p-3 dark:border-border-dark/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                  <div style={{ color }}>
                    {renderDynamicIcon(icon, 'h-3.5 w-3.5')}
                  </div>
                  {label}
                </span>
                <span className="text-xs font-bold text-rose-500 dark:text-rose-400">{dim.score}%</span>
              </div>
              <div className="h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
                />
              </div>
              <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark line-clamp-1">
                {dim.details.join(' · ')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
