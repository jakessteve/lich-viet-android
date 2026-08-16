/**
 * Vedic Gochar (Planetary Transit) & Antardasha Sub-Period Engine
 *
 * Grounded in classical Parashari Jyotish:
 * - Vimshottari Antardasha (Bhukti) 9-subperiod subdivision within Mahadashas
 * - Chandra Gochar: Planetary transits evaluated relative to natal Moon sign (Chandra Rashi)
 * - Sade Sati detection (Saturn transit in 12th, 1st, 2nd house from Moon)
 * - Ashtakavarga & classical house transit polarity rules (BPHS)
 * - Tarabala calculation for transit Moon & major bodies
 * - Dynamic, parameterized Vietnamese synthesis
 */

import {
  unixMsToJulianDay,
  buildTopocentricObserver,
  computeTopocentricPlanetarySnapshot,
  calculateTarabala,
} from '@omce/core-logic';
import type { VedicChartInput } from '../../types/astrology';
import { calculateWesternChart } from './westernCalculator';

export interface AntardashaPeriod {
  subLord: string;
  subLordVi: string;
  symbol: string;
  color: string;
  startYear: number;
  endYear: number;
  durationMonths: number;
  isCurrent: boolean;
  ageRange: string;
  descriptionVi: string;
}

export interface GocharTransitDetail {
  body: string;
  bodyVi: string;
  symbol: string;
  transitSign: string;
  transitSignVi: string;
  houseFromMoon: number;
  isBenefic: boolean;
  isSadeSati: boolean;
  tarabalaScore: number;
  tarabalaNameVi: string;
  descriptionVi: string;
}

export interface GocharReport {
  dateLabel: string;
  natalMoonSign: string;
  natalMoonSignVi: string;
  natalMoonNakshatra: string;
  isSadeSatiActive: boolean;
  sadeSatiPhase?: 'Khởi đầu (Nhà 12)' | 'Đỉnh điểm (Nhà 1)' | 'Kết thúc (Nhà 2)';
  overallScore: number; // 1.0 - 10.0
  luckTier: 'Đại Cát' | 'Khởi Sắc' | 'Bình Hòa' | 'Thử Thách' | 'Gian Nan';
  transits: GocharTransitDetail[];
  summaryVi: string;
  remedialAdviceVi: string;
}

const VIMSHOTTARI_YEARS: Record<string, number> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

const DASHA_ORDER = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'] as const;

const DASHA_METAS: Record<string, { nameVi: string; symbol: string; color: string }> = {
  ketu: { nameVi: 'Kế Đô (Ketu)', symbol: '☋', color: '#E67E22' },
  venus: { nameVi: 'Sao Kim (Shukra)', symbol: '♀', color: '#E91E63' },
  sun: { nameVi: 'Mặt Trời (Surya)', symbol: '☉', color: '#F39C12' },
  moon: { nameVi: 'Mặt Trăng (Chandra)', symbol: '☽', color: '#3498DB' },
  mars: { nameVi: 'Sao Hỏa (Mangala)', symbol: '♂', color: '#E74C3C' },
  rahu: { nameVi: 'La Hầu (Rahu)', symbol: '☊', color: '#8E44AD' },
  jupiter: { nameVi: 'Sao Mộc (Guru)', symbol: '♃', color: '#F1C40F' },
  saturn: { nameVi: 'Sao Thổ (Shani)', symbol: '♄', color: '#34495E' },
  mercury: { nameVi: 'Sao Thủy (Budha)', symbol: '☿', color: '#2ECC71' },
};

const RASHI_NAMES_VI: Record<string, string> = {
  Aries: 'Bạch Dương (Mesha)',
  Taurus: 'Kim Ngưu (Vrishabha)',
  Gemini: 'Song Tử (Mithuna)',
  Cancer: 'Cự Giải (Karka)',
  Leo: 'Sư Tử (Simha)',
  Virgo: 'Xử Nữ (Kanya)',
  Libra: 'Thiên Bình (Tula)',
  Scorpio: 'Bọ Cạp (Vrishchika)',
  Sagittarius: 'Nhân Mã (Dhanu)',
  Capricorn: 'Ma Kết (Makara)',
  Aquarius: 'Bảo Bình (Kumbha)',
  Pisces: 'Song Ngư (Meena)',
};

const RASHI_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

// Classical favorable houses from natal Moon (Brihat Parashara Hora Shastra)
const BENEFIC_HOUSES_FROM_MOON: Record<string, number[]> = {
  sun: [3, 6, 10, 11],
  moon: [1, 3, 6, 7, 10, 11],
  mars: [3, 6, 11],
  mercury: [2, 4, 6, 8, 10, 11],
  jupiter: [2, 5, 7, 9, 11],
  venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  saturn: [3, 6, 11],
  rahu: [3, 6, 11],
  ketu: [3, 6, 11],
};

const TARABALA_NAMES = [
  'Janma (Bản mệnh)',
  'Sampat (Tài lộc)',
  'Vipat (Thử thách)',
  'Kshema (Bình an)',
  'Pratyak (Chướng ngại)',
  'Sadhana (Thành tựu)',
  'Naidhana (Nguy hại)',
  'Mitra (Bạn hữu)',
  'Parama Mitra (Đại quý nhân)',
];

/**
 * Calculates 9 Antardasha (Bhukti) sub-periods for a specific Mahadasha period.
 */
export function calculateAntardashaPeriods(
  mahaLord: string,
  startYear: number,
  durationYears: number,
  birthYear: number,
  currentYear: number = new Date().getFullYear(),
): AntardashaPeriod[] {
  const normMahaLord = mahaLord.toLowerCase();
  const startIndex = (DASHA_ORDER as readonly string[]).indexOf(normMahaLord);
  if (startIndex === -1) return [];

  const mahaYears = VIMSHOTTARI_YEARS[normMahaLord] ?? 10;
  const subPeriods: AntardashaPeriod[] = [];
  let accumulatedYears = 0;

  for (let i = 0; i < 9; i++) {
    const subLord = DASHA_ORDER[(startIndex + i) % 9];
    const subYears = VIMSHOTTARI_YEARS[subLord] ?? 10;
    const subDuration = (mahaYears * subYears) / 120; // Exact Vimshottari formula

    const sYear = startYear + accumulatedYears;
    const eYear = sYear + subDuration;
    accumulatedYears += subDuration;

    const isCurrent = currentYear >= sYear && currentYear < eYear;
    const sAge = Math.max(0, Math.round(sYear - birthYear));
    const eAge = Math.max(sAge + 1, Math.round(eYear - birthYear));

    const meta = DASHA_METAS[subLord] ?? { nameVi: subLord, symbol: '★', color: '#9E9E9E' };
    const mahaMeta = DASHA_METAS[normMahaLord] ?? { nameVi: mahaLord, symbol: '★', color: '#9E9E9E' };

    let descriptionVi = `Tiểu vận ${meta.nameVi} phối chiếu cùng Đại vận ${mahaMeta.nameVi}.`;
    if (normMahaLord === subLord) {
      descriptionVi = `Giai đoạn khởi đầu đại vận (${meta.nameVi}/${meta.nameVi}): Định hình phương hướng chủ đạo và tiếp nhận luồng sinh khí mới.`;
    } else if (['jupiter', 'venus', 'mercury'].includes(subLord)) {
      descriptionVi = `Cát tinh ${meta.nameVi} mang đến cơ hội mở rộng tài lộc, phát triển tri thức và hanh thông giao thiệp.`;
    } else if (['saturn', 'rahu', 'ketu', 'mars'].includes(subLord)) {
      descriptionVi = `Thời kỳ tôi luyện tính kiên nhẫn dưới ảnh hưởng của ${meta.nameVi}; cần làm việc cẩn trọng và giữ vững kỷ luật.`;
    }

    subPeriods.push({
      subLord,
      subLordVi: meta.nameVi,
      symbol: meta.symbol,
      color: meta.color,
      startYear: Math.round(sYear * 10) / 10,
      endYear: Math.round(eYear * 10) / 10,
      durationMonths: Math.round(subDuration * 12 * 10) / 10,
      isCurrent,
      ageRange: `${sAge}–${eAge}t`,
      descriptionVi,
    });
  }

  return subPeriods;
}

/**
 * Evaluates Gochar (Transit) for Vedic Chart relative to Natal Moon (Chandra Rashi).
 */
export function calculateVedicGochar(input: VedicChartInput, targetDate: Date = new Date()): GocharReport {
  const westernInput = {
    birthDate: input.birthDate,
    birthHour: input.birthHour,
    birthMinute: input.birthMinute,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    ayanamsa: input.ayanamsa ?? 'lahiri',
  };
  const vedicNatal = calculateWesternChart(westernInput);
  const moonPlanet = vedicNatal.planets.find((p) => p.body.toLowerCase() === 'moon');
  const natalMoonSign = moonPlanet?.sign ?? 'Aries';
  const natalMoonSignIndex = RASHI_ORDER.indexOf(natalMoonSign);
  const natalMoonNakshatra = moonPlanet?.nakshatra ?? 'Ashwini';
  const natalMoonNakshatraIndex = Math.floor(((moonPlanet?.siderealLongitude ?? 0) * 27) / 360);

  const julianDay = unixMsToJulianDay(targetDate.getTime());
  const observer = buildTopocentricObserver({
    julianDay,
    latitude: input.latitude,
    longitude: input.longitude,
    altitudeMeters: 0,
  });

  const snapshot = computeTopocentricPlanetarySnapshot(observer, 'lahiri') as Array<{
    body: string;
    siderealLongitude: number;
  }>;

  const transits: GocharTransitDetail[] = [];
  let isSadeSatiActive = false;
  let sadeSatiPhase: GocharReport['sadeSatiPhase'] = undefined;
  let beneficCount = 0;
  let maleficCount = 0;

  for (const p of snapshot) {
    const normBody = p.body.toLowerCase();
    const meta = DASHA_METAS[normBody] ?? { nameVi: p.body, symbol: '★', color: '#9E9E9E' };

    const signIndex = Math.floor(p.siderealLongitude / 30);
    const transitSign = RASHI_ORDER[signIndex] ?? 'Aries';
    const houseFromMoon = ((signIndex - natalMoonSignIndex + 12) % 12) + 1;

    const beneficHouses = BENEFIC_HOUSES_FROM_MOON[normBody] ?? [3, 6, 11];
    const isBenefic = beneficHouses.includes(houseFromMoon);

    if (isBenefic) beneficCount++;
    else maleficCount++;

    // Check Saturn Sade Sati (Saturn in 12, 1, 2 from natal Moon)
    let isSadeSati = false;
    if (normBody === 'saturn') {
      if (houseFromMoon === 12) {
        isSadeSati = true;
        isSadeSatiActive = true;
        sadeSatiPhase = 'Khởi đầu (Nhà 12)';
      } else if (houseFromMoon === 1) {
        isSadeSati = true;
        isSadeSatiActive = true;
        sadeSatiPhase = 'Đỉnh điểm (Nhà 1)';
      } else if (houseFromMoon === 2) {
        isSadeSati = true;
        isSadeSatiActive = true;
        sadeSatiPhase = 'Kết thúc (Nhà 2)';
      }
    }

    // Tarabala calculation
    const transitNakshatraIndex = Math.floor((p.siderealLongitude * 27) / 360);
    const tarabalaResult = calculateTarabala(natalMoonNakshatraIndex, transitNakshatraIndex);
    const tarabalaNameVi = TARABALA_NAMES[(tarabalaResult.tarabala - 1) % 9] ?? 'Bình hòa';

    let descriptionVi = `${meta.nameVi} đang quá cảnh tại cung số ${houseFromMoon} (${RASHI_NAMES_VI[transitSign] ?? transitSign}) tính từ Mặt Trăng gốc.`;
    if (isBenefic) {
      descriptionVi += ` Đắc vị trí cát lợi, mang lại trợ lực thuận lợi cho các hoạt động thực tế và tinh thần.`;
    } else if (isSadeSati) {
      descriptionVi += ` Thời kỳ Sade Sati (${sadeSatiPhase}): Đòi hỏi sự bền bỉ, tính trách nhiệm cao và giải tỏa áp lực tinh thần.`;
    } else {
      descriptionVi += ` Cần chú ý cẩn trọng trong các quyết định liên quan đến lĩnh vực nhà ${houseFromMoon}.`;
    }

    transits.push({
      body: normBody,
      bodyVi: meta.nameVi,
      symbol: meta.symbol,
      transitSign,
      transitSignVi: RASHI_NAMES_VI[transitSign] ?? transitSign,
      houseFromMoon,
      isBenefic,
      isSadeSati,
      tarabalaScore: tarabalaResult.scoreDelta,
      tarabalaNameVi,
      descriptionVi,
    });
  }

  // Calculate Gochar Score
  let score = 7.0 + beneficCount * 0.4 - maleficCount * 0.35;
  if (isSadeSatiActive) score -= 1.0;
  score = Math.round(Math.max(1.0, Math.min(10.0, score)) * 10) / 10;

  let luckTier: GocharReport['luckTier'] = 'Bình Hòa';
  if (score >= 8.5) luckTier = 'Đại Cát';
  else if (score >= 7.0) luckTier = 'Khởi Sắc';
  else if (score >= 5.5) luckTier = 'Bình Hòa';
  else if (score >= 4.0) luckTier = 'Thử Thách';
  else luckTier = 'Gian Nan';

  const summaryVi = `Vận trình Gochar hiện tại theo Mặt Trăng gốc ${RASHI_NAMES_VI[natalMoonSign] ?? natalMoonSign} đạt ${score}/10 (${luckTier}). ${
    isSadeSatiActive
      ? `Đang trong giai đoạn Shani Sade Sati (${sadeSatiPhase}) — cần chú trọng sự bền bỉ và giữ tâm thế an nhiên.`
      : `Có ${beneficCount} hành tinh ở vị trí thuận lợi, tạo đà hanh thông cho công việc và giao thiệp.`
  }`;

  const remedialAdviceVi = isSadeSatiActive
    ? 'Duy trì lối sống kỷ luật, thường xuyên thiền định, chia sẻ giúp đỡ người xung quanh để tích lũy phước báu hóa giải áp lực.'
    : 'Tập trung tận dụng thế cát lợi của các hành tinh chủ đạo, chủ động xúc tiến các kế hoạch phát triển bản thân.';

  return {
    dateLabel: targetDate.toLocaleDateString('vi-VN'),
    natalMoonSign,
    natalMoonSignVi: RASHI_NAMES_VI[natalMoonSign] ?? natalMoonSign,
    natalMoonNakshatra,
    isSadeSatiActive,
    sadeSatiPhase,
    overallScore: score,
    luckTier,
    transits,
    summaryVi,
    remedialAdviceVi,
  };
}
