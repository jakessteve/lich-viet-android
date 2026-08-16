import React from 'react';
import { Info, Calendar, ShieldCheck, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border-light dark:border-border-dark flex-row items-center gap-2.5 space-y-0 text-left">
          <Info className="text-gold dark:text-gold-dark h-5 w-5 shrink-0" />
          <DialogTitle className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Về Lịch Việt
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-center">
          {/* Logo & App title */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold/20 via-amber-500/15 to-orange-500/20 flex items-center justify-center shadow-inner">
              <Calendar className="h-8 w-8 text-gold dark:text-gold-dark" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-amber-600 dark:from-gold-dark dark:via-amber-400 dark:to-yellow-300">
              LỊCH VIỆT
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light/40 dark:border-border-dark/40">
              Phiên bản 1.0
            </span>
          </div>

          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Ứng dụng tra cứu Âm Lịch, Dụng Sự, Tử Vi Đẩu Số, Chiêm Tinh Học và Gieo Quẻ Kinh Dịch đa nền tảng hiện đại.
            Tích hợp thuật toán chuẩn thiên văn Thụy Sĩ và tri thức cổ học Á Đông.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/40">
              <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                <ShieldCheck className="h-3.5 w-3.5 text-good dark:text-good-dark" />
                <span>Quyền riêng tư</span>
              </div>
              <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                Dữ liệu ngày sinh và lá số được lưu an toàn trên thiết bị của bạn.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/40">
              <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                <Zap className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
                <span>Độ chính xác cao</span>
              </div>
              <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                Hiệu chỉnh giờ sinh theo kinh độ và múi giờ quốc tế chính xác.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 bg-surface-subtle-light/50 dark:bg-surface-subtle-dark/50 border-t border-border-light dark:border-border-dark flex justify-between items-center text-xs text-text-secondary-light dark:text-text-secondary-dark sm:justify-between">
          <span>© 2026 Lịch Việt App</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="px-4 font-semibold"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
