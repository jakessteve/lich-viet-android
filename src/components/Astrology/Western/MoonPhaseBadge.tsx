import React from 'react';
import type { MoonPhaseResult } from '@/services/astrology/moonPhase';

export const MoonPhaseBadge: React.FC<{ moonPhase: MoonPhaseResult }> = ({ moonPhase }) => {
  return (
    <div className="surface-card rounded-2xl border border-border-light/60 p-4 dark:border-border-dark/60 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-astral-primary/10 text-2xl dark:bg-astral-primary/20 shadow-inner">
            <span aria-hidden="true">{moonPhase.symbol}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-micro font-bold uppercase tracking-wider text-astral-primary dark:text-astral-primary-dark">
                Pha Mặt Trăng Sinh
              </span>
              <span className="badge-astral">{moonPhase.illuminationPercentage}% sáng</span>
            </div>
            <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
              {moonPhase.nameVi}
            </h4>
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
        {moonPhase.descriptionVi}{' '}
        <strong className="font-medium text-text-primary-light dark:text-text-primary-dark">
          {moonPhase.personalityTraitsVi}
        </strong>
      </p>
    </div>
  );
};
