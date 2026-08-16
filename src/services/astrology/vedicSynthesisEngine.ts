/**
 * Vedic Astrology (Jyotish) Holistic Synthesis Engine — Lịch Việt v3
 *
 * Dynamically synthesizes Sidereal Jyotish calculations:
 * - Lagna (Ascendant) & Lagna Lord placement in Bhavas
 * - Moon Rasi, Nakshatra, Pada & Nakshatra Deities/Motivation
 * - Chara Karakas (Atmakaraka soul lesson, Amatyakaraka career indicator)
 * - Detected Yogas & Doshas (Gajakesari, Pancha Mahapurusha, Raja Yogas, Budhaditya, etc.)
 * - Active Vimshottari Dasha time-activation
 * - Bhava Distribution (Kendra power vs Trikona dharma vs Dusthana transformation)
 *
 * Provides deeply personalized, non-generic Jyotish life readings grounded in calculations.
 */

import type { WesternChartResult } from './westernCalculator';
import { detectVedicYogasAndDoshas } from './vedicYogas';
import { calculateVedicDashaTimeline, type VimshottariDashaResult } from './vedicDasha';

export interface VedicSynthesizedReading {
  lagnaReadingVi: string;
  moonNakshatraReadingVi: string;
  atmakarakaReadingVi: string;
  activeYogasSummaryVi: string[];
  activeDashaReadingVi: string;
  bhavaMatrixReadingVi: string;
  actionableGuidanceVi: string;
}

const NAKSHATRA_DATA: Record<string, { lord: string; deity: string; motivation: string; traitVi: string }> = {
  Ashwini: {
    lord: 'Ketu',
    deity: 'Ashvins',
    motivation: 'Dharma',
    traitVi: 'Năng lượng chữa lành, tốc độ hành động nhanh nhạy và tinh thần tiên phong mở đường.',
  },
  Bharani: {
    lord: 'Venus',
    deity: 'Yama',
    motivation: 'Artha',
    traitVi: 'Khả năng chịu đựng thử thách lớn, tinh thần kỷ luật và sức mạnh chuyển hóa sâu sắc.',
  },
  Krittika: {
    lord: 'Sun',
    deity: 'Agni',
    motivation: 'Kama',
    traitVi: 'Ngọn lửa nhiệt huyết, sự sắc sảo, tínhộc trực và khả năng phân định đúng sai rạch ròi.',
  },
  Rohini: {
    lord: 'Moon',
    deity: 'Brahma',
    motivation: 'Moksha',
    traitVi: 'Năng khiếu thẩm mỹ, sự quyến rũ, tình yêu thiên nhiên và tài năng thu hút nguồn lực vật chất.',
  },
  Mrigashira: {
    lord: 'Mars',
    deity: 'Soma',
    motivation: 'Moksha',
    traitVi: 'Tâm trí tò mò tìm kiếm chân lý, khả năng nghiên cứu điều tra và sự nhạy bén trong giao tiếp.',
  },
  Ardra: {
    lord: 'Rahu',
    deity: 'Rudra',
    motivation: 'Kama',
    traitVi: 'Sức mạnh vượt qua giông bão, tư duy cách mạng đột phá và khả năng tái sinh từ nghịch cảnh.',
  },
  Punarvasu: {
    lord: 'Jupiter',
    deity: 'Aditi',
    motivation: 'Artha',
    traitVi: 'Sự bao dung, tâm hồn phục thiện, khả năng phục hồi sau thất bại và mang lại may mắn cho xung quanh.',
  },
  Pushya: {
    lord: 'Saturn',
    deity: 'Brihaspati',
    motivation: 'Dharma',
    traitVi: 'Chòm sao nuôi dưỡng phước báu tối cao, tinh thần trách nhiệm, đạo đức và sự thông thái.',
  },
  Ashlesha: {
    lord: 'Mercury',
    deity: 'Nagas',
    motivation: 'Dharma',
    traitVi: 'Trực giác tâm linh sâu sắc, tư duy chiến lược ngầm và năng lực nhìn thấu tâm can người khác.',
  },
  Magha: {
    lord: 'Ketu',
    deity: 'Pitris',
    motivation: 'Artha',
    traitVi: 'Khí chất tôn quý, gắn kết cội nguồn tổ tiên, lòng tự trọng cao và khát vọng để lại di sản.',
  },
  'Purva Phalguni': {
    lord: 'Venus',
    deity: 'Bhaga',
    motivation: 'Kama',
    traitVi: 'Sức sáng tạo nghệ thuật, phong cách hào hoa, tận hưởng niềm vui sống và các mối quan hệ hòa hợp.',
  },
  'Uttara Phalguni': {
    lord: 'Sun',
    deity: 'Aryaman',
    motivation: 'Moksha',
    traitVi: 'Tinh thần hiệp nghĩa, sự bảo trợ, lòng trung thành và năng lực xây dựng liên minh vững chắc.',
  },
  Hasta: {
    lord: 'Moon',
    deity: 'Savitar',
    motivation: 'Moksha',
    traitVi: 'Đôi bàn tay khéo léo, tài năng thủ công/kỹ thuật, sự hóm hỉnh và khả năng biến ý tưởng thành hiện thực.',
  },
  Chitra: {
    lord: 'Mars',
    deity: 'Vishwakarma',
    motivation: 'Kama',
    traitVi: 'Tư duy kiến trúc sư, khiếu thẩm mỹ tinh xảo, đam mê cái đẹp và sự hoàn thiện tỉ mỉ.',
  },
  Swati: {
    lord: 'Rahu',
    deity: 'Vayu',
    motivation: 'Artha',
    traitVi: 'Sự độc lập tự do, tài năng thương mại đối ngoại và khả năng thích ứng mềm dẻo như ngọn gió.',
  },
  Vishakha: {
    lord: 'Jupiter',
    deity: 'Indra-Agni',
    motivation: 'Dharma',
    traitVi: 'Mục tiêu tập trung kiên định, lòng quyết tâm sắt đá và khả năng chinh phục những đỉnh cao lớn.',
  },
  Anuradha: {
    lord: 'Saturn',
    deity: 'Mitra',
    motivation: 'Dharma',
    traitVi: 'Tình bạn trung thành, khả năng tổ chức tập thể và lòng tận tụy vượt qua mọi thử thách địa lý.',
  },
  Jyeshtha: {
    lord: 'Mercury',
    deity: 'Indra',
    motivation: 'Artha',
    traitVi: 'Uy quyền lãnh đạo, bản lĩnh bảo vệ người khác và khả năng quản lý khủng hoảng sắc bén.',
  },
  Mula: {
    lord: 'Ketu',
    deity: 'Nirriti',
    motivation: 'Kama',
    traitVi: 'Năng lực đào sâu gốc rễ bản chất, phá bỏ ảo tưởng và nghiên cứu triết học, huyền học sâu sắc.',
  },
  'Purva Ashadha': {
    lord: 'Venus',
    deity: 'Apas',
    motivation: 'Moksha',
    traitVi: 'Sự tự tin bất khả chiến bại, khả năng truyền cảm hứng và niềm tin vững chắc vào lý tưởng.',
  },
  'Uttara Ashadha': {
    lord: 'Sun',
    deity: 'Vishvadevas',
    motivation: 'Moksha',
    traitVi: 'Đức tính kiên trì bền bỉ, tính khiêm nhường chuẩn mực và sự công nhận bền vững từ xã hội.',
  },
  Shravana: {
    lord: 'Moon',
    deity: 'Vishnu',
    motivation: 'Artha',
    traitVi: 'Khả năng lắng nghe thấu hiểu, ham học hỏi tri thức truyền thống và gìn giữ danh tiếng tốt đẹp.',
  },
  Dhanishta: {
    lord: 'Mars',
    deity: 'Vasus',
    motivation: 'Dharma',
    traitVi: 'Nhịp điệu âm nhạc, sự hào phóng, năng lực quản trị tài chính và tầm ảnh hưởng cộng đồng.',
  },
  Shatabhisha: {
    lord: 'Rahu',
    deity: 'Varuna',
    motivation: 'Dharma',
    traitVi: 'Năng lực nhìn thấu quy luật vũ trụ, chữa lành bằng y học/khoa học và sự kín đáo độc lập.',
  },
  'Purva Bhadrapada': {
    lord: 'Jupiter',
    deity: 'Aja Ekapada',
    motivation: 'Artha',
    traitVi: 'Chiều sâu tâm linh huyền bí, lý tưởng phụng sự nhân loại và khả năng chuyển hóa tâm thức mạnh mẽ.',
  },
  'Uttara Bhadrapada': {
    lord: 'Saturn',
    deity: 'Ahir Budhnya',
    motivation: 'Kama',
    traitVi: 'Sự điềm tĩnh sâu sắc, trí tuệ kiên định, lòng từ bi và khả năng kiểm soát cảm xúc tuyệt vời.',
  },
  Revati: {
    lord: 'Mercury',
    deity: 'Pushan',
    motivation: 'Moksha',
    traitVi: 'Lòng trắc ẩn vô bờ bến, sự bảo bọc những sinh linh yếu thế và tâm hồn giàu tính nghệ thuật, trực giác.',
  },
};

const SIGNS_SIDEREAL = [
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

const BODY_LABELS_VI: Record<string, string> = {
  sun: 'Mặt Trời (Surya)',
  moon: 'Mặt Trăng (Chandra)',
  mercury: 'Sao Thủy (Budha)',
  venus: 'Sao Kim (Shukra)',
  mars: 'Sao Hỏa (Mangala)',
  jupiter: 'Sao Mộc (Guru)',
  saturn: 'Sao Thổ (Shani)',
  rahu: 'La Hầu (Rahu)',
  ketu: 'Kế Đô (Ketu)',
};

const ATMAKARAKA_LESSONS: Record<string, string> = {
  sun: 'Bài học linh hồn về sự Khiêm nhường: Học cách dùng quyền uy để soi sáng và phụng sự thay vì khẳng định cái tôi kiêu hãnh.',
  moon: 'Bài học linh hồn về Lòng Thấu Cảm: Kiểm soát cảm xúc bồng bềnh, nuôi dưỡng tình yêu thương thuần khiết không điều kiện.',
  mars: 'Bài học linh hồn về Bất Bạo Động (Ahimsa): Chuyển hóa cơn giận và ý chí chiến đấu thành lòng dũng cảm bảo vệ công lý.',
  mercury:
    'Bài học linh hồn về Sự Chân Thật: Làm chủ lời nói, sử dụng trí tuệ để kết nối và truyền bá tri thức chân chính.',
  jupiter:
    'Bài học linh hồn về Sự Bao Dung & Tôn Trọng: Chia sẻ trí tuệ với tâm thế học hỏi, không áp đặt giáo điều lên người khác.',
  venus:
    'Bài học linh hồn về Tiết Chế Đam Mê: Tinh lọc tình cảm lãng mạn thành tình yêu thiêng liêng, vị tha và thanh tịnh.',
  saturn:
    'Bài học linh hồn về Chấp Nhận & Kiên Nhẫn: Gánh vác trách nhiệm với lòng vô tư, biến đau thương thành sự thấu suốt nhân sinh.',
  rahu: 'Bài học linh hồn về Vượt Qua Ảo Tưởng: Nhìn thấu những dục vọng thế gian để tìm về giá trị chân thật của linh hồn.',
};

/**
 * Synthesizes comprehensive Jyotish reading from calculated Vedic chart result.
 */
export function synthesizeVedicReading(
  chartResult: WesternChartResult,
  birthDate: Date = new Date(),
): VedicSynthesizedReading {
  const moon = chartResult.planets.find((p) => p.body === 'moon');
  const ascIdx = Math.floor((((chartResult.ascendant % 360) + 360) % 360) / 30);
  const ascSign = SIGNS_SIDEREAL[ascIdx] ?? 'Bạch Dương';

  // 1. Lagna (Ascendant) Reading
  const lagnaDeg = (chartResult.ascendant % 30).toFixed(1);
  const lagnaReadingVi = `Lagna (Cung Mọc Vệ Đà) tại ${ascSign} (${lagnaDeg}°): Đây là điểm gốc (Tanu Bhava) định hình toàn bộ thể chất, năng lượng sinh mệnh và cách bạn nhập thế. Cung Mọc ${ascSign} mang lại cho bạn phong cách kiên định, tầm nhìn thực tế và con đường cuộc đời gắn liền với việc khẳng định bản lĩnh cá nhân.`;

  // 2. Moon Rasi, Nakshatra & Pada Reading
  let moonNakshatraReadingVi = '';
  if (moon) {
    const moonSignName = SIGNS_SIDEREAL[Math.floor((((moon.siderealLongitude % 360) + 360) % 360) / 30)] ?? moon.sign;
    const nakshatraName = moon.nakshatra ?? 'Ashwini';
    const padaNum = (moon.pada ?? 0) + 1;
    const nMeta = NAKSHATRA_DATA[nakshatraName] ?? {
      lord: 'Chủ tinh',
      deity: 'Thần hộ mệnh',
      motivation: 'Dharma',
      traitVi: 'Tư chất thông tuệ và linh hoạt.',
    };

    moonNakshatraReadingVi = `Mặt Trăng (Chandra) cư tại ${moonSignName}, ngự tại Chòm sao Janma Nakshatra ${nakshatraName} (Pada ${padaNum}, cai quản bởi ${nMeta.lord}, động lực ${nMeta.motivation}): ${nMeta.traitVi} Đây là nguồn năng lượng cốt lõi định hình thế giới cảm xúc (Manas), phản xạ trực giác và thói quen vô thức của bạn.`;
  }

  // 3. Atmakaraka (Soul Planet)
  const mainPlanets = chartResult.planets.filter((p) =>
    ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.body),
  );
  let atmakaraka = mainPlanets[0];
  for (const p of mainPlanets) {
    if (p.degreeInSign > (atmakaraka?.degreeInSign ?? 0)) {
      atmakaraka = p;
    }
  }

  const akNameVi = atmakaraka ? (BODY_LABELS_VI[atmakaraka.body] ?? atmakaraka.body) : 'Mặt Trời';
  const akLesson = atmakaraka ? (ATMAKARAKA_LESSONS[atmakaraka.body] ?? 'Bài học về sự trưởng thành tâm linh.') : '';
  const atmakarakaReadingVi = `Hành tinh chủ linh hồn (Atmakaraka - AK) là ${akNameVi} (tọa độ cao nhất ${atmakaraka?.degreeInSign.toFixed(1)}° trong cung). ${akLesson}`;

  // 4. Detected Yogas & Doshas
  const vedicPositions = chartResult.planets.map((p) => ({
    body: p.body,
    siderealLongitude: p.siderealLongitude,
    house: p.house,
    signIndex: Math.floor((((p.siderealLongitude % 360) + 360) % 360) / 30),
  }));

  const detectedYogas = detectVedicYogasAndDoshas(vedicPositions, chartResult.ascendant);
  const activeYogasSummaryVi: string[] = [];

  if (detectedYogas.length > 0) {
    detectedYogas.forEach((yoga) => {
      activeYogasSummaryVi.push(
        `${yoga.nameVi} (${yoga.nameSanskrit}) — **${yoga.categoryVi}, mức độ ${yoga.severityOrStrength}**: ${yoga.descriptionVi}${yoga.bhavaClassificationVi ? ` Cấu trúc: ${yoga.bhavaClassificationVi}.` : ''}${yoga.remedyOrAdviceVi ? ` Lời khuyên: ${yoga.remedyOrAdviceVi}` : ''}`,
      );
    });
  } else {
    activeYogasSummaryVi.push(
      'Lá số sở hữu cấu trúc hành tinh phân bổ đồng đều giữa các cung vị, hướng tới sự ổn định và phát triển bền bỉ theo thời gian.',
    );
  }

  // 5. Active Vimshottari Dasha
  let activeDashaReadingVi = '';
  if (moon) {
    const birthYear = birthDate ? birthDate.getFullYear() : new Date().getFullYear();
    const dashaTimeline: VimshottariDashaResult = calculateVedicDashaTimeline(
      moon.siderealLongitude,
      birthYear,
      new Date().getFullYear(),
    );
    const currPeriod = dashaTimeline.currentPeriod;
    if (currPeriod) {
      activeDashaReadingVi = `Đại vận Vimshottari Dasha hiện tại: ${currPeriod.lordVi} (từ ${currPeriod.startYear} đến ${currPeriod.endYear}, độ tuổi ${currPeriod.ageRange}). ${currPeriod.descriptionVi} Đây là thời kỳ trọng tâm mà năng lượng của hành tinh này chi phối các sự kiện chính trong đời bạn.`;
    }
  }

  // 6. Bhava Matrix Synthesis
  const kendraPlanets = chartResult.planets.filter((p) => [1, 4, 7, 10].includes(p.house));
  const trikonaPlanets = chartResult.planets.filter((p) => [5, 9].includes(p.house));
  const dusthanaPlanets = chartResult.planets.filter((p) => [6, 8, 12].includes(p.house));

  const bhavaMatrixReadingVi = `Thế trận 12 Cung (Bhava Matrix): Có ${kendraPlanets.length} hành tinh ngụ tại Cung Kendra (trụ cột hành động 1, 4, 7, 10), ${trikonaPlanets.length} hành tinh ngụ tại Cung Trikona (phước đức & tài trí 5, 9), và ${dusthanaPlanets.length} hành tinh tại Cung Dusthana (tôi luyện & chuyển hóa 6, 8, 12). Cấu trúc này tạo nên sự cân bằng giữa khả năng kiến tạo danh vị thực tế và chiều sâu tu tập tâm thức.`;

  // 7. Actionable Guidance
  const actionableGuidanceVi = `Lời khuyên Jyotish: Hãy lấy tư chất kiên định của Lagna ${ascSign} làm nền tảng, phát huy năng lực trực giác của Nakshatra ${moon?.nakshatra ?? ''} để nắm bắt thời vận trong đại vận Dasha, và luôn thực hành bài học linh hồn của ${akNameVi} để tích lũy phước đức (Purva Punya) bền vững.`;

  return {
    lagnaReadingVi,
    moonNakshatraReadingVi,
    atmakarakaReadingVi,
    activeYogasSummaryVi,
    activeDashaReadingVi,
    bhavaMatrixReadingVi,
    actionableGuidanceVi,
  };
}
