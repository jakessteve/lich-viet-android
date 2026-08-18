import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Calendar, UserPlus, Zap, FolderHeart, Sparkles } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MotionFadeIn } from '@/components/ui/motion-primitives';

export default function UpgradePage() {
  usePageTitle('Quyền lợi Thành viên');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isPremium = user?.accessTier === 'premium' || user?.accessTier === 'admin';

  return (
    <MotionFadeIn className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <Card variant="glass" className="p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gold/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold/20 via-amber-500/15 to-orange-500/20 flex items-center justify-center mb-4 shadow-inner">
          <Award className="h-8 w-8 text-gold dark:text-gold-dark" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mb-2">
          {isPremium ? 'Tài Khoản Cao Cấp' : 'Trải Nghiệm Lịch Việt Toàn Diện'}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark max-w-xl mx-auto leading-relaxed">
          {isPremium
            ? 'Bạn đang sử dụng đầy đủ các quyền lợi và tính năng cao cấp nhất của Lịch Việt.'
            : 'Toàn bộ công cụ tính toán thiên văn và an sao cổ học cốt lõi luôn miễn phí. Tính năng nâng cao giúp bạn quản lý và đồng bộ không giới hạn.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => navigate('/app/am-lich')}
            variant="default"
            className="gap-2 px-6 rounded-xl font-semibold shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            Mở Lịch Ngày
          </Button>
          {!isAuthenticated && (
            <Button
              onClick={() => navigate('/app/dang-ky')}
              variant="outline"
              className="gap-2 px-6 rounded-xl font-semibold text-gold dark:text-gold-dark border-gold/30 dark:border-gold-dark/30 hover:bg-gold/10"
            >
              <UserPlus className="h-4 w-4" />
              Đăng Ký Miễn Phí
            </Button>
          )}
        </div>
      </Card>

      {/* Feature Comparison / Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="default" className="p-5 border border-border-light/60 dark:border-border-dark/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
            Thuật toán Offline
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Tính toán Lịch Âm, Tiết Khí, Tử Vi và Chiêm Tinh trực tiếp trên máy với độ trễ 0ms, không phụ thuộc kết nối
            mạng.
          </p>
        </Card>

        <Card variant="default" className="p-5 border border-border-light/60 dark:border-border-dark/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FolderHeart className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">Lưu Trữ Lá Số</h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Lưu trữ và phân loại danh sách lá số gia đình, bạn bè và đối tác. Tự động liên kết khi tra cứu hợp tuổi.
          </p>
        </Card>

        <Card variant="default" className="p-5 border border-border-light/60 dark:border-border-dark/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
            Cá Nhân Hóa Toàn Diện
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Tự động tính điểm hỷ dụng, giờ xuất hành cát lành và việc nên làm theo đúng can chi năm sinh của bạn.
          </p>
        </Card>
      </div>
    </MotionFadeIn>
  );
}
