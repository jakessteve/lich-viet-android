import React, { useState } from 'react';
import { useTuViStore } from '../../stores/tuviStore';
import { formatTuViChartAsMarkdown } from '../../services/tuvi/markdownFormatter';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="w-full flex items-center gap-2.5 sm:gap-3 pt-2">
      <Button
        type="button"
        variant={copied ? 'secondary' : 'outline'}
        onClick={handleCopy}
        className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border-light/60 dark:border-border-dark/60"
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
      >
        <Download className="h-4 w-4" />
        <span>Tải file .md</span>
      </Button>
    </div>
  );
};
