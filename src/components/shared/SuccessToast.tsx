import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  durationMs?: number;
}

export default function SuccessToast({ message, visible, onHide, durationMs = 3500 }: SuccessToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onHide, 300); // wait for exit animation
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [visible, durationMs, onHide]);

  if (!visible && !show) return null;

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 motion-gpu',
        show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-50/95 dark:bg-emerald-950/90 border border-emerald-200/60 dark:border-emerald-700/30 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-950/40 backdrop-blur-md">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{message}</p>
      </div>
    </div>
  );
}
