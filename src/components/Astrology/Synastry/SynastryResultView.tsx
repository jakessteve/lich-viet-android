import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { SegmentedControl } from '../../shared';
import { WesternChartDisplay } from '../Western/WesternChartDisplay';
import { SynastryRadarChart } from './SynastryRadarChart';

const TAB_OPTIONS = [
  { id: 'synastry', label: 'Hợp Lá Số', icon: 'favorite', shortLabel: 'Hợp' },
  { id: 'composite', label: 'Composite', icon: 'link', shortLabel: 'Comp.' },
  { id: 'davison', label: 'Davison', icon: 'schedule', shortLabel: 'Dav.' },
] as const;

type ResultTab = (typeof TAB_OPTIONS)[number]['id'];

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - score / 100);
  const tone = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-white/10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={tone}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{score}</span>
        <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">/100</span>
      </div>
    </div>
  );
}

function Verdict({ score }: { score: number }) {
  if (score >= 75)
    return (
      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        Rất hòa hợp — nền tảng gắn kết keo sơn bền vững
      </p>
    );
  if (score >= 55)
    return (
      <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
        Hòa hợp tốt — đồng điệu cảm xúc, cùng nhau phát triển
      </p>
    );
  if (score >= 40)
    return (
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
        Trung bình — mang nhiều nét bổ trợ, cần kiên nhẫn đối thoại
      </p>
    );
  return (
    <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
      Thử thách lớn — cơ hội tôi luyện và chuyển hóa mối duyên
    </p>
  );
}

export const SynastryResultView: React.FC = () => {
  const { synastryResult, compositeResult, davisonResult } = useAstrologyStore(
    useShallow((state) => ({
      synastryResult: state.synastryResult,
      compositeResult: state.compositeResult,
      davisonResult: state.davisonResult,
    })),
  );
  const [tab, setTab] = useState<ResultTab>('synastry');

  if (!synastryResult) return null;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <SegmentedControl
        options={TAB_OPTIONS}
        value={tab}
        onChange={setTab}
        ariaLabel="Kết quả hợp lá số"
        tone="emerald"
      />

      {tab === 'synastry' && (
        <div className="space-y-5">
          {/* Header Score Card */}
          <div className="glass-card p-5 text-center space-y-3">
            <ScoreRing score={synastryResult.combinedScore} />
            <div>
              <p className="text-xs uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Điểm hòa hợp đa chiều (Combined Synastry Index)
              </p>
              <Verdict score={synastryResult.combinedScore} />
            </div>
          </div>

          {/* 5-Dimensional Radar Chart */}
          {synastryResult.dimensions && (
            <SynastryRadarChart dimensions={synastryResult.dimensions} />
          )}

          {/* 3 Pillar Summary Cards */}
          {/* 3 Pillar Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Tử Vi */}
            {synastryResult.engines.tuVi && (
              <div className="glass-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5 truncate">
                      <span className="material-icons-round text-base text-amber-500">auto_awesome</span>
                      Tử Vi & Bát Tự
                    </h4>
                    <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                      {synastryResult.engines.tuVi.score}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                      style={{ width: `${Math.min(100, Math.max(0, synastryResult.engines.tuVi.score))}%` }}
                    />
                  </div>

                  {synastryResult.engines.tuVi.batTrach && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50">
                      <span className="material-icons-round text-xs">explore</span>
                      Bát Trạch: {synastryResult.engines.tuVi.batTrach.relationship} ({synastryResult.engines.tuVi.batTrach.quaiA} - {synastryResult.engines.tuVi.batTrach.quaiB})
                    </div>
                  )}

                  {synastryResult.engines.tuVi.insights.length > 0 ? (
                    <ul className="space-y-1 pt-1">
                      {synastryResult.engines.tuVi.insights.slice(0, 4).map((insight, i) => (
                        <li
                          key={i}
                          className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex gap-1.5 leading-snug"
                        >
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Chưa có nhận xét chi tiết.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 2. Tây Phương */}
            {synastryResult.engines.western && (
              <div className="glass-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5 truncate">
                      <span className="material-icons-round text-base text-indigo-500 dark:text-indigo-400">auto_graph</span>
                      Tây Phương (Synastry)
                    </h4>
                    <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                      {synastryResult.engines.western.score}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                      style={{ width: `${Math.min(100, Math.max(0, synastryResult.engines.western.score))}%` }}
                    />
                  </div>

                  {synastryResult.engines.western.insights.length > 0 ? (
                    <ul className="space-y-1 pt-1">
                      {synastryResult.engines.western.insights.slice(0, 4).map((insight, i) => (
                        <li
                          key={i}
                          className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex gap-1.5 leading-snug"
                        >
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Chưa có nhận xét chi tiết.
                    </p>
                  )}
                </div>

                {synastryResult.engines.western.houseOverlays && synastryResult.engines.western.houseOverlays.length > 0 && (
                  <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/40">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
                      House Overlays (Cung Nhà Đối Phương)
                    </p>
                    <div className="space-y-1">
                      {synastryResult.engines.western.houseOverlays.slice(0, 2).map((ho, idx) => (
                        <div key={idx} className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-between">
                          <span className="font-semibold">{ho.planet}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">{ho.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Vedic */}
            {synastryResult.engines.vedic && (
              <div className="glass-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5 truncate">
                      <span className="material-icons-round text-base text-emerald-500">star_half</span>
                      Vedic (Ashtakoot & Manglik)
                    </h4>
                    <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                      {synastryResult.engines.vedic.score}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                      style={{ width: `${Math.min(100, Math.max(0, synastryResult.engines.vedic.score))}%` }}
                    />
                  </div>

                  {synastryResult.engines.vedic.manglik && (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${synastryResult.engines.vedic.manglik.isCompatible ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200/50'}`}>
                      <span className="material-icons-round text-xs">local_fire_department</span>
                      Kuja Dosha: {synastryResult.engines.vedic.manglik.label}
                    </div>
                  )}

                  {synastryResult.engines.vedic.insights.length > 0 ? (
                    <ul className="space-y-1 pt-1">
                      {synastryResult.engines.vedic.insights.slice(0, 4).map((insight, i) => (
                        <li
                          key={i}
                          className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex gap-1.5 leading-snug"
                        >
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Chưa có nhận xét chi tiết.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ashtakoot 8 Gunas Detailed Breakdown */}
          {synastryResult.engines.vedic?.rawBreakdown &&
            Object.keys(synastryResult.engines.vedic.rawBreakdown).length > 0 && (
              <div className="surface-card p-4 sm:p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-3">
                <div className="flex items-center justify-between border-b border-border-light/40 pb-2.5 dark:border-border-dark/40">
                  <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                    <span className="material-icons-round text-base text-emerald-500">star_half</span>
                    Bảng 8 Tiêu Chí Ashtakoot Guna Milan (Kèm Hóa Giải Dosha Pariharas)
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {synastryResult.engines.vedic.score}/100
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { key: 'varna', nameVi: 'Tâm Hồn (Varna)', max: 1, desc: 'Vị thế tâm hồn & bản ngã' },
                    { key: 'vashya', nameVi: 'Sức Hút (Vashya)', max: 2, desc: 'Sự thu hút & gắn bó' },
                    { key: 'tara', nameVi: 'Vận May (Tara)', max: 3, desc: 'May mắn & tương hỗ' },
                    { key: 'yoni', nameVi: 'Hòa Hợp Thể Xác (Yoni)', max: 4, desc: 'Tương hợp sinh lý & cảm xúc' },
                    { key: 'grahaMaitri', nameVi: 'Tình Bạn (Graha Maitri)', max: 5, desc: 'Đồng điệu tư duy sống' },
                    { key: 'gana', nameVi: 'Khí Chất (Gana)', max: 6, desc: 'Hòa hợp tính cách' },
                    { key: 'bhakoot', nameVi: 'Gia Đạo (Bhakoot)', max: 7, desc: 'Hạnh phúc gia đình & tài lộc' },
                    { key: 'nadi', nameVi: 'Sức Khỏe & Con Cái (Nadi)', max: 8, desc: 'Sức khỏe thể chất & hậu duệ' },
                  ].map((koota) => {
                    const score = synastryResult.engines.vedic.rawBreakdown[koota.key] ?? 0;
                    const ratio = score / koota.max;
                    const isPerfect = ratio === 1;
                    return (
                      <div
                        key={koota.key}
                        className="rounded-xl border border-border-light/40 bg-surface-container-lowest/50 p-2.5 dark:border-border-dark/40 flex flex-col justify-between space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                            {koota.nameVi}
                          </span>
                          <span
                            className={`text-xs font-bold ${isPerfect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-300'}`}
                          >
                            {score}/{koota.max}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark leading-tight">
                          {koota.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Pariharas Info */}
                {synastryResult.engines.vedic.pariharas && synastryResult.engines.vedic.pariharas.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="material-icons-round text-sm text-emerald-500">check_circle</span>
                      Ngoại Lệ Hóa Giải (Dosha Pariharas):
                    </p>
                    {synastryResult.engines.vedic.pariharas.map((p, idx) => (
                      <p key={idx} className="text-[11px] pl-5">• {p.rule}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Constructive Relationship Guidance */}
          {synastryResult.advice && synastryResult.advice.length > 0 && (
            <div className="surface-card p-4 sm:p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-2.5 bg-gradient-to-br from-rose-50/30 to-indigo-50/30 dark:from-rose-950/10 dark:to-indigo-950/10">
              <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                <span className="material-icons-round text-base text-rose-500">tips_and_updates</span>
                Lời Khuyên Nuôi Dưỡng Tình Cảm & Chuyển Hóa Xung Khắc
              </h4>
              <ul className="space-y-1.5">
                {synastryResult.advice.map((adv, idx) => (
                  <li key={idx} className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex gap-2 leading-relaxed">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'composite' && compositeResult && (
        <div className="space-y-3">
          <div className="glass-card p-4">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Lá số <strong>Composite</strong> là trung điểm các hành tinh của hai người — bản đồ năng lượng của chính
              mối quan hệ.
            </p>
          </div>
          <WesternChartDisplay result={compositeResult} />
        </div>
      )}

      {tab === 'davison' && davisonResult && (
        <div className="space-y-3">
          <div className="glass-card p-4 space-y-1">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Lá số <strong>Davison</strong> được lập tại thời điểm và địa điểm trung bình giữa hai ngày sinh — lá số
              khai sinh của mối quan hệ.
            </p>
            <p className="text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark">
              Thời điểm: {davisonResult.dateLabel} · Vĩ độ {davisonResult.latitude.toFixed(2)}°, Kinh độ{' '}
              {davisonResult.longitude.toFixed(2)}°
            </p>
          </div>
          <WesternChartDisplay result={davisonResult.chart} />
        </div>
      )}
    </div>
  );
};

export default SynastryResultView;
