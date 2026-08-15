import React, { useMemo, useState } from 'react';
import type { TuViChart as TuViChartType, DaiHanInterpretationResult } from '../../types/tuvi';
import { getAllDaiHanInterpretations, getCurrentDaiHan } from '../../services/tuvi/daiHanInterpretation';
import { SegmentedControl, type SegmentedOption } from '../shared';

type SummaryTab = 'overview' | 'daiHan';
type DaiHanViewMode = 'simple' | 'advanced';

const SUMMARY_TABS: readonly SegmentedOption<SummaryTab>[] = [
  { id: 'overview', label: 'Tổng quan', shortLabel: 'Tổng quan', icon: 'dashboard' },
  { id: 'daiHan', label: 'Đại hạn', shortLabel: 'Đại hạn', icon: 'timeline' },
];

const DAI_HAN_VIEW_MODES: readonly SegmentedOption<DaiHanViewMode>[] = [
  { id: 'simple', label: 'Cơ bản (Dễ hiểu)', shortLabel: 'Cơ bản', icon: 'menu_book' },
  { id: 'advanced', label: 'Chuyên sâu (Kỹ thuật)', shortLabel: 'Chuyên sâu', icon: 'psychology' },
];

const TUHOA_CLASS: Record<'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ', string> = {
  Lộc: 'bg-good/15 text-good dark:text-good-dark border border-good/30',
  Quyền: 'bg-info/15 text-info dark:text-info-dark border border-info/30',
  Khoa: 'bg-purple/15 text-purple dark:text-purple-dark border border-purple/30',
  Kỵ: 'bg-bad/15 text-bad dark:text-bad-dark border border-bad/30',
};

const LUCK_TIER_CLASS: Record<DaiHanInterpretationResult['luckTier'], string> = {
  'Đại Cát': 'bg-good/15 text-good dark:text-good-dark border-good/40',
  'Khởi Sắc': 'bg-info/15 text-info dark:text-info-dark border-info/40',
  'Bình Hòa': 'bg-gold/15 text-gold-light dark:text-gold-dark border-gold/40',
  'Thử Thách': 'bg-orange/15 text-orange dark:text-orange-dark border-orange/40',
  'Gian Nan': 'bg-bad/15 text-bad dark:text-bad-dark border-bad/40',
};

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${className ?? ''}`}>
      {children}
    </span>
  );
}

function TuHoaHeaderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-gold-light dark:text-gold-dark"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M7 6h8" />
      <path d="M9 4l-2 2 2 2" />
      <path d="M17 18H9" />
      <path d="M15 16l2 2-2 2" />
      <path d="M6 12h12" />
      <path d="M12 6v12" />
    </svg>
  );
}

function summarizeTuHoa(chart: TuViChartType) {
  const order: Record<string, number> = { Lộc: 0, Quyền: 1, Khoa: 2, Kỵ: 3 };
  return chart.palaces
    .flatMap((palace) =>
      palace.tuHoa.map((tuHoa) => ({
        palaceName: palace.name,
        type: tuHoa.type,
        starName: tuHoa.starName,
        sourceCan: tuHoa.sourceCan,
      })),
    )
    .sort((a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99));
}

export const TuViSummaryPanel: React.FC<{ chart: TuViChartType }> = React.memo(({ chart }) => {
  const [activeTab, setActiveTab] = useState<SummaryTab>('overview');
  const [daiHanViewMode, setDaiHanViewMode] = useState<DaiHanViewMode>('simple');

  const viewYear = chart.hanContext?.viewYear;
  const allDaiHan = useMemo(() => getAllDaiHanInterpretations(chart, viewYear), [chart, viewYear]);
  const currentDaiHan = useMemo(() => getCurrentDaiHan(chart, viewYear), [chart, viewYear]);

  const currentDaiHanIndex = useMemo(() => {
    const idx = allDaiHan.findIndex((dh) => dh.isCurrent);
    return idx >= 0 ? idx : 0;
  }, [allDaiHan]);

  const [selectedDaiHanIndex, setSelectedDaiHanIndex] = useState<number | null>(null);

  const effectiveSelectedIndex = selectedDaiHanIndex !== null ? selectedDaiHanIndex : currentDaiHanIndex;
  const selectedDaiHan = allDaiHan[effectiveSelectedIndex] ?? allDaiHan[0] ?? currentDaiHan;

  const palaceStats = useMemo(
    () =>
      chart.palaces.map((palace) => ({
        name: palace.name,
        chi: palace.chi,
        majorCount: palace.chinhTinh.length,
        auxiliaryCount: palace.phuTinh.length,
        satCount: palace.satTinh.length,
        tuHoaCount: palace.tuHoa.length,
        isMenh: palace.isMenh,
        isThan: palace.isThan,
        hasTuan: palace.hasTuan,
        hasTriet: palace.hasTriet,
      })),
    [chart.palaces],
  );

  const summary = useMemo(() => {
    const totalMajorStars = palaceStats.reduce((sum, palace) => sum + palace.majorCount, 0);
    const totalAuxiliaryStars = palaceStats.reduce((sum, palace) => sum + palace.auxiliaryCount, 0);
    const totalSatStars = palaceStats.reduce((sum, palace) => sum + palace.satCount, 0);
    const maxMajorStars = palaceStats.reduce((max, palace) => Math.max(max, palace.majorCount), 0);
    const strongestPalaces = palaceStats
      .filter((palace) => palace.majorCount === maxMajorStars && maxMajorStars > 0)
      .map((palace) => palace.name);
    const emptyMajorPalaces = palaceStats.filter((palace) => palace.majorCount === 0).map((palace) => palace.name);
    const tuHoaEntries = summarizeTuHoa(chart);

    return {
      totalMajorStars,
      totalAuxiliaryStars,
      totalSatStars,
      strongestPalaces,
      emptyMajorPalaces,
      tuHoaEntries,
    };
  }, [chart, palaceStats]);

  return (
    <section className="surface-panel space-y-4 p-4 sm:p-5">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary-light dark:text-text-secondary-dark">
            Tóm tắt lá số
          </p>
          <h3 className="mt-1 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
            Tổng quan cấu trúc và Đại hạn
          </h3>
          <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Thông tin cấu trúc lá số và luận giải dòng chảy vận trình 10 năm theo Tử Vi Đẩu Số.
          </p>
        </div>

        <SegmentedControl
          options={SUMMARY_TABS}
          value={activeTab}
          onChange={setActiveTab}
          ariaLabel="Tổng quan lá số Tử Vi"
          className="w-full"
        />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Current Đại Hạn High-Signal Highlight Card */}
          {currentDaiHan && (
            <div className="surface-card relative overflow-hidden p-4 sm:p-5 shadow-sm space-y-3.5 border-gold/40 dark:border-gold-dark/40 bg-gradient-to-br from-gold/10 via-surface-subtle-light/80 to-surface-container-low dark:from-gold-dark/10 dark:via-surface-subtle-dark/80 dark:to-surface-elevated-dark/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-gold-light dark:text-gold-dark text-xl animate-pulse">timeline</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                        Đại Hạn Hiện Tại: {currentDaiHan.ageRange} tuổi
                      </h4>
                      <Badge className="bg-gold/20 text-gold-light dark:text-gold-dark border border-gold/40">
                        Cung {currentDaiHan.palaceName} ({currentDaiHan.palaceCanChi})
                      </Badge>
                      <Badge className={`border ${LUCK_TIER_CLASS[currentDaiHan.luckTier]}`}>
                        Vận Thế: {currentDaiHan.luckTier} ({currentDaiHan.luckScore}/10)
                      </Badge>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDaiHanIndex(currentDaiHanIndex);
                    setActiveTab('daiHan');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-gold-light dark:text-gold-dark hover:underline cursor-pointer"
                >
                  Khám phá 12 Đại hạn
                  <span className="material-icons-round text-sm">chevron_right</span>
                </button>
              </div>

              {/* Tam Tài Scoreboard Mini */}
              <div className="grid gap-2 sm:grid-cols-4 text-xs">
                <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">Thiên Thời (Thái Tuế)</span>
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{currentDaiHan.tamTai.thienThoi.level}</p>
                </div>
                <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">Địa Lợi (Cung Chi)</span>
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{currentDaiHan.tamTai.diaLoi.level}</p>
                </div>
                <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">Nhân Hòa (Quý Nhân)</span>
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{currentDaiHan.tamTai.nhanHoa.level}</p>
                </div>
                <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">Khí Lực (Trường Sinh)</span>
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{currentDaiHan.truongSinh.name}</p>
                </div>
              </div>

              {/* Prominent Patterns Tags */}
              {currentDaiHan.prominentPatterns.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentDaiHan.prominentPatterns.map((pat, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${
                        pat.type === 'cat'
                          ? 'bg-good/15 text-good dark:text-good-dark border-good/30'
                          : pat.type === 'hung'
                          ? 'bg-bad/15 text-bad dark:text-bad-dark border-bad/30'
                          : 'bg-gold/15 text-gold-light dark:text-gold-dark border-gold/30'
                      }`}
                    >
                      {pat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Formatted 4-pillar Overview */}
              <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                {currentDaiHan.detailedSynthesis.overview.split('\n\n').map((part, idx) => {
                  const colonIdx = part.indexOf(':');
                  if (colonIdx > 0 && colonIdx < 20) {
                    const title = part.slice(0, colonIdx);
                    const content = part.slice(colonIdx + 1);
                    return (
                      <p key={idx}>
                        <strong className="font-bold text-gold-light dark:text-gold-dark">{title}:</strong>{content}
                      </p>
                    );
                  }
                  return <p key={idx}>{part}</p>;
                })}
              </div>

              {/* Item 2 Fixed Spacing */}
              <div className="mt-3 pt-3 border-t border-border-light/40 dark:border-border-dark/40 flex flex-wrap items-start justify-between gap-2 text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <div className="flex items-start gap-2 leading-relaxed">
                  <span className="material-icons-round text-gold-light dark:text-gold-dark text-base shrink-0 mt-0.5">lightbulb</span>
                  <div>
                    <strong className="text-text-primary-light dark:text-text-primary-dark">Định hướng cốt lõi:</strong>{' '}
                    <span>{currentDaiHan.detailedSynthesis.strategicGuidance}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 xl:grid-cols-2">
            {/* Major Star Layout Card */}
            <div className="surface-card rounded-2xl p-4">
              <div className="flex items-center gap-1.5">
                <span className="material-icons-round shrink-0 text-base text-gold-light dark:text-gold-dark">straighten</span>
                <h4 className="flex-1 min-w-0 text-left text-sm font-semibold leading-snug text-text-primary-light dark:text-text-primary-dark">
                  Bố cục chính tinh
                </h4>
              </div>
              <div className="mt-3 space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <p>
                  Tổng chính tinh: <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{summary.totalMajorStars}</span>
                </p>
                <p>
                  Tổng phụ tinh: <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{summary.totalAuxiliaryStars}</span>
                </p>
                <p>
                  Tổng sát tinh: <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{summary.totalSatStars}</span>
                </p>
                <p>
                  Cung nhiều chính tinh nhất:{' '}
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {summary.strongestPalaces.length > 0 ? summary.strongestPalaces.join(', ') : '—'}
                  </span>
                </p>
                <p>
                  Cung vô chính diệu:{' '}
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {summary.emptyMajorPalaces.length > 0 ? summary.emptyMajorPalaces.join(', ') : 'Không có'}
                  </span>
                </p>
              </div>
            </div>

            {/* Tu Hoa Transformations Card */}
            <div className="surface-card rounded-2xl p-4">
              <div className="flex items-center gap-1.5">
                <TuHoaHeaderIcon />
                <h4 className="flex-1 min-w-0 text-left text-sm font-semibold leading-snug text-text-primary-light dark:text-text-primary-dark">
                  Tứ Hóa hiện diện
                </h4>
              </div>
              <div className="mt-3 space-y-2">
                {summary.tuHoaEntries.length === 0 ? (
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Chưa có Tứ Hóa được ghi nhận.</p>
                ) : (
                  summary.tuHoaEntries.slice(0, 8).map((entry) => (
                    <div key={`${entry.palaceName}-${entry.type}-${entry.starName}`} className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge className={TUHOA_CLASS[entry.type]}>{entry.type}</Badge>
                      <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{entry.starName}</span>
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">→ {entry.palaceName}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'daiHan' && (
        <div className="space-y-4">
          {/* View Mode Selector: Full width matching page width */}
          <SegmentedControl
            options={DAI_HAN_VIEW_MODES}
            value={daiHanViewMode}
            onChange={setDaiHanViewMode}
            ariaLabel="Chế độ xem luận giải Đại Hạn"
            className="w-full"
          />

          {/* 12 Đại Hạn Timeline Selector */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
              Dòng thời gian 12 Đại Hạn (10 năm / chu kỳ)
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-2.5 px-1 scrollbar-thin">
              {allDaiHan.map((dh, index) => {
                const isSelected = index === effectiveSelectedIndex;
                return (
                  <button
                    key={`${dh.palaceId}-${dh.ageRange}`}
                    type="button"
                    onClick={() => setSelectedDaiHanIndex(index)}
                    className={`flex flex-col items-center flex-shrink-0 px-3 py-2 rounded-xl text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-gold/20 border-gold shadow-md text-text-primary-light dark:text-text-primary-dark font-bold ring-2 ring-gold/60'
                        : 'bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/50 border-border-light/60 dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:border-gold/40'
                    }`}
                  >
                    <span className="font-bold whitespace-nowrap">{dh.ageRange}t</span>
                    <span className="text-[10px] truncate max-w-[75px]">{dh.palaceName}</span>
                    <span className="text-[9px] font-medium text-gold-light dark:text-gold-dark">{dh.luckScore}/10</span>
                    {dh.isCurrent && (
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-light dark:bg-gold-dark animate-pulse" title="Đại hạn hiện tại" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Đại Hạn Detail Inspector */}
          {selectedDaiHan && (
            <article className="space-y-4 surface-card rounded-2xl p-4 sm:p-5">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-light/40 dark:border-border-dark/40 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                      Đại Hạn {selectedDaiHan.ageRange} tuổi
                    </h4>
                    <span className="text-sm font-semibold text-gold-light dark:text-gold-dark">
                      — Cung {selectedDaiHan.palaceName} ({selectedDaiHan.palaceCanChi})
                    </span>
                    <Badge className={`border ${LUCK_TIER_CLASS[selectedDaiHan.luckTier]}`}>
                      {selectedDaiHan.luckTier} ({selectedDaiHan.luckScore}/10)
                    </Badge>
                    {selectedDaiHan.isCurrent && (
                      <Badge className="bg-gold/20 text-gold-light dark:text-gold-dark border border-gold/40">
                        Đang diễn ra
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                    {selectedDaiHan.lifeStageTheme.stageName}: {selectedDaiHan.lifeStageTheme.coreFocus}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Badge className="bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark border border-border-light/50 dark:border-border-dark/50">
                    Trường Sinh: {selectedDaiHan.truongSinh.name}
                  </Badge>
                  {selectedDaiHan.thaiTue && (
                    <Badge className="bg-purple/15 text-purple dark:text-purple-dark border border-purple/30">
                      {selectedDaiHan.thaiTue.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* MODE 1: Cơ bản (Simple & Accessible) */}
              {daiHanViewMode === 'simple' && (
                <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark animate-fade-in">
                  <div className="rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/40 dark:border-border-dark/40 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-gold-light dark:text-gold-dark text-sm">
                      <span className="material-icons-round text-base">auto_awesome</span>
                      Tổng Quan Dòng Vận 10 Năm
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                      {selectedDaiHan.detailedSynthesis.overview.split('\n\n').map((part, idx) => {
                        const colonIdx = part.indexOf(':');
                        if (colonIdx > 0 && colonIdx < 20) {
                          const title = part.slice(0, colonIdx);
                          const content = part.slice(colonIdx + 1);
                          return (
                            <p key={idx}>
                              <strong className="font-bold text-gold-light dark:text-gold-dark">{title}:</strong>{content}
                            </p>
                          );
                        }
                        return <p key={idx}>{part}</p>;
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-good/5 dark:bg-good-dark/5 border border-good/25 dark:border-good-dark/25 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-good dark:text-good-dark text-xs sm:text-sm">
                        <span className="material-icons-round text-base">work</span>
                        Sự Nghiệp & Tài Lộc
                      </div>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm">
                        {selectedDaiHan.detailedSynthesis.careerAndWealth}
                      </p>
                    </div>

                    <div className="rounded-xl bg-info/5 dark:bg-info-dark/5 border border-info/25 dark:border-info-dark/25 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-info dark:text-info-dark text-xs sm:text-sm">
                        <span className="material-icons-round text-base">favorite</span>
                        Gia Đạo, Tình Cảm & Thể Trạng
                      </div>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm">
                        {selectedDaiHan.detailedSynthesis.relationshipAndHealth}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/30 dark:border-gold-dark/30 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-gold-light dark:text-gold-dark text-xs sm:text-sm">
                      <span className="material-icons-round text-base">lightbulb</span>
                      Chiến Lược Hành Động Trọng Tâm
                    </div>
                    <p className="text-text-primary-light dark:text-text-primary-dark font-medium text-xs sm:text-sm">
                      {selectedDaiHan.detailedSynthesis.strategicGuidance}
                    </p>
                  </div>
                </div>
              )}

              {/* MODE 2: Chuyên sâu (Advanced & Technical) (Item 4: Tam Tài 1-column layout) */}
              {daiHanViewMode === 'advanced' && (
                <div className="grid gap-3.5 lg:grid-cols-2 text-xs leading-relaxed text-text-primary-light dark:text-text-primary-dark animate-fade-in">
                  {/* 1. Bố Cục Tọa Thủ & Tam Phương Tứ Chính */}
                  <div className="rounded-xl bg-gold/5 dark:bg-gold-dark/5 border border-gold/25 dark:border-gold-dark/25 p-3.5 space-y-2">
                    <div className="font-bold text-gold-light dark:text-gold-dark text-xs flex items-center gap-1.5">
                      <span className="material-icons-round text-sm">stars</span>
                      Bố Cục Tọa Thủ & Tam Phương Tứ Chính
                    </div>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
                      {selectedDaiHan.starStructure.summary}
                    </p>
                    {selectedDaiHan.starStructure.majorStars.length > 0 ? (
                      <p className="text-text-primary-light dark:text-text-primary-dark">
                        <strong>Chính tinh tọa thủ:</strong>{' '}
                        {selectedDaiHan.starStructure.majorStars.map((s) => `${s.name} (${s.brightness})`).join(', ')}
                      </p>
                    ) : (
                      <p className="text-gold-light dark:text-gold-dark font-medium">
                        ⚠️ {selectedDaiHan.starStructure.vcdSpecialNote ?? 'Bản cung Vô Chính Diệu, mượn lực chiếu từ đối cung.'}
                      </p>
                    )}

                    {/* Can Cung Đại Hạn Tứ Hóa */}
                    <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 space-y-1 border border-border-light/40 dark:border-border-dark/40">
                      <span className="text-[10px] uppercase font-bold text-gold-light dark:text-gold-dark">
                        Lưu Tứ Hóa Can {selectedDaiHan.daiHanTuHoa.canCung} Đại Hạn:
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span>✦ Lộc: <strong>{selectedDaiHan.daiHanTuHoa.hoaLoc}</strong></span>
                        <span>✦ Quyền: <strong>{selectedDaiHan.daiHanTuHoa.hoaQuyen}</strong></span>
                        <span>✦ Khoa: <strong>{selectedDaiHan.daiHanTuHoa.hoaKhoa}</strong></span>
                        <span>✦ Kỵ: <strong>{selectedDaiHan.daiHanTuHoa.hoaKy}</strong></span>
                      </div>
                    </div>

                    <p className="text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/30 dark:border-border-dark/30">
                      {selectedDaiHan.tamPhuongTuChinh.summary}
                    </p>
                    {selectedDaiHan.tuanTriet.note && (
                      <p className="text-bad dark:text-bad-dark pt-1 font-medium">
                        🛡️ {selectedDaiHan.tuanTriet.note}
                      </p>
                    )}
                  </div>

                  {/* 2. Đánh Giá Tam Tài (Item 4: Clean 1-column Vertical Stack) */}
                  <div className="rounded-xl bg-purple/5 dark:bg-purple-dark/5 border border-purple/25 dark:border-purple-dark/25 p-3.5 space-y-2.5">
                    <div className="font-bold text-purple dark:text-purple-dark text-xs flex items-center gap-1.5">
                      <span className="material-icons-round text-sm">balance</span>
                      Đánh Giá Tam Tài (Thiên Thời – Địa Lợi – Nhân Hòa)
                    </div>
                    <div className="space-y-2.5">
                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 border border-border-light/30 dark:border-border-dark/30 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gold-light dark:text-gold-dark text-xs">✦ Thiên Thời</span>
                          <Badge className="bg-gold/15 text-gold-light dark:text-gold-dark">{selectedDaiHan.tamTai.thienThoi.level}</Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.tamTai.thienThoi.desc}
                        </p>
                      </div>

                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 border border-border-light/30 dark:border-border-dark/30 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-info dark:text-info-dark text-xs">✦ Địa Lợi</span>
                          <Badge className="bg-info/15 text-info dark:text-info-dark">{selectedDaiHan.tamTai.diaLoi.level}</Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.tamTai.diaLoi.desc}
                        </p>
                      </div>

                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 border border-border-light/30 dark:border-border-dark/30 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-good dark:text-good-dark text-xs">✦ Nhân Hòa</span>
                          <Badge className="bg-good/15 text-good dark:text-good-dark">{selectedDaiHan.tamTai.nhanHoa.level}</Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.tamTai.nhanHoa.desc}
                        </p>
                      </div>

                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 border border-border-light/30 dark:border-border-dark/30 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-purple dark:text-purple-dark text-xs">✦ Khí Lực ({selectedDaiHan.truongSinh.name})</span>
                          <Badge className="bg-purple/15 text-purple dark:text-purple-dark">{selectedDaiHan.truongSinh.name}</Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.truongSinh.energyDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Các Cách Cục & Điểm Nhấn Nổi Bật */}
                  <div className="rounded-xl bg-good/5 dark:bg-good-dark/5 border border-good/25 dark:border-good-dark/25 p-3.5 space-y-2">
                    <div className="font-bold text-good dark:text-good-dark text-xs flex items-center gap-1.5">
                      <span className="material-icons-round text-sm">auto_awesome</span>
                      Cách Cục & Điểm Nhấn Nổi Bật ({selectedDaiHan.prominentPatterns.length})
                    </div>
                    {selectedDaiHan.prominentPatterns.length === 0 ? (
                      <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        Đại vận duy trì thế quân bình, không bị sát tinh xung phá nặng nề.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDaiHan.prominentPatterns.map((pat, i) => (
                          <div key={i} className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2 border border-border-light/40 dark:border-border-dark/40 space-y-0.5">
                            <span className={`text-[11px] font-bold ${pat.type === 'cat' ? 'text-good dark:text-good-dark' : pat.type === 'hung' ? 'text-bad dark:text-bad-dark' : 'text-gold-light dark:text-gold-dark'}`}>
                              ✦ {pat.name}
                            </span>
                            <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                              {pat.note ?? pat.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Lộ Trình 10 Năm & Dự Báo Toàn Diện */}
                  <div className="rounded-xl bg-info/5 dark:bg-info-dark/5 border border-info/25 dark:border-info-dark/25 p-3.5 space-y-2.5">
                    <div className="font-bold text-info dark:text-info-dark text-xs flex items-center gap-1.5">
                      <span className="material-icons-round text-sm">trending_up</span>
                      Lộ Trình 10 Năm & Dự Báo Toàn Diện
                    </div>

                    {/* 5-Year Phasing */}
                    <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 space-y-1.5 border border-border-light/40 dark:border-border-dark/40">
                      <span className="text-[10px] uppercase font-bold text-info dark:text-info-dark">
                        ⏳ Phân kỳ tiến trình 5 năm:
                      </span>
                      <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                        • <strong>Tiền vận (5 năm đầu):</strong> {selectedDaiHan.phasingBreakdown.firstHalf}
                      </p>
                      <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                        • <strong>Hậu vận (5 năm sau):</strong> {selectedDaiHan.phasingBreakdown.secondHalf}
                      </p>
                    </div>

                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                      💼 {selectedDaiHan.detailedSynthesis.careerAndWealth}
                    </p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                      🛡️ {selectedDaiHan.detailedSynthesis.relationshipAndHealth}
                    </p>
                    <p className="text-info dark:text-info-dark font-semibold pt-1 border-t border-border-light/30 dark:border-border-dark/30">
                      ☞ {selectedDaiHan.detailedSynthesis.strategicGuidance}
                    </p>
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      )}
    </section>
  );
});

TuViSummaryPanel.displayName = 'TuViSummaryPanel';
