import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useShallow } from 'zustand/react/shallow';
import { useElectionStore } from '../../stores/electionStore';
import { ElectionInputForm } from './ElectionInputForm';
import { ElectionResultCard } from './ElectionResultCard';

export const ElectionPage: React.FC = () => {
  usePageTitle('Chọn Ngày Tốt');
  
  const { results, isScanning, error, clearError } = useElectionStore(
    useShallow((state) => ({
      results: state.results,
      isScanning: state.isScanning,
      error: state.error,
      clearError: state.clearError,
    })),
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <span className="material-icons-round text-xl text-emerald-500 dark:text-emerald-400">event_available</span>
          Tìm Ngày Tốt
        </h2>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Đánh giá dựa trên đa hệ: Tử Vi, Lục Nhâm, Vedic & Phương Tây
        </p>
      </div>

      {/* Form */}
      <ElectionInputForm />

      {/* Error */}
      {error && (
        <div
          className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-bad dark:text-bad-dark flex items-start gap-2"
          role="alert"
        >
          <span className="material-icons-round text-base mt-0.5">error</span>
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            aria-label="Đóng lỗi"
          >
            <span className="material-icons-round text-sm">close</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isScanning && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Đang quét các ngày phù hợp...
          </p>
        </div>
      )}

      {/* Results */}
      {!isScanning && results && results.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark border-b border-border-light dark:border-border-dark pb-2">
            Kết quả đề xuất ({results.length})
          </h3>
          <div className="space-y-3">
            {results.map((result, idx) => (
              <ElectionResultCard key={idx} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isScanning && results && results.length === 0 && (
        <div className="text-center py-12 px-4 glass-card animate-fade-in-up">
          <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Không tìm thấy ngày phù hợp
          </h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">
            Thử mở rộng khoảng thời gian tìm kiếm hoặc thay đổi tiêu chí.
          </p>
        </div>
      )}
    </div>
  );
};

export default ElectionPage;
