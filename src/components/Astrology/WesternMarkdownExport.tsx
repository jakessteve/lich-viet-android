import React, { useState } from 'react';
import { useAstrologyStore } from '../../stores/astrologyStore';
import type { WesternChartResult } from '../../services/astrology/westernCalculator';
import { formatWesternNatalAsMarkdown } from '../../services/astrology/westernNatalMarkdown';
import { formatVedicChartAsMarkdown } from '../../services/astrology/vedicMarkdownFormatter';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  system: 'western' | 'vedic';
}

export const WesternMarkdownExport: React.FC<Props> = ({ system }) => {
  const result = useAstrologyStore((s) => (system === 'vedic' ? s.vedicResult : s.westernResult));
  const westernNatalResult = useAstrologyStore((s) => s.westernNatalResult);
  const vedicInput = useAstrologyStore((s) => s.vedicInput);
  const [copied, setCopied] = useState(false);
  const name = system === 'vedic' ? 'lá-số-vedic' : 'lá-số-tây-phương';

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

  const handleDownload = async () => {
    try {
      const filename = `${name}-${new Date().toISOString().slice(0, 10)}.md`;
      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: filename,
          data: md,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        window.alert(`Đã lưu file Markdown vào thư mục Documents/${filename}`);
      } else {
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Failed to download', e);
      window.alert('Không thể lưu file lúc này. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full flex items-center gap-2.5 sm:gap-3 pt-2">
      <Button
        type="button"
        variant={copied ? 'secondary' : 'outline'}
        onClick={handleCopy}
        className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border-light/60 dark:border-border-dark/60"
        title="Sao chép Markdown"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-good dark:text-good-dark" />
            <span className="text-good dark:text-good-dark">Đã chép!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Sao chép Markdown</span>
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleDownload}
        className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border-light/60 dark:border-border-dark/60"
        title="Tải Markdown"
      >
        <Download className="h-4 w-4" />
        <span>Tải file .md</span>
      </Button>
    </div>
  );
};

export default WesternMarkdownExport;
