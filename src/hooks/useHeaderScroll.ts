import { useState, useEffect, useRef } from 'react';

interface UseHeaderScrollOptions {
  /** Minimum scroll distance from top before header can hide */
  minScroll?: number;
  /** Minimum delta change before triggering visibility toggle */
  threshold?: number;
  /** Auto-hide delay in milliseconds after scrolling stops (default: 3000ms) */
  autoHideDelay?: number;
}

export function useHeaderScroll(options: UseHeaderScrollOptions = {}) {
  const { minScroll = 60, threshold = 10, autoHideDelay = 3000 } = options;
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isVisibleRef = useRef(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return;
    }

    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const startIdleTimer = (scrollY: number) => {
      clearIdleTimer();
      if (autoHideDelay > 0 && scrollY > minScroll) {
        idleTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
      }
    };

    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      const requestAf =
        typeof window.requestAnimationFrame === 'function'
          ? window.requestAnimationFrame
          : (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;

      rafId.current = requestAf(() => {
        const currentScrollY = Math.max(0, typeof window.scrollY === 'number' ? window.scrollY : 0);
        const delta = currentScrollY - lastScrollY.current;

        // Is page scrolled past minimal threshold?
        setIsScrolled(currentScrollY > 10);

        // Always show if at or near top
        if (currentScrollY <= minScroll) {
          clearIdleTimer();
          setIsVisible(true);
        } else if (Math.abs(delta) >= threshold) {
          if (delta > 0) {
            // Scrolling down -> hide immediately and clear timer
            clearIdleTimer();
            setIsVisible(false);
          } else if (delta < 0) {
            // Scrolling up -> show header and start auto-hide timer
            setIsVisible(true);
            startIdleTimer(currentScrollY);
          }
        } else if (isVisibleRef.current && currentScrollY > minScroll) {
          // If already visible and scrolled down, refresh idle timer
          startIdleTimer(currentScrollY);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearIdleTimer();
      if (rafId.current && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId.current);
      }
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [minScroll, threshold, autoHideDelay]);

  return { isVisible, isScrolled };
}

export default useHeaderScroll;
