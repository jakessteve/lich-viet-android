import React, { useState } from 'react';
import { useTuViStore } from '../../stores/tuviStore';
import { formatTuViChartAsMarkdown } from '../../services/tuvi/markdownFormatter';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TuViMarkdownExport: React.FC = () => {
  const chart = useTuViStore((s) => s.chart);
  const [copied, setCopied] = useState(false);

  if (!chart) return null;

  const getMarkdown = () => formatTuViChartAsMarkdown(chart);

  const handleCopy = async () => {
    try {
      const md = getMarkdown();
      if (Capacitor.isNativePlatform()) {
        await Clipboard.write({ string: md });
      } else {
        await navigator.clipboard.writeText(md);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="w-full flex items-center justify-center pt-2">
      <Button
        type="button"
        variant={copied ? 'secondary' : 'outline'}
        onClick={handleCopy}
        className="w-full sm:w-auto min-w-[200px] h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border-light/60 dark:border-border-dark/60 hover:bg-surface-subtle-light dark:hover:bg-white/5 transition-all spring-press"
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
    </div>
  );
};

