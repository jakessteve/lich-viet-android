import { useState, useEffect } from 'react';

export type DeviceClass = 'phone' | 'phone-landscape' | 'tablet' | 'foldable-inner' | 'desktop';

export interface DeviceState {
  deviceClass: DeviceClass;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  isFoldableInner: boolean;
}

function getDeviceState(): DeviceState {
  if (typeof window === 'undefined') {
    return {
      deviceClass: 'desktop',
      isCompact: false,
      isMedium: false,
      isExpanded: true,
      isFoldableInner: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Media query checks
  const isLandscape = window.matchMedia('(orientation: landscape)').matches;

  // Foldable hinge check (if browser supports it)
  // Fallback heuristic: 768px-1023px width but relatively short (e.g. aspect ratio close to square)
  const hasHinge = window.matchMedia('(horizontal-viewport-segments: 2)').matches;
  const isLikelyFoldableInner = width >= 768 && width < 1024 && (hasHinge || height < 850);

  let deviceClass: DeviceClass;

  if (width >= 1024) {
    deviceClass = 'desktop';
  } else if (width >= 768) {
    deviceClass = isLikelyFoldableInner ? 'foldable-inner' : 'tablet';
  } else if (width >= 640 && isLandscape) {
    deviceClass = 'phone-landscape';
  } else {
    deviceClass = 'phone';
  }

  return {
    deviceClass,
    // Compact: < 640px (Phones in portrait, foldable cover screens)
    isCompact: width < 640,
    // Medium: 640px - 1023px (Landscape phones, tablets, foldable inner screens)
    isMedium: width >= 640 && width < 1024,
    // Expanded: >= 1024px (Desktops, large tablets in landscape)
    isExpanded: width >= 1024,
    isFoldableInner: deviceClass === 'foldable-inner',
  };
}

/**
 * A hook that provides a richer classification of the current device viewport.
 * Helps distinguish between standard phones, tablets, desktops, and foldable inner screens.
 */
export function useDeviceClass(): DeviceState {
  const [state, setState] = useState<DeviceState>(getDeviceState());

  useEffect(() => {
    // We listen to resize, orientationchange, and viewport segment changes if supported
    const handleResize = () => {
      setState(getDeviceState());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}
