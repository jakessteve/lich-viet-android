// ══════════════════════════════════════════════════════════
// SuccessToast — Temporary success notification
// ══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

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
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/30 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-900/30 backdrop-blur-sm">
        <span className="material-icons-round text-lg text-emerald-500 dark:text-emerald-400">check_circle</span>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{message}</p>
      </div>
    </div>
  );
}
