import React, { useMemo } from 'react';
import { Award, Compass, Table, Hourglass } from 'lucide-react';
import type { SwissNatalChartResult } from '../../../services/astrology/swissNatalChart';
import { analyzeTraditionalChart } from '../../../services/astrology/traditionalAstrology';

interface TraditionalChartViewProps {
  natalResult: SwissNatalChartResult;
  birthDate: Date;
}

export const TraditionalChartView: React.FC<TraditionalChartViewProps> = ({ natalResult, birthDate }) => {
  const analysis = useMemo(() => {
    return analyzeTraditionalChart(natalResult, birthDate);
  }, [natalResult, birthDate]);

  const { sect, planets, almutenFiguris, arabicLots, firdaria } = analysis;

  return (
    <div className="space-y-6">
      {/* 1. Sect Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border ${
          sect.isDay
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-200'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 font-mono text-xl font-bold">
              {sect.isDay ? '☉' : '☽'}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">{sect.sectLabelVi}</h3>
              <p className="text-xs opacity-90">
                {sect.isDay
                  ? 'Mặt Trời ngự trên đường chân trời: Cung ngày nhấn mạnh hành động trực tiếp, công danh và nhiệt huyết.'
                  : 'Mặt Trời ngự dưới đường chân trời: Cung đêm nhấn mạnh trực giác, chiều sâu nội tâm và mối quan hệ bền vững.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
              Cát Tinh Đắc Thời: {sect.beneficOfSect === 'jupiter' ? 'Sao Mộc ♃' : 'Sao Kim ♀'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
              Hung Tinh Bất Lợi: {sect.outOfSectMalefic === 'mars' ? 'Sao Hỏa ♂' : 'Sao Thổ ♄'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Almuten Figuris & Arabic Lots Card */}
      <div className="space-y-4">
        <div className="glass-card p-4 sm:p-5 space-y-3">
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500 shrink-0" />
            Chủ Quản Tối Cao (Almuten Figuris - Ibn Ezra)
          </h4>
          <div className="p-3 bg-surface-subtle-light dark:bg-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Hành tinh thống lĩnh toàn lá số:
              </p>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                {almutenFiguris.almuten} ({almutenFiguris.almutenScore} Điểm Phẩm Chất)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-gold/15 text-amber-950 dark:text-gold-dark text-xs font-bold border border-gold/30">
              Almuten
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Bảng xếp hạng năng lượng:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {almutenFiguris.rankings.slice(0, 5).map((r, i) => (
                <span key={r.planet} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-white/10 font-medium">
                  #{i + 1} {r.planet}: {r.score}đ
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 space-y-3">
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-500 shrink-0" />
            Các Điểm Ả Rập Trọng Yếu (Arabic Lots)
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-surface-subtle-light dark:bg-white/5">
              <span className="font-medium">{arabicLots.fortune.name}:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {arabicLots.fortune.degree}° {arabicLots.fortune.signVi}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-surface-subtle-light dark:bg-white/5">
              <span className="font-medium">{arabicLots.spirit.name}:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {arabicLots.spirit.degree}° {arabicLots.spirit.signVi}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-surface-subtle-light dark:bg-white/5">
              <span className="font-medium">{arabicLots.eros.name}:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {arabicLots.eros.degree}° {arabicLots.eros.signVi}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-surface-subtle-light dark:bg-white/5">
              <span className="font-medium">{arabicLots.necessity.name}:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {arabicLots.necessity.degree}° {arabicLots.necessity.signVi}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5-Fold Essential Dignity Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-light dark:border-border-dark/40 flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Table className="h-4 w-4 text-indigo-500 shrink-0" />
            Bảng 5 Phẩm Chất Cốt Lõi (5-Fold Essential Dignities)
          </h4>
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Hệ thống Cổ điển Ptolemy & Dorotheus
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle-light dark:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark uppercase font-semibold">
              <tr>
                <th className="p-3">Hành Tinh</th>
                <th className="p-3">Vị Trí</th>
                <th className="p-3">Cung Chủ (+5)</th>
                <th className="p-3">Đắc Địa (+4)</th>
                <th className="p-3">Tam Hợp (+3)</th>
                <th className="p-3">Giới Hạn (+2)</th>
                <th className="p-3">Thập Phân (+1)</th>
                <th className="p-3 text-right">Tổng Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark/30">
              {planets.map((p) => (
                <tr key={p.planet} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                    <span className="text-base">{p.symbol}</span>
                    {p.nameVi}
                    {p.isRetrograde && <span className="text-rose-500 font-bold ml-1">℞</span>}
                  </td>
                  <td className="p-3">
                    {p.degree}°{p.minute}' {p.signVi} (Cung {p.house})
                  </td>
                  <td className="p-3">
                    {p.essentialDetails.isDomicile ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                        Chính Cung (+5)
                      </span>
                    ) : p.essentialDetails.isDetriment ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-semibold">
                        Tù Hãm (-5)
                      </span>
                    ) : (
                      <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 capitalize">
                        {p.essentialDetails.domicileRuler}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.essentialDetails.isExaltation ? (
                      <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 font-semibold">
                        Đắc Địa (+4)
                      </span>
                    ) : p.essentialDetails.isFall ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
                        Hãm Địa (-4)
                      </span>
                    ) : (
                      <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 capitalize">
                        {p.essentialDetails.exaltationRuler || '-'}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.essentialDetails.isTriplicity ? (
                      <span className="badge-astral">Tam Hợp (+3)</span>
                    ) : (
                      <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 capitalize">
                        {p.essentialDetails.triplicityRuler}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.essentialDetails.isTerm ? (
                      <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 font-semibold">
                        Thuộc Giới (+2)
                      </span>
                    ) : (
                      <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 capitalize">
                        {p.essentialDetails.termRuler}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.essentialDetails.isDecan ? (
                      <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 font-semibold">
                        Thập Phân (+1)
                      </span>
                    ) : (
                      <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/70 capitalize">
                        {p.essentialDetails.decanRuler}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-bold text-sm">
                    <span
                      className={
                        p.netScore >= 5
                          ? 'text-emerald-500'
                          : p.netScore < 0
                            ? 'text-rose-500'
                            : 'text-text-primary-light dark:text-text-primary-dark'
                      }
                    >
                      {p.netScore > 0 ? `+${p.netScore}` : p.netScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Firdaria Timeline */}
      <div className="glass-card p-4 sm:p-5 space-y-3">
        <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-astral-primary dark:text-astral-primary-dark shrink-0" />
          Chu Kỳ Vận Hạn Firdaria (75 Năm Trung Cổ)
        </h4>
        <div className="space-y-2.5">
          {firdaria.periods.map((per) => (
            <div
              key={per.periodLabel}
              className="p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark/40 flex justify-between items-center"
            >
              <div>
                <p className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark capitalize">
                  Chúa Tể: {per.ruler.replace('_', ' ')}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{per.periodLabel}</p>
              </div>
              <span className="badge-astral">{per.years} năm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
