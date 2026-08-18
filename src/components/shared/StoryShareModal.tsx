import React, { useState, useRef } from 'react';
import { Sparkles, X, Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  solarDateStr: string;
  lunarDateStr: string;
  verdict: string;
  goodHours?: string[];
  quote?: string;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  isOpen,
  onClose,
  title,
  solarDateStr,
  lunarDateStr,
  verdict,
  goodHours = ['Giờ Thìn (07:00–09:00)', 'Giờ Tỵ (09:00–11:00)'],
  quote = 'Vạn sự tùy duyên khởi, Tâm an vạn sự lành.',
}) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1'>('9:16');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    const text = `✨ LỊCH VIỆT · ${title}\n📅 Dương lịch: ${solarDateStr}\n🌙 Âm lịch: ${lunarDateStr}\n🌟 Đánh giá: ${verdict}\n⏰ Khung giờ tốt: ${goodHours.join(', ')}\n💬 "${quote}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-light dark:bg-surface-dark border border-border-light/60 dark:border-border-dark/60 rounded-3xl shadow-2xl max-w-md w-full p-5 space-y-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold dark:text-gold-dark" />
            <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
              Chia Sẻ Ngày Lành
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-subtle-light dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ratio Selector */}
        <div className="flex items-center justify-center gap-2 bg-surface-subtle-light dark:bg-surface-elevated-dark p-1 rounded-xl">
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all interactive-press ${
              aspectRatio === '9:16'
                ? 'bg-white dark:bg-white/10 text-text-primary-light dark:text-gold-dark shadow-xs'
                : 'text-text-secondary-light dark:text-text-secondary-dark'
            }`}
          >
            Tỷ lệ Story (9:16)
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all interactive-press ${
              aspectRatio === '1:1'
                ? 'bg-white dark:bg-white/10 text-text-primary-light dark:text-gold-dark shadow-xs'
                : 'text-text-secondary-light dark:text-text-secondary-dark'
            }`}
          >
            Tỷ lệ Vuông (1:1)
          </button>
        </div>

        {/* Preview Card */}
        <div className="flex justify-center items-center py-2">
          <div
            ref={cardRef}
            className={`w-full max-w-[280px] rounded-2xl p-5 flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 shadow-xl border border-gold/30 bg-gradient-to-b from-[#141428] via-[#0a0a1a] to-[#121226] text-white ${
              aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
            }`}
          >
            {/* Background Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-gold/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Brand */}
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold-dark/90">
                LỊCH VIỆT · BẢN SẮC Á ĐÔNG
              </span>
              <div className="h-0.5 w-8 bg-gold-dark/40 mx-auto rounded-full" />
            </div>

            {/* Middle Content */}
            <div className="space-y-2.5 my-auto relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold-dark text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                {title}
              </div>

              <div className="space-y-0.5">
                <p className="text-xl font-bold font-display tracking-tight text-amber-100">{solarDateStr}</p>
                <p className="text-xs text-amber-200/80 font-medium">Âm lịch: {lunarDateStr}</p>
              </div>

              <p className="text-xs text-emerald-300 font-semibold bg-emerald-950/40 border border-emerald-500/20 py-1.5 px-2.5 rounded-xl">
                {verdict}
              </p>

              {aspectRatio === '9:16' && (
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Khung Giờ Vàng</span>
                  <div className="flex flex-col gap-1">
                    {goodHours.slice(0, 2).map((h, i) => (
                      <span key={i} className="text-xs text-amber-200/90 font-medium">
                        ⭐ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quote */}
            <div className="pt-2 relative z-10 border-t border-white/10">
              <p className="text-[11px] italic text-gray-300 font-serif leading-tight">&ldquo;{quote}&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyText}
            className="flex-1 h-11 rounded-xl text-xs font-semibold gap-1.5 border-border-light/60 dark:border-border-dark/60"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-good dark:text-good-dark" />
                <span>Đã sao chép chữ!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Sao chép nội dung</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={handleCopyText}
            className="flex-1 h-11 rounded-xl text-xs font-semibold gap-1.5 bg-gold hover:bg-gold-light text-white"
          >
            <Share2 className="h-4 w-4" />
            <span>Chia sẻ nhanh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryShareModal;
