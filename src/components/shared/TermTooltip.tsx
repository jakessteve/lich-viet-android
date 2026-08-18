import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ESOTERIC_TERMS: Record<string, { title: string; explanation: string; category: string }> = {
  'Nạp âm': {
    title: 'Lục Thập Hoa Giáp Nạp Âm',
    explanation:
      'Nạp âm là hệ thống quy đổi 60 hoa giáp thành 30 hành bản mệnh (như Hải Trung Kim, Lư Trung Hỏa). Nạp âm dùng để xét ngũ hành sinh khắc tinh tế giữa ngày và bản mệnh con người.',
    category: 'Ngũ Hành',
  },
  'Hải Trung Kim': {
    title: 'Vàng Dưới Biển (Hải Trung Kim)',
    explanation:
      'Kim ẩn mình dưới đáy đại dương, tượng trưng cho tài năng tiềm ẩn, điềm tĩnh, cần sự kiên nhẫn và nội lực mới phát huy tối đa.',
    category: 'Nạp Âm',
  },
  'Bành tổ bách kỵ': {
    title: 'Bành Tổ Bách Kỵ Nhật',
    explanation:
      'Lời khuyên kiêng kỵ theo Thiên Can và Địa Chi của Bành Tổ truyền lại trong dân gian, nhắc nhở những việc cụ thể không nên tiến hành trong ngày để tránh bất trắc.',
    category: 'Dân Gian',
  },
  'Trực': {
    title: 'Thập Nhị Kiến Trừ (12 Trực)',
    explanation:
      '12 trạng thái biến chuyển của tự nhiên: Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thâu, Khai, Bế. Mỗi trực mang đặc tính tốt cho những công việc nhất định.',
    category: 'Trực & Tú',
  },
  'Nhị thập bát tú': {
    title: '28 Chòm Sao (Nhị Thập Bát Tú)',
    explanation:
      'Hệ thống 28 chòm sao thiên văn cổ đại phân bố theo 4 phương (Thanh Long, Bạch Hổ, Chu Tước, Huyền Vũ), dùng để phân định cát hung khi khởi sự việc lớn.',
    category: 'Trực & Tú',
  },
  'Hoàng Đạo': {
    title: 'Ngày / Giờ Hoàng Đạo',
    explanation:
      'Thời điểm các vị thần thiện cát lành bảo hộ (Thanh Long, Minh Đường, Kim Quỹ, Thiên Đức, Ngọc Đường, Tư Mệnh), thích hợp nhất để làm việc quan trọng.',
    category: 'Cát Thần',
  },
  'Hắc Đạo': {
    title: 'Ngày / Giờ Hắc Đạo',
    explanation:
      'Thời điểm vượng khí của các hung thần (Thiên Hình, Chu Tước, Bạch Hổ, Thiên Lao, Huyền Vũ, Câu Trận), nên giữ gìn, cẩn trọng, tránh tranh chấp hay khởi sự mạo hiểm.',
    category: 'Hung Thần',
  },
  'Tam Hợp': {
    title: 'Cục Diện Tam Hợp',
    explanation:
      'Sự hòa hợp giữa 3 địa chi (Thân-Tý-Thìn, Dần-Ngọ-Tuất, Tỵ-Dậu-Sửu, Hợi-Mão-Mùi), tạo ra trường năng lượng hỗ trợ mạnh mẽ, vượng cát khí.',
    category: 'Xung Hợp',
  },
  'Lục Xung': {
    title: 'Thế Cục Lục Xung',
    explanation:
      'Sự đối lập trực diện giữa 2 địa chi đối cung (Tý-Ngọ, Sửu-Mùi, Dần-Thân, Mão-Dậu, Thìn-Tuất, Tỵ-Hợi), dễ phát sinh xung đột hoặc biến động.',
    category: 'Xung Hợp',
  },
  'Triệt': {
    title: 'Triệt Không (Triệt)',
    explanation:
      'Ảnh hưởng mạnh mẽ trong giai đoạn tiền vận (trước 30 tuổi), có tính chất cản trở nhưng đồng thời làm giảm bớt hung tính của các sát tinh.',
    category: 'Tử Vi',
  },
  'Tuần': {
    title: 'Tuần Không (Tuần)',
    explanation:
      'Có tác dụng bao bọc, làm chậm nhịp nhưng ổn định vận trình suốt cuộc đời, rèn luyện tính kiên trì và bền bỉ.',
    category: 'Tử Vi',
  },
  'Vô Chính Diệu': {
    title: 'Cung Vô Chính Diệu',
    explanation:
      'Cung vị không có 14 chính tinh đóng trụ, mang tính linh hoạt, khả năng thích ứng cao và mượn lực từ cung đối chiếu để phát triển.',
    category: 'Tử Vi',
  },
};

interface TermTooltipProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ term, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = ESOTERIC_TERMS[term] || {
    title: term,
    explanation: `Thuật ngữ văn hóa/chiêm tinh học truyền thống: ${term}`,
    category: 'Thuật ngữ',
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          'inline-flex items-center gap-1 cursor-pointer border-b border-dotted border-gold/50 dark:border-gold-dark/50 hover:text-gold dark:hover:text-gold-dark transition-colors',
          className,
        )}
        title={`Bấm để xem giải nghĩa thuật ngữ: ${term}`}
      >
        {children || term}
        <HelpCircle className="h-3 w-3 text-gold/70 dark:text-gold-dark/70 inline shrink-0" />
      </span>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-surface-light dark:bg-surface-dark border border-border-light/60 dark:border-border-dark/60 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-3 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-amber-950 dark:text-gold-dark">
                  {info.category}
                </span>
                <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-1">
                  {info.title}
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {info.explanation}
            </p>

            <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/40 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-gold/10 text-text-primary-light dark:text-gold-dark text-xs font-semibold hover:bg-gold/20 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TermTooltip;
