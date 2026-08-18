import React, { useMemo } from 'react';
import { useInView, useCountUp } from './landingPageData';
import { Search, Database, Sparkles } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const statsSection = useInView(0.2);
  const lookupCount = useCountUp(12480, 1400, statsSection.inView);
  const dataCount = useCountUp(85000, 1600, statsSection.inView);
  const toolsCount = useCountUp(5, 1000, statsSection.inView);

  const stats = useMemo(
    () => [
      {
        value: lookupCount.toLocaleString('vi-VN'),
        suffix: '+',
        label: 'Lượt tra cứu',
        icon: <Search className="h-5 w-5 mx-auto text-blue-500/60 dark:text-blue-400/50 mb-1.5" />,
        accentColor: 'text-blue-500 dark:text-blue-400',
      },
      {
        value: dataCount.toLocaleString('vi-VN'),
        suffix: '+',
        label: 'Dữ liệu thiên văn',
        icon: <Database className="h-5 w-5 mx-auto text-teal-500/60 dark:text-teal-400/50 mb-1.5" />,
        accentColor: 'text-teal-500 dark:text-teal-400',
      },
      {
        value: toolsCount.toLocaleString('vi-VN'),
        suffix: ' phân hệ',
        label: 'Đang hoạt động',
        icon: <Sparkles className="h-5 w-5 mx-auto text-purple-500/60 dark:text-purple-400/50 mb-1.5" />,
        accentColor: 'text-purple-500 dark:text-purple-400',
      },
    ],
    [dataCount, lookupCount, toolsCount],
  );

  return (
    <section
      id="stats-section"
      ref={statsSection.ref as unknown as React.RefObject<HTMLElement>}
      className="py-10 px-5 relative z-10"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center py-6 px-4 glass-card glass-noise rounded-2xl border border-border-light/60 dark:border-border-dark/60"
            >
              {s.icon}
              <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                {s.value}
                <span className={s.accentColor}>{s.suffix}</span>
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(StatsSection);
