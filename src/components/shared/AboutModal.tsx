import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-scale"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white dark:bg-mystery-surface rounded-2xl shadow-2xl border border-border-light dark:border-mystery-purple/20 max-h-[85vh] flex flex-col overflow-hidden animate-scale-in z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2.5">
            <span className="material-icons-round text-gold dark:text-gold-dark text-2xl">info</span>
            <h2
              id="about-modal-title"
              className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark"
            >
              Về Lịch Việt
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
        <div className="p-6 overflow-y-auto space-y-5 text-center">
          {/* Logo & App title */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold/20 via-amber-500/15 to-orange-500/20 flex items-center justify-center shadow-inner">
              <span className="material-icons-round text-3xl text-gold dark:text-gold-dark">calendar_month</span>
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300">
              LỊCH VIỆT
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark">
              Phiên bản 3.0.0
            </span>
          </div>

          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Ứng dụng tra cứu Âm Lịch, Dụng Sự, Tử Vi Đẩu Số, Chiêm Tinh Học và Gieo Quẻ Kinh Dịch đa nền tảng hiện đại.
            Tích hợp thuật toán chuẩn thiên văn Thụy Sĩ và tri thức cổ học Á Đông.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/40">
              <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark block mb-1">
                🔒 Quyền riêng tư
              </span>
              <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                Dữ liệu ngày sinh và lá số được lưu an toàn trên thiết bị của bạn.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/40">
              <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark block mb-1">
                ⚡ Độ chính xác cao
              </span>
              <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                Hiệu chỉnh giờ sinh theo kinh độ và múi giờ quốc tế chính xác.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-surface-subtle-dark border-t border-border-light dark:border-border-dark flex justify-between items-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <span>© 2026 Lịch Việt App</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-primary-light dark:text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
