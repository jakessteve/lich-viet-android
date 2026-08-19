import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, Compass, CalendarCheck } from 'lucide-react';
import { safeStorage } from '@/stores/appStore';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Tổng Quan Âm Lịch & Tiết Khí',
    description: 'Tra cứu can chi, nạp âm, trực tú và khung giờ hoàng đạo theo thuật toán thiên văn cổ học chính xác.',
    icon: Compass,
    tag: 'Lịch Ngày',
  },
  {
    title: 'Cá Nhân Hóa Điểm Ngày Theo Tuổi',
    description: 'Nhập ngày giờ sinh để tự động tính điểm tương hợp tam hợp, lục hợp và việc nên làm / kiêng kỵ dành riêng cho bạn.',
    icon: Sparkles,
    tag: 'Bản Mệnh',
  },
  {
    title: 'Trạch Nhật & Chọn Ngày Khởi Sự',
    description: 'Tìm kiếm ngày giờ đắc tài lộc cho xuất hành, khai trương, cưới hỏi, động thổ với bộ lọc ngũ hành chuyên sâu.',
    icon: CalendarCheck,
    tag: 'Dụng Sự',
  },
];

const ONBOARDING_KEY = 'lichviet_onboarding_completed_v1';

export const OnboardingTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const isCompleted = safeStorage.get(ONBOARDING_KEY);
    if (!isCompleted) {
      // Show onboarding on first visit after a slight delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    safeStorage.set(ONBOARDING_KEY, 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-scale">
      <div className="relative w-full max-w-md p-6 overflow-hidden rounded-3xl bg-surface-light dark:bg-surface-elevated-dark border border-border-light/80 dark:border-border-dark shadow-2xl space-y-5">
        {/* Header with dismiss button */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-gold/15 text-amber-950 dark:text-gold-dark border border-gold/30">
            {step.tag} · Bước {currentStep + 1}/{ONBOARDING_STEPS.length}
          </span>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng hướng dẫn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 via-amber-500/15 to-purple/15 border border-gold/30 flex items-center justify-center text-gold dark:text-gold-dark shadow-xs">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            {step.title}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Step indicators & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-light/40 dark:border-border-dark/30">
          <div className="flex gap-1.5">
            {ONBOARDING_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentStep === idx
                    ? 'w-6 bg-gold dark:bg-gold-dark'
                    : 'w-1.5 bg-surface-subtle-light dark:bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <>
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-1.5 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gold text-slate-900 dark:bg-gold-dark dark:text-slate-900 hover:brightness-110 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer spring-press"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleDismiss}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-gold to-amber-600 text-white shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer spring-press"
              >
                <span>Bắt đầu khám phá</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OnboardingTour);
