import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useShallow } from 'zustand/react/shallow';
import { CalendarCheck, AlertCircle, X, SearchX, CheckCircle2, Loader2, CalendarDays, SlidersHorizontal } from 'lucide-react';
import { useElectionStore } from '../../stores/electionStore';
import { useAppStore } from '../../stores/appStore';
import { ElectionInputForm } from './ElectionInputForm';
import { ElectionResultCard } from './ElectionResultCard';
import DungSuView from '../LichDungSu/DungSuView';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MotionFadeIn, MotionPageTransition } from '@/components/ui/motion-primitives';
import { cn } from '@/lib/utils';

type SubTab = 'tim-ngay' | 'dung-su';

export const ElectionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeSubTab: SubTab = rawTab === 'dung-su' ? 'dung-su' : 'tim-ngay';

  usePageTitle(activeSubTab === 'dung-su' ? 'Tra Cứu Dụng Sự' : 'Tìm Ngày Tốt');

  const [filterCatOnly, setFilterCatOnly] = React.useState(false);

  const selectedDate = useAppStore((s) => s.selectedDate);
  const dayData = useAppStore((s) => s.dayData);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);

  const { results, isScanning, error, clearError } = useElectionStore(
    useShallow((state) => ({
      results: state.results,
      isScanning: state.isScanning,
      error: state.error,
      clearError: state.clearError,
    })),
  );

  const filteredResults = useMemo(() => {
    if (!results) return [];
    return filterCatOnly ? results.filter((r) => r.totalScore >= 70) : results;
  }, [filterCatOnly, results]);

  const handleSubTabChange = (tab: SubTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'tim-ngay') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  return (
    <MotionFadeIn className="space-y-6 max-w-4xl mx-auto">
      {/* Subtab Segmented Control */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 bg-surface-subtle-light dark:bg-surface-elevated-dark rounded-2xl border border-border-light/60 dark:border-border-dark/60 shadow-xs">
          <button
            type="button"
            onClick={() => handleSubTabChange('tim-ngay')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all spring-press',
              activeSubTab === 'tim-ngay'
                ? 'bg-white dark:bg-white/10 text-text-primary-light dark:text-gold-dark shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white',
            )}
          >
            <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tìm Ngày Tốt</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabChange('dung-su')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all spring-press',
              activeSubTab === 'dung-su'
                ? 'bg-white dark:bg-white/10 text-text-primary-light dark:text-gold-dark shadow-sm'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white',
            )}
          >
            <SlidersHorizontal className="h-4 w-4 text-purple dark:text-purple-dark" />
            <span>Tra Cứu Dụng Sự</span>
          </button>
        </div>
      </div>

      <MotionPageTransition key={activeSubTab}>
        {activeSubTab === 'tim-ngay' ? (
          <div className="space-y-6">
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
                  className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors interactive-press"
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
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
                <CalendarDays className="h-6 w-6 text-purple dark:text-purple-dark" />
                Tra Cứu Dụng Sự
              </h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Phân tích 13 động cơ học thuật, định lượng giờ hoàng đạo & hướng xuất hành theo việc
              </p>
            </div>

            <DungSuView
              selectedDate={selectedDate}
              data={dayData}
              onSelectDate={setSelectedDate}
            />
          </div>
        )}
      </MotionPageTransition>
    </MotionFadeIn>
  );
};

export default ElectionPage;
