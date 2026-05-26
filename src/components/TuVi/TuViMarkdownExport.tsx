import React, { useState } from 'react';
import { useTuViStore } from '../../stores/tuviStore';
import { formatTuViChartAsMarkdown } from '../../services/tuvi/markdownFormatter';
import { buildTuViImageFilename, downloadTuViChartAsImage } from '../../services/tuvi/chartImageExport';

export const TuViMarkdownExport: React.FC = () => {
  const { chart } = useTuViStore();
  const [copied, setCopied] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  if (!chart) return null;

  const getMarkdown = () => formatTuViChartAsMarkdown(chart);

  const handleCopy = async () => {
    const md = getMarkdown();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const md = getMarkdown();
    const name = chart.input.name?.trim() || 'la-so';
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tu-vi-${name.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      await downloadTuViChartAsImage('[data-tuvi-chart-export]', buildTuViImageFilename(chart.input.name));
    } catch (error) {
      console.error('Failed to export Tử Vi chart as image:', error);
      window.alert('Không thể tải ảnh Tử Vi lúc này. Vui lòng thử lại.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const btnBase =
    'surface-control flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 btn-interact';

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleDownloadImage}
        disabled={isDownloadingImage}
        className={`${btnBase} hover:bg-surface-container-lowest dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
        aria-busy={isDownloadingImage}
      >
        <span className="material-icons-round text-sm">{isDownloadingImage ? 'hourglass_top' : 'image'}</span>
        {isDownloadingImage ? 'Đang tải ảnh...' : 'Tải ảnh'}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className={`${btnBase} ${
          copied
            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
            : 'hover:bg-surface-container-lowest dark:hover:bg-white/10'
        }`}
      >
        <span className="material-icons-round text-sm">{copied ? 'check' : 'content_copy'}</span>
        {copied ? 'Đã chép!' : 'Sao chép Markdown'}
      </button>

      <button
        type="button"
        onClick={handleDownload}
        className={`${btnBase} hover:bg-surface-container-lowest dark:hover:bg-white/10`}
      >
        <span className="material-icons-round text-sm">download</span>
        Tải .md
      </button>
    </div>
  );
};
