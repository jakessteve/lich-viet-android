import React from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const SIGNS_SIDEREAL = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư',
];

export const VedicInterpretationPanel: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const moon = result.planets.find(p => p.body === 'moon');
  
  const ascIdx = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
  const ascSign = SIGNS_SIDEREAL[ascIdx];
  
  // Calculate Atmakaraka (Planet with highest degree, excluding Rahu/Ketu/Uranus/Neptune/Pluto)
  const mainPlanets = result.planets.filter(p => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.body));
  let atmakaraka = mainPlanets[0];
  for (const p of mainPlanets) {
    if (p.degreeInSign > atmakaraka.degreeInSign) {
      atmakaraka = p;
    }
  }

  const BODY_LABELS: Record<string, string> = {
    sun: 'Mặt Trời',
    moon: 'Mặt Trăng',
    mercury: 'Sao Thủy',
    venus: 'Sao Kim',
    mars: 'Sao Hỏa',
    jupiter: 'Sao Mộc',
    saturn: 'Sao Thổ',
  };

  return (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
      <div className="card-header bg-purple-50/50 dark:bg-purple-900/10">
        <h3 className="section-title text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <span className="material-icons-round text-base">psychology</span>
          Diễn Giải Nhanh (Jyotish Pillars)
        </h3>
      </div>
      <div className="p-4 space-y-4">
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            AS
          </div>
          <div>
            <h4 className="font-semibold text-sm">Lagna (Cung Mọc) ở {ascSign}</h4>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
              Điểm quan trọng nhất trong lá số Vệ Đà. Đại diện cho bản ngã, con đường cuộc đời, cơ thể vật lý và cách bạn tiếp cận thế giới.
            </p>
          </div>
        </div>

        {moon && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xl font-bold">
              ☽
            </div>
            <div>
              <h4 className="font-semibold text-sm">Rasi (Mặt Trăng) ở {SIGNS_SIDEREAL[Math.floor(moon.siderealLongitude / 30)]}</h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                Đại diện cho tâm trí (Manas) và cảm xúc. Rasi là nền tảng để xem xét các vận hạn (Gochara) trong cuộc sống hàng ngày.
              </p>
            </div>
          </div>
        )}

        {moon && moon.nakshatra && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">
              ★
            </div>
            <div>
              <h4 className="font-semibold text-sm">Janma Nakshatra: {moon.nakshatra} {moon.pada != null ? `(Pada ${moon.pada + 1})` : ''}</h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                Chòm sao nơi Mặt Trăng ngự trị khi sinh. Quyết định khung tâm trí bẩm sinh và là điểm bắt đầu của chu kỳ đại vận Vimshottari Dasha.
              </p>
            </div>
          </div>
        )}

        {atmakaraka && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">
              AK
            </div>
            <div>
              <h4 className="font-semibold text-sm">Atmakaraka: {BODY_LABELS[atmakaraka.body] || atmakaraka.body}</h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                Hành tinh có độ số cao nhất trong cung. Đại diện cho "chủ tinh linh hồn", chỉ ra khát vọng sâu sắc nhất và bài học nghiệp quả chính trong kiếp này.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
