/**
 * CosmicWeatherCard — Full glass card for the hero 3-column grid.
 * Expands the compact CosmicWeatherWidget into a card-height layout
 * matching the Today card and Birthday Input card.
 */

import React, { useMemo } from 'react';
import { getCosmicForecast } from '@lich-viet/core/thaiAt';
import { getLunarDate } from '@lich-viet/core/calendar';

interface CosmicWeatherCardProps {
  navigate: (path: string) => void;
  today: {
    canChiYear: string;
  };
}

const CosmicWeatherCard: React.FC<CosmicWeatherCardProps> = ({ navigate, today }) => {
  const forecast = useMemo(() => {
    try {
      const now = new Date();
      const lunar = getLunarDate(now);
      return getCosmicForecast(lunar.year);
    } catch {
      return null;
    }
  }, []);

  if (!forecast) return <div className="glass-card glass-noise p-5" />;

  const toneColor =
    forecast.tone === 'optimistic'
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-400/8'
      : forecast.tone === 'cautious'
        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/8 dark:bg-blue-400/8'
        : 'text-amber-600 dark:text-amber-400 bg-amber-500/8 dark:bg-amber-400/8';

  const toneLabel =
    forecast.tone === 'optimistic' ? 'Thuận lợi' : forecast.tone === 'cautious' ? 'Bình thường' : 'Cần lưu ý';

  const toneIcon =
    forecast.tone === 'optimistic' ? 'trending_up' : forecast.tone === 'cautious' ? 'trending_flat' : 'trending_down';

  return (
    <button
      onClick={() => navigate('/app/am-lich')}
      className="group glass-card glass-noise p-5 text-center hover-lift cursor-pointer flex flex-col items-center"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-5">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary-light/60 dark:text-text-secondary-dark/60">
          Vận Khí Vũ Trụ
        </span>
        <span className="material-icons-round text-sm text-text-secondary-light/60 dark:text-text-secondary-dark/60 group-hover:text-gold dark:group-hover:text-gold-dark transition-colors">
          arrow_forward
        </span>
      </div>

      {/* Cosmic visual — centered + large */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-gold/10 dark:from-mystery-purple/25 dark:via-blue-500/15 dark:to-gold/10 flex items-center justify-center mb-3">
        <span className="material-icons-round text-2xl text-purple-500/70 dark:text-purple-400/80">public</span>
      </div>

      {/* Main label — BIG */}
      <p className="text-lg font-bold tracking-tight leading-snug bg-clip-text text-transparent bg-gradient-to-r from-text-primary-light to-text-secondary-light dark:from-white dark:to-gray-400">
        {today.canChiYear}
      </p>
      <p className="text-sm font-semibold text-gold dark:text-gold-dark mb-1">{forecast.palaceName}</p>

      {/* Details — centered rows */}
      <div className="mt-auto w-full space-y-1.5 pt-3 border-t border-border-light/15 dark:border-white/[0.04]">
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <span className="material-icons-round text-xs text-gold/50 dark:text-gold-dark/40">swap_horiz</span>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">{forecast.hostGuestLabel}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <span className="material-icons-round text-xs text-gold/50 dark:text-gold-dark/40">spa</span>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">Hành {forecast.element}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <span className={`material-icons-round text-xs`}>{toneIcon}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${toneColor}`}>{toneLabel}</span>
        </div>
      </div>
    </button>
  );
};

export default React.memo(CosmicWeatherCard);
