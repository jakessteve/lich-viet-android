/**
 * TamThucCrossRef — Cross-references Mai Hoa divination results with the full Tam Thức
 * (Kỳ Môn Độn Giáp + Đại Lục Nhâm + Thái Ất Thần Số) alongside humanized interpretations.
 */

import React, { useMemo } from 'react';
import { Compass, ChevronDown } from 'lucide-react';
import { synthesizeTamThuc, type TamThucSynthesis } from '@/utils/tamThucSynthesis';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TamThucCrossRefProps {
  date: Date;
  questionContext?: string | { query?: string };
}

export const TamThucCrossRef: React.FC<TamThucCrossRefProps> = ({ date, questionContext }) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const queryStr = typeof questionContext === 'string' ? questionContext : questionContext?.query;

  const synthesis: TamThucSynthesis | null = useMemo(() => {
    try {
      const h = date.getHours();
      const hourIndex = Math.floor(((h + 1) % 24) / 2);
      return synthesizeTamThuc(date, hourIndex);
    } catch {
      return null;
    }
  }, [date]);

  const humanizedAdvice = useMemo(() => {
    if (!synthesis) return null;

    const { combinedVerdict } = synthesis;
    const isCat = combinedVerdict === 'cat';
    const isHung = combinedVerdict === 'hung';

    let overview = '';
    let practicalGuidance = '';
    let strategicPillar = '';

    if (isCat) {
      overview =
        'Trường năng lượng thời không từ Tam Thức (Kỳ Môn, Lục Nhâm, Thái Ất) đang ở trạng thái thuận hòa và tương sinh. Đây là thời điểm tốt để khởi động dự định, triển khai công việc mới hoặc chủ động mở rộng liên kết.';
      practicalGuidance =
        'Về hành động thực tế: Bạn có thể tự tin thúc đẩy các cuộc đàm phán, hoàn tất ký kết thỏa thuận hoặc giải quyết khúc mắc tồn đọng. Lục Nhâm và Kỳ Môn cùng chỉ ra yếu tố quý nhân hỗ trợ, thuận lợi cho việc kết nối.';
      strategicPillar =
        'Lời khuyên sách lược: Giữ tâm thế chân thành, hành sự minh bạch và tận dụng đà thuận lợi trong ngày để tạo bước tiến rõ rệt.';
    } else if (isHung) {
      overview =
        'Trường năng lượng Tam Thức cho thấy thời điểm này có nhiều xung lực biến động và trở ngại tiềm ẩn. Cục diện khuyên bạn nên đi chậm lại, cẩn trọng trong từng quyết định và ưu tiên bảo toàn nguồn lực.';
      practicalGuidance =
        'Về hành động thực tế: Tránh các quyết định bốc đồng hoặc đầu tư mạo hiểm khi chưa nắm đủ thông tin. Khi giao tiếp hoặc thương thảo, hãy kiểm tra kỹ các điều khoản pháp lý và giữ thái độ hòa nhã để tránh xung đột.';
      strategicPillar =
        'Lời khuyên sách lược: Lấy tĩnh chế động, tập trung rà soát và củng cố nội lực thay vì mở rộng ồ ạt.';
    } else {
      overview =
        'Tam Thức ghi nhận trạng thái bình hòa đan xen. Khí vận không quá xấu nhưng chưa đạt độ hanh thông hoàn toàn; kết quả phụ thuộc chủ yếu vào sự chuẩn bị kỹ lưỡng và thái độ ứng xử của bạn.';
      practicalGuidance =
        'Về hành động thực tế: Những việc thông thường, duy trì hoặc lập kế hoạch đều diễn ra suôn sẻ. Với các bước đi quan trọng mang tính bước ngoặt, hãy tham vấn thêm chuyên môn và chọn các khung giờ cát lành trong ngày để thực hiện.';
      strategicPillar =
        'Lời khuyên sách lược: Thực hiện từng bước vững chắc, lắng nghe phản hồi thực tế và linh hoạt thích ứng theo tình hình.';
    }

    return {
      overview,
      practicalGuidance,
      strategicPillar,
    };
  }, [synthesis]);

  if (!synthesis || !humanizedAdvice) return null;

  const isCat = synthesis.combinedVerdict === 'cat';
  const isHung = synthesis.combinedVerdict === 'hung';

  return (
    <Card
      className={cn(
        'rounded-2xl border p-4 sm:p-5 space-y-4 transition-all',
        isCat
          ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-500/25'
          : isHung
            ? 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-500/25'
            : 'bg-surface-subtle-light/80 dark:bg-surface-elevated-dark/60 border-border-light/60 dark:border-border-dark/60',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl',
              isCat
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : isHung
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  : 'bg-purple/15 text-purple dark:text-purple-dark',
            )}
          >
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
              Đối Chiếu Tam Thức (Kỳ Môn · Lục Nhâm · Thái Ất)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Giờ {synthesis.hourBranchName} · Đồng thuận {synthesis.agreementCount}/3 hệ thống
            </p>
          </div>
        </div>

        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold border',
            isCat
              ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-500/30'
              : isHung
                ? 'bg-rose-100/70 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-500/30'
                : 'bg-purple/10 text-purple dark:text-purple-dark border-purple/30',
          )}
        >
          {synthesis.combinedLabel}
        </span>
      </div>

      {/* Humanized Narrative Card */}
      <div className="space-y-2 rounded-xl bg-surface-light/80 dark:bg-surface-dark/70 p-3.5 border border-border-light/50 dark:border-border-dark/50 text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed">
        {queryStr && (
          <p className="font-semibold text-text-secondary-light dark:text-text-secondary-dark pb-1 border-b border-border-light/40 dark:border-border-dark/40">
            Việc cần xem: <span className="text-text-primary-light dark:text-text-primary-dark font-bold">{queryStr}</span>
          </p>
        )}
        <p>{humanizedAdvice.overview}</p>
        <p className="pt-1">{humanizedAdvice.practicalGuidance}</p>
        <p className="pt-1 text-xs italic text-text-secondary-light dark:text-text-secondary-dark font-medium">
          {humanizedAdvice.strategicPillar}
        </p>
      </div>

      {/* 3-Pillar Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Kỳ Môn */}
        <div className="rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-light/60 dark:bg-surface-elevated-dark/40 p-2.5 space-y-1">
          <div className="flex items-center justify-between font-bold text-text-primary-light dark:text-text-primary-dark">
            <span>Kỳ Môn Độn Giáp</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                synthesis.methods.qmdj.verdict === 'cat'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : synthesis.methods.qmdj.verdict === 'hung'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark',
              )}
            >
              {synthesis.methods.qmdj.verdictLabel}
            </span>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-[11px] line-clamp-2">
            {synthesis.methods.qmdj.summary}
          </p>
        </div>

        {/* Lục Nhâm */}
        <div className="rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-light/60 dark:bg-surface-elevated-dark/40 p-2.5 space-y-1">
          <div className="flex items-center justify-between font-bold text-text-primary-light dark:text-text-primary-dark">
            <span>Đại Lục Nhâm</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                synthesis.methods.lucNham.verdict === 'cat'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : synthesis.methods.lucNham.verdict === 'hung'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark',
              )}
            >
              {synthesis.methods.lucNham.verdictLabel}
            </span>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-[11px] line-clamp-2">
            {synthesis.methods.lucNham.summary}
          </p>
        </div>

        {/* Thái Ất */}
        <div className="rounded-xl border border-border-light/60 dark:border-border-dark/60 bg-surface-light/60 dark:bg-surface-elevated-dark/40 p-2.5 space-y-1">
          <div className="flex items-center justify-between font-bold text-text-primary-light dark:text-text-primary-dark">
            <span>Thái Ất Thần Số</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                synthesis.methods.thaiAt.verdict === 'cat'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : synthesis.methods.thaiAt.verdict === 'hung'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-surface-subtle-light dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark',
              )}
            >
              {synthesis.methods.thaiAt.verdictLabel}
            </span>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-[11px] line-clamp-2">
            {synthesis.methods.thaiAt.summary}
          </p>
        </div>
      </div>

      {/* Expandable Technical Details */}
      <div>
        <button
          type="button"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white pt-1 interactive-press"
          aria-expanded={isDetailsExpanded}
        >
          <span>Chi tiết thông số học thuật Tam Thức</span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-200', isDetailsExpanded && 'rotate-180')}
          />
        </button>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-250 ease-out',
            isDetailsExpanded ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-light/40 dark:bg-surface-dark/40 border border-border-light/40 dark:border-border-dark/40 space-y-1.5">
              <span className="font-bold text-text-primary-light dark:text-text-primary-dark block">
                Thông số Kỳ Môn:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-text-secondary-light dark:text-text-secondary-dark">
                {synthesis.methods.qmdj.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-surface-light/40 dark:bg-surface-dark/40 border border-border-light/40 dark:border-border-dark/40 space-y-1.5">
              <span className="font-bold text-text-primary-light dark:text-text-primary-dark block">
                Thông số Lục Nhâm & Thái Ất:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-text-secondary-light dark:text-text-secondary-dark">
                {synthesis.methods.lucNham.details.map((d, i) => (
                  <li key={`ln-${i}`}>{d}</li>
                ))}
                {synthesis.methods.thaiAt.details.map((d, i) => (
                  <li key={`ta-${i}`}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TamThucCrossRef;
