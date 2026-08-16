import React, { useState, useMemo } from 'react';
import type { SwissNatalChartResult } from '../../../services/astrology/swissNatalChart';
import { analyzeThematicChart } from '../../../services/astrology/thematicAstrology';

interface ThematicChartViewProps {
  natalResult: SwissNatalChartResult;
}

const THEME_MODES = [
  { id: 'vocational', label: 'Hướng Nghiệp', icon: 'work' },
  { id: 'financial', label: 'Tài Chính', icon: 'account_balance_wallet' },
  { id: 'karmic', label: 'Nghiệp Quả & Draconic', icon: 'psychology' },
  { id: 'relationship', label: 'Tình Cảm & Hôn Phối', icon: 'favorite' },
  { id: 'parenting', label: 'Nuôi Dạy Trẻ', icon: 'child_care' },
] as const;

type ThemeMode = (typeof THEME_MODES)[number]['id'];

export const ThematicChartView: React.FC<ThematicChartViewProps> = ({ natalResult }) => {
  const [activeMode, setActiveMode] = useState<ThemeMode>('vocational');

  const thematic = useMemo(() => {
    return analyzeThematicChart(natalResult);
  }, [natalResult]);

  const { vocational, financial, karmic, relationship, parenting } = thematic;

  return (
    <div className="space-y-6">
      {/* Sub-mode selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {THEME_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setActiveMode(mode.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeMode === mode.id
                ? 'bg-astral-primary text-white shadow-md'
                : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark'
            }`}
          >
            <span className="material-icons-round text-base">{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {/* 1. Hướng Nghiệp */}
      {activeMode === 'vocational' && (
        <div className="glass-card p-4 sm:p-5 space-y-4 animate-fade-scale">
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark/40 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-astral-primary dark:text-astral-primary-dark">work</span>
              Giải Mã Sứ Mệnh Hướng Nghiệp
            </h3>
            <span className="badge-astral">Thiên Đỉnh (MC): {vocational.mcSignVi}</span>
          </div>

          <div className="astral-card p-3.5 text-xs space-y-1">
            <p className="font-bold text-astral-primary dark:text-astral-primary-dark">
              Hình Mẫu Nghề Nghiệp Cốt Lõi: {vocational.careerArchetype}
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">{vocational.workStyle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3.5 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40">
              <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                <span className="material-icons-round text-emerald-500 text-sm">check_circle</span>
                Thế Mạnh Vượt Trội:
              </h4>
              <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
                {vocational.keyStrengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40">
              <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                <span className="material-icons-round text-sky-500 text-sm">stars</span>
                Lĩnh Vực Tương Thích Cao:
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vocational.recommendedFields.map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tài Chính */}
      {activeMode === 'financial' && (
        <div className="glass-card p-4 sm:p-5 space-y-4 animate-fade-scale">
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark/40 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-emerald-500">account_balance_wallet</span>
              Bản Đồ Tài Chính & Dòng Tiền
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
              Chỉ Số Thịnh Vượng: {financial.wealthScore}/100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Khả Năng Thu Nhập Tự Thân (Cung 2):</h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">{financial.earningCapacity}</p>
              <p className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 italic">
                {financial.secondHouseSummary}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Đầu Tư & Nguồn Lực Đối Tác (Cung 8):</h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">{financial.investmentStyle}</p>
              <p className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 italic">
                {financial.eighthHouseSummary}
              </p>
            </div>
          </div>

          {financial.fortunePlacement && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <p className="font-bold text-amber-800 dark:text-amber-300">{financial.fortunePlacement}</p>
            </div>
          )}

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              Lời Khuyên Tối Ưu Hóa Tài Chính:
            </h4>
            <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
              {financial.wealthTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 3. Nghiệp Quả & Draconic */}
      {activeMode === 'karmic' && (
        <div className="glass-card p-4 sm:p-5 space-y-4 animate-fade-scale">
          <div className="border-b border-border-light dark:border-border-dark/40 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-violet-500">psychology</span>
              Giải Mã Nghiệp Quả & Bản Đồ Sao Draconic
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs space-y-1">
            <p className="font-bold text-violet-600 dark:text-violet-300">Sứ Mệnh Linh Hồn (La Hầu ☊):</p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">{karmic.soulMission}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-2">
              <h4 className="font-bold text-amber-600 dark:text-amber-400">Kế Đô (☋) & Bài Học Tiền Kiếp:</h4>
              <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
                {karmic.pastLifePatterns.map((pat, i) => (
                  <li key={i}>{pat}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-2">
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400">Bài Học Chuyển Hóa Cần Rèn Luyện:</h4>
              <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
                {karmic.karmicLessons.map((les, i) => (
                  <li key={i}>{les}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Draconic vs Natal Planets */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              Vị Trí Bản Đồ Draconic (Bản Thiết Kế Linh Hồn 0° Bạch Dương):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {karmic.draconicPlanets.map((dp, i) => (
                <div key={i} className="p-2 rounded-lg bg-surface-subtle-light dark:bg-white/5 text-center">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                    {dp.symbol} {dp.nameVi}
                  </span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark text-[11px]">
                    {dp.draconicDegree}° {dp.draconicSignVi}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tình Cảm & Hôn Phối */}
      {activeMode === 'relationship' && (
        <div className="glass-card p-4 sm:p-5 space-y-4 animate-fade-scale">
          <div className="border-b border-border-light dark:border-border-dark/40 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-rose-500">favorite</span>
              Bản Đồ Tình Cảm & Mối Quan Hệ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
              <h4 className="font-bold text-rose-600 dark:text-rose-400">Phong Cách Yêu Thương (Sao Kim):</h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">{relationship.loveStyle}</p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
              <h4 className="font-bold text-rose-600 dark:text-rose-400">Nhu Cầu Cảm Xúc Sâu Kín (Mặt Trăng):</h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">{relationship.emotionalNeeds}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 text-xs space-y-2">
            <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Chân Dung Bạn Đời Lý Tưởng:</h4>
            <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
              {relationship.idealPartnerTraits.map((trait, i) => (
                <li key={i}>{trait}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. Nuôi Dạy Trẻ */}
      {activeMode === 'parenting' && (
        <div className="glass-card p-4 sm:p-5 space-y-4 animate-fade-scale">
          <div className="border-b border-border-light dark:border-border-dark/40 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-amber-500">child_care</span>
              Nuôi Dạy Con & Tâm Lý Trẻ Nhỏ
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <p className="font-bold text-amber-800 dark:text-amber-300">{parenting.childArchetype}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Nhu Cầu An Toàn Cảm Xúc:</h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                {parenting.emotionalSecurityNeed}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Phong Cách Tư Duy & Học Tập:</h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                {parenting.cognitiveLearningStyle}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 text-xs space-y-2">
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">Lời Khuyên Cho Cha Mẹ:</h4>
            <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
              {parenting.parentingAdvice.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
