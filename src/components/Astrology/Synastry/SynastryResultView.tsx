import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { SegmentedControl } from '../../shared';
import { WesternChartDisplay } from '../Western/WesternChartDisplay';

const TAB_OPTIONS = [
  { id: 'synastry', label: 'Hợp Lá Số', icon: 'favorite', shortLabel: 'Hợp' },
  { id: 'composite', label: 'Composite', icon: 'link', shortLabel: 'Comp.' },
  { id: 'davison', label: 'Davison', icon: 'schedule', shortLabel: 'Dav.' },
] as const;

type ResultTab = (typeof TAB_OPTIONS)[number]['id'];

const ENGINE_META: Array<{ key: 'tuVi' | 'western' | 'vedic'; label: string; icon: string; color: string }> = [
  { key: 'tuVi', label: 'Tử Vi', icon: 'auto_awesome', color: 'text-amber-500' },
  { key: 'western', label: 'Tây Phương', icon: 'auto_graph', color: 'text-indigo-500 dark:text-indigo-400' },
  { key: 'vedic', label: 'Vedic (Ashtakoot)', icon: 'star_half', color: 'text-emerald-500' },
];

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
  if (score >= 75) return <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Rất hòa hợp — nền tảng gắn kết bền vững</p>;
  if (score >= 55) return <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">Hòa hợp tốt — cần nuôi dưỡng sự đồng điệu</p>;
  if (score >= 40) return <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Trung bình — khác biệt cần đối thoại và kiên nhẫn</p>;
  return <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Thử thách lớn — cần nỗ lực thấu hiểu lẫn nhau</p>;
}

export const SynastryResultView: React.FC = () => {
  const { synastryResult, compositeResult, davisonResult } = useAstrologyStore(
    useShallow((state) => ({
      synastryResult: state.synastryResult,
      compositeResult: state.compositeResult,
      davisonResult: state.davisonResult,
    }))
  );
  const [tab, setTab] = useState<ResultTab>('synastry');

  if (!synastryResult) return null;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <SegmentedControl
        options={TAB_OPTIONS}
        value={tab}
        onChange={setTab}
        ariaLabel="Kết quả hợp lá số"
        tone="emerald"
      />

      {tab === 'synastry' && (
        <div className="space-y-4">
          <div className="glass-card p-5 text-center space-y-3">
            <ScoreRing score={synastryResult.combinedScore} />
            <div>
              <p className="text-xs uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Điểm hòa hợp tổng hợp</p>
              <Verdict score={synastryResult.combinedScore} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ENGINE_META.map(({ key, label, icon, color }) => {
              const engine = synastryResult.engines[key];
              return (
                <div key={key} className="glass-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <span className={`material-icons-round text-base ${color}`}>{icon}</span>
                      {label}
                    </h4>
                    <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{engine.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                      style={{ width: `${Math.min(100, Math.max(0, engine.score))}%` }}
                    />
                  </div>
                  {engine.insights.length > 0 ? (
                    <ul className="space-y-1">
                      {engine.insights.slice(0, 4).map((insight, i) => (
                        <li key={i} className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex gap-1.5">
                          <span className="text-rose-400">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Chưa có nhận xét chi tiết.</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ashtakoot 8 Gunas Breakdown */}
          {synastryResult.engines.vedic.rawBreakdown && Object.keys(synastryResult.engines.vedic.rawBreakdown).length > 0 && (
            <div className="surface-card p-4 sm:p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-3">
              <div className="flex items-center justify-between border-b border-border-light/40 pb-2.5 dark:border-border-dark/40">
                <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                  <span className="material-icons-round text-base text-emerald-500">star_half</span>
                  Bảng Chi Tiết 8 Tiêu Chí Hòa Hợp (Ashtakoot Guna Milan)
                </h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {Object.values(synastryResult.engines.vedic.rawBreakdown).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0)}/36 điểm
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { key: 'varna', nameVi: 'Tâm Hồn (Varna)', max: 1, desc: 'Vị thế tâm hồn & cái tôi' },
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
                        <span className={`text-xs font-bold ${isPerfect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
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
            </div>
          )}
        </div>
      )}

      {tab === 'composite' && compositeResult && (
        <div className="space-y-3">
          <div className="glass-card p-4">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Lá số <strong>Composite</strong> là trung điểm các hành tinh của hai người — bản đồ năng lượng của chính mối quan hệ.
            </p>
          </div>
          <WesternChartDisplay result={compositeResult} />
        </div>
      )}

      {tab === 'davison' && davisonResult && (
        <div className="space-y-3">
          <div className="glass-card p-4 space-y-1">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Lá số <strong>Davison</strong> được lập tại thời điểm và địa điểm trung bình giữa hai ngày sinh — lá số khai sinh của mối quan hệ.
            </p>
            <p className="text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark">
              Thời điểm: {davisonResult.dateLabel} · Vĩ độ {davisonResult.latitude.toFixed(2)}°, Kinh độ {davisonResult.longitude.toFixed(2)}°
            </p>
          </div>
          <WesternChartDisplay result={davisonResult.chart} />
        </div>
      )}
    </div>
  );
};

export default SynastryResultView;
