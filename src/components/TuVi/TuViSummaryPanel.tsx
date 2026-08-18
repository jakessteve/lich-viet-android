import React, { useMemo, useState } from 'react';
import type { TuViChart as TuViChartType, DaiHanInterpretationResult } from '../../types/tuvi';
import { getAllDaiHanInterpretations, getCurrentDaiHan } from '../../services/tuvi/daiHanInterpretation';
import { classifyTuViChart } from '../../services/tuvi/chartClassification';
import { calculateFlyingStars } from '../../services/tuvi/flyingStars';
import { SegmentedControl, type SegmentedOption } from '../shared';
import { TuViTieuHanPanel } from './TuViTieuHanPanel';
import { TrendingUp, Network, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

type SummaryTab = 'overview' | 'tieuHan' | 'daiHan' | 'phiTinh';

const SUMMARY_TABS: readonly SegmentedOption<SummaryTab>[] = [
  { id: 'overview', label: 'Tổng quan', shortLabel: 'Tổng quan' },
  { id: 'tieuHan', label: 'Tiểu hạn & Năm', shortLabel: 'Tiểu hạn' },
  { id: 'daiHan', label: 'Đại hạn', shortLabel: 'Đại hạn' },
  { id: 'phiTinh', label: 'Phi Tinh Tứ Hóa', shortLabel: 'Phi Tinh' },
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
  'Bình Hòa': 'bg-gold/15 text-amber-950 dark:text-gold-dark border-gold/40',
  'Thử Thách': 'bg-orange/15 text-orange dark:text-orange-dark border-orange/40',
  'Gian Nan': 'bg-bad/15 text-bad dark:text-bad-dark border-bad/40',
};

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
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
      className="h-4 w-4 shrink-0 text-gold dark:text-gold-dark"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M7 6h8" />
      <path d="M12 6v6" />
      <path d="M9 12h6" />
      <path d="M8 18h8" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function summarizeTuHoa(chart: TuViChartType) {
  const order = { Lộc: 0, Quyền: 1, Khoa: 2, Kỵ: 3 };
  return chart.palaces
    .flatMap((palace) =>
      palace.tuHoa.map((entry) => ({
        ...entry,
        palaceName: palace.name,
        palaceChi: palace.chi,
      })),
    )
    .sort((a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99));
}

export const TuViSummaryPanel: React.FC<{
  chart: TuViChartType;
  mode?: 'simple' | 'advanced';
  onModeChange?: (mode: 'simple' | 'advanced') => void;
}> = React.memo(({ chart, mode = 'simple' }) => {
  const [activeTab, setActiveTab] = useState<SummaryTab>('overview');

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

  const classification = useMemo(() => classifyTuViChart(chart), [chart]);
  const flyingStars = useMemo(() => calculateFlyingStars(chart), [chart]);

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
          {/* Cây Phân Loại Lá Số (Only in Advanced Mode) */}
          {mode === 'advanced' && (
            <div className="rounded-2xl border border-gold/40 bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/60 p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-gold dark:text-gold-dark" />
                  <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    Cây Phân Loại Lá Số
                  </h4>
                </div>
                <Badge className="bg-gold/15 text-amber-950 dark:text-gold-dark border border-gold/40">
                  {classification.cucName}
                </Badge>
              </div>

              {/* Breadcrumb Path */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                {classification.classificationPath.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="rounded-lg bg-surface-container-low px-2.5 py-1 text-text-primary-light dark:text-text-primary-dark border border-border-light/50 dark:border-border-dark/50">
                      {step}
                    </span>
                    {idx < classification.classificationPath.length - 1 && (
                      <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs">›</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/30 dark:border-border-dark/30">
                {classification.patternSummaryVi}
              </p>
            </div>
          )}

          {/* Current Đại Hạn High-Signal Highlight Card */}
          {currentDaiHan && (
            <div className="surface-card relative overflow-hidden p-4 sm:p-5 shadow-sm space-y-3.5 border-gold/40 dark:border-gold-dark/40 bg-gradient-to-br from-gold/10 via-surface-subtle-light/80 to-surface-container-low dark:from-gold-dark/10 dark:via-surface-subtle-dark/80 dark:to-surface-elevated-dark/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold dark:text-gold-dark shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                        Đại Hạn Hiện Tại: {currentDaiHan.ageRange} tuổi
                      </h4>
                      <Badge className="bg-gold/20 text-amber-950 dark:text-gold-dark border border-gold/40">
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-text-primary-light dark:text-gold-dark hover:underline cursor-pointer interactive-press"
                >
                  Khám phá 12 Đại hạn
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tam Tài Scoreboard Mini (Only in Advanced Mode) */}
              {mode === 'advanced' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                      Thiên Thời (Thái Tuế)
                    </span>
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      {currentDaiHan.tamTai.thienThoi.level}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                      Địa Lợi (Nạp Âm)
                    </span>
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      {currentDaiHan.tamTai.diaLoi.level}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                      Nhân Hòa (Cát/Sát)
                    </span>
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      {currentDaiHan.tamTai.nhanHoa.level}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                      Khí Lực (Tràng Sinh)
                    </span>
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      {currentDaiHan.truongSinh.name}
                    </p>
                  </div>
                </div>
              )}

              {/* One-Line Executive Synthesis */}
              <p className="text-xs leading-relaxed text-text-primary-light dark:text-text-primary-dark font-medium border-t border-border-light/30 dark:border-border-dark/30 pt-2.5">
                {currentDaiHan.detailedSynthesis.overview}
              </p>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="surface-card rounded-2xl p-3 text-center border-gold/30">
              <span className="text-micro uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                Chính Tinh
              </span>
              <p className="text-lg font-bold text-gold dark:text-gold-dark mt-0.5">{summary.totalMajorStars}</p>
            </div>
            <div className="surface-card rounded-2xl p-3 text-center border-info/30">
              <span className="text-micro uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                Phụ Tinh
              </span>
              <p className="text-lg font-bold text-info dark:text-info-dark mt-0.5">{summary.totalAuxiliaryStars}</p>
            </div>
            <div className="surface-card rounded-2xl p-3 text-center border-bad/30">
              <span className="text-micro uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                Sát Tinh
              </span>
              <p className="text-lg font-bold text-bad dark:text-bad-dark mt-0.5">{summary.totalSatStars}</p>
            </div>
            <div className="surface-card rounded-2xl p-3 text-center border-purple/30">
              <span className="text-micro uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                Tứ Hóa
              </span>
              <p className="text-lg font-bold text-purple dark:text-purple-dark mt-0.5">
                {summary.tuHoaEntries.length}
              </p>
            </div>
          </div>

          {/* Four Transformations Banner */}
          <div className="surface-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-dark flex items-center gap-1.5">
                <TuHoaHeaderIcon />
                Tứ Hóa Năm Sinh Toàn Bàn
              </h4>
              <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                Can {chart.centerInfo.canChiYear.split(' ')[0]} định hình
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {summary.tuHoaEntries.map((tuHoa, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-surface-subtle-light/70 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 p-3 flex flex-col items-start gap-1.5"
                >
                  <Badge className={cn(TUHOA_CLASS[tuHoa.type], 'text-xs font-semibold px-2 py-0.5')}>
                    Hóa {tuHoa.type}
                  </Badge>
                  <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    {tuHoa.starName}
                  </span>
                  <p className="text-micro text-text-secondary-light dark:text-text-secondary-dark truncate w-full">
                    Cung {tuHoa.palaceName} [{tuHoa.palaceChi}]
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tieuHan' && <TuViTieuHanPanel chart={chart} viewYear={viewYear} mode={mode} />}

      {activeTab === 'daiHan' && (
        <div className="space-y-4">
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
                    <span className="text-[9px] font-medium text-gold dark:text-gold-dark">{dh.luckScore}/10</span>
                    {dh.isCurrent && (
                      <span
                        className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-light dark:bg-gold-dark animate-pulse"
                        title="Đại hạn hiện tại"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Đại Hạn Detail Inspector */}
          {selectedDaiHan && (
            <article className="space-y-4 surface-card rounded-2xl p-4 sm:p-5 border border-border-light/60 dark:border-border-dark/60">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-light/40 dark:border-border-dark/40 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                      Đại Hạn {selectedDaiHan.ageRange} tuổi
                    </h4>
                    <span className="text-sm font-semibold text-gold dark:text-gold-dark">
                      — Cung {selectedDaiHan.palaceName} ({selectedDaiHan.palaceCanChi})
                    </span>
                    <Badge className={`border ${LUCK_TIER_CLASS[selectedDaiHan.luckTier]}`}>
                      {selectedDaiHan.luckTier} ({selectedDaiHan.luckScore}/10)
                    </Badge>
                    {selectedDaiHan.isCurrent && (
                      <Badge className="bg-gold/20 text-amber-950 dark:text-gold-dark border border-gold/40">
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

              {/* 1. Tổng Quan Dòng Vận 10 Năm */}
              <div className="rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/40 dark:border-border-dark/40 p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-gold dark:text-gold-dark text-sm">
                  <span className="indicator-pip bg-gold" aria-hidden="true" />
                  Tổng Quan Dòng Vận 10 Năm
                </div>
                <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                  {selectedDaiHan.detailedSynthesis.overview.split('\n\n').map((part, idx) => {
                    const colonIdx = part.indexOf(':');
                    if (colonIdx > 0 && colonIdx < 30) {
                      const title = part.slice(0, colonIdx);
                      const content = part.slice(colonIdx + 1);
                      return (
                        <p key={idx}>
                          <strong className="font-bold text-gold dark:text-gold-dark">{title}:</strong>
                          {content}
                        </p>
                      );
                    }
                    return <p key={idx}>{part}</p>;
                  })}
                </div>
              </div>

              {/* 2. Trọng Tâm Sự Nghiệp & Gia Đạo */}
              <div className="space-y-3">
                <div className="rounded-xl bg-good/5 dark:bg-good-dark/5 border border-good/25 dark:border-good-dark/25 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-good dark:text-good-dark text-xs sm:text-sm">
                    <span className="indicator-pip-sm bg-good" aria-hidden="true" />
                    Sự Nghiệp & Tài Lộc
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm leading-relaxed">
                    {selectedDaiHan.detailedSynthesis.careerAndWealth}
                  </p>
                </div>

                <div className="rounded-xl bg-info/5 dark:bg-info-dark/5 border border-info/25 dark:border-info-dark/25 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-info dark:text-info-dark text-xs sm:text-sm">
                    <span className="indicator-pip-sm bg-info" aria-hidden="true" />
                    Gia Đạo, Tình Cảm & Thể Trạng
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm leading-relaxed">
                    {selectedDaiHan.detailedSynthesis.relationshipAndHealth}
                  </p>
                </div>
              </div>

              {/* 3. Chiến Lược Hành Động Trọng Tâm */}
              <div className="rounded-xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/30 dark:border-gold-dark/30 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-gold dark:text-gold-dark text-xs sm:text-sm">
                  <span className="indicator-pip-sm bg-gold" aria-hidden="true" />
                  Chiến Lược Hành Động Trọng Tâm
                </div>
                <p className="text-text-primary-light dark:text-text-primary-dark font-medium text-xs sm:text-sm leading-relaxed">
                  {selectedDaiHan.detailedSynthesis.strategicGuidance}
                </p>
              </div>

              {/* 4. Cấu Trúc Tam Tài & Bố Cục Tọa Thủ (Only in Advanced Mode) */}
              {mode === 'advanced' && (
                <div className="space-y-3.5 text-xs leading-relaxed text-text-primary-light dark:text-text-primary-dark pt-1">
                  {/* Bố Cục Tọa Thủ & Tam Phương Tứ Chính */}
                  <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/40 dark:border-border-dark/40 p-3.5 space-y-2">
                    <div className="font-bold text-gold dark:text-gold-dark text-xs flex items-center gap-1.5">
                      <span className="indicator-pip-sm bg-gold" aria-hidden="true" />
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
                      <p className="text-gold dark:text-gold-dark font-medium">
                        {selectedDaiHan.starStructure.vcdSpecialNote ??
                          'Bản cung Vô Chính Diệu, mượn lực chiếu từ đối cung.'}
                      </p>
                    )}

                    {/* Can Cung Đại Hạn Tứ Hóa */}
                    <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2.5 space-y-1 border border-border-light/40 dark:border-border-dark/40">
                      <span className="text-[10px] uppercase font-bold text-gold dark:text-gold-dark">
                        Lưu Tứ Hóa Can {selectedDaiHan.daiHanTuHoa.canCung} Đại Hạn:
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span>
                          ✦ Lộc: <strong>{selectedDaiHan.daiHanTuHoa.hoaLoc}</strong>
                        </span>
                        <span>
                          ✦ Quyền: <strong>{selectedDaiHan.daiHanTuHoa.hoaQuyen}</strong>
                        </span>
                        <span>
                          ✦ Khoa: <strong>{selectedDaiHan.daiHanTuHoa.hoaKhoa}</strong>
                        </span>
                        <span>
                          ✦ Kỵ: <strong>{selectedDaiHan.daiHanTuHoa.hoaKy}</strong>
                        </span>
                      </div>
                    </div>

                    <p className="text-text-secondary-light dark:text-text-secondary-dark pt-1 border-t border-border-light/30 dark:border-border-dark/30">
                      {selectedDaiHan.tamPhuongTuChinh.summary}
                    </p>
                    {selectedDaiHan.tuanTriet.note && (
                      <p className="text-bad dark:text-bad-dark pt-1 font-medium">{selectedDaiHan.tuanTriet.note}</p>
                    )}
                  </div>

                  {/* Đánh Giá Tam Tài */}
                  <div className="rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/40 dark:border-border-dark/40 p-3.5 space-y-2.5">
                    <div className="font-bold text-purple dark:text-purple-dark text-xs flex items-center gap-1.5">
                      <span className="indicator-pip-sm bg-purple" aria-hidden="true" />
                      Đánh Giá Tam Tài (Thiên Thời – Địa Lợi – Nhân Hòa)
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2 border border-border-light/30 dark:border-border-dark/30 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gold dark:text-gold-dark text-xs">
                            ✦ Thiên Thời (Thái Tuế)
                          </span>
                          <Badge className="bg-gold/15 text-amber-950 dark:text-gold-dark">
                            {selectedDaiHan.tamTai.thienThoi.level}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.tamTai.thienThoi.desc}
                        </p>
                      </div>

                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2 border border-border-light/30 dark:border-border-dark/30 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-info dark:text-info-dark text-xs">✦ Địa Lợi (Nạp Âm)</span>
                          <Badge className="bg-info/15 text-info dark:text-info-dark">
                            {selectedDaiHan.tamTai.diaLoi.level}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.tamTai.diaLoi.desc}
                        </p>
                      </div>

                      <div className="rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-2 border border-border-light/30 dark:border-border-dark/30 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-good dark:text-good-dark text-xs">✦ Nhân Hòa (Cát/Sát)</span>
                          <Badge className="bg-good/15 text-good dark:text-good-dark">
                            {selectedDaiHan.tamTai.nhanHoa.level}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedDaiHan.tamTai.nhanHoa.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Phân Kỳ Tiến Trình 5 Năm (Only in Advanced Mode) */}
              {mode === 'advanced' && (
                <div className="rounded-xl bg-surface-subtle-light/70 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 p-3.5 space-y-2">
                  <span className="text-xs uppercase font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-info" />
                    Phân Kỳ Tiến Trình 5 Năm
                  </span>
                  <div className="space-y-2 text-xs leading-relaxed">
                    <div className="p-2.5 rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/30 dark:border-border-dark/30">
                      <strong className="text-gold dark:text-gold-dark block mb-1">Tiền vận (5 năm đầu):</strong>
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        {selectedDaiHan.phasingBreakdown.firstHalf}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 border border-border-light/30 dark:border-border-dark/30">
                      <strong className="text-info dark:text-info-dark block mb-1">Hậu vận (5 năm sau):</strong>
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        {selectedDaiHan.phasingBreakdown.secondHalf}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      )}

      {activeTab === 'phiTinh' && (
        <div className="space-y-4 page-enter-smooth">
          {/* Executive Synthesis Card with Formatted Paragraphs */}
          <div className="surface-card rounded-2xl p-4 sm:p-5 border border-border-light/60 dark:border-border-dark/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-border-light/40 dark:border-border-dark/40 pb-2.5">
              <Network className="h-5 w-5 text-gold dark:text-gold-dark" />
              <h3 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                Luận Giải Động Thái Phi Tinh Toàn Bàn
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {flyingStars.synthesisItems && flyingStars.synthesisItems.length > 0
                ? flyingStars.synthesisItems.map((item, idx) => (
                    <p
                      key={idx}
                      className="text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark"
                    >
                      <strong className="font-bold text-gold dark:text-gold-dark mr-1">{item.title}:</strong>
                      {item.content}
                    </p>
                  ))
                : flyingStars.overallSynthesisVi.split('\n\n').map((para, idx) => {
                    const colonIdx = para.indexOf(':');
                    if (colonIdx > 0 && colonIdx < 40) {
                      const title = para.slice(0, colonIdx);
                      const rest = para.slice(colonIdx + 1);
                      return (
                        <p
                          key={idx}
                          className="text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark"
                        >
                          <strong className="font-bold text-gold dark:text-gold-dark mr-1">{title}:</strong>
                          {rest}
                        </p>
                      );
                    }
                    return (
                      <p
                        key={idx}
                        className="text-xs sm:text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark"
                      >
                        {para}
                      </p>
                    );
                  })}
            </div>
          </div>

          {/* Key Interactions: Mệnh & Tài Quan */}
          <div className="space-y-3">
            {/* Mệnh Flying */}
            <div className="surface-card rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-dark flex items-center gap-1.5">
                <span className="indicator-pip-sm bg-gold" aria-hidden="true" />
                Mệnh Xuất Tứ Hóa
              </h4>
              <div className="space-y-1.5">
                {flyingStars.keyInteractions.menhFlying.length === 0 ? (
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Không có</p>
                ) : (
                  flyingStars.keyInteractions.menhFlying.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge className={TUHOA_CLASS[h.type]}>Hóa {h.type}</Badge>
                      <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {h.starName}
                      </span>
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        → {h.targetPalaceName} {h.isTuHoa ? '(Tự Hóa)' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mệnh Received */}
            <div className="surface-card rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-info dark:text-info-dark flex items-center gap-1.5">
                <span className="indicator-pip-sm bg-info" aria-hidden="true" />
                Tứ Hóa Nhập Cung Mệnh
              </h4>
              <div className="space-y-1.5">
                {flyingStars.keyInteractions.menhReceived.length === 0 ? (
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Không có cung vị phi nhập trực tiếp
                  </p>
                ) : (
                  flyingStars.keyInteractions.menhReceived.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        {h.sourcePalaceName}
                      </span>
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">phi</span>
                      <Badge className={TUHOA_CLASS[h.type]}>Hóa {h.type}</Badge>
                      <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                        ({h.starName})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tự Hóa Grid (Only in Advanced Mode) */}
          {mode === 'advanced' && (
            <div className="surface-card rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple dark:text-purple-dark flex items-center gap-1.5">
                <span className="indicator-pip-sm bg-purple" aria-hidden="true" />
                Các Vị Trí Tự Hóa Nội Cung ({flyingStars.tuHuaList.length})
              </h4>
              {flyingStars.tuHuaList.length === 0 ? (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Bản bàn không có vị trí Tự Hóa nội tại.
                </p>
              ) : (
                <div className="space-y-2">
                  {flyingStars.tuHuaList.map((tuHua, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
                          Cung {tuHua.sourcePalaceName} (Can {tuHua.sourceCan})
                        </span>
                        <Badge className={TUHOA_CLASS[tuHua.type]}>Tự Hóa {tuHua.type}</Badge>
                      </div>
                      <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        {tuHua.descriptionVi}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
});

TuViSummaryPanel.displayName = 'TuViSummaryPanel';
