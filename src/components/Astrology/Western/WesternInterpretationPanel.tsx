import React from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const SIGNS = [
  'Bạch Dương',
  'Kim Ngưu',
  'Song Tử',
  'Cự Giải',
  'Sư Tử',
  'Xử Nữ',
  'Thiên Bình',
  'Bọ Cạp',
  'Nhân Mã',
  'Ma Kết',
  'Bảo Bình',
  'Song Ngư',
];

const HOUSE_THEMES: Record<number, string> = {
  1: 'Bản sắc & phong thái tự lập',
  2: 'Tài chính & giá trị cá nhân',
  3: 'Tư duy & kết nối giao tiếp',
  4: 'Nền tảng gia đạo & nội tâm',
  5: 'Sáng tạo & niềm vui sống',
  6: 'Sức khỏe & tinh thần phụng sự',
  7: 'Hôn nhân & đối tác đồng hành',
  8: 'Chuyển hóa & chiều sâu tâm lý',
  9: 'Triết lý & mở rộng chân trời',
  10: 'Sự nghiệp & đỉnh cao danh vọng',
  11: 'Lý tưởng & mạng lưới cộng đồng',
  12: 'Tiềm thức & tâm linh tĩnh tại',
};

export const WesternInterpretationPanel: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const sun = result.planets.find((p) => p.body === 'sun');
  const moon = result.planets.find((p) => p.body === 'moon');

  const ascIdx = Math.floor((((result.ascendant % 360) + 360) % 360) / 30);
  const ascSign = SIGNS[ascIdx] ?? 'Bạch Dương';
  const ascDeg = (result.ascendant % 30).toFixed(1);

  const mcIdx = Math.floor((((result.midheaven % 360) + 360) % 360) / 30);
  const mcSign = SIGNS[mcIdx] ?? 'Ma Kết';
  const mcDeg = (result.midheaven % 30).toFixed(1);

  // Day vs Night Sect
  const isDiurnal = sun ? [7, 8, 9, 10, 11, 12].includes(sun.house) : true;

  return (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
      <div className="card-header bg-astral-surface-light/50 dark:bg-astral-surface-dark/30 flex items-center justify-between">
        <h3 className="section-title text-sm flex items-center gap-2 text-astral-primary dark:text-astral-primary-dark font-bold">
          <span className="material-icons-round text-base">auto_awesome</span>
          Diễn Giải Nhanh (The Big Three & Trọng Tâm Vận Mệnh)
        </h3>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-astral-primary/10 text-astral-primary dark:text-astral-primary-dark">
          {isDiurnal ? '☀️ Lá Số Ban Ngày (Diurnal)' : '🌙 Lá Số Ban Đêm (Nocturnal)'}
        </span>
      </div>
      <div className="p-4 space-y-4">
        {sun && (
          <div className="flex gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-center leading-none select-none text-amber-800 dark:text-amber-300 text-xl font-bold">
              ☉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  Mặt Trời ở {sun.sign} ({sun.degreeInSign.toFixed(1)}°) — Nhà {sun.house}
                </h4>
                <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                  [{HOUSE_THEMES[sun.house] ?? `Nhà ${sun.house}`}]
                </span>
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                Ý chí nhận thức cốt lõi và sức sống tự thân được tôi luyện trong lĩnh vực{' '}
                {HOUSE_THEMES[sun.house]?.toLowerCase() ?? `Nhà ${sun.house}`}. Khí chất {sun.sign} giúp bạn định hình
                mục tiêu cuộc sống rõ ràng và phong cách hành động tự tin.
              </p>
            </div>
          </div>
        )}

        {moon && (
          <div className="flex gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-center leading-none select-none text-slate-600 dark:text-slate-300 text-xl font-bold">
              ☽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  Mặt Trăng ở {moon.sign} ({moon.degreeInSign.toFixed(1)}°) — Nhà {moon.house}
                </h4>
                <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                  [{HOUSE_THEMES[moon.house] ?? `Nhà ${moon.house}`}]
                </span>
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                Nhu cầu an toàn cảm xúc và trực giác nội tâm gắn liền với{' '}
                {HOUSE_THEMES[moon.house]?.toLowerCase() ?? `Nhà ${moon.house}`}. Khí chất {moon.sign} định hình cách
                bạn nuôi dưỡng bản thân và phản xạ bản năng trước những biến động cuộc sống.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-center leading-none select-none text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            ASC
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              Cung Mọc (Ascendant) ở {ascSign} ({ascDeg}°)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              Điểm khởi đầu của lá số (Nhà 1): Đại diện cho phong thái tiếp cận cuộc sống, ấn tượng ban đầu và năng
              lượng thể chất. Phong thái {ascSign} giúp bạn tạo dựng sự tín nhiệm và định vị bản sắc cá nhân trong môi
              trường xã hội.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-center leading-none select-none text-sky-600 dark:text-sky-400 font-bold text-sm">
            MC
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              Thiên Đỉnh (Midheaven) ở {mcSign} ({mcDeg}°)
            </h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              Đỉnh cao của biểu đồ (Nhà 10): Định hướng con đường công danh sự nghiệp, uy tín công chúng và lý tưởng
              phụng sự xã hội theo phong cách chuẩn mực và bền bỉ của {mcSign}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
