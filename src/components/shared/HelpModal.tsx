import React from 'react';
import { HelpCircle, Calendar, CalendarCheck, Sparkles, Dices, SlidersHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border-light dark:border-border-dark flex-row items-center gap-2.5 space-y-0 text-left">
          <HelpCircle className="text-gold dark:text-gold-dark h-5 w-5 shrink-0" />
          <DialogTitle className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Hướng dẫn sử dụng & Trợ giúp
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold dark:text-gold-dark" />
              1. Âm Lịch & Dụng Sự Hàng Ngày
            </h3>
            <p>
              Xem thông tin ngày âm lịch, can chi, tiết khí, trực, nhị thập bát tú, sao tốt sao xấu. Thẻ{' '}
              <strong>Dụng Sự</strong> giúp bạn tra nhanh các việc nên làm và kiêng cữ trong ngày, cùng bảng giờ hoàng
              đạo và hướng xuất hành hỷ thần/tài thần.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-emerald-500" />
              2. Chọn Ngày Tốt (Electional Engine)
            </h3>
            <p>
              Dành cho việc hệ trọng (cưới hỏi, khai trương, làm nhà, xuất hành xa). Hệ thống tự động quét và chấm điểm
              tổng hợp qua nhiều hệ thuật toán để chọn ngày tối ưu nhất trong khoảng thời gian mong muốn.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              3. Tử Vi & Chiêm Tinh Học
            </h3>
            <p>
              Lập lá số <strong>Tử Vi Đẩu Số</strong> (Nam phái, Thiên Lương, Bắc phái) và hệ thống{' '}
              <strong>Chiêm Tinh</strong> (Tây Phương, Ấn Độ Vedic, Hợp Lá Số). Hỗ trợ chuẩn hóa giờ sinh theo kinh độ
              và múi giờ quốc tế chính xác.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <Dices className="h-4 w-4 text-purple-500" />
              4. Gieo Quẻ Dịch Số
            </h3>
            <p>
              Bao gồm <strong>Mai Hoa Dịch Số</strong> gieo quẻ theo thời khắc hoặc số ngẫu nhiên, và phương pháp{' '}
              <strong>Tam Thức</strong> (Thái Ất, Kì Môn Độn Giáp, Lục Nhâm Đại Độn) tra cứu điềm hung cát.
            </p>
          </div>

          {/* Section 5: Cá nhân hóa */}
          <div className="p-4 rounded-xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/20 text-text-primary-light dark:text-text-primary-dark space-y-1.5">
            <span className="font-semibold flex items-center gap-1.5 text-gold dark:text-gold-dark">
              <SlidersHorizontal className="h-4 w-4" /> Mẹo Cá Nhân Hóa
            </span>
            <p className="text-xs">
              Vào mục <strong>Cài đặt &gt; Hồ sơ</strong> hoặc đăng nhập để lưu năm sinh và vị trí. Ứng dụng sẽ tự động
              tính điểm cát hung riêng theo tuổi và làm nổi bật các giờ vượng tài cho bạn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 bg-surface-subtle-light/50 dark:bg-surface-subtle-dark/50 border-t border-border-light dark:border-border-dark flex justify-end">
          <Button variant="default" onClick={onClose} className="px-5 py-2 font-semibold">
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
