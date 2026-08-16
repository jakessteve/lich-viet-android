import React, { useState } from 'react';
import {
  calculateHoraryQuestion,
  HORARY_TOPICS,
  type HoraryServiceResult,
} from '../../../services/astrology/horaryService';
import type { WesternChartInput } from '../../../types/astrology';

interface HoraryViewProps {
  currentInput: WesternChartInput;
}

export const HoraryView: React.FC<HoraryViewProps> = ({ currentInput }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(HORARY_TOPICS[0].id);
  const [result, setResult] = useState<HoraryServiceResult | null>(null);

  const handleCastChart = () => {
    const lat = currentInput.latitude ?? 21.0285;
    const lng = currentInput.longitude ?? 105.8542;
    const tz = currentInput.timezone ?? 7;
    const res = calculateHoraryQuestion(selectedTopic, lat, lng, new Date(), tz);
    setResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="border-b border-border-light dark:border-border-dark/40 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <span className="material-icons-round text-indigo-500">help_outline</span>
            Hỏi Nhanh Horary (Thấu Thị Thời Khắc)
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Lập lá số tại thời khắc bạn khởi phát câu hỏi để luận giải sự việc cụ thể theo thuật Chiêm Tinh Dự Đoán Cổ
            Điển.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark block">
            Chọn Chủ Đề Bạn Muốn Hỏi:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {HORARY_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedTopic === topic.id
                    ? 'bg-astral-surface-light dark:bg-astral-surface-dark border-astral-primary text-astral-primary dark:text-astral-primary-dark shadow-sm font-semibold'
                    : 'bg-surface-subtle-light dark:bg-surface-elevated-dark border-border-light dark:border-border-dark/40 text-text-secondary-light dark:text-text-secondary-dark hover:bg-astral-surface-light/40 dark:hover:bg-astral-surface-dark/40'
                }`}
              >
                <div className="font-bold mb-0.5">{topic.nameVi}</div>
                <div className="text-[11px] opacity-80">{topic.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCastChart}
              className="px-5 py-2.5 rounded-xl bg-astral-primary hover:bg-astral-primary/90 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2"
            >
              <span className="material-icons-round text-base">auto_awesome</span>
              Lập Lá Số & Luận Giải Ngay
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-4 animate-fade-scale">
          {/* Radicality & Verdict Banner */}
          <div className="glass-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light dark:border-border-dark/40 pb-3">
              <div>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Thời khắc lập lá số: {result.dateLabel}
                </span>
                <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                  Chủ Đề: {result.topicLabel}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block">
                  Độ tin cậy:
                </span>
                <span className="text-xl font-bold text-astral-primary dark:text-astral-primary-dark">
                  {result.judgment.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Verdict Card */}
            <div className="astral-card p-4 text-center space-y-1">
              <span className="text-xs uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark tracking-wider block">
                Kết Quả Dự Đoán
              </span>
              <h3 className={`text-lg sm:text-xl font-black ${result.judgment.verdictColor}`}>
                {result.judgment.verdict}
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-lg mx-auto">
                {result.judgment.aspectDetail}
              </p>
            </div>

            {/* Radicality Warnings */}
            {result.judgment.radicality.warnings.length > 0 && (
              <div className="space-y-2">
                {result.judgment.radicality.warnings.map((w: { message: string }, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
                  >
                    <span className="material-icons-round text-base shrink-0">warning</span>
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Moon Void of Course */}
            <div
              className={`p-3 rounded-xl text-xs border ${
                result.judgment.moonVoc.isVoid
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {result.judgment.moonVoc.message}
            </div>

            {/* Significators Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                  Đại Diện Cho Bạn (Querent):
                </span>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Chủ quản Cung 1:{' '}
                  <strong className="capitalize">{result.judgment.querentSignificators.primary}</strong> (Cung Mọc:{' '}
                  {result.judgment.querentSignificators.ascDegree}° {result.judgment.querentSignificators.ascSign})
                </p>
                <p className="text-text-secondary-light/70 dark:text-text-secondary-dark/70">
                  Đồng đại diện cảm xúc: Mặt Trăng ☽
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-white/5 border border-border-light dark:border-border-dark/40 space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                  Đại Diện Đối Tượng / Sự Việc (Quesited):
                </span>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Chủ quản Cung {result.judgment.quesitedSignificators.houseNumber}:{' '}
                  <strong className="capitalize">{result.judgment.quesitedSignificators.primary}</strong> (
                  {result.judgment.quesitedSignificators.houseSign})
                </p>
                <p className="text-text-secondary-light/70 dark:text-text-secondary-dark/70">
                  Tương tác góc: {result.judgment.aspectPerfection}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
