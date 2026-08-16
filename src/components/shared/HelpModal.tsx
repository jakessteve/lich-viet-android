import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-scale"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl bg-white dark:bg-mystery-surface rounded-2xl shadow-2xl border border-border-light dark:border-mystery-purple/20 max-h-[85vh] flex flex-col overflow-hidden animate-scale-in z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2.5">
            <span className="material-icons-round text-gold dark:text-gold-dark text-2xl">help_outline</span>
            <h2 id="help-modal-title" className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              Hướng dẫn sử dụng & Trợ giúp
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Đóng"
          >
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-base text-gold dark:text-gold-dark">calendar_month</span>
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
              <span className="material-icons-round text-base text-emerald-500">event_available</span>
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
              <span className="material-icons-round text-base text-indigo-500">auto_awesome</span>
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
              <span className="material-icons-round text-base text-purple-500">casino</span>
              4. Gieo Quẻ Dịch Số
            </h3>
            <p>
              Bao gồm <strong>Mai Hoa Dịch Số</strong> gieo quẻ theo thời khắc hoặc số ngẫu nhiên, và phương pháp{' '}
              <strong>Tam Thức</strong> (Thái Ất, Kì Môn Độn Giáp, Lục Nhâm Đại Độn) tra cứu điềm hung cát.
            </p>
          </div>

          {/* Section 5: Cá nhân hóa */}
          <div className="p-4 rounded-xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/20 text-text-primary-light dark:text-text-primary-dark space-y-1.5">
            <span className="font-semibold flex items-center gap-1.5 text-gold-dark dark:text-gold">
              <span className="material-icons-round text-sm">tune</span> Mẹo Cá Nhân Hóa
            </span>
            <p className="text-xs">
              Vào mục <strong>Cài đặt &gt; Hồ sơ</strong> hoặc đăng nhập để lưu năm sinh và vị trí. Ứng dụng sẽ tự động
              tính điểm cát hung riêng theo tuổi và làm nổi bật các giờ vượng tài cho bạn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-surface-subtle-dark border-t border-border-light dark:border-border-dark flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
