import React, { useMemo } from 'react';
import { useInView, useCountUp } from './landingPageData';

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
        icon: 'search',
        iconTint: 'text-blue-500/60 dark:text-blue-400/50',
        accentColor: 'text-blue-500 dark:text-blue-400',
      },
      {
        value: dataCount.toLocaleString('vi-VN'),
        suffix: '+',
        label: 'Dữ liệu thiên văn',
        icon: 'database',
        iconTint: 'text-teal-500/60 dark:text-teal-400/50',
        accentColor: 'text-teal-500 dark:text-teal-400',
      },
      {
        value: toolsCount.toLocaleString('vi-VN'),
        suffix: ' phân hệ',
        label: 'Đang hoạt động',
        icon: 'auto_awesome',
        iconTint: 'text-purple-500/60 dark:text-purple-400/50',
        accentColor: 'text-purple-500 dark:text-purple-400',
      },
    ],
    [dataCount, lookupCount, toolsCount],
  );

  return (
    <section id="stats-section" ref={statsSection.ref} className="py-10 px-5 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-6 px-4 glass-card glass-noise">
              <span className={`material-icons-round text-lg ${s.iconTint} mb-1.5 block`}>{s.icon}</span>
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
