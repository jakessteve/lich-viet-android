import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';

export default function UpgradePage() {
  usePageTitle('Quyền lợi Thành viên');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const isPremium = user?.accessTier === 'premium' || user?.accessTier === 'admin';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in-up space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gold/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold/20 via-amber-500/15 to-orange-500/20 flex items-center justify-center mb-4 shadow-inner">
          <span className="material-icons-round text-3xl text-gold dark:text-gold-dark">workspace_premium</span>
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
          <button
            onClick={() => navigate('/app/am-lich')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all"
          >
            <span className="material-icons-round text-base">calendar_month</span>
            Mở Lịch Ngày
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/app/dang-ky')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-gold dark:text-gold-dark bg-gold/10 dark:bg-gold-dark/10 border border-gold/20 dark:border-gold-dark/20 hover:bg-gold/20 transition-all"
            >
              <span className="material-icons-round text-base">person_add</span>
              Đăng Ký Miễn Phí
            </button>
          )}
        </div>
      </div>

      {/* Feature Comparison / Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="surface-card p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-icons-round text-xl">offline_bolt</span>
          </div>
          <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
            Thuật toán Offline
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Tính toán Lịch Âm, Tiết Khí, Tử Vi và Chiêm Tinh trực tiếp trên máy với độ trễ 0ms, không phụ thuộc kết nối mạng.
          </p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <span className="material-icons-round text-xl">folder_special</span>
          </div>
          <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
            Lưu Trữ Lá Số
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Lưu trữ và phân loại danh sách lá số gia đình, bạn bè và đối tác. Tự động liên kết khi tra cứu hợp tuổi.
          </p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-border-light/60 dark:border-border-dark/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span className="material-icons-round text-xl">auto_fix_high</span>
          </div>
          <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
            Cá Nhân Hóa Toàn Diện
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Tự động tính điểm hỷ dụng, giờ xuất hành cát lành và việc nên làm theo đúng can chi năm sinh của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}

