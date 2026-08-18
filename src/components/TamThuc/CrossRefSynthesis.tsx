/**
 * CrossRefSynthesis — Consensus panel showing combined Tam Thức analysis
 *
 * Displays agreement score, combined verdict, and per-method key insights.
 */

import React from 'react';
import type { TamThucSynthesis, MethodSummary } from '@lich-viet/core/tamThuc';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CrossRefSynthesisProps {
  synthesis: TamThucSynthesis;
}

const VERDICT_STYLES = {
  cat: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
    border: 'border-emerald-200/60 dark:border-emerald-700/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  hung: {
    bg: 'bg-red-50/80 dark:bg-red-950/20',
    border: 'border-red-200/60 dark:border-red-700/30',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  trungBinh: {
    bg: 'bg-amber-50/80 dark:bg-amber-950/20',
    border: 'border-amber-200/60 dark:border-amber-700/30',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
    icon: <Info className="h-5 w-5" />,
  },
};

function MethodPill({ method }: { method: MethodSummary }) {
  const style = VERDICT_STYLES[method.verdict];
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', style.bg, style.border)}>
      <span className="text-base">{method.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-bold text-text-primary-light dark:text-text-primary-dark truncate">
          {method.nameShort}
        </p>
        <p className={cn('text-xs font-medium', style.text)}>{method.verdictLabel}</p>
      </div>
      <span className={style.text}>{style.icon}</span>
    </div>
  );
}

export default function CrossRefSynthesis({ synthesis }: CrossRefSynthesisProps) {
  const style = VERDICT_STYLES[synthesis.combinedVerdict];

  return (
    <Card className={cn('rounded-2xl border-2 p-5 space-y-4 shadow-sm', style.border, style.bg)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', style.badge)}>{style.icon}</div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">Tổng Hợp Tam Thức</h3>
          <p className={cn('text-sm font-semibold', style.text)}>{synthesis.combinedLabel}</p>
        </div>
        {/* Agreement indicator */}
        <div className="flex items-center gap-1">
          {[synthesis.methods.qmdj, synthesis.methods.lucNham, synthesis.methods.thaiAt].map((m, i) => (
            <div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                m.verdict === synthesis.combinedVerdict
                  ? m.verdict === 'cat'
                    ? 'bg-emerald-500'
                    : m.verdict === 'hung'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  : 'bg-gray-300 dark:bg-gray-600',
              )}
              title={`${m.nameShort}: ${m.verdictLabel}`}
            />
          ))}
        </div>
      </div>

      {/* Three method pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <MethodPill method={synthesis.methods.qmdj} />
        <MethodPill method={synthesis.methods.lucNham} />
        <MethodPill method={synthesis.methods.thaiAt} />
      </div>

      {/* Narrative */}
      <p className="text-sm leading-relaxed text-text-primary-light/80 dark:text-text-primary-dark/80">
        {synthesis.narrative}
      </p>
    </Card>
  );
}
