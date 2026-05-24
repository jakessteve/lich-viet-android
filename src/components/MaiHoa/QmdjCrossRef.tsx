/**
 * QmdjCrossRef — Shows QMDJ chart data alongside Mai Hoa hexagram results
 *
 * "Your Mai Hoa reading aligns with [Door] + [Star] in the QMDJ chart"
 */

import React, { useMemo } from 'react';
import { generateQmdjChart } from '@lich-viet/core/qmdj';
import type { Chi } from '../../types/calendar';

const CHI_FROM_HOUR: Chi[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

interface QmdjCrossRefProps {
  date: Date;
}

const QmdjCrossRef: React.FC<QmdjCrossRefProps> = ({ date }) => {
  const crossRef = useMemo(() => {
    try {
      const h = date.getHours();
      const hourIndex = Math.floor(((h + 1) % 24) / 2);
      const hourChi = CHI_FROM_HOUR[hourIndex];
      const chart = generateQmdjChart(date, hourChi);

      // Find the most significant palace (the one with the directing door)
      const trucSuPalace = chart.palaces.find((p) => p.door?.id === chart.trucSuDoorId);
      const trucPhuPalace = chart.palaces.find((p) => p.star?.id === chart.trucPhuStarId);

      const door = trucSuPalace?.door;
      const star = trucPhuPalace?.star;

      // Check formations
      const auspFormations = chart.formations.filter((f) => f.effect === 'cat');
      const inausFormations = chart.formations.filter((f) => f.effect === 'hung');

      const isAligned = door && door.auspiciousness === 'cat';
      const alignmentNote = isAligned
        ? `Kỳ Môn xác nhận: ${door?.nameVi} + ${star?.nameVi} — thuận lợi ✅`
        : `Kỳ Môn cảnh báo: ${door?.nameVi} + ${star?.nameVi} — cần cân nhắc ⚠️`;

      return {
        door,
        star,
        alignmentNote,
        isAligned,
        auspFormations,
        inausFormations,
        gameNumber: chart.gameNumber,
        isDuongDon: chart.isDuongDon,
        solarTerm: chart.solarTerm,
      };
    } catch {
      return null;
    }
  }, [date]);

  if (!crossRef) return null;

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        crossRef.isAligned
          ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-700/20'
          : 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-700/20'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="material-icons-round text-sm text-purple-500 dark:text-purple-400">grid_view</span>
        <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
          Đối Chiếu Kỳ Môn Độn Giáp
        </h4>
      </div>

      <p
        className={`text-sm font-medium ${
          crossRef.isAligned ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
        }`}
      >
        {crossRef.alignmentNote}
      </p>

      <div className="flex flex-wrap gap-1.5 text-sm">
        <span className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark border border-gray-200/40 dark:border-white/10">
          Cục {crossRef.gameNumber} · {crossRef.isDuongDon ? 'Dương Độn' : 'Âm Độn'}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark border border-gray-200/40 dark:border-white/10">
          {crossRef.solarTerm}
        </span>
        {crossRef.auspFormations.map((f) => (
          <span
            key={f.id}
            className="px-2 py-0.5 rounded-full bg-emerald-100/60 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-700/20"
          >
            ✅ {f.nameVi}
          </span>
        ))}
        {crossRef.inausFormations.map((f) => (
          <span
            key={f.id}
            className="px-2 py-0.5 rounded-full bg-red-100/60 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-700/20"
          >
            ❌ {f.nameVi}
          </span>
        ))}
      </div>
    </div>
  );
};

export default QmdjCrossRef;
