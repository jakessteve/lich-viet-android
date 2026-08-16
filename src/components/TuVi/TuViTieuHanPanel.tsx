import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { TuViChart as TuViChartType, TieuHanInterpretationResult } from '../../types/tuvi';
import { interpretTieuHan, interpretNguyetHan } from '../../services/tuvi/tieuHanInterpretation';
import { SegmentedControl, type SegmentedOption } from '../shared';

type TieuHanViewMode = 'simple' | 'advanced';

const TIEU_HAN_VIEW_MODES: readonly SegmentedOption<TieuHanViewMode>[] = [
  { id: 'simple', label: 'Cơ bản (Dễ hiểu)', shortLabel: 'Cơ bản', icon: 'menu_book' },
  { id: 'advanced', label: 'Chuyên sâu (Kỹ thuật)', shortLabel: 'Chuyên sâu', icon: 'psychology' },
];

const LUCK_TIER_CLASS: Record<TieuHanInterpretationResult['luckTier'], string> = {
  'Đại Cát': 'bg-good/15 text-good dark:text-good-dark border-good/40',
  'Khởi Sắc': 'bg-info/15 text-info dark:text-info-dark border-info/40',
  'Bình Hòa': 'bg-gold/15 text-gold-light dark:text-gold-dark border-gold/40',
  'Thử Thách': 'bg-orange/15 text-orange dark:text-orange-dark border-orange/40',
  'Gian Nan': 'bg-bad/15 text-bad dark:text-bad-dark border-bad/40',
};

const TUHOA_BADGE_CLASS: Record<string, string> = {
  Lộc: 'bg-good/15 text-good dark:text-good-dark border-good/30',
  Quyền: 'bg-info/15 text-info dark:text-info-dark border-info/30',
  Khoa: 'bg-purple/15 text-purple dark:text-purple-dark border-purple/30',
  Kỵ: 'bg-bad/15 text-bad dark:text-bad-dark border-bad/30',
};

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${className ?? ''}`}>
      {children}
    </span>
  );
}

export const TuViTieuHanPanel: React.FC<{
  chart: TuViChartType;
  viewYear?: number;
  viewMonth?: number;
  onSelectMonth?: (month: number) => void;
}> = React.memo(({ chart, viewYear, viewMonth, onSelectMonth }) => {
  const [viewMode, setViewMode] = useState<TieuHanViewMode>('simple');
  const targetYear = viewYear ?? chart.hanContext?.viewYear ?? new Date().getFullYear();
  const currentSelectedMonth = viewMonth ?? chart.hanContext?.viewMonth ?? new Date().getMonth() + 1;
  const [activeMonth, setActiveMonth] = useState<number>(currentSelectedMonth);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Sync internal active month if parent prop changes
  useEffect(() => {
    if (viewMonth) setActiveMonth(viewMonth);
  }, [viewMonth]);

  // Full Tiểu Hạn interpretation calculation
  const tieuHanData = useMemo(() => interpretTieuHan(chart, targetYear), [chart, targetYear]);

  // 12 Monthly Nguyệt Hạn items
  const monthlyList = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return interpretNguyetHan(chart, targetYear, month);
    });
  }, [chart, targetYear]);

  // Active selected month details
  const selectedMonthData = useMemo(() => {
    return monthlyList[activeMonth - 1] ?? monthlyList[0];
  }, [monthlyList, activeMonth]);

  // Auto-scroll carousel to selected month
  useEffect(() => {
    if (carouselRef.current) {
      const selectedEl = carouselRef.current.querySelector(`[data-month="${activeMonth}"]`) as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeMonth]);

  const handleMonthClick = (month: number) => {
    setActiveMonth(month);
    onSelectMonth?.(month);
  };

  return (
    <div className="space-y-4 page-enter-smooth">
      {/* ── Header & View Mode Switcher ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <span className="material-icons-round text-eastern-gold-light dark:text-eastern-gold-dark text-lg" aria-hidden="true">
              event_available
            </span>
            Vận Hạn Hiện Tại Năm {tieuHanData.yearCan} {tieuHanData.yearChi} ({tieuHanData.viewYear})
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Tiểu Hạn tại Cung <strong>{tieuHanData.tieuHanPalaceName}</strong> [{tieuHanData.tieuHanPalaceChi}] · Đương số {tieuHanData.viewAge} tuổi
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <SegmentedControl
            options={TIEU_HAN_VIEW_MODES}
            value={viewMode}
            onChange={(mode) => setViewMode(mode)}
            ariaLabel="Chế độ xem Tiểu Hạn"
          />
        </div>
      </div>

      {/* ── Executive Luck Card ─────────────────────────────────── */}
      <div className="surface-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-eastern-gold space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-light/40 dark:border-border-dark/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">✨</span>
            <div>
              <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark block">
                Tổng Quan Vận Trình Năm
              </span>
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                {tieuHanData.themeHeadlineVi}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={LUCK_TIER_CLASS[tieuHanData.luckTier]}>
              {tieuHanData.luckTier} · {tieuHanData.overallScore}/10
            </Badge>
          </div>
        </div>

        {/* Đại Tiểu Hạn Resonance Banner */}
        <div className="rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-3 border border-border-light/50 dark:border-border-dark/50 flex items-start gap-2.5">
          <span className="material-icons-round text-eastern-gold-light dark:text-eastern-gold-dark text-base shrink-0 mt-0.5" aria-hidden="true">
            timeline
          </span>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-text-primary-light dark:text-text-primary-dark">
              {tieuHanData.daiHanResonance.titleVi} (Hệ số tác động: {tieuHanData.daiHanResonance.amplification}x)
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {tieuHanData.daiHanResonance.descriptionVi}
            </p>
          </div>
        </div>

        {/* Narrative Synthesis */}
        <div className="space-y-2 text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed pt-1">
          <p>
            🧭 <strong>Vận thế chung:</strong> {tieuHanData.detailedSynthesis.generalVibe}
          </p>
          <p>
            💼 <strong>Sự nghiệp & Tài lộc:</strong> {tieuHanData.detailedSynthesis.careerAndFinance}
          </p>
          <p>
            ❤️ <strong>Tình cảm & Sức khỏe:</strong> {tieuHanData.detailedSynthesis.relationshipAndHealth}
          </p>
          <p className="text-info dark:text-info-dark font-medium pt-1 border-t border-border-light/30 dark:border-border-dark/30">
            💡 <strong>Lời khuyên hành động:</strong> {tieuHanData.detailedSynthesis.actionableAdvice}
          </p>
        </div>

        {tieuHanData.keyWarnings.length > 0 && (
          <div className="rounded-xl bg-bad/10 dark:bg-bad-dark/10 p-2.5 border border-bad/20 text-xs space-y-1">
            <span className="font-bold text-bad dark:text-bad-dark flex items-center gap-1">
              <span className="material-icons-round text-sm">warning</span> Lưu ý phòng ngừa:
            </span>
            <ul className="list-disc list-inside text-text-secondary-light dark:text-text-secondary-dark pl-1 space-y-0.5">
              {tieuHanData.keyWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Lưu Tứ Hóa & Dynamic Collisions ─────────────────────── */}
      <div className="surface-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-eastern-gold-light dark:text-eastern-gold-dark flex items-center gap-1.5">
            <span className="indicator-pip-sm bg-eastern-gold" aria-hidden="true" />
            Lưu Tứ Hóa Năm {tieuHanData.yearCan} & Tương Tác
          </h4>
          <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
            Can {tieuHanData.yearCan} quản lĩnh
          </span>
        </div>

        {/* 4 Annual Hua Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 rounded-xl bg-good/5 dark:bg-good-dark/5 border border-good/20 flex items-center justify-between">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Lưu Lộc</span>
            <Badge className={TUHOA_BADGE_CLASS['Lộc']}>{tieuHanData.luuTuHoa.hoaLoc}</Badge>
          </div>
          <div className="p-2 rounded-xl bg-info/5 dark:bg-info-dark/5 border border-info/20 flex items-center justify-between">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Lưu Quyền</span>
            <Badge className={TUHOA_BADGE_CLASS['Quyền']}>{tieuHanData.luuTuHoa.hoaQuyen}</Badge>
          </div>
          <div className="p-2 rounded-xl bg-purple/5 dark:bg-purple-dark/5 border border-purple/20 flex items-center justify-between">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Lưu Khoa</span>
            <Badge className={TUHOA_BADGE_CLASS['Khoa']}>{tieuHanData.luuTuHoa.hoaKhoa}</Badge>
          </div>
          <div className="p-2 rounded-xl bg-bad/5 dark:bg-bad-dark/5 border border-bad/20 flex items-center justify-between">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Lưu Kỵ</span>
            <Badge className={TUHOA_BADGE_CLASS['Kỵ']}>{tieuHanData.luuTuHoa.hoaKy}</Badge>
          </div>
        </div>

        {/* Specific Detected Collisions */}
        {tieuHanData.collisions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {tieuHanData.collisions.map((collision, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border border-border-light/50 dark:border-border-dark/50 text-xs space-y-0.5"
              >
                <div className="font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-eastern-gold" />
                  {collision.titleVi}
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed pl-3">
                  {collision.descriptionVi}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 12-Month Nguyệt Hạn Snap Carousel ────────────────────── */}
      <div className="surface-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
            <span className="material-icons-round text-base text-info" aria-hidden="true">
              calendar_view_month
            </span>
            Tiến Trình 12 Tháng Nguyệt Hạn (Năm {tieuHanData.viewYear})
          </h4>
          <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
            Chạm để xem chi tiết tháng
          </span>
        </div>

        {/* Carousel strip */}
        <div
          ref={carouselRef}
          className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory"
        >
          {monthlyList.map((monthItem) => {
            const isSelected = monthItem.viewMonth === activeMonth;
            return (
              <button
                key={monthItem.viewMonth}
                type="button"
                data-month={monthItem.viewMonth}
                onClick={() => handleMonthClick(monthItem.viewMonth)}
                className={`snap-start shrink-0 w-24 sm:w-28 p-2.5 rounded-xl text-left border transition-all duration-normal ease-spring-snappy ${
                  isSelected
                    ? 'border-eastern-gold bg-eastern-gold-light/10 dark:bg-eastern-gold-dark/15 shadow-sm ring-1 ring-eastern-gold'
                    : 'border-border-light/60 dark:border-border-dark/60 bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 hover:bg-surface-subtle-light dark:hover:bg-surface-elevated-dark'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                  <span>Tháng {monthItem.viewMonth}</span>
                  <span className="text-micro text-eastern-gold-light dark:text-eastern-gold-dark">
                    {monthItem.monthScore}
                  </span>
                </div>
                <div className="text-micro text-text-secondary-light dark:text-text-secondary-dark mt-1 truncate">
                  Cung {monthItem.palaceName}
                </div>
                <div className="mt-1.5">
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      LUCK_TIER_CLASS[monthItem.luckTier]
                    }`}
                  >
                    {monthItem.luckTier}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Month Detail Card */}
        {selectedMonthData && (
          <div className="rounded-xl bg-surface-subtle-light/90 dark:bg-surface-elevated-dark/70 p-3.5 border border-border-light/50 dark:border-border-dark/50 space-y-1.5 page-enter-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-eastern-gold-light dark:text-eastern-gold-dark flex items-center gap-1">
                <span className="material-icons-round text-sm">event</span>
                Chi Tiết Nguyệt Hạn Tháng {selectedMonthData.viewMonth} Âm Lịch (Cung {selectedMonthData.palaceName})
              </span>
              <Badge className={LUCK_TIER_CLASS[selectedMonthData.luckTier]}>
                {selectedMonthData.luckTier} · {selectedMonthData.monthScore}/10
              </Badge>
            </div>
            <p className="text-xs text-text-primary-light dark:text-text-primary-dark">
              🎯 <strong>Trọng tâm tháng:</strong> {selectedMonthData.focusThemeVi}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {selectedMonthData.summaryVi} {selectedMonthData.adviceVi}
            </p>
          </div>
        )}
      </div>

      {/* ── Advanced Technical Section ─────────────────────────── */}
      {viewMode === 'advanced' && (
        <div className="surface-card rounded-2xl p-4 sm:p-5 space-y-4 page-enter-smooth border border-border-light/60 dark:border-border-dark/60">
          <div className="flex items-center gap-2 border-b border-border-light/40 dark:border-border-dark/40 pb-2.5">
            <span className="material-icons-round text-purple text-lg" aria-hidden="true">
              psychology
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark">
              Phân Tích Ma Trận Kỹ Thuật (Tam Tài & Tinh Diệu Cung Vận)
            </h4>
          </div>

          {/* Tam Tài Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-subtle-light/70 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                <span>Thiên Thời (Vòng Thái Tuế)</span>
                <span className="text-eastern-gold-light dark:text-eastern-gold-dark">{tieuHanData.tamTai.thienThoi.level} ({tieuHanData.tamTai.thienThoi.score}/10)</span>
              </div>
              <p className="text-micro text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {tieuHanData.tamTai.thienThoi.desc}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light/70 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                <span>Địa Lợi (Nạp Âm vs Chi Cung)</span>
                <span className="text-eastern-gold-light dark:text-eastern-gold-dark">{tieuHanData.tamTai.diaLoi.level} ({tieuHanData.tamTai.diaLoi.score}/10)</span>
              </div>
              <p className="text-micro text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {tieuHanData.tamTai.diaLoi.desc}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light/70 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                <span>Nhân Hòa (Cát / Sát Tinh Hội)</span>
                <span className="text-eastern-gold-light dark:text-eastern-gold-dark">{tieuHanData.tamTai.nhanHoa.level} ({tieuHanData.tamTai.nhanHoa.score}/10)</span>
              </div>
              <p className="text-micro text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {tieuHanData.tamTai.nhanHoa.desc}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle-light/70 dark:bg-surface-elevated-dark/50 border border-border-light/40 dark:border-border-dark/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                <span>Khí Lực (Tràng Sinh)</span>
                <span className="text-eastern-gold-light dark:text-eastern-gold-dark">{tieuHanData.tamTai.khiLuc.stage} ({tieuHanData.tamTai.khiLuc.score}/10)</span>
              </div>
              <p className="text-micro text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {tieuHanData.tamTai.khiLuc.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TuViTieuHanPanel.displayName = 'TuViTieuHanPanel';
