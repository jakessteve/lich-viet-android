import React, { useState } from 'react';
import { useAstrologyStore } from '../../stores/astrologyStore';
import type { WesternChartResult } from '../../services/astrology/westernCalculator';
import { formatWesternNatalAsMarkdown } from '../../services/astrology/westernNatalMarkdown';
import { formatVedicChartAsMarkdown } from '../../services/astrology/vedicMarkdownFormatter';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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

  const btnBase =
    'flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-container-lowest transition-colors';

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={handleCopy}
        className={`${btnBase} ${
          copied ? 'bg-green-500/20 text-green-600 dark:text-green-400' : ''
        }`}
        title="Sao chép Markdown"
      >
        <span className="material-icons-round text-base">{copied ? 'check' : 'content_copy'}</span>
        {copied ? 'Đã chép!' : 'Sao chép MD'}
      </button>
      <button
        onClick={handleDownload}
        className={btnBase}
        title="Tải Markdown"
      >
        <span className="material-icons-round text-base">download</span>
        Tải MD
      </button>
    </div>
  );
};

export default WesternMarkdownExport;
