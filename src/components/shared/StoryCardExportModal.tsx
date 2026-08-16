/**
 * Story Card 9:16 Export Modal — Lịch Việt v3
 *
 * Generates a clean, aesthetic 9:16 mobile summary image (1080x1920 format)
 * with robust timeout protection to ensure the Android WebView never freezes.
 */

import React, { useRef, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { sanitizePlainText } from '@/utils/security';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Sparkles, CheckCircle2, Download, Share2, RotateCcw, Camera, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StoryCardExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  solarDate: string;
  westernArchetype?: string;
  tuViArchetype?: string;
  vedicArchetype?: string;
  superpower: string;
  actionCompass: string;
}

export const StoryCardExportModal: React.FC<StoryCardExportModalProps> = ({
  isOpen,
  onClose,
  name,
  solarDate,
  westernArchetype = 'Bạch Dương / Cung Mọc Sư Tử',
  tuViArchetype = 'Mệnh Tử Vi Thiên Phủ',
  vedicArchetype = 'Lagna Karka / Nakshatra Shravana',
  superpower,
  actionCompass,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const safeName = sanitizePlainText(name, 40) || 'Bản Thân';

  const generateImagePromise = async (): Promise<string> => {
    if (!cardRef.current) throw new Error('Không tìm thấy khung ảnh');

    // Run toPng with 3.5s timeout safety
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Quá thời gian tạo ảnh, vui lòng thử lại')), 3500),
    );

    const renderPromise = (async () => {
      try {
        return await toPng(cardRef.current!, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: true,
        });
      } catch {
        // Fallback to JPEG if PNG fails
        return await toJpeg(cardRef.current!, {
          quality: 0.9,
          pixelRatio: 1.5,
        });
      }
    })();

    return Promise.race([renderPromise, timeoutPromise]);
  };

  const handleGenerateImage = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const dataUrl = await generateImagePromise();
      setExportedImageUrl(dataUrl);
      return dataUrl;
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tạo ảnh, vui lòng thử lại');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedImageUrl) return;
    const link = document.createElement('a');
    link.download = `${safeName}_ban_menh_9x16.png`;
    link.href = exportedImageUrl;
    link.click();
  };

  const handleShare = async () => {
    let currentUrl = exportedImageUrl;
    if (!currentUrl) {
      currentUrl = await handleGenerateImage();
    }
    if (!currentUrl) return;

    const shareText = `✦ Bản Mệnh Tổng Hợp của ${safeName} (${solarDate}) ✦\n- Tây Phương: ${westernArchetype}\n- Tử Vi: ${tuViArchetype}\n- Vệ Đà: ${vedicArchetype}\n\n🌟 Bản sắc cốt lõi: ${superpower}\n🚀 Trọng tâm 2026: ${actionCompass}\n\nKhám phá tại LichViet.app`;

    // 1. Web Share API (if supported)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Try file sharing if Blob creation succeeds
        const blob = await (await fetch(currentUrl)).blob();
        const file = new File([blob], `${safeName}_story.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Bản Mệnh ${safeName}`,
            text: shareText,
            files: [file],
          });
          return;
        } else {
          await navigator.share({
            title: `Bản Mệnh ${safeName}`,
            text: shareText,
          });
          return;
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 2. Capacitor native Clipboard or Browser fallback
    try {
      if (Capacitor.isNativePlatform()) {
        await Clipboard.write({ string: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {
      handleDownload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6 space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              Xuất Story 9:16 (Instagram / TikTok)
            </DialogTitle>
          </div>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Tạo ảnh thẻ tổng hợp bản sắc cá nhân chuẩn tỉ lệ dọc 9:16 sắc nét để lưu trữ hoặc chia sẻ.
          </p>
        </DialogHeader>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {copiedToast && (
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-300 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Đã sao chép nội dung & thông tin bản mệnh vào bộ nhớ tạm!
          </div>
        )}

        {/* 9:16 Preview Card Container */}
        <div className="flex justify-center overflow-hidden rounded-2xl border border-gold/30 bg-[#0a0a1a] shadow-inner">
          <div
            ref={cardRef}
            className="w-[280px] h-[498px] bg-gradient-to-b from-[#0a0a1a] via-[#131428] to-[#0a0a1a] text-white p-5 flex flex-col justify-between select-none relative overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="space-y-1 text-center relative z-10">
              <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-400">
                ✦ LỊCH VIỆT · TỔNG QUAN BẢN MỆNH ✦
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-wide pt-1">{safeName}</h2>
              <p className="text-[10px] text-gray-400">{solarDate}</p>
            </div>

            {/* 3 Pillars Badge Row */}
            <div className="space-y-1.5 text-[10px] relative z-10">
              <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-amber-300 font-semibold">Tây Phương:</span>
                <span className="text-gray-200 truncate max-w-[150px]">{westernArchetype}</span>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-indigo-300 font-semibold">Tử Vi:</span>
                <span className="text-gray-200 truncate max-w-[150px]">{tuViArchetype}</span>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-rose-300 font-semibold">Vệ Đà:</span>
                <span className="text-gray-200 truncate max-w-[150px]">{vedicArchetype}</span>
              </div>
            </div>

            {/* Core Trait Highlight */}
            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/30 p-3 text-center space-y-1 relative z-10">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">🌟 BẢN SẮC CỐT LÕI</div>
              <p className="text-[11px] leading-relaxed font-medium text-gray-100">{superpower}</p>
            </div>

            {/* 2026 Action Focus */}
            <div className="text-center space-y-0.5 relative z-10">
              <div className="text-[9px] font-bold uppercase tracking-wider text-sky-400">
                🚀 ĐỊNH HƯỚNG TRỌNG TÂM 2026
              </div>
              <p className="text-[10px] leading-relaxed text-gray-300">{actionCompass}</p>
            </div>

            {/* Card Footer Watermark */}
            <div className="text-center text-[8px] text-gray-500 tracking-wider pt-1 border-t border-white/10">
              LichViet.app · Khám phá tiềm năng Thân - Tâm - Trí
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!exportedImageUrl ? (
            <Button
              type="button"
              onClick={handleGenerateImage}
              disabled={isExporting}
              variant="gold"
              className="flex-1 gap-1.5 text-xs font-bold text-black"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {isExporting ? 'Đang tạo ảnh...' : 'Tạo Ảnh Bản Mệnh'}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleDownload}
                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                <Download className="h-4 w-4" />
                Lưu Ảnh
              </Button>
              <Button
                type="button"
                onClick={handleShare}
                className="flex-1 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                <Share2 className="h-4 w-4" />
                Chia Sẻ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateImage}
                title="Tạo lại ảnh"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
