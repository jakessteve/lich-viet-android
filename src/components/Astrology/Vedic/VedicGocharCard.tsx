import React from 'react';
import type { GocharReport } from '@/services/astrology/gocharAnalysis';
import CollapsibleCard from '../../CollapsibleCard';

export const VedicGocharCard: React.FC<{ gochar: GocharReport }> = ({ gochar }) => {
  return (
    <CollapsibleCard
      title={`Vận Hạn Gochar (Quá Cảnh Theo Mặt Trăng Rashi) — ${gochar.dateLabel}`}
      icon="track_changes"
      defaultOpen
      collapseOnMobile={false}
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Executive Overview Banner */}
        <div className="rounded-xl bg-purple-500/10 dark:bg-purple-900/20 border border-purple-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                Mặt Trăng Gốc (Chandra Rashi): <strong>{gochar.natalMoonSignVi}</strong>
              </span>
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                · Nakshatra: {gochar.natalMoonNakshatra}
              </span>
            </div>
            <p className="text-xs text-text-primary-light dark:text-text-primary-dark leading-relaxed">
              {gochar.summaryVi}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                gochar.luckTier === 'Đại Cát'
                  ? 'bg-good/15 text-good dark:text-good-dark border-good/40'
                  : gochar.luckTier === 'Khởi Sắc'
                    ? 'bg-info/15 text-info dark:text-info-dark border-info/40'
                    : gochar.luckTier === 'Bình Hòa'
                      ? 'bg-gold/15 text-gold-light dark:text-gold-dark border-gold/40'
                      : 'bg-bad/15 text-bad dark:text-bad-dark border-bad/40'
              }`}
            >
              {gochar.luckTier} · {gochar.overallScore}/10
            </span>
          </div>
        </div>

        {/* Sade Sati Alert Callout */}
        {gochar.isSadeSatiActive && (
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-900/20 border border-amber-500/40 p-3 flex items-start gap-2.5">
            <span className="material-icons-round text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5">
              warning_amber
            </span>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">
                Cảnh Báo Vận Hạn: Shani Sade Sati ({gochar.sadeSatiPhase})
              </span>
              <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Sao Thổ (Shani) đang quá cảnh gần Mặt Trăng gốc. Đây là chu kỳ 7.5 năm tôi luyện ý chí, đòi hỏi tính kỷ luật, sự kiên định và buông bỏ nóng vội để kiến tạo nền móng vững bền.
              </p>
              <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300/90 pt-0.5">
                💡 Khuyên giải: {gochar.remedialAdviceVi}
              </p>
            </div>
          </div>
        )}

        {/* Planetary Transit Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
              <span className="material-icons-round text-sm text-purple-600 dark:text-purple-400">explore</span>
              Vị Trí Các Hành Tinh Quá Cảnh So Với Cung Mặt Trăng
            </span>
            <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
              9 hành tinh chính
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {gochar.transits.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border-light/50 dark:border-border-dark/50 bg-surface-subtle-light/60 dark:bg-surface-elevated-dark/40 space-y-1.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                    <span>{t.symbol}</span>
                    {t.bodyVi}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        t.isBenefic
                          ? 'bg-good/15 text-good dark:text-good-dark'
                          : 'bg-bad/15 text-bad dark:text-bad-dark'
                      }`}
                    >
                      {t.isBenefic ? 'Cát Lợi' : 'Thử Thách'}
                    </span>
                    <span className="text-micro font-mono bg-purple-500/10 text-purple-700 dark:text-purple-300 px-1 py-0.2 rounded">
                      Nhà {t.houseFromMoon}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-between">
                  <span>Cung: {t.transitSignVi.split(' ')[0]}</span>
                  <span>Tarabala: {t.tarabalaNameVi.split(' ')[0]}</span>
                </div>

                <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed pt-0.5">
                  {t.descriptionVi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default VedicGocharCard;
