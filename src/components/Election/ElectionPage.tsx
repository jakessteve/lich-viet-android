import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useShallow } from 'zustand/react/shallow';
import { CalendarCheck, AlertCircle, X, SearchX, CheckCircle2, Loader2 } from 'lucide-react';
import { useElectionStore } from '../../stores/electionStore';
import { ElectionInputForm } from './ElectionInputForm';
import { ElectionResultCard } from './ElectionResultCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MotionFadeIn } from '@/components/ui/motion-primitives';
import { cn } from '@/lib/utils';

export const ElectionPage: React.FC = () => {
  usePageTitle('Chọn Ngày Tốt');
  const [filterCatOnly, setFilterCatOnly] = React.useState(false);

  const { results, isScanning, error, clearError } = useElectionStore(
    useShallow((state) => ({
      results: state.results,
      isScanning: state.isScanning,
      error: state.error,
      clearError: state.clearError,
    })),
  );

  const filteredResults = React.useMemo(() => {
    if (!results) return [];
    return filterCatOnly ? results.filter((r) => r.totalScore >= 70) : results;
  }, [filterCatOnly, results]);

  return (
    <MotionFadeIn className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <CalendarCheck className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
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
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            aria-label="Đóng lỗi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {isScanning && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in-up">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Đang quét các ngày phù hợp...
          </p>
        </div>
      )}

      {/* Results */}
      {!isScanning && results && results.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-2">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span>
                Kết quả đề xuất ({filteredResults.length}/{results.length})
              </span>
            </h3>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={!filterCatOnly ? 'default' : 'ghost'}
                onClick={() => setFilterCatOnly(false)}
                className={cn(
                  'text-xs h-8 px-3 rounded-lg',
                  !filterCatOnly && 'bg-emerald-600 hover:bg-emerald-700 text-white',
                )}
              >
                Tất cả ({results.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filterCatOnly ? 'default' : 'ghost'}
                onClick={() => setFilterCatOnly(true)}
                className={cn(
                  'text-xs h-8 px-3 rounded-lg gap-1',
                  filterCatOnly && 'bg-emerald-600 hover:bg-emerald-700 text-white',
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Chỉ ngày Cát (≥ 70đ)
              </Button>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <Card variant="glass" className="text-center py-8 px-4">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Không có ngày nào đạt mức điểm Cát lợi (≥ 70đ) trong khoảng đã chọn. Bạn có thể chọn tab &quot;Tất
                cả&quot; để xem chi tiết các ngày khác.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result, idx) => (
                <ElectionResultCard key={idx} result={result} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isScanning && results && results.length === 0 && (
        <Card variant="glass" className="text-center py-12 px-4 animate-fade-in-up">
          <SearchX className="h-12 w-12 mx-auto text-text-secondary-light/40 dark:text-text-secondary-dark/40 mb-3" />
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Không tìm thấy ngày phù hợp
          </h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">
            Thử mở rộng khoảng thời gian tìm kiếm hoặc thay đổi tiêu chí.
          </p>
        </Card>
      )}
    </MotionFadeIn>
  );
};

export default ElectionPage;
