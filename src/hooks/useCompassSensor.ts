import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeHeading } from '@/utils/flyingStarEngine';
import type {
  CompassCalibrationState,
  CompassHeadingSource,
  CompassPermissionState,
} from '@/types/fengshui';

export interface CompassSensorState {
  headingDeg: number | null;
  magneticHeadingDeg: number | null;
  trueHeadingDeg: number | null;
  accuracyDeg: number | null;
  permissionState: CompassPermissionState;
  calibrationState: CompassCalibrationState;
  source: CompassHeadingSource;
  supported: boolean;
  listening: boolean;
  message?: string;
}

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
  absolute?: boolean;
};

function hasOrientationSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'DeviceOrientationEvent' in window || 'ondeviceorientation' in window;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeHeading(a) - normalizeHeading(b));
  return Math.min(diff, 360 - diff);
}

function extractHeading(
  event: DeviceOrientationEvent,
): { heading: number | null; accuracy: number | null; isAbsolute: boolean } {
  const compassEvent = event as OrientationEventWithCompass;
  if (typeof compassEvent.webkitCompassHeading === 'number') {
    const accuracy = typeof compassEvent.webkitCompassAccuracy === 'number' ? compassEvent.webkitCompassAccuracy : null;
    return { heading: normalizeHeading(compassEvent.webkitCompassHeading), accuracy, isAbsolute: true };
  }

  if (typeof event.alpha !== 'number') {
    return { heading: null, accuracy: null, isAbsolute: false };
  }

  const alphaHeading = event.absolute ? event.alpha : 360 - event.alpha;
  return { heading: normalizeHeading(alphaHeading), accuracy: null, isAbsolute: Boolean(event.absolute) };
}

export function useCompassSensor() {
  const listenersRef = useRef<(() => void) | null>(null);
  const pendingHeadingRef = useRef<number | null>(null);
  const pendingAccuracyRef = useRef<number | null>(null);
  const lastHeadingRef = useRef<number | null>(null);
  const absoluteReadingSeenRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<CompassSensorState>({
    headingDeg: null,
    magneticHeadingDeg: null,
    trueHeadingDeg: null,
    accuracyDeg: null,
    permissionState: 'prompt',
    calibrationState: 'unknown',
    source: 'manual',
    supported: hasOrientationSupport(),
    listening: false,
    message: undefined,
  });

  const flushPendingHeading = useCallback(() => {
    rafRef.current = null;

    const heading = pendingHeadingRef.current;
    if (heading === null) return;

    const accuracy = pendingAccuracyRef.current;
    const previous = lastHeadingRef.current;
    if (previous !== null && angularDistance(previous, heading) < 0.75) {
      return;
    }

    lastHeadingRef.current = heading;
    setState((current) => ({
      ...current,
      headingDeg: heading,
      magneticHeadingDeg: heading,
      trueHeadingDeg: heading,
      accuracyDeg: accuracy,
      permissionState: 'granted',
      calibrationState:
        accuracy === null ? 'unknown' : accuracy <= 20 ? 'ok' : accuracy <= 40 ? 'low-accuracy' : 'interference',
      source: 'browser',
      supported: true,
      listening: true,
      message: undefined,
    }));
  }, []);

  const queueHeadingUpdate = useCallback(
    (heading: number, accuracy: number | null, isAbsolute: boolean) => {
      if (isAbsolute) {
        absoluteReadingSeenRef.current = true;
      } else if (absoluteReadingSeenRef.current) {
        return;
      }

      pendingHeadingRef.current = heading;
      pendingAccuracyRef.current = accuracy;

      if (rafRef.current !== null) return;

      if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
        flushPendingHeading();
        return;
      }

      rafRef.current = window.requestAnimationFrame(flushPendingHeading);
    },
    [flushPendingHeading],
  );

  const stop = useCallback(() => {
    listenersRef.current?.();
    listenersRef.current = null;
    if (rafRef.current !== null && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = null;
    pendingHeadingRef.current = null;
    pendingAccuracyRef.current = null;
    absoluteReadingSeenRef.current = false;
    setState((current) => ({
      ...current,
      listening: false,
      source: current.source === 'manual' ? 'manual' : current.source,
    }));
  }, []);

  const start = useCallback(async () => {
    if (typeof window === 'undefined' || !hasOrientationSupport()) {
      setState((current) => ({
        ...current,
        permissionState: 'unsupported',
        supported: false,
        listening: false,
        message: 'Thiết bị hoặc trình duyệt này không hỗ trợ la bàn.',
      }));
      return false;
    }

    listenersRef.current?.();
    listenersRef.current = null;

    const permissionRequester = (window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    })?.requestPermission;

    if (typeof permissionRequester === 'function') {
      try {
        const permission = await permissionRequester();
        if (permission !== 'granted') {
          setState((current) => ({
            ...current,
            permissionState: 'denied',
            listening: false,
            message: 'Quyền truy cập cảm biến la bàn bị từ chối.',
          }));
          return false;
        }
      } catch {
        setState((current) => ({
          ...current,
          permissionState: 'denied',
          listening: false,
          message: 'Không thể mở quyền truy cập cảm biến la bàn.',
        }));
        return false;
      }
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { heading, accuracy, isAbsolute } = extractHeading(event);
      if (heading === null) return;

      queueHeadingUpdate(heading, accuracy, isAbsolute);
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('deviceorientation', handleOrientation as EventListener, true);

    listenersRef.current = () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
    };

    setState((current) => ({
      ...current,
      permissionState: 'granted',
      supported: true,
      listening: true,
      source: 'browser',
      message: undefined,
    }));

    return true;
  }, []);

  useEffect(() => stop, [stop]);

  return {
    ...state,
    start,
    stop,
  };
}
