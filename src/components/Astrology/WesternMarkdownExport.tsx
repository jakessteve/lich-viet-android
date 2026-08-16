import React, { useEffect, useRef, useState } from 'react';
import { useAstrologyStore } from '../../stores/astrologyStore';
import type { WesternChartResult } from '../../services/astrology/westernCalculator';
import { formatWesternNatalAsMarkdown } from '../../services/astrology/westernNatalMarkdown';
import { formatVedicChartAsMarkdown } from '../../services/astrology/vedicMarkdownFormatter';
import { downloadChartAsImage, buildChartImageFilename } from '../../services/astrology/chartImageExport';
import { saveWesternNatalChart } from '../../services/astrology/westernNatalSave';
import { useAppStore } from '../../stores/appStore';
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
  const isDark = useAppStore((s) => s.isDark);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [savingNatalFormat, setSavingNatalFormat] = useState<'svg' | 'png' | null>(null);
  const [natalMenuOpen, setNatalMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const natalMenuRef = useRef<HTMLDivElement>(null);
  const natalMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const firstNatalChoiceRef = useRef<HTMLButtonElement>(null);
  const name = system === 'vedic' ? 'lá-số-vedic' : 'lá-số-tây-phương';

  useEffect(() => {
    if (!natalMenuOpen) return;
    firstNatalChoiceRef.current?.focus();
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!natalMenuRef.current?.contains(target) && !natalMenuTriggerRef.current?.contains(target)) {
        setNatalMenuOpen(false);
        natalMenuTriggerRef.current?.focus();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setNatalMenuOpen(false);
      natalMenuTriggerRef.current?.focus();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [natalMenuOpen]);

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
  const selector = system === 'vedic' ? '[data-vedic-chart-export]' : '[data-western-chart-export]';
  const prefix = system === 'vedic' ? 'vedic' : 'western';


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

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      await downloadChartAsImage(selector, buildChartImageFilename(prefix));
    } catch (error) {
      console.error(`Failed to export ${system} chart as image:`, error);
      window.alert('Không thể tải ảnh lúc này. Vui lòng thử lại.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleSaveNatal = async (format: 'svg' | 'png') => {
    if (!westernNatalResult) return;
    try {
      setSavingNatalFormat(format);
      const saved = await saveWesternNatalChart(westernNatalResult, format, {
        theme: isDark ? 'dark' : 'light',
        size: 1180,
        pixelRatio: format === 'png' ? 2 : 1,
      });
      if (saved.destination === 'documents') {
        window.alert(`Đã lưu lá số: ${saved.uri ?? `Documents/LichViet/${saved.filename}`}`);
      }
    } catch (error) {
      console.error(`Failed to export Western natal ${format}:`, error);
      window.alert(`Không thể tải ${format.toUpperCase()} lúc này. Vui lòng thử lại.`);
    } finally {
      setSavingNatalFormat(null);
      setNatalMenuOpen(false);
      natalMenuTriggerRef.current?.focus();
    }
  };

  const btnBase =
    'flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-container-lowest transition-colors';

  return (
    <div
      className={
        system === 'western'
          ? 'grid grid-cols-2 gap-2 pt-4 sm:flex sm:items-center sm:justify-center'
          : 'flex items-center justify-center gap-2 pt-4'
      }
    >
      {system === 'vedic' && (
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloadingImage}
          className={`${btnBase} disabled:opacity-60 disabled:cursor-not-allowed`}
          title="Tải ảnh biểu đồ"
          aria-label="Tải ảnh"
        >
          <span className="material-icons-round text-base">{isDownloadingImage ? 'hourglass_top' : 'image'}</span>
          {isDownloadingImage ? 'Đang tải...' : 'Tải ảnh'}
        </button>
      )}
      {system === 'western' && westernNatalResult && (
        <div className="relative col-span-2 sm:col-auto">
          <button
            ref={natalMenuTriggerRef}
            type="button"
            onClick={() => setNatalMenuOpen((current) => !current)}
            disabled={savingNatalFormat !== null}
            className={`${btnBase} w-full bg-astral-surface-light font-semibold text-astral-primary hover:bg-astral-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-astral-surface-dark dark:text-astral-primary-dark sm:w-auto`}
            aria-haspopup="menu"
            aria-expanded={natalMenuOpen}
            aria-controls="western-natal-download-menu"
          >
            <span className="material-icons-round text-base" aria-hidden="true">
              {savingNatalFormat ? 'hourglass_top' : 'download'}
            </span>
            {savingNatalFormat ? `Đang tạo ${savingNatalFormat.toUpperCase()}…` : 'Tải lá số'}
            <span
              className={`material-icons-round text-base transition-transform ${natalMenuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              expand_more
            </span>
          </button>
          {natalMenuOpen && (
            <div
              ref={natalMenuRef}
              id="western-natal-download-menu"
              role="menu"
              aria-label="Chọn định dạng tải lá số"
              className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-border-light/70 bg-surface-light p-1.5 shadow-xl dark:border-border-dark/70 dark:bg-surface-dark"
            >
              <button
                ref={firstNatalChoiceRef}
                type="button"
                role="menuitem"
                disabled={savingNatalFormat !== null}
                onClick={() => void handleSaveNatal('svg')}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark focus-visible:bg-astral-surface-light dark:focus-visible:bg-astral-surface-dark focus-visible:outline-none disabled:opacity-50"
              >
                <span
                  className="material-icons-round text-astral-primary dark:text-astral-primary-dark"
                  aria-hidden="true"
                >
                  data_object
                </span>
                <span>
                  <strong className="block text-sm">SVG</strong>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Vector, sắc nét khi phóng to
                  </span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={savingNatalFormat !== null}
                onClick={() => void handleSaveNatal('png')}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark focus-visible:bg-astral-surface-light dark:focus-visible:bg-astral-surface-dark focus-visible:outline-none disabled:opacity-50"
              >
                <span
                  className="material-icons-round text-astral-primary dark:text-astral-primary-dark"
                  aria-hidden="true"
                >
                  image
                </span>
                <span>
                  <strong className="block text-sm">PNG</strong>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Ảnh 2×, dễ chia sẻ
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
      <button
        onClick={handleCopy}
        className={`${btnBase} ${system === 'western' ? 'w-full sm:w-auto' : ''} ${
          copied ? 'bg-green-500/20 text-green-600 dark:text-green-400' : ''
        }`}
        title="Sao chép Markdown"
      >
        <span className="material-icons-round text-base">{copied ? 'check' : 'content_copy'}</span>
        {copied ? 'Đã chép!' : 'Sao chép MD'}
      </button>
      <button
        onClick={handleDownload}
        className={`${btnBase} ${system === 'western' ? 'w-full sm:w-auto' : ''}`}
        title="Tải Markdown"
      >
        <span className="material-icons-round text-base">download</span>
        Tải MD
      </button>
    </div>
  );
};

export default WesternMarkdownExport;
