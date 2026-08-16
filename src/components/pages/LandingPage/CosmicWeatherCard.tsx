/**
 * CosmicWeatherCard — Full glass card for the hero 3-column grid.
 * Expands the compact CosmicWeatherWidget into a card-height layout
 * matching the Today card and Birthday Input card.
 */

import React, { useMemo } from 'react';
import { getCosmicForecast } from '@lich-viet/core/thaiAt';
import { getLunarDate } from '@lich-viet/core/calendar';
import { ArrowRight, Globe, ArrowLeftRight, Sparkles, TrendingUp, Minus, TrendingDown } from 'lucide-react';

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

  if (!forecast) return <div className="glass-card glass-noise p-5 rounded-2xl" />;

  const toneColor =
    forecast.tone === 'optimistic'
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-400/8'
      : forecast.tone === 'cautious'
        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/8 dark:bg-blue-400/8'
        : 'text-amber-800 dark:text-amber-300 bg-amber-500/8 dark:bg-amber-400/8';

  const toneLabel =
    forecast.tone === 'optimistic' ? 'Thuận lợi' : forecast.tone === 'cautious' ? 'Bình thường' : 'Cần lưu ý';

  const ToneIcon =
    forecast.tone === 'optimistic' ? TrendingUp : forecast.tone === 'cautious' ? Minus : TrendingDown;

  return (
    <button
      onClick={() => navigate('/app/am-lich')}
      className="group glass-card glass-noise p-5 text-center hover-lift cursor-pointer flex flex-col items-center rounded-2xl border border-border-light/60 dark:border-border-dark/60 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-5">
        <span className="label-standard text-text-secondary-light/70 dark:text-text-secondary-dark/70">
          Vận Khí Vũ Trụ
        </span>
        <ArrowRight className="h-4 w-4 text-text-secondary-light/60 dark:text-text-secondary-dark/60 group-hover:text-gold dark:group-hover:text-gold-dark transition-colors" />
      </div>

      {/* Cosmic visual — centered + large */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-gold/10 dark:from-mystery-purple/25 dark:via-blue-500/15 dark:to-gold/10 flex items-center justify-center mb-3">
        <Globe className="h-6 w-6 text-purple-500/70 dark:text-purple-400/80" />
      </div>

      {/* Main label — BIG */}
      <p className="text-lg font-bold tracking-tight leading-snug bg-clip-text text-transparent bg-gradient-to-r from-text-primary-light to-text-secondary-light dark:from-white dark:to-gray-400">
        {today.canChiYear}
      </p>
      <p className="text-sm font-semibold text-gold dark:text-gold-dark mb-1">{forecast.palaceName}</p>

      {/* Details — centered rows */}
      <div className="mt-auto w-full space-y-1.5 pt-3 border-t border-border-light/15 dark:border-white/[0.04]">
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <ArrowLeftRight className="h-3.5 w-3.5 text-gold/50 dark:text-gold-dark/40" />
          <span className="text-text-secondary-light dark:text-text-secondary-dark">{forecast.hostGuestLabel}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-gold/50 dark:text-gold-dark/40" />
          <span className="text-text-secondary-light dark:text-text-secondary-dark">Hành {forecast.element}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <ToneIcon className="h-3.5 w-3.5" />
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${toneColor}`}>{toneLabel}</span>
        </div>
      </div>
    </button>
  );
};

export default React.memo(CosmicWeatherCard);
