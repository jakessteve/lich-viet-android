/**
 * SynergyRadar — SVG Radar/Spider Chart
 *
 * Visualizes 5 scoring dimensions from the Dụng Sự composite score:
 *   📅 Ngày, 👥 Hợp Tuổi, 🌌 Vận Khí, ⚠️ An Toàn, 🔗 Tương Hợp
 *
 * Pure presentation — receives normalized 0–100 values for each axis.
 */

import React, { useMemo } from 'react';

export type RadarData = {
  day?: number;
  compat?: number;
  cosmic?: number;
  safety?: number;
  synergy?: number;
  [key: string]: number | undefined;
};

export interface RadarAxis {
  key: string;
  label: string;
}

interface SynergyRadarProps {
  data: RadarData;
  axes?: RadarAxis[];
  size?: number;
}

const DEFAULT_AXES: RadarAxis[] = [
  { key: 'day', label: '📅 Ngày' },
  { key: 'compat', label: '👥 Hợp Tuổi' },
  { key: 'cosmic', label: '🌌 Vận Khí' },
  { key: 'safety', label: '⚠️ An Toàn' },
  { key: 'synergy', label: '🔗 Tổng Hợp' },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const SynergyRadar: React.FC<SynergyRadarProps> = ({ data, axes = DEFAULT_AXES, size = 200 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;

  const angleStep = 360 / axes.length;
  const labelsWithAngles = axes.map((a, i) => ({
    ...a,
    angle: -90 + i * angleStep,
  }));

  const values = useMemo(() => {
    return axes.map((a) => data[a.key] || 0);
  }, [data, axes]);

  // Polygon points for the data shape
  const polygonPoints = useMemo(() => {
    return labelsWithAngles
      .map((l, i) => {
        const r = (values[i] / 100) * maxR;
        const pt = polarToCartesian(cx, cy, r, l.angle);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  }, [values, cx, cy, maxR, labelsWithAngles]);

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
        {/* Background grid */}
        {gridLevels.map((level) => {
          const pts = labelsWithAngles
            .map((l: RadarAxis & { angle: number }) => {
              const pt = polarToCartesian(cx, cy, maxR * level, l.angle);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-gray-300 dark:text-gray-600"
              strokeDasharray={level < 1 ? '2 2' : 'none'}
            />
          );
        })}

        {/* Axis lines */}
        {labelsWithAngles.map((l: RadarAxis & { angle: number }) => {
          const pt = polarToCartesian(cx, cy, maxR, l.angle);
          return (
            <line
              key={l.key}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-gray-300 dark:text-gray-600"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="var(--color-gold, #d4a574)"
          strokeWidth={1.5}
          className="animate-fade-scale"
        />

        {/* Data points */}
        {labelsWithAngles.map((l: RadarAxis & { angle: number }, i: number) => {
          const r = (values[i] / 100) * maxR;
          const pt = polarToCartesian(cx, cy, r, l.angle);
          return (
            <circle
              key={l.key}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill="var(--color-gold, #d4a574)"
              stroke="white"
              strokeWidth={1}
            />
          );
        })}

        {/* Labels */}
        {labelsWithAngles.map((l: RadarAxis & { angle: number }, i: number) => {
          const labelR = maxR + 18;
          const pt = polarToCartesian(cx, cy, labelR, l.angle);
          return (
            <text
              key={l.key}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] fill-gray-600 dark:fill-gray-400 font-medium"
            >
              {l.label}
              <tspan x={pt.x} dy="11" className="text-[10px] fill-gray-400 dark:fill-gray-500">
                {values[i]}%
              </tspan>
            </text>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-gold, #d4a574)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-gold, #d4a574)" stopOpacity={0.1} />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default SynergyRadar;
