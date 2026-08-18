import { computeVimshottariDasha } from '@lich-viet/core-logic';
import { calculateAntardashaPeriods, type AntardashaPeriod } from './gocharAnalysis';

export interface DashaPeriod {
  lord: string;
  lordVi: string;
  symbol: string;
  color: string;
  startYear: number;
  endYear: number;
  durationYears: number;
  isCurrent: boolean;
  ageRange: string;
  descriptionVi: string;
  antardashas?: AntardashaPeriod[];
}

export interface VimshottariDashaResult {
  periods: DashaPeriod[];
  currentPeriod: DashaPeriod | null;
  birthNakshatraIndex: number;
  balanceYears: number;
}

const DASHA_METAS: Record<string, { nameVi: string; symbol: string; color: string; descVi: string }> = {
  ketu: {
    nameVi: 'Kế Đô (Ketu)',
    symbol: '☋',
    color: '#E67E22',
    descVi: 'Giai đoạn chiêm nghiệm tâm linh, buông bỏ chấp niệm và tìm kiếm sự giải thoát nội tâm.',
  },
  venus: {
    nameVi: 'Sao Kim (Shukra)',
    symbol: '♀',
    color: '#E91E63',
    descVi: 'Giai đoạn thăng hoa về tình duyên, nghệ thuật, tiện nghi vật chất và các mối quan hệ xã hội.',
  },
  sun: {
    nameVi: 'Mặt Trời (Surya)',
    symbol: '☉',
    color: '#F39C12',
    descVi: 'Thời kỳ khẳng định uy quyền, nâng cao danh tiếng, phát triển sự nghiệp và tỏa sáng vị thế.',
  },
  moon: {
    nameVi: 'Mặt Trăng (Chandra)',
    symbol: '☽',
    color: '#3498DB',
    descVi: 'Giai đoạn nhạy bén về cảm xúc, phát triển gia đạo, sự bình yên tâm hồn và trực giác.',
  },
  mars: {
    nameVi: 'Sao Hỏa (Mangala)',
    symbol: '♂',
    color: '#E74C3C',
    descVi: 'Thời kỳ dồi dào năng lượng hành động, dũng cảm đối đầu thử thách, mua sắm tài sản đất đai.',
  },
  rahu: {
    nameVi: 'La Hầu (Rahu)',
    symbol: '☊',
    color: '#8E44AD',
    descVi: 'Giai đoạn bùng nổ tham vọng, nhiều đột phá bất ngờ, mở rộng kinh doanh nhưng cần tránh bốc đồng.',
  },
  jupiter: {
    nameVi: 'Sao Mộc (Guru)',
    symbol: '♃',
    color: '#F1C40F',
    descVi: 'Thời kỳ đại cát tinh che chở: mở rộng tri thức, con cái thuận hòa, tài lộc dồi dào và phước lành.',
  },
  saturn: {
    nameVi: 'Sao Thổ (Shani)',
    symbol: '♄',
    color: '#34495E',
    descVi: 'Giai đoạn rèn luyện tính kỷ luật, kiên trì vượt qua khó khăn để xây dựng thành tựu bền vững lâu dài.',
  },
  mercury: {
    nameVi: 'Sao Thủy (Budha)',
    symbol: '☿',
    color: '#2ECC71',
    descVi: 'Thời kỳ rực rỡ về học vấn, thương mại, giao tiếp, ngoại giao và phát triển các ý tưởng kinh doanh.',
  },
};

export function calculateVedicDashaTimeline(
  moonSiderealLongitude: number,
  birthYear: number,
  currentYear: number = new Date().getFullYear(),
): VimshottariDashaResult {
  const rawDashas = computeVimshottariDasha(moonSiderealLongitude, 0, birthYear);

  const periods: DashaPeriod[] = rawDashas.map(
    (d: { lord: string; startYear: number; endYear: number; duration: number }) => {
      const meta = DASHA_METAS[d.lord.toLowerCase()] ?? {
        nameVi: d.lord,
        symbol: '★',
        color: '#9E9E9E',
        descVi: 'Giai đoạn đại vận hành tinh.',
      };

      const sYear = Math.round(d.startYear * 10) / 10;
      const eYear = Math.round(d.endYear * 10) / 10;
      const isCurrent = currentYear >= sYear && currentYear < eYear;

      const startAge = Math.max(0, Math.round(sYear - birthYear));
      const endAge = Math.round(eYear - birthYear);

      const antardashas = calculateAntardashaPeriods(d.lord, sYear, d.duration, birthYear, currentYear);

      return {
        lord: d.lord,
        lordVi: meta.nameVi,
        symbol: meta.symbol,
        color: meta.color,
        startYear: sYear,
        endYear: eYear,
        durationYears: Math.round(d.duration * 10) / 10,
        isCurrent,
        ageRange: `${startAge} - ${endAge} tuổi`,
        descriptionVi: meta.descVi,
        antardashas,
      };
    },
  );

  const currentPeriod = periods.find((p) => p.isCurrent) ?? periods[0] ?? null;
  const nakshatraIndex = Math.floor((((moonSiderealLongitude % 360) + 360) % 360) / (360 / 27));

  return {
    periods,
    currentPeriod,
    birthNakshatraIndex: nakshatraIndex,
    balanceYears: periods[0]?.durationYears ?? 0,
  };
}
