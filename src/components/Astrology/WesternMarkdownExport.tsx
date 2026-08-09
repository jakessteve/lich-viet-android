import React from 'react';
import { useAstrologyStore } from '../../stores/astrologyStore';
import type { WesternChartResult } from '../../services/astrology/westernCalculator';
import { formatWesternChartAsMarkdown } from '../../services/astrology/markdownFormatter';

interface Props {
  system: 'western' | 'vedic';
}

export const WesternMarkdownExport: React.FC<Props> = ({ system }) => {
  const result = useAstrologyStore((s) =>
    system === 'vedic' ? s.vedicResult : s.westernResult
  );
  const name = system === 'vedic' ? 'lá-số-vedic' : 'lá-số-tây-phương';

  if (!result) return null;

  const md = formatWesternChartAsMarkdown(result as WesternChartResult, system);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // clipboard unavailable
    }
  };

  const handleDownload = () => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 justify-center pt-4">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-container-lowest transition-colors"
        title="Sao chép Markdown"
      >
        <span className="material-icons-round text-base">content_copy</span>
        Sao chép MD
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-container-lowest transition-colors"
        title="Tải Markdown"
      >
        <span className="material-icons-round text-base">download</span>
        Tải MD
      </button>
    </div>
  );
};

export default WesternMarkdownExport;
