import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FeatureKey } from '@/utils/tierGuard';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  minTier?: 'pro' | 'expert';
  featureKey?: FeatureKey;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  title = 'Tính Năng Dành Cho Thành Viên Nâng Cao',
  description = 'Mở khóa toàn bộ sức mạnh phân tích chiêm tinh và tính năng chuyên sâu cùng Lịch Việt Pro.',
  minTier = 'pro',
}) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    onClose();
    navigate('/app/nang-cap');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-gold/30 dark:border-gold/20 shadow-2xl bg-surface-light dark:bg-surface-elevated-dark">
        {/* Decorative Top Banner */}
        <div className="relative p-6 bg-gradient-to-br from-amber-500/20 via-gold/15 to-purple/10 border-b border-border-light/50 dark:border-border-dark/50 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-gold flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gold/20 text-gold-dark dark:text-gold border border-gold/30">
              Yêu cầu gói {minTier === 'expert' ? 'Expert' : 'Pro'}
            </span>
            <DialogTitle className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {title}
            </DialogTitle>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          <p>{description}</p>

          <div className="space-y-2 p-3.5 rounded-2xl bg-surface-subtle-light dark:bg-white/5 border border-border-light/50 dark:border-border-dark/40">
            <div className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
              Đặc quyền gói {minTier === 'expert' ? 'Expert' : 'Pro'}:
            </div>
            <ul className="space-y-1.5 text-xs text-text-primary-light dark:text-text-primary-dark">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-good dark:text-good-dark shrink-0" />
                <span>Quét lịch hoàng đạo & xuất hạn không giới hạn</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-good dark:text-good-dark shrink-0" />
                <span>Xuất file PDF lá số Bát Tự / Tử Vi chuẩn in</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-good dark:text-good-dark shrink-0" />
                <span>Hoàn toàn không quảng cáo, tốc độ ưu tiên</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="p-4 sm:p-6 bg-surface-subtle-light/40 dark:bg-surface-elevated-dark/80 border-t border-border-light/50 dark:border-border-dark/50 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl"
          >
            Để sau
          </Button>
          <Button
            type="button"
            onClick={handleUpgradeClick}
            className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-gold hover:from-amber-600 hover:to-gold-dark text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Nâng Cấp Ngay</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
