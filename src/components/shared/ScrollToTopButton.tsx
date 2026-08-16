import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ threshold = 300, className = '' }) => {
  const showScrollToTopButton = useAppStore((s) => s.showScrollToTopButton);
  const [isVisible, setIsVisible] = useState(false);

  const checkScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    setIsVisible(currentScroll > threshold);
  }, [threshold]);

  useEffect(() => {
    if (!showScrollToTopButton) {
      setIsVisible(false);
      return;
    }

    checkScroll();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('scroll', checkScroll, { passive: true });
      return () => {
        if (typeof window.removeEventListener === 'function') {
          window.removeEventListener('scroll', checkScroll);
        }
      };
    }
  }, [checkScroll, showScrollToTopButton]);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!showScrollToTopButton || !isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      title="Cuộn lên đầu trang"
      className={cn(
        'fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-surface-card/90 dark:bg-mystery-surface/90 text-text-primary-light dark:text-text-primary-dark backdrop-blur-xl border border-border-light/60 dark:border-border-dark/60 shadow-apple hover:shadow-apple-hover hover:scale-105 active:scale-95 transition-all duration-200 animate-fade-scale group spring-press',
        className,
      )}
    >
      <ArrowUp className="h-5 w-5 text-gold dark:text-gold-dark group-hover:-translate-y-0.5 transition-transform duration-200" />
    </button>
  );
};

export default ScrollToTopButton;
