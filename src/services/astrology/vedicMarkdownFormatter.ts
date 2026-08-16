/**
 * Vedic Astrology (Jyotish) Markdown Formatter — Lịch Việt
 *
 * Formats a comprehensive Sidereal Jyotish chart as rich Markdown:
 * - Panchanga & Janma Kundali (Lagna, Moon Rasi, Ayanamsa)
 * - Janma Nakshatra (Pada 1–4, Lord, Deity, Motivation, Traits)
 * - Chara Karakas (Atmakaraka Soul Planet & Lesson, Amatyakaraka)
 * - Navagrahas (9 Grahas with Sidereal coordinates, Bhavas, Vedic Dignities)
 * - Bhava Matrix (Kendra, Trikona, Upachaya, Dusthana distributions)
 * - Detected Yogas & Doshas with Dasha activations & Remedial Upayas
 * - Vimshottari Dasha 120-year Timeline with current Mahadasha deep-dive
 * - Holistic Jyotish Synthesis & Karma guidance
 *
 * Pure TypeScript — zero React dependencies.
 */

import type { WesternChartResult } from './westernCalculator';
import { synthesizeVedicReading } from './vedicSynthesisEngine';
import { detectVedicYogasAndDoshas } from './vedicYogas';
import { calculateVedicDashaTimeline, type VimshottariDashaResult } from './vedicDasha';
import { computeVedicDignity } from '@omce/core-logic';

export interface VedicMarkdownOptions {
  birthDate?: Date;
  name?: string;
  ayanamsa?: string;
  promptHeader?: string;
}

const GRAHA_NAMES: Record<string, { nameVi: string; nameSkt: string; symbol: string }> = {
  sun: { nameVi: 'Mặt Trời', nameSkt: 'Surya', symbol: '☉' },
  moon: { nameVi: 'Mặt Trăng', nameSkt: 'Chandra', symbol: '☽' },
  mars: { nameVi: 'Sao Hỏa', nameSkt: 'Mangala', symbol: '♂' },
  mercury: { nameVi: 'Sao Thủy', nameSkt: 'Budha', symbol: '☿' },
  jupiter: { nameVi: 'Sao Mộc', nameSkt: 'Guru', symbol: '♃' },
  venus: { nameVi: 'Sao Kim', nameSkt: 'Shukra', symbol: '♀' },
  saturn: { nameVi: 'Sao Thổ', nameSkt: 'Shani', symbol: '♄' },
  rahu: { nameVi: 'La Hầu', nameSkt: 'Rahu', symbol: '☊' },
  ketu: { nameVi: 'Kế Đô', nameSkt: 'Ketu', symbol: '☋' },
};

const DIGNITY_LABELS_VI: Record<string, string> = {
  uchha_peak: 'Miếu vượng (Đỉnh)',
  uchha_sign: 'Miếu vượng (Uchha)',
  neecha_peak: 'Hãm địa (Đáy)',
  neecha_sign: 'Hãm địa (Neecha)',
  moolatrikona: 'Moolatrikona (Căn vị)',
  neutral: 'Bình hòa',
};

const BHAVA_KEYWORDS: Record<number, string> = {
  1: 'Tanu (Bản Thân & Thể Chất)',
  2: 'Dhana (Tài Lộc & Gia Sản)',
  3: 'Sahaja (Dũng Khí & Kỹ Năng)',
  4: 'Sukha (Gia Đạo & Bình An)',
  5: 'Putra (Trí Tuệ & Phước Quá Khứ)',
  6: 'Ari (Tôi Luyện & Sức Khỏe)',
  7: 'Yuvati (Hôn Nhân & Đối Tác)',
  8: 'Randhra (Chuyển Hóa & Huyền Bí)',
  9: 'Dharma (Phước Đức & Đạo Học)',
  10: 'Karma (Sự Nghiệp & Danh Vọng)',
  11: 'Labha (Thành Tựu & Ước Vọng)',
  12: 'Vyaya (Giải Thoát & Tâm Linh)',
};

const SIGNS_SIDEREAL = [
  'Bạch Dương (Mesha)',
  'Kim Ngưu (Vrishabha)',
  'Song Tử (Mithuna)',
  'Cự Giải (Karka)',
  'Sư Tử (Simha)',
  'Xử Nữ (Kanya)',
  'Thiên Bình (Tula)',
  'Bọ Cạp (Vrishchika)',
  'Nhân Mã (Dhanu)',
  'Ma Kết (Makara)',
  'Bảo Bình (Kumbha)',
  'Song Ngư (Meena)',
];

function formatDegMin(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  const deg = Math.floor(norm % 30);
  const min = Math.floor((norm % 30 - deg) * 60);
  return `${deg}°${min.toString().padStart(2, '0')}′`;
}

/**
 * Formats a complete Vedic (Jyotish) chart as rich Markdown.
 */
export function formatVedicChartAsMarkdown(
  chartResult: WesternChartResult,
  options?: VedicMarkdownOptions,
): string {
  const birthDate = options?.birthDate ?? new Date();
  const name = options?.name?.trim() || 'Chưa rõ';
  const ayanamsa = options?.ayanamsa ?? 'Lahiri (Chitra Paksha)';
  const birthYear = birthDate instanceof Date ? birthDate.getFullYear() : new Date(birthDate).getFullYear();

  const synthesis = synthesizeVedicReading(chartResult, birthDate);
  const parts: string[] = [];

  if (options?.promptHeader) {
    parts.push(options.promptHeader);
  }

  // Header
  parts.push('# Lá Số Chiêm Tinh Vệ Đà (Vedic Jyotish - Janma Kundali)');

  // 1. Overview & Panchanga
  const moon = chartResult.planets.find((p) => p.body === 'moon');
  const ascIdx = Math.floor((((chartResult.ascendant % 360) + 360) % 360) / 30);
  const ascSign = SIGNS_SIDEREAL[ascIdx] ?? 'Bạch Dương';

  const linesOverview = ['## Thông Tin Cơ Bản & Trọng Tâm Bản Mệnh'];
  linesOverview.push(`- **Họ tên**: ${name}`);
  linesOverview.push(`- **Hệ thống Ayanamsa**: ${ayanamsa}`);
  linesOverview.push(`- **Lagna (Cung Mọc Vệ Đà / Tanu Bhava)**: ${ascSign} (${formatDegMin(chartResult.ascendant)})`);
  if (moon) {
    const moonSignIdx = Math.floor((((moon.siderealLongitude % 360) + 360) % 360) / 30);
    const moonSign = SIGNS_SIDEREAL[moonSignIdx] ?? moon.sign;
    linesOverview.push(`- **Janma Rasi (Cung Mặt Trăng)**: ${moonSign} (${formatDegMin(moon.siderealLongitude)})`);
    linesOverview.push(
      `- **Janma Nakshatra (Chòm Sao 27 Tú)**: ${moon.nakshatra ?? 'Ashwini'} (Pada ${(moon.pada ?? 0) + 1})`,
    );
  }

  // Chara Karakas
  const mainPlanets = chartResult.planets.filter((p) =>
    ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.body),
  );
  const sortedByDeg = [...mainPlanets].sort((a, b) => b.degreeInSign - a.degreeInSign);
  const atmakaraka = sortedByDeg[0];
  const amatyakaraka = sortedByDeg[1];

  if (atmakaraka) {
    const akMeta = GRAHA_NAMES[atmakaraka.body] ?? { nameVi: atmakaraka.body, nameSkt: '' };
    linesOverview.push(
      `- **Atmakaraka (Hành Tinh Chủ Linh Hồn - AK)**: ${akMeta.nameVi} (${akMeta.nameSkt} - ${atmakaraka.degreeInSign.toFixed(1)}° trong cung)`,
    );
  }
  if (amatyakaraka) {
    const amkMeta = GRAHA_NAMES[amatyakaraka.body] ?? { nameVi: amatyakaraka.body, nameSkt: '' };
    linesOverview.push(
      `- **Amatyakaraka (Hành Tinh Sự Nghiệp & Tài Năng - AmK)**: ${amkMeta.nameVi} (${amkMeta.nameSkt} - ${amatyakaraka.degreeInSign.toFixed(1)}° trong cung)`,
    );
  }

  parts.push(linesOverview.join('\n'));

  // 2. Navagrahas Table
  const linesGrahas = ['## Bảng Tọa Độ 9 Cửu Diệu (Navagrahas & Dignities)'];
  linesGrahas.push('| Hành Tinh (Graha) | Cung Hoàng Đạo (Rasi) | Tọa Độ Sidereal | Cung Vị (Bhava) | Chòm Sao (Nakshatra) | Phẩm Vị (Dignity) |');
  linesGrahas.push('|---|---|---:|:---:|---|---|');

  const grahaBodies = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  for (const body of grahaBodies) {
    const p = chartResult.planets.find((pl) => pl.body === body);
    if (!p) continue;
    const gMeta = GRAHA_NAMES[body] ?? { nameVi: body, nameSkt: '', symbol: '★' };
    const signIdx = Math.floor((((p.siderealLongitude % 360) + 360) % 360) / 30);
    const signName = SIGNS_SIDEREAL[signIdx] ?? p.sign;
    const nakshatraStr = p.nakshatra ? `${p.nakshatra} (P.${(p.pada ?? 0) + 1})` : '—';
    const rawDignity = computeVedicDignity(p.body, p.siderealLongitude);
    const dignityText = DIGNITY_LABELS_VI[rawDignity] ?? 'Bình hòa';

    linesGrahas.push(
      `| ${gMeta.nameVi} (${gMeta.nameSkt}) ${gMeta.symbol} | ${signName} | ${formatDegMin(p.siderealLongitude)} | Nhà ${p.house} (${BHAVA_KEYWORDS[p.house]?.split(' ')[0] ?? ''}) | ${nakshatraStr} | ${dignityText} |`,
    );
  }
  parts.push(linesGrahas.join('\n'));

  // 3. Bhava Matrix
  const kendraPlanets = chartResult.planets.filter((p) => [1, 4, 7, 10].includes(p.house));
  const trikonaPlanets = chartResult.planets.filter((p) => [1, 5, 9].includes(p.house));
  const upachayaPlanets = chartResult.planets.filter((p) => [3, 6, 10, 11].includes(p.house));
  const dusthanaPlanets = chartResult.planets.filter((p) => [6, 8, 12].includes(p.house));

  const linesBhava = ['## Ma Trận 12 Cung Vị (Bhava Matrix)'];
  linesBhava.push(
    `- **Cung Kendra (1, 4, 7, 10 - Trụ cột quyền lực & hành động)**: ${kendraPlanets.map((p) => GRAHA_NAMES[p.body]?.nameVi ?? p.body).join(', ') || 'Không có hành tinh'}`,
  );
  linesBhava.push(
    `- **Cung Trikona (1, 5, 9 - Phước đức & tài lộc Dharma/Lakshmi)**: ${trikonaPlanets.map((p) => GRAHA_NAMES[p.body]?.nameVi ?? p.body).join(', ') || 'Không có hành tinh'}`,
  );
  linesBhava.push(
    `- **Cung Upachaya (3, 6, 10, 11 - Tăng trưởng & vượt khó)**: ${upachayaPlanets.map((p) => GRAHA_NAMES[p.body]?.nameVi ?? p.body).join(', ') || 'Không có hành tinh'}`,
  );
  linesBhava.push(
    `- **Cung Dusthana (6, 8, 12 - Tôi luyện & chuyển hóa)**: ${dusthanaPlanets.map((p) => GRAHA_NAMES[p.body]?.nameVi ?? p.body).join(', ') || 'Không có hành tinh'}`,
  );
  linesBhava.push(`- **Tổng quan thế trận Bhava**: ${synthesis.bhavaMatrixReadingVi}`);
  parts.push(linesBhava.join('\n'));

  // 4. Detected Yogas and Doshas
  const vedicPositions = chartResult.planets.map((p) => ({
    body: p.body,
    siderealLongitude: p.siderealLongitude,
    house: p.house,
    signIndex: Math.floor((((p.siderealLongitude % 360) + 360) % 360) / 30),
  }));
  const detectedYogas = detectVedicYogasAndDoshas(vedicPositions, chartResult.ascendant);

  const linesYogas = ['## Tổ Hợp Cát Cách & Khắc Kỵ (Detected Yogas & Doshas)'];
  if (detectedYogas.length === 0) {
    linesYogas.push('Lá số sở hữu cấu trúc hành tinh phân bổ đồng đều, không phát hiện tổ hợp cực đoan.');
  } else {
    for (const yoga of detectedYogas) {
      linesYogas.push(`\n### ${yoga.nameVi} (${yoga.nameSanskrit}) — [${yoga.categoryVi} · Mức độ: ${yoga.severityOrStrength}]`);
      linesYogas.push(`- **Hành tinh & Cung vị**: ${yoga.planetsInvolved.join(' + ')}${yoga.bhavaHouses ? ` tại Nhà ${yoga.bhavaHouses.join(', ')}` : ''}`);
      linesYogas.push(`- **Ý nghĩa cấu trúc**: ${yoga.descriptionVi}`);
      if (yoga.personalizedSynthesisVi) {
        linesYogas.push(`- **Luận giải chi tiết**: ${yoga.personalizedSynthesisVi}`);
      }
      if (yoga.dashaActivationVi) {
        linesYogas.push(`- **Thời điểm kích hoạt**: ${yoga.dashaActivationVi}`);
      }
      if (yoga.remedyOrAdviceVi) {
        linesYogas.push(`- **Lời khuyên & Hóa giải (Remedies)**: ${yoga.remedyOrAdviceVi}`);
      }
    }
  }
  parts.push(linesYogas.join('\n'));

  // 5. Vimshottari Dasha Timeline
  if (moon) {
    const currentYear = new Date().getFullYear();
    const dashaTimeline: VimshottariDashaResult = calculateVedicDashaTimeline(
      moon.siderealLongitude,
      birthYear,
      currentYear,
    );

    const linesDasha = ['## Chu Kỳ Đại Vận Thời Gian (Vimshottari Dasha Timeline)'];
    linesDasha.push('| Đại Vận (Mahadasha) | Biểu Tượng | Giai Đoạn Năm | Độ Tuổi | Thời Lượng | Trạng Thái |');
    linesDasha.push('|---|:---:|---|---|---:|:---:|');

    for (const period of dashaTimeline.periods) {
      const currentMarker = period.isCurrent ? '★ **Đang Kích Hoạt**' : '—';
      linesDasha.push(
        `| ${period.lordVi} | ${period.symbol} | ${period.startYear} – ${period.endYear} | ${period.ageRange} | ${period.durationYears} năm | ${currentMarker} |`,
      );
    }

    if (dashaTimeline.currentPeriod) {
      const curr = dashaTimeline.currentPeriod;
      linesDasha.push(`\n### Luận Giải Đại Vận Hiện Tại: ${curr.lordVi} (${curr.startYear} – ${curr.endYear})`);
      linesDasha.push(`- **Năng lượng chủ đạo**: ${curr.descriptionVi}`);
      linesDasha.push(`- **Trọng tâm vận trình**: ${synthesis.activeDashaReadingVi}`);
    }

    parts.push(linesDasha.join('\n'));
  }

  // 6. Holistic Synthesis & Actionable Guidance
  const linesSynthesis = ['## Tổng Hợp Luận Giải Jyotish & Định Hướng Nghiệp Lực'];
  linesSynthesis.push(`- **Luận giải Lagna**: ${synthesis.lagnaReadingVi}`);
  linesSynthesis.push(`- **Luận giải Tâm trí Mặt Trăng (Janma Nakshatra)**: ${synthesis.moonNakshatraReadingVi}`);
  linesSynthesis.push(`- **Bài học linh hồn Atmakaraka**: ${synthesis.atmakarakaReadingVi}`);
  linesSynthesis.push(`- **Kim chỉ nam hành động & Tu dưỡng (Remedial Guidance)**: ${synthesis.actionableGuidanceVi}`);
  parts.push(linesSynthesis.join('\n'));

  // Footer
  parts.push('---');
  parts.push('*Lá số được tính toán theo hệ tọa độ thiên văn Sidereal Lahiri (Chitra Paksha Ayanamsa) — Hệ thống Jyotish Lịch Việt.*');

  return parts.join('\n\n');
}
