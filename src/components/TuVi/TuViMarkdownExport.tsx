import React, { useState } from 'react';
import { useTuViStore } from '../../stores/tuviStore';
import { formatTuViChartAsMarkdown } from '../../services/tuvi/markdownFormatter';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export const TuViMarkdownExport: React.FC = () => {
  const { chart } = useTuViStore();
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

  const handleDownload = async () => {
    try {
      const md = getMarkdown();
      const name = chart.input.name?.trim() || 'la-so';
      const filename = `tu-vi-${name.toLowerCase().replace(/\s+/g, '-')}.md`;
      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: filename,
          data: md,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        window.alert(`Đã lưu file Markdown vào thư mục Documents/${filename}`);
      } else {
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Failed to download', e);
      window.alert('Không thể lưu file lúc này. Vui lòng thử lại.');
    }
  };

  const btnBase =
    'surface-control flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 btn-interact';

  return (
    <div className="flex flex-wrap gap-2">
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
