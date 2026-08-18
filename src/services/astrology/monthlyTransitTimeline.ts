/**
 * Western Astrology Monthly Transit Timeline & Predictive Heatmap Engine
 *
 * Grounded in classical and modern Western predictive astrology:
 * - 12-month planetary transit timeline using Swiss Ephemeris topocentric snapshots
 * - Aspect detection with tight orb tolerances (Conjunction, Opposition, Trine, Square, Sextile)
 * - Outer planet prioritization (Jupiter, Saturn, Uranus, Neptune, Pluto) vs inner triggers (Mars, Venus, Mercury)
 * - Dynamic, parameterized narrative interpretations in Vietnamese
 * - Polarity scoring and heatmap data for intuitive UI visualization
 */

import {
  unixMsToJulianDay,
  buildTopocentricObserver,
  computeTopocentricPlanetarySnapshot,
} from '@lich-viet/core-logic';
import type { WesternChartInput } from '../../types/astrology';
import { calculateWesternChart } from './westernCalculator';

export interface TransitAspectDetail {
  transitBody: string;
  transitBodyVi: string;
  natalBody: string;
  natalBodyVi: string;
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  aspectTypeVi: string;
  orb: number;
  isHarmonious: boolean;
  intensity: 'high' | 'medium' | 'low';
  interpretationVi: string;
}

export interface MonthlyTransitSummary {
  month: number;
  monthLabel: string;
  year: number;
  score: number; // 1.0 - 10.0
  luckTier: 'Đại Cát' | 'Khởi Sắc' | 'Bình Hòa' | 'Thử Thách' | 'Gian Nan';
  harmoniousCount: number;
  tensionCount: number;
  dominantAspects: TransitAspectDetail[];
  summaryVi: string;
  careerFinanceAdviceVi: string;
  relationshipHealthAdviceVi: string;
}

export interface TransitPeakEvent {
  month: number;
  dateLabel: string;
  transitBody: string;
  transitBodyVi: string;
  natalBody: string;
  natalBodyVi: string;
  aspectType: string;
  aspectTypeVi: string;
  significance: 'major' | 'moderate' | 'minor';
  titleVi: string;
  descriptionVi: string;
}

export interface MonthlyTransitTimeline {
  year: number;
  months: MonthlyTransitSummary[];
  overallYearScore: number;
  overallLuckTier: 'Đại Cát' | 'Khởi Sắc' | 'Bình Hòa' | 'Thử Thách' | 'Gian Nan';
  yearOverviewVi: string;
  peakEvents: TransitPeakEvent[];
  favorableMonths: number[];
  challengingMonths: number[];
}

const BODY_NAMES_VI: Record<string, string> = {
  sun: 'Mặt Trời',
  moon: 'Mặt Trăng',
  mercury: 'Sao Thủy',
  venus: 'Sao Kim',
  mars: 'Sao Hỏa',
  jupiter: 'Sao Mộc',
  saturn: 'Sao Thổ',
  uranus: 'Thiên Vương',
  neptune: 'Hải Vương',
  pluto: 'Diêm Vương',
  ascendant: 'Điểm Mọc (ASC)',
  midheaven: 'Thiên Đỉnh (MC)',
};

const ASPECT_INFO: Record<
  string,
  { nameVi: string; angle: number; orb: number; isHarmonious: boolean; scoreDelta: number }
> = {
  conjunction: { nameVi: 'Trùng Tụ (0°)', angle: 0, orb: 6, isHarmonious: true, scoreDelta: 1.2 },
  sextile: { nameVi: 'Lục Hợp (60°)', angle: 60, orb: 4, isHarmonious: true, scoreDelta: 1.0 },
  trine: { nameVi: 'Tam Hợp (120°)', angle: 120, orb: 5, isHarmonious: true, scoreDelta: 1.5 },
  square: { nameVi: 'Vuông Góc (90°)', angle: 90, orb: 5, isHarmonious: false, scoreDelta: -1.4 },
  opposition: { nameVi: 'Đối Đỉnh (180°)', angle: 180, orb: 6, isHarmonious: false, scoreDelta: -1.2 },
};

const PLANET_WEIGHTS: Record<string, number> = {
  jupiter: 2.2,
  saturn: 2.2,
  uranus: 1.8,
  neptune: 1.8,
  pluto: 2.0,
  mars: 1.4,
  sun: 1.2,
  venus: 1.2,
  mercury: 1.0,
  moon: 0.8,
};

const norm = (v: number) => ((v % 360) + 360) % 360;

/**
 * Dynamic parameterized interpretation synthesizer for a transit aspect
 */
function synthesizeTransitAspectInterpretation(
  transitBody: string,
  natalBody: string,
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile',
  isHarmonious: boolean,
): string {
  const tVi = BODY_NAMES_VI[transitBody] ?? transitBody;
  const nVi = BODY_NAMES_VI[natalBody] ?? natalBody;

  if (transitBody === 'jupiter') {
    if (isHarmonious) {
      return `Sao Mộc chiếu thuận lợi với ${nVi} natal: Đem lại vận hội mở rộng, sự lạc quan, quý nhân tương trợ và cơ hội phát triển đột phá.`;
    }
    return `Sao Mộc tạo góc căng với ${nVi} natal: Cơ hội nhiều nhưng dễ thái quá hoặc đánh giá quá lạc quan; cần kiểm soát ngân sách và giữ kỷ luật.`;
  }

  if (transitBody === 'saturn') {
    if (isHarmonious) {
      return `Sao Thổ hỗ trợ vững chắc cho ${nVi} natal: Thời điểm chín muồi để xác lập cam kết bền vững, xây dựng nền tảng sự nghiệp và củng cố uy tín.`;
    }
    return `Sao Thổ thử thách ${nVi} natal: Đòi hỏi sự kiên nhẫn, tinh thần trách nhiệm và tính kỷ luật cao độ để vượt qua áp lực tạm thời.`;
  }

  if (transitBody === 'uranus') {
    if (isHarmonious) {
      return `Thiên Vương Tinh mang đến luồng gió sáng tạo cho ${nVi} natal: Nhiều ý tưởng đổi mới, giải phóng tư duy và bứt phá khỏi lối mòn cũ.`;
    }
    return `Thiên Vương Tinh gây biến động bất ngờ với ${nVi} natal: Nhắc nhở thích ứng linh hoạt trước thay đổi ngoại cảnh, tránh phản ứng bộc phát.`;
  }

  if (transitBody === 'neptune') {
    if (isHarmonious) {
      return `Hải Vương Tinh kết nối với ${nVi} natal: Thăng hoa cảm hứng nghệ thuật, trực giác nhạy bén và nuôi dưỡng chiều sâu tinh thần.`;
    }
    return `Hải Vương Tinh tạo góc mơ hồ với ${nVi} natal: Cần giữ sự thực tế, kiểm tra kỹ lưỡng các điều khoản giấy tờ và tránh ảo tưởng.`;
  }

  if (transitBody === 'pluto') {
    if (isHarmonious) {
      return `Diêm Vương Tinh gia tăng nội lực cho ${nVi} natal: Khả năng chuyển hóa sâu sắc, củng cố quyền uy và phục hồi năng lượng mạnh mẽ.`;
    }
    return `Diêm Vương Tinh kích hoạt chuyển hóa áp lực với ${nVi} natal: Đòi hỏi buông bỏ những thói quen cũ không còn phù hợp để tái tạo bản thân.`;
  }

  if (transitBody === 'mars') {
    if (isHarmonious) {
      return `Sao Hỏa tiếp thêm năng lượng hành động cho ${nVi} natal: Tinh thần nhiệt huyết, quyết đoán thúc đẩy các dự án tiến nhanh.`;
    }
    return `Sao Hỏa tạo góc xung động với ${nVi} natal: Dễ nảy sinh nóng vội hoặc tranh chấp; cần kiềm chế cảm xúc và điều tiết sức khỏe.`;
  }

  if (isHarmonious) {
    return `${tVi} chiếu thuận lợi với ${nVi} natal: Năng lượng điều hòa êm đẹp, thuận lợi duy trì nhịp độ công việc và gia đạo hòa thuận.`;
  }
  return `${tVi} tạo góc thử thách với ${nVi} natal: Cần chú ý cân bằng tâm trạng, quản trị căng thẳng và đối nhân xử thế hòa nhã.`;
}

/**
 * Calculates monthly transits timeline for a Western Natal chart across an entire Gregorian year.
 */
export function calculateMonthlyTransits(input: WesternChartInput, targetYear: number): MonthlyTransitTimeline {
  const natal = calculateWesternChart(input);
  const natalPlanets = natal.planets.map((p) => ({
    body: p.body,
    tropicalLongitude: p.tropicalLongitude,
  }));

  const months: MonthlyTransitSummary[] = [];
  const peakEvents: TransitPeakEvent[] = [];

  for (let month = 1; month <= 12; month++) {
    // Sample transit snapshot at month midpoint (the 15th at 12:00 UTC)
    const midDate = new Date(Date.UTC(targetYear, month - 1, 15, 12, 0, 0));
    const julianDay = unixMsToJulianDay(midDate.getTime());

    const observer = buildTopocentricObserver({
      julianDay,
      latitude: input.latitude,
      longitude: input.longitude,
      altitudeMeters: 0,
    });

    const snapshot = computeTopocentricPlanetarySnapshot(observer) as Array<{
      body: string;
      tropicalLongitude: number;
    }>;

    const aspectDetails: TransitAspectDetail[] = [];

    for (const transit of snapshot) {
      for (const natalPlanet of natalPlanets) {
        const dist = Math.abs(norm(transit.tropicalLongitude - natalPlanet.tropicalLongitude));
        const shortest = Math.min(dist, 360 - dist);

        for (const [aspKey, aspRule] of Object.entries(ASPECT_INFO)) {
          if (Math.abs(shortest - aspRule.angle) <= aspRule.orb) {
            const orb = Math.abs(shortest - aspRule.angle);
            const isHarmonious =
              aspRule.isHarmonious &&
              !(aspKey === 'conjunction' && ['saturn', 'mars', 'pluto'].includes(transit.body) && ['moon', 'sun'].includes(natalPlanet.body));

            const intensity: 'high' | 'medium' | 'low' = orb < 1.5 ? 'high' : orb < 3.5 ? 'medium' : 'low';
            const aspectType = aspKey as TransitAspectDetail['aspectType'];
            const interpretationVi = synthesizeTransitAspectInterpretation(
              transit.body,
              natalPlanet.body,
              aspectType,
              isHarmonious,
            );

            aspectDetails.push({
              transitBody: transit.body,
              transitBodyVi: BODY_NAMES_VI[transit.body] ?? transit.body,
              natalBody: natalPlanet.body,
              natalBodyVi: BODY_NAMES_VI[natalPlanet.body] ?? natalPlanet.body,
              aspectType,
              aspectTypeVi: aspRule.nameVi,
              orb: Math.round(orb * 10) / 10,
              isHarmonious,
              intensity,
              interpretationVi,
            });

            // If tight orb on major outer planet, register as peak event
            if (orb < 1.2 && ['jupiter', 'saturn', 'uranus', 'pluto'].includes(transit.body)) {
              peakEvents.push({
                month,
                dateLabel: `Tháng ${month}/${targetYear}`,
                transitBody: transit.body,
                transitBodyVi: BODY_NAMES_VI[transit.body] ?? transit.body,
                natalBody: natalPlanet.body,
                natalBodyVi: BODY_NAMES_VI[natalPlanet.body] ?? natalPlanet.body,
                aspectType: aspKey,
                aspectTypeVi: aspRule.nameVi,
                significance: ['jupiter', 'saturn'].includes(transit.body) ? 'major' : 'moderate',
                titleVi: `${BODY_NAMES_VI[transit.body] ?? transit.body} ${aspRule.nameVi} ${BODY_NAMES_VI[natalPlanet.body] ?? natalPlanet.body}`,
                descriptionVi: interpretationVi,
              });
            }
          }
        }
      }
    }

    // Sort aspects by intensity and weight
    aspectDetails.sort((a, b) => {
      const wA = (PLANET_WEIGHTS[a.transitBody] ?? 1) * (a.intensity === 'high' ? 1.5 : 1);
      const wB = (PLANET_WEIGHTS[b.transitBody] ?? 1) * (b.intensity === 'high' ? 1.5 : 1);
      return wB - wA || a.orb - b.orb;
    });

    const harmoniousCount = aspectDetails.filter((a) => a.isHarmonious).length;
    const tensionCount = aspectDetails.filter((a) => !a.isHarmonious).length;

    // Calculate normalized month score (1.0 to 10.0)
    let score = 7.0 + harmoniousCount * 0.45 - tensionCount * 0.55;
    score = Math.round(Math.max(1.0, Math.min(10.0, score)) * 10) / 10;

    let luckTier: MonthlyTransitSummary['luckTier'] = 'Bình Hòa';
    if (score >= 8.5) luckTier = 'Đại Cát';
    else if (score >= 7.0) luckTier = 'Khởi Sắc';
    else if (score >= 5.5) luckTier = 'Bình Hòa';
    else if (score >= 4.0) luckTier = 'Thử Thách';
    else luckTier = 'Gian Nan';

    // Narrative summaries
    const dominantAspects = aspectDetails.slice(0, 4);
    const summaryParts: string[] = [];
    summaryParts.push(
      `Tháng ${month}/${targetYear} ghi nhận ${aspectDetails.length} góc chiếu transit đáng chú ý (${harmoniousCount} góc hài hòa, ${tensionCount} góc căng thẳng).`,
    );
    if (dominantAspects.length > 0) {
      summaryParts.push(dominantAspects[0].interpretationVi);
    }

    let careerFinanceAdviceVi = 'Vận trình công việc duy trì ổn định, thích hợp tập trung hoàn thiện chuyên môn.';
    if (harmoniousCount >= 2) {
      careerFinanceAdviceVi =
        'Thời điểm thuận lợi để đàm phán hợp đồng, đề xuất ý tưởng mới và xúc tiến các dự án quan trọng.';
    } else if (tensionCount >= 2) {
      careerFinanceAdviceVi =
        'Nên cẩn trọng trong các cam kết tài chính, rà soát kỹ văn bản và tránh quyết định mạo hiểm.';
    }

    let relationshipHealthAdviceVi = 'Gia đạo bình hòa, giữ tinh thần cân bằng và sinh hoạt điều độ.';
    if (tensionCount >= 2) {
      relationshipHealthAdviceVi =
        'Chú ý giải tỏa áp lực tinh thần, lắng nghe cơ thể và tránh các xung đột đối thoại không cần thiết.';
    }

    months.push({
      month,
      monthLabel: `Tháng ${month}`,
      year: targetYear,
      score,
      luckTier,
      harmoniousCount,
      tensionCount,
      dominantAspects,
      summaryVi: summaryParts.join(' '),
      careerFinanceAdviceVi,
      relationshipHealthAdviceVi,
    });
  }

  // Calculate year metrics
  const avgScore =
    Math.round((months.reduce((sum, m) => sum + m.score, 0) / months.length) * 10) / 10;

  let overallLuckTier: MonthlyTransitTimeline['overallLuckTier'] = 'Bình Hòa';
  if (avgScore >= 8.5) overallLuckTier = 'Đại Cát';
  else if (avgScore >= 7.0) overallLuckTier = 'Khởi Sắc';
  else if (avgScore >= 5.5) overallLuckTier = 'Bình Hòa';
  else if (avgScore >= 4.0) overallLuckTier = 'Thử Thách';
  else overallLuckTier = 'Gian Nan';

  const favorableMonths = months.filter((m) => m.score >= 7.0).map((m) => m.month);
  const challengingMonths = months.filter((m) => m.score < 5.5).map((m) => m.month);

  const yearOverviewVi = `Toàn cảnh năm ${targetYear} theo góc chiếu chiêm tinh phương Tây đạt trung bình ${avgScore}/10 (${overallLuckTier}). Các tháng thuận lợi nhất là ${
    favorableMonths.length > 0 ? favorableMonths.map((m) => `Tháng ${m}`).join(', ') : 'giữ mức ổn định'
  }, cần chủ động nắm bắt cơ hội để tạo bước tiến vững chắc.`;

  return {
    year: targetYear,
    months,
    overallYearScore: avgScore,
    overallLuckTier,
    yearOverviewVi,
    peakEvents: peakEvents.slice(0, 8),
    favorableMonths,
    challengingMonths,
  };
}
