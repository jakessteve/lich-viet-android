import React from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { WESTERN_INTERPRETATIONS } from '../../../services/astrology/interpretations';

const SIGNS = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];

export const WesternInterpretationPanel: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const sun = result.planets.find(p => p.body === 'sun');
  const moon = result.planets.find(p => p.body === 'moon');
  
  const ascIdx = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
  const ascSign = SIGNS[ascIdx];
  
  const mcIdx = Math.floor(((result.midheaven % 360) + 360) % 360 / 30);
  const mcSign = SIGNS[mcIdx];

  const getInterpretation = (point: string, sign: string, fallback: string) => {
    return WESTERN_INTERPRETATIONS[point]?.[sign] || fallback;
  };

  return (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
      <div className="card-header bg-indigo-50/50 dark:bg-indigo-900/10">
        <h3 className="section-title text-sm flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <span className="material-icons-round text-base">auto_awesome</span>
          Diễn Giải Nhanh (The Big Three)
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {sun && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl font-bold">
              ☉
            </div>
            <div>
              <h4 className="font-semibold text-sm">Mặt Trời ở {sun.sign}</h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                {getInterpretation('sun', sun.sign, 'Đại diện cho cái tôi, tính cách cốt lõi và ý chí nhận thức. Nó cho thấy sức sống, bản sắc và cách bạn thể hiện bản thân với thế giới.')}
              </p>
            </div>
          </div>
        )}
        
        {moon && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xl font-bold">
              ☽
            </div>
            <div>
              <h4 className="font-semibold text-sm">Mặt Trăng ở {moon.sign}</h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                {getInterpretation('moon', moon.sign, 'Đại diện cho bản chất cảm xúc, tiềm thức và thế giới nội tâm. Nó cho thấy nhu cầu an toàn, thói quen và cách bạn phản ứng theo bản năng.')}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            ASC
          </div>
          <div>
            <h4 className="font-semibold text-sm">Cung Mọc (Ascendant) ở {ascSign}</h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              {getInterpretation('ascendant', ascSign, 'Đại diện cho lớp mặt nạ bên ngoài, ấn tượng đầu tiên và cơ thể vật lý. Nó cho thấy cách bạn tiếp cận cuộc sống và cách người khác nhìn nhận bạn.')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm">
            MC
          </div>
          <div>
            <h4 className="font-semibold text-sm">Thiên Đỉnh (Midheaven) ở {mcSign}</h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              {getInterpretation('midheaven', mcSign, 'Đại diện cho sự nghiệp, danh tiếng và mục tiêu cuộc sống. Nó cho thấy hình ảnh công chúng và những gì bạn phấn đấu đạt được trong xã hội.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
