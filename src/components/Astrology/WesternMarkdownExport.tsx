import React, { useState } from 'react';
import { useAstrologyStore } from '../../stores/astrologyStore';
import type { WesternChartResult } from '../../services/astrology/westernCalculator';
import { formatWesternNatalAsMarkdown } from '../../services/astrology/westernNatalMarkdown';
import { formatVedicChartAsMarkdown } from '../../services/astrology/vedicMarkdownFormatter';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  system: 'western' | 'vedic';
}

export const WesternMarkdownExport: React.FC<Props> = ({ system }) => {
  const result = useAstrologyStore((s) => (system === 'vedic' ? s.vedicResult : s.westernResult));
  const westernNatalResult = useAstrologyStore((s) => s.westernNatalResult);
  const vedicInput = useAstrologyStore((s) => s.vedicInput);
  const [copied, setCopied] = useState(false);

  if (!result || (system === 'western' && !westernNatalResult)) return null;

  const md =
    system === 'western'
      ? formatWesternNatalAsMarkdown(westernNatalResult as NonNullable<typeof westernNatalResult>)
      : formatVedicChartAsMarkdown(result as WesternChartResult, {
          birthDate:
            vedicInput?.birthDate instanceof Date
              ? vedicInput.birthDate
              : vedicInput?.birthDate
                ? new Date(vedicInput.birthDate)
                : undefined,
          name: vedicInput?.name,
          ayanamsa: vedicInput?.ayanamsa,
        });

  const handleCopy = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Clipboard.write({ string: md });
      } else {
        await navigator.clipboard.writeText(md);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <Button
      type="button"
      variant={copied ? 'secondary' : 'outline'}
      onClick={handleCopy}
      className="w-full sm:w-auto min-w-[180px] h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border-light/60 dark:border-border-dark/60 hover:bg-surface-subtle-light dark:hover:bg-white/5 transition-all spring-press"
      title="Sao chép toàn bộ luận giải lá số dạng Markdown"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-good dark:text-good-dark" />
          <span className="text-good dark:text-good-dark">Đã sao chép vào bộ nhớ tạm!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 text-gold dark:text-gold-dark" />
          <span>Sao chép Luận Giải (Markdown)</span>
        </>
      )}
    </Button>
  );
};

export default WesternMarkdownExport;

