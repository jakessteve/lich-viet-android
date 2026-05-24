/**
 * AcademicCitation — Per-factor source attribution toggle
 *
 * Shows collapsible 📖 citations per scoring group,
 * attributing each factor to its classical academic source.
 */

import React, { useState } from 'react';

interface AcademicCitationProps {
  /** Display label for the group */
  groupLabel: string;
  /** Array of source citation strings */
  sources: string[];
}

const AcademicCitation: React.FC<AcademicCitationProps> = ({ groupLabel, sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-gold dark:hover:text-gold-dark transition-colors cursor-pointer"
        title={`Nguồn học thuật cho ${groupLabel}`}
      >
        <span>📖</span>
        <span className="underline decoration-dotted">Nguồn tham khảo</span>
        <span className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="mt-1 pl-4 space-y-0.5 animate-fade-scale">
          {sources.map((src, i) => (
            <p
              key={i}
              className="text-[10px] text-text-secondary-light/60 dark:text-text-secondary-dark/60 leading-relaxed"
            >
              • {src}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicCitation;

/**
 * Pre-defined citation data for each scoring group.
 */
export const GROUP_CITATIONS: Record<string, string[]> = {
  day: [
    '協紀辨方書 (Hiệp Kỷ Biện Phương Thư) — Hoàng Đạo, Thần Sát, Ngũ Hành nhật',
    '玉匣通書 (Ngọc Hạp Thông Thư) — 28 Tú, Trực, Sao hàng ngày',
  ],
  compatibility: [
    '三命通會 (Tam Mệnh Thông Hội) — Bát Tự 合婚, Nạp Âm đối chiếu',
    '紫微斗數全書 (Tử Vi Đẩu Số Toàn Thư) — Cung Phu Thê, Tứ Hóa phi tinh',
    'Pythagorean Numerology — Ma trận tương hợp Số Đường Đời 9×9',
  ],
  cosmicEnergy: [
    '奇門遁甲大全 (Kỳ Môn Độn Giáp Đại Toàn) — Cục diện, Cửu Cung',
    '太乙數統宗 (Thái Ất Số Thống Tông) — 16 thần, Kế thần',
  ],
};
