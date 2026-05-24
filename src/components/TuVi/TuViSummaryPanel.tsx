import React, { useMemo, useState } from 'react';
import type { TuViChart as TuViChartType, TuViCombination } from '../../types/tuvi';
import { SegmentedControl, type SegmentedOption } from '../shared';

type SummaryTab = 'overview' | 'combinations';

const SUMMARY_TABS: readonly SegmentedOption<SummaryTab>[] = [
  { id: 'overview', label: 'Tổng quan', shortLabel: 'Tổng quan', icon: 'dashboard' },
  { id: 'combinations', label: 'Cách cục', shortLabel: 'Cách cục', icon: 'auto_awesome' },
];

const COMBINATION_CATEGORY_LABEL: Record<TuViCombination['category'], string> = {
  cat: 'Cát',
  trung: 'Trung',
  hung: 'Hung',
};

const COMBINATION_CATEGORY_CLASS: Record<TuViCombination['category'], string> = {
  cat: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300',
  trung: 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300',
  hung: 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300',
};

const PURITY_LABEL: Record<TuViCombination['purity'], string> = {
  thuần: 'Thuần',
  bán: 'Bán',
  phá: 'Phá',
};

const PURITY_CLASS: Record<TuViCombination['purity'], string> = {
  thuần: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300',
  bán: 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300',
  phá: 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300',
};

const TUHOA_CLASS: Record<'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ', string> = {
  Lộc: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300',
  Quyền: 'bg-sky-100 text-sky-700 dark:bg-sky-900/35 dark:text-sky-300',
  Khoa: 'bg-violet-100 text-violet-700 dark:bg-violet-900/35 dark:text-violet-300',
  Kỵ: 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300',
};

const RARITY_CLASS = 'bg-gold/12 text-gold-light dark:bg-gold-dark/12 dark:text-gold-dark';

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="surface-card p-3 sm:p-4 rounded-2xl border border-border-light/60 dark:border-border-dark/60">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
        <span className="material-icons-round text-sm text-gold-light dark:text-gold-dark">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark break-words">
        {value}
      </div>
    </div>
  );
}

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

function getCombinationSummary(combinations: TuViCombination[]) {
  const sorted = [...combinations].sort((a, b) => {
    const rarityA = a.rarity ?? 0;
    const rarityB = b.rarity ?? 0;
    if (rarityA !== rarityB) return rarityB - rarityA;
    if (a.strength !== b.strength) return b.strength - a.strength;
    return a.name.localeCompare(b.name);
  });

  const counts = combinations.reduce(
    (acc, combination) => {
      acc[combination.category] += 1;
      return acc;
    },
    { cat: 0, trung: 0, hung: 0 },
  );

  return { sorted, counts };
}

export const TuViSummaryPanel: React.FC<{ chart: TuViChartType }> = ({ chart }) => {
  const [activeTab, setActiveTab] = useState<SummaryTab>('overview');

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
    const totalTuHoa = palaceStats.reduce((sum, palace) => sum + palace.tuHoaCount, 0);
    const maxMajorStars = palaceStats.reduce((max, palace) => Math.max(max, palace.majorCount), 0);
    const strongestPalaces = palaceStats
      .filter((palace) => palace.majorCount === maxMajorStars && maxMajorStars > 0)
      .map((palace) => palace.name);
    const emptyMajorPalaces = palaceStats.filter((palace) => palace.majorCount === 0).map((palace) => palace.name);
    const tuHoaEntries = summarizeTuHoa(chart);
    const { sorted: combinations, counts: combinationCounts } = getCombinationSummary(chart.combinations);
    const tuanCount = palaceStats.filter((palace) => palace.hasTuan).length;
    const trietCount = palaceStats.filter((palace) => palace.hasTriet).length;

    return {
      totalMajorStars,
      totalAuxiliaryStars,
      totalSatStars,
      totalTuHoa,
      strongestPalaces,
      emptyMajorPalaces,
      tuHoaEntries,
      combinations,
      combinationCounts,
      tuanCount,
      trietCount,
    };
  }, [chart, palaceStats]);

  const overviewBadges = [
    {
      label: 'Cách cục',
      value: `${summary.combinations.length}`,
      icon: 'auto_awesome',
    },
    {
      label: 'Cung vô chính diệu',
      value: `${summary.emptyMajorPalaces.length}`,
      icon: 'radio_button_unchecked',
    },
    {
      label: 'Tứ Hóa',
      value: `${summary.totalTuHoa}`,
      icon: 'rebase',
    },
    {
      label: 'Tuần / Triệt',
      value: `${summary.tuanCount} / ${summary.trietCount}`,
      icon: 'sync_alt',
    },
  ];

  return (
    <section className="surface-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary-light dark:text-text-secondary-dark">
            Tóm tắt lá số
          </p>
          <h3 className="mt-1 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
            Tổng quan cấu trúc và Cách cục
          </h3>
          <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Thông tin cấu trúc lá số, không phải luận đoán cá nhân.
          </p>
        </div>

        <SegmentedControl
          options={SUMMARY_TABS}
          value={activeTab}
          onChange={setActiveTab}
          ariaLabel="Tổng quan lá số Tử Vi"
          className="w-full sm:w-auto"
        />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Trường phái" value={chart.centerInfo.schoolLabel} icon="account_tree" />
            <StatCard label="Mệnh / Thân" value={`${chart.centerInfo.menhCung} • ${chart.centerInfo.thanCungLabel}`} icon="groups" />
            <StatCard label="Cục / Mệnh-Cục" value={`${chart.centerInfo.cuc} • ${chart.menhCucRelation.description}`} icon="hub" />
            <StatCard label="Huyền khí" value={`${chart.huyenKhi.totalScore} · ${chart.huyenKhi.grade}`} icon="blur_on" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {overviewBadges.map((badge) => (
              <StatCard key={badge.label} label={badge.label} value={badge.value} icon={badge.icon} />
            ))}
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="surface-card rounded-2xl border border-border-light/60 dark:border-border-dark/60 p-4">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">straighten</span>
                <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
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

            <div className="surface-card rounded-2xl border border-border-light/60 dark:border-border-dark/60 p-4">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">conversion_path</span>
                <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
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

          <div className="surface-card rounded-2xl border border-border-light/60 dark:border-border-dark/60 p-4">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">sparkles</span>
              <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Cách cục nổi bật
              </h4>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.combinations.length === 0 ? (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Chưa phát hiện Cách cục theo thư viện hiện tại.
                </p>
              ) : (
                summary.combinations.slice(0, 6).map((combination) => (
                  <div
                    key={combination.id ?? combination.name}
                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-light/60 bg-surface-container-low px-3 py-2 text-sm dark:border-border-dark/60 dark:bg-white/5"
                  >
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{combination.name}</span>
                    <Badge className={COMBINATION_CATEGORY_CLASS[combination.category]}>
                      {COMBINATION_CATEGORY_LABEL[combination.category]}
                    </Badge>
                    <Badge className={PURITY_CLASS[combination.purity]}>{PURITY_LABEL[combination.purity]}</Badge>
                    {combination.rarity ? <Badge className={RARITY_CLASS}>Hiếm {combination.rarity}/5</Badge> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'combinations' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Cát cách" value={`${summary.combinationCounts.cat}`} icon="check_circle" />
            <StatCard label="Trung cách" value={`${summary.combinationCounts.trung}`} icon="remove_circle" />
            <StatCard label="Hung cách" value={`${summary.combinationCounts.hung}`} icon="warning" />
          </div>

          {summary.combinations.length === 0 ? (
            <div className="surface-card rounded-2xl border border-border-light/60 dark:border-border-dark/60 p-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Chưa phát hiện Cách cục theo thư viện hiện tại.
            </div>
          ) : (
            <div className="space-y-3">
              {summary.combinations.map((combination) => (
                <article
                  key={combination.id ?? `${combination.name}-${combination.involvedCung.join('-')}`}
                  className="surface-card rounded-2xl border border-border-light/60 dark:border-border-dark/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {combination.name}
                      </h4>
                      <p className="mt-0.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {combination.nameHanViet}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={COMBINATION_CATEGORY_CLASS[combination.category]}>
                        {COMBINATION_CATEGORY_LABEL[combination.category]}
                      </Badge>
                      <Badge className={PURITY_CLASS[combination.purity]}>{PURITY_LABEL[combination.purity]}</Badge>
                      {combination.rarity ? <Badge className={RARITY_CLASS}>Hiếm {combination.rarity}/5</Badge> : null}
                      <Badge className="bg-surface-container-low text-text-secondary-light dark:bg-white/5 dark:text-text-secondary-dark">
                        {combination.strength}/10
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                        Sao liên quan
                      </p>
                      <p className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">
                        {combination.involvedStars.join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                        Cung liên quan
                      </p>
                      <p className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">
                        {combination.involvedCung.join(', ')}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {combination.detectionReason}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
