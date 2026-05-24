/**
 * QmdjChartWidget — Visual Cửu Cung Grid for Kỳ Môn Độn Giáp
 * Renders a 3×3 palace grid showing Door, Star, Deity, and Stems.
 */

import React, { useMemo, useState } from 'react';
import type { Chi } from '../../types/calendar';
import type { QmdjChart, QmdjPalace } from '../../types/qmdj';
import { generateQmdjChart } from '@lich-viet/core/qmdj';
import { getQmdjHourSummary } from '@lich-viet/core/qmdj';

interface QmdjChartWidgetProps {
  date: Date;
  hourChi: Chi;
}

/** Map palace numbers to their 3×3 grid positions (Lạc Thư layout). */
const GRID_LAYOUT = [
  [4, 9, 2], // Top row: SE, S, SW
  [3, 5, 7], // Middle: E, Center, W
  [8, 1, 6], // Bottom: NE, N, NW
];

const AUSPICIOUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  dai_cat: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-900/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-700/30',
    dot: 'bg-emerald-500',
  },
  cat: {
    bg: 'bg-sky-50/80 dark:bg-sky-900/15',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200/60 dark:border-sky-700/30',
    dot: 'bg-sky-500',
  },
  trung_binh: {
    bg: 'bg-amber-50/80 dark:bg-amber-900/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-700/30',
    dot: 'bg-amber-500',
  },
  hung: {
    bg: 'bg-red-50/80 dark:bg-red-900/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200/60 dark:border-red-700/30',
    dot: 'bg-red-500',
  },
  dai_hung: {
    bg: 'bg-red-100/80 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300/60 dark:border-red-600/30',
    dot: 'bg-red-600',
  },
};

const DEFAULT_COLORS = {
  bg: 'bg-gray-50/80 dark:bg-white/5',
  text: 'text-gray-500 dark:text-gray-400',
  border: 'border-gray-200/60 dark:border-white/10',
  dot: 'bg-gray-400',
};

function getColors(auspiciousness?: string) {
  if (!auspiciousness) return DEFAULT_COLORS;
  return AUSPICIOUS_COLORS[auspiciousness] || DEFAULT_COLORS;
}

const QmdjChartWidget: React.FC<QmdjChartWidgetProps> = ({ date, hourChi }) => {
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null);

  const chart: QmdjChart | null = useMemo(() => {
    try {
      return generateQmdjChart(date, hourChi);
    } catch {
      return null;
    }
  }, [date, hourChi]);

  const summary = useMemo(() => {
    if (!chart) return null;
    return getQmdjHourSummary(chart);
  }, [chart]);

  if (!chart) {
    return (
      <div className="text-center py-4 text-base text-text-secondary-light dark:text-text-secondary-dark">
        <span className="material-icons-round text-2xl mb-1 block opacity-40">error_outline</span>
        Không thể tính Kỳ Môn cho ngày này
      </div>
    );
  }

  const palaceMap = new Map<number, QmdjPalace>();
  chart.palaces.forEach((p) => palaceMap.set(p.number, p));

  const selectedP = selectedPalace ? palaceMap.get(selectedPalace) : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-lg text-gold dark:text-gold-dark">auto_awesome</span>
          <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">Kỳ Môn Độn Giáp</h3>
        </div>
        <div className="flex items-center gap-2 text-base text-text-secondary-light dark:text-text-secondary-dark">
          <span className="px-1.5 py-0.5 rounded bg-surface-subtle-light dark:bg-white/10 font-medium">
            {chart.isDuongDon ? 'Dương Độn' : 'Âm Độn'}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-subtle-light dark:bg-white/10 font-medium">
            Cục {chart.gameNumber}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-subtle-light dark:bg-white/10 font-medium">
            {chart.hourCan} {chart.hourChi}
          </span>
        </div>
      </div>

      {/* 3×3 Cửu Cung Grid */}
      <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
        {GRID_LAYOUT.flat().map((palaceNum) => {
          const palace = palaceMap.get(palaceNum);
          if (!palace) return <div key={palaceNum} />;

          const doorColors = getColors(palace.door?.auspiciousness);
          const isCenter = palaceNum === 5;
          const isSelected = selectedPalace === palaceNum;

          return (
            <button
              key={palaceNum}
              onClick={() => setSelectedPalace(isSelected ? null : palaceNum)}
              className={`relative flex flex-col items-center justify-center p-2 min-h-[72px] transition-all duration-150 cursor-pointer
                ${doorColors.bg}
                ${isSelected ? 'ring-2 ring-inset ring-gold/50 dark:ring-gold-dark/50 scale-[1.02]' : ''}
                ${isCenter ? 'bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-800/10' : ''}
                hover:brightness-95 dark:hover:brightness-110
              `}
            >
              {/* Palace number */}
              <span className="absolute top-0.5 left-1 text-xs font-bold text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                {palaceNum}
              </span>

              {/* Direction */}
              <span className="absolute top-0.5 right-1 text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                {palace.direction}
              </span>

              {/* Door (main label) */}
              {palace.door ? (
                <span className={`text-sm font-bold ${doorColors.text} leading-none`}>{palace.door.nameVi}</span>
              ) : (
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-none">Trung Cung</span>
              )}

              {/* Star */}
              {palace.star && (
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 leading-none">
                  {palace.star.nameVi}
                </span>
              )}

              {/* Stem */}
              {palace.earthStem && (
                <span className="text-xs font-medium text-text-secondary-light/70 dark:text-text-secondary-dark/70 mt-0.5 leading-none">
                  {palace.earthStem}
                </span>
              )}

              {/* Auspiciousness dot */}
              {palace.door && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${doorColors.dot}`} />}

              {/* Formation indicator */}
              {chart.formations.some((f) => f.palaceNumber === palaceNum) && (
                <span className="absolute bottom-0.5 right-1 text-[10px]">🐉</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Palace Detail */}
      {selectedP && (
        <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light/50 dark:border-border-dark/50 text-sm space-y-1.5 animate-fade-scale">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm">
              Cung {selectedP.number} — {selectedP.direction}
            </span>
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              ({selectedP.trigram} / {selectedP.element})
            </span>
          </div>
          {selectedP.door && (
            <p className={`${getColors(selectedP.door.auspiciousness).text} font-medium`}>
              🚪 {selectedP.door.nameVi}: {selectedP.door.description}
            </p>
          )}
          {selectedP.star && (
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              ⭐ {selectedP.star.nameVi}: {selectedP.star.description}
            </p>
          )}
          {selectedP.deity && (
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              🔮 {selectedP.deity.nameVi}: {selectedP.deity.description}
            </p>
          )}
          {selectedP.earthStem && (
            <p className="text-text-secondary-light/70 dark:text-text-secondary-dark/70">
              Can: {selectedP.earthStem}
              {selectedP.heavenlyStem && ` → ${selectedP.heavenlyStem}`}
            </p>
          )}
          {chart.formations
            .filter((f) => f.palaceNumber === selectedP.number)
            .map((f) => (
              <p key={f.id} className={`font-medium ${getColors(f.effect).text}`}>
                🐉 {f.nameVi} ({f.nameCn}): {f.description}
              </p>
            ))}
        </div>
      )}

      {/* Formation Badges */}
      {chart.formations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chart.formations.map((f) => {
            const colors = getColors(f.effect);
            return (
              <span
                key={`${f.id}-${f.palaceNumber}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                🐉 {f.nameVi}
                <span className="opacity-60">Cung {f.palaceNumber}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Top Doors Summary */}
      {summary && (
        <div className="flex items-center gap-2 text-base text-text-secondary-light dark:text-text-secondary-dark">
          <span className="font-semibold uppercase tracking-wider">Tốt nhất:</span>
          {summary.topDoors.map((d, i) => {
            const colors = getColors(d.auspiciousness);
            return (
              <span key={i} className={`${colors.text} font-medium`}>
                {d.doorName} ({d.direction})
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QmdjChartWidget;
