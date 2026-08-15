import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ElectionCandidate } from '../../types/election';
import CollapsibleCard from '../CollapsibleCard';

export const ElectionResultCard: React.FC<{ result: ElectionCandidate }> = ({ result }) => {
  const navigate = useNavigate();
  const date = new Date(result.timestamp);
  
  // Format MM-DD for daily view link
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  const dateLink = `${y}-${m}-${d}`;

  // Simple scoring colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <CollapsibleCard
      title={
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
            {date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1.5">
            <span className="material-icons-round text-sm">schedule</span>
            {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} — {result.dayLabel}
          </span>
        </div>
      }
      headerRight={
        <div className="flex flex-col items-end gap-1">
          <span className={`text-lg font-bold ${getScoreColor(result.totalScore)}`}>
            {Math.round(result.totalScore)}
          </span>
          <span className="text-micro uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
            Điểm tổng
          </span>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        {/* Visual Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getScoreBg(result.totalScore)}`} 
            style={{ width: `${Math.min(100, Math.max(0, result.totalScore))}%` }} 
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center border-b border-border-light dark:border-border-dark pb-4">
          <div>
            <div className={`text-sm font-bold ${getScoreColor(result.easternScore)}`}>
              {Math.round(result.easternScore)}
            </div>
            <div className="text-micro uppercase text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Đông Phương</div>
          </div>
          <div className="border-l border-r border-border-light dark:border-border-dark">
            <div className={`text-sm font-bold ${getScoreColor(result.westernScore)}`}>
              {Math.round(result.westernScore)}
            </div>
            <div className="text-micro uppercase text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Tây Phương</div>
          </div>
          <div>
            <div className={`text-sm font-bold ${getScoreColor(result.vedicScore)}`}>
              {Math.round(result.vedicScore)}
            </div>
            <div className="text-micro uppercase text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Ấn Độ (Vedic)</div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark">
          <div className="flex justify-between">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">Tiết khí</span>
            <span className="font-semibold">{result.solarTerm}</span>
          </div>
          {result.reason && (
            <div className="flex justify-between">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Đánh giá</span>
              <span className="font-semibold">{result.reason}</span>
            </div>
          )}
        </div>

        {/* Best Hours Preview */}
        {result.bestHours && result.bestHours.length > 0 && (
          <div className="pt-1 border-t border-border-light/40 dark:border-border-dark/40 space-y-1.5">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark block">
              Giờ tốt đề xuất trong ngày:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.bestHours.slice(0, 3).map((item, hIdx) => (
                <span
                  key={hIdx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
                >
                  <span className="material-icons-round text-xs">access_time</span>
                  <strong>{item.hourInfo.name}</strong> ({item.hourInfo.timeRange}) — {Math.round(item.activityScore)}đ
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Link */}
        <div className="pt-2 text-right">
          <button
            onClick={() => navigate(`/app/am-lich?date=${dateLink}`)}
            className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-end gap-1 w-full"
          >
            Xem chi tiết ngày này
            <span className="material-icons-round text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </CollapsibleCard>
  );
};
