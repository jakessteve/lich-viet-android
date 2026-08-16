/**
 * Western Astrology Holistic Synthesis Engine — Lịch Việt v3
 *
 * Dynamically synthesizes Swiss Ephemeris natal calculations:
 * - Day/Night sect modulation (Diurnal vs Nocturnal chart)
 * - Moon phase at birth integration
 * - Ascendant + Chart Ruler (House & Sign of Ruler)
 * - Sun, Moon & Midheaven contextual dynamics
 * - Essential Dignities (Domicile, Exaltation, Detriment, Fall, Peregrine)
 * - House Rulerships (Ruler of House X in House Y)
 * - Exact Aspects with orb weighting & Retrograde status
 * - Aspect Patterns (Grand Trine, T-Square, Stellium, etc.)
 * - Element & Modality balance percentages
 *
 * Grounded strictly in calculated mathematical outputs without generic fluff.
 */

import type { SwissNatalChartResult, SwissNatalAngle, SwissNatalAngleName } from './swissNatalChart';

export interface WesternSynthesizedReading {
  sect: {
    isDiurnal: boolean;
    sectLight: string;
    sectBenefit: string;
    descriptionVi: string;
  };
  moonPhaseReadingVi: string;
  bigThreeSynthesisVi: string;
  chartRulerSynthesisVi: string;
  midheavenReadingVi: string;
  objectSyntheses: Record<
    string,
    {
      objectId: string;
      nameVi: string;
      signVi: string;
      house: number;
      dignitySummaryVi?: string;
      rulershipSummaryVi?: string;
      aspectsSummaryVi?: string;
      retrogradeNoteVi?: string;
      fullContextualReadingVi: string;
    }
  >;
  dominantPatternsVi: string[];
  elementalBalanceVi: string;
  growthTensionsVi: string[];
  actionableGuidanceVi: string;
}

const DIGNITY_EXPLANATIONS: Record<string, { label: string; tone: string; desc: string }> = {
  domicile: {
    label: 'Cư Miếu (Domicile)',
    tone: 'Thuận tự nhiên & Quyền năng trọn vẹn',
    desc: 'Hành tinh ngự trị tại chính hoàng đạo của mình, phát huy tối đa tư chất bẩm sinh, hành động tự nhiên và đầy tự tin.',
  },
  exaltation: {
    label: 'Đắc Vượng (Exaltation)',
    tone: 'Tỏa sáng rực rỡ & Lý tưởng hóa',
    desc: 'Hành tinh đạt trạng thái thăng hoa, biểu hiện phẩm chất cao đẹp nhất và dễ gặt hái thành tựu nổi bật.',
  },
  detriment: {
    label: 'Hãm Địa (Detriment)',
    tone: 'Trải nghiệm khác biệt & Thử thách tôi luyện',
    desc: 'Hành tinh cư đối diện cung cai quản, đòi hỏi bạn phải dùng tư duy đột phá, sáng tạo lối đi riêng thay vì rập khuôn.',
  },
  fall: {
    label: 'Tuyệt Địa (Fall)',
    tone: 'Chuyển hóa nội tâm & Chiều sâu trải nghiệm',
    desc: 'Hành tinh ở vị thế đối lập với đỉnh cao thăng hoa, cần sự nhẫn nại tôi luyện để biến điểm yếu thành nguồn sức mạnh nội tâm sâu sắc.',
  },
  peregrine: {
    label: 'Tự Do (Peregrine)',
    tone: 'Linh hoạt & Tự chủ thích nghi',
    desc: 'Hành tinh không có phẩm giá cốt lõi đặc thù, phụ thuộc nhiều vào vị trí nhà và các góc chiếu để định hình cách thể hiện.',
  },
};

const HOUSE_THEMES: Record<number, { domainVi: string; keywordVi: string }> = {
  1: { domainVi: 'Bản sắc, phong thái cá nhân và cơ thể vật lý', keywordVi: 'Bản Thân' },
  2: { domainVi: 'Tài chính cá nhân, của cải, giá trị tự thân và kỹ năng kiếm tiền', keywordVi: 'Tài Sản' },
  3: { domainVi: 'Tư duy logic, giao tiếp, học tập ngắn hạn, anh chị em và môi trường gần', keywordVi: 'Giao Tiếp' },
  4: { domainVi: 'Cội nguồn, gia đình, nhà cửa, nội tâm và điểm tựa cảm xúc', keywordVi: 'Gia Đạo' },
  5: { domainVi: 'Sức sáng tạo cá nhân, tình yêu lãng mạn, niềm vui sống và con cái', keywordVi: 'Sáng Tạo' },
  6: { domainVi: 'Công việc hàng ngày, thói quen sinh hoạt, sức khỏe và tinh thần phục vụ', keywordVi: 'Sức Khỏe' },
  7: { domainVi: 'Mối quan hệ đối tác 1-1, hôn nhân và sự tương tác công khai', keywordVi: 'Hôn Nhân' },
  8: { domainVi: 'Tài nguyên chung, sự chuyển hóa, tâm lý sâu kín và tài sản thừa kế', keywordVi: 'Chuyển Hóa' },
  9: { domainVi: 'Triết lý sống, giáo dục bậc cao, xuất ngoại và mở rộng chân trời', keywordVi: 'Tri Thức' },
  10: { domainVi: 'Sự nghiệp đỉnh cao, danh tiếng công chúng và vị thế xã hội', keywordVi: 'Sự Nghiệp' },
  11: { domainVi: 'Mạng lưới cộng đồng, bạn bè chí hướng, lý tưởng và ước mơ tương lai', keywordVi: 'Cộng Đồng' },
  12: { domainVi: 'Tiềm thức, sự giải thoát tâm linh, những góc khuất và năng lực phục hồi', keywordVi: 'Tiềm Thức' },
};

function createDefaultAngle(
  id: string,
  name: string,
  nameVi: string,
  symbol: string,
  sign: string,
  signVi: string,
): SwissNatalAngle {
  return {
    id,
    name,
    nameVi,
    symbol,
    longitude: 0,
    sign,
    signVi,
    degree: 0,
    minute: 0,
    isAngle: true,
  };
}

const DEFAULT_ANGLES: Record<SwissNatalAngleName, SwissNatalAngle> = {
  Ascendant: createDefaultAngle('angle:ascendant', 'Ascendant', 'Cung Mọc', 'ASC', 'Aries', 'Bạch Dương'),
  Midheaven: createDefaultAngle('angle:midheaven', 'Midheaven', 'Thiên Đỉnh', 'MC', 'Capricorn', 'Ma Kết'),
  Descendant: createDefaultAngle('angle:descendant', 'Descendant', 'Cung Lặn', 'DSC', 'Libra', 'Thiên Bình'),
  'Imum Coeli': createDefaultAngle('angle:imum-coeli', 'Imum Coeli', 'Thiên Đế', 'IC', 'Cancer', 'Cự Giải'),
};

/**
 * Builds a nuanced, calculation-grounded synthesis of a Swiss Natal Chart.
 */
export function synthesizeWesternNatalChart(chart: SwissNatalChartResult): WesternSynthesizedReading {
  const objects = chart?.objects ?? [];
  const angles = chart?.angles ?? DEFAULT_ANGLES;
  const aspects = chart?.aspects ?? [];
  const aspectPatterns = chart?.aspectPatterns ?? [];
  const elementBalance = chart?.elementBalance;
  const moonPhase = chart?.moonPhase;
  const houseRulers = chart?.houseRulers ?? [];

  const sun = objects.find((o) => o.id === 'planet:sun');
  const moon = objects.find((o) => o.id === 'planet:moon');
  const asc = angles.Ascendant ?? DEFAULT_ANGLES.Ascendant;
  const mc = angles.Midheaven ?? DEFAULT_ANGLES.Midheaven;

  // 1. Day / Night Sect
  // If Sun is above horizon (Houses 7, 8, 9, 10, 11, 12), it's a Diurnal (Day) Chart.
  const isDiurnal = sun ? [7, 8, 9, 10, 11, 12].includes(sun.house) : true;
  const sectLight = isDiurnal ? 'Mặt Trời (Chủ tinh Ngày)' : 'Mặt Trăng (Chủ tinh Đêm)';
  const sectBenefit = isDiurnal
    ? 'Sao Mộc (Cát tinh Đêm) & Sao Thổ (Tôi luyện Ngày)'
    : 'Sao Kim (Cát tinh Đêm) & Sao Hỏa (Tôi luyện Đêm)';
  const sectDescriptionVi = isDiurnal
    ? `Lá số Ban Ngày (Diurnal Chart): Mặt Trời nằm trên đường chân trời (Nhà ${sun?.house ?? 10}), giúp bạn tỏa sáng rõ nét trong môi trường công cộng, ưu tiên ý chí tỉnh thức, mục tiêu rõ ràng và tính định hướng xã hội.`
    : `Lá số Ban Đêm (Nocturnal Chart): Mặt Trời nằm dưới đường chân trời (Nhà ${sun?.house ?? 4}), giúp thế giới nội tâm, trực giác và cảm xúc sâu thẳm của Mặt Trăng (Nhà ${moon?.house ?? 1}) trở thành động lực dẫn dắt chính trong cuộc đời.`;

  // 2. Moon Phase Reading
  let moonPhaseReadingVi = '';
  if (moonPhase) {
    moonPhaseReadingVi = `Sinh vào pha ${moonPhase.nameVi} (góc phân cách ${Math.round(moonPhase.phaseAngle)}°): ${moonPhase.descriptionVi} ${moonPhase.personalityTraitsVi}`;
  }

  // 3. Chart Ruler (Ruler of Ascendant)
  let chartRulerSynthesisVi = '';
  const ascRuler = houseRulers.find((hr) => hr.houseNumber === 1);
  if (ascRuler) {
    const rulerObj = objects.find((o) => o.id === ascRuler.traditionalRulerId);
    if (rulerObj) {
      const houseTarget = HOUSE_THEMES[rulerObj.house]?.domainVi ?? `Nhà ${rulerObj.house}`;
      const dignityLabel = rulerObj.dignity?.labelVi ? ` (${rulerObj.dignity.labelVi})` : '';
      chartRulerSynthesisVi = `Chủ tinh Cung Mọc là ${ascRuler.traditionalRulerVi}${rulerObj.symbol} ngụ tại ${rulerObj.signVi} (Nhà ${rulerObj.house})${dignityLabel}. Toàn bộ phong thái của Cung Mọc ${asc.signVi} được dẫn dắt bởi nguồn năng lượng này, tập trung trọng tâm phát triển cuộc đời vào lĩnh vực ${houseTarget}.`;
    }
  }

  // 4. Big Three Contextual Synthesis (Sun, Moon, Ascendant)
  let bigThreeSynthesisVi = '';
  if (sun && moon) {
    const sunHouseTheme = HOUSE_THEMES[sun.house]?.domainVi ?? `Nhà ${sun.house}`;
    const moonHouseTheme = HOUSE_THEMES[moon.house]?.domainVi ?? `Nhà ${moon.house}`;
    bigThreeSynthesisVi = `Tam Trụ Bản Mệnh tạo nên cấu trúc Thân - Tâm - Trí hài hòa: Ý chí nhận thức cốt lõi (Mặt Trời ${sun.signVi} tại Nhà ${sun.house} - ${sunHouseTheme}) được dẫn dắt bởi nhu cầu an toàn nội tâm (Mặt Trăng ${moon.signVi} tại Nhà ${moon.house} - ${moonHouseTheme}), và thể hiện ra bên ngoài qua phong thái đĩnh đạc của Cung Mọc ${asc.signVi}.`;
  }

  // 5. Midheaven (MC) Career Reading
  let midheavenReadingVi = '';
  const mcRuler = houseRulers.find((hr) => hr.houseNumber === 10);
  const tenthHousePlanets = objects.filter((o) => o.house === 10 && !o.isAngle);
  const planetsIn10Str =
    tenthHousePlanets.length > 0
      ? `Có sự hội tụ trực tiếp của **${tenthHousePlanets.map((p) => `${p.nameVi} ${p.symbol}`).join(', ')}** tại Nhà 10`
      : 'Nhà 10 tập trung theo định hướng của chủ tinh';
  midheavenReadingVi = `Thiên Đỉnh (Midheaven) tại ${mc.signVi} (${mc.degree ?? 0}°${mc.minute ?? 0}'): Con đường sự nghiệp và danh vọng xã hội hướng tới sự chuyên nghiệp, chuẩn mực. ${planetsIn10Str}${mcRuler ? `, dưới sự điều phối của Chủ tinh Nhà 10 (${mcRuler.traditionalRulerVi} tại Nhà ${mcRuler.rulerHouse ?? 10} - ${mcRuler.rulerSignVi ?? ''})` : ''}.`;

  // 6. Object-by-Object Multi-Factor Synthesis
  const objectSyntheses: WesternSynthesizedReading['objectSyntheses'] = {};

  objects.forEach((obj) => {
    if (obj.isAngle) return;

    // A. Dignity
    let dignitySummaryVi = '';
    if (obj.dignity) {
      const digMeta = DIGNITY_EXPLANATIONS[obj.dignity.type];
      if (digMeta) {
        dignitySummaryVi = `${digMeta.label}: ${digMeta.desc}`;
      }
    }

    // B. House Rulership (which houses does this planet rule?)
    const ruledHouses = houseRulers.filter((hr) => hr.traditionalRulerId === obj.id).map((hr) => hr.houseNumber);
    let rulershipSummaryVi = '';
    if (ruledHouses.length > 0) {
      const houseListStr = ruledHouses.map((h) => `Nhà ${h} (${HOUSE_THEMES[h]?.keywordVi ?? ''})`).join(' & ');
      rulershipSummaryVi = `Quản chiếu ${houseListStr}, mang nguồn lực của các lĩnh vực này hội tụ về Nhà ${obj.house} (${HOUSE_THEMES[obj.house]?.keywordVi ?? ''}).`;
    }

    // C. Aspects
    const objAspects = aspects.filter((a) => a.objectAId === obj.id || a.objectBId === obj.id);
    const topAspectNotes: string[] = [];
    objAspects.slice(0, 3).forEach((asp) => {
      const otherName = asp.objectAId === obj.id ? asp.objectBName : asp.objectAName;
      const orbStr = `${asp.orbDifference.toFixed(1)}°`;
      if (asp.name === 'conjunction') {
        topAspectNotes.push(`Trùng tụ với ${otherName} (sai số ${orbStr}): Năng lượng hòa quyện mật thiết`);
      } else if (asp.name === 'trine') {
        topAspectNotes.push(`Tam hợp với ${otherName} (sai số ${orbStr}): Luồng trợ lực tự nhiên hanh thông`);
      } else if (asp.name === 'square') {
        topAspectNotes.push(`Vuông góc với ${otherName} (sai số ${orbStr}): Thử thách thúc đẩy đột phá`);
      } else if (asp.name === 'opposition') {
        topAspectNotes.push(`Đối đỉnh với ${otherName} (sai số ${orbStr}): Bài học cân bằng hai thái cực`);
      } else if (asp.name === 'sextile') {
        topAspectNotes.push(`Lục hợp với ${otherName} (sai số ${orbStr}): Cơ hội thuận lợi qua hành động`);
      }
    });
    const aspectsSummaryVi =
      topAspectNotes.length > 0 ? topAspectNotes.join('; ') : 'Góc chiếu bình hòa, độc lập thể hiện năng lượng.';

    // D. Retrograde
    let retrogradeNoteVi: string | undefined;
    if (obj.retrograde) {
      retrogradeNoteVi =
        'Nghịch hành (Retrograde): Quá trình chuyển hóa năng lượng diễn ra sâu sắc ở thế giới nội tâm, cần thời gian chiêm nghiệm và tôi luyện kỹ lưỡng trước khi bộc lộ ra ngoài.';
    }

    // E. Full Contextual Reading
    const houseContext = HOUSE_THEMES[obj.house]?.domainVi ?? `Nhà ${obj.house}`;
    const fullContextualReadingVi = `${obj.nameVi} tọa lạc tại ${obj.signVi} (${obj.degree}°${obj.minute}') thuộc Nhà ${obj.house} (${houseContext}). ${dignitySummaryVi ? `${dignitySummaryVi} ` : ''}${rulershipSummaryVi ? `${rulershipSummaryVi} ` : ''}${retrogradeNoteVi ? `${retrogradeNoteVi} ` : ''}${aspectsSummaryVi ? `Tương tác góc chiếu: ${aspectsSummaryVi}.` : ''}`;

    objectSyntheses[obj.id] = {
      objectId: obj.id,
      nameVi: obj.nameVi,
      signVi: obj.signVi,
      house: obj.house,
      dignitySummaryVi,
      rulershipSummaryVi,
      aspectsSummaryVi,
      retrogradeNoteVi,
      fullContextualReadingVi,
    };
  });

  // 7. Dominant Patterns & Element Balance
  const dominantPatternsVi: string[] = [];
  if (aspectPatterns && aspectPatterns.length > 0) {
    aspectPatterns.forEach((p) => {
      const planetNames = p.planets?.map((pl) => pl.nameVi) ?? [];
      const synthNote = p.personalizedSynthesis?.uniqueGiftVi ? ` — ${p.personalizedSynthesis.uniqueGiftVi}` : '';
      dominantPatternsVi.push(
        `Cấu trúc góc đặc biệt: ${p.nameVi} (${p.type}) liên kết **${planetNames.join(' - ')}**. ${p.descriptionVi}${synthNote}`,
      );
    });
  }

  let elementalBalanceVi = '';
  if (elementBalance) {
    const { dominantElement, dominantModality, elements, modalities } = elementBalance;
    elementalBalanceVi = `Phân bổ năng lượng tự nhiên: Nguyên tố chủ đạo là ${dominantElement} (${elements[dominantElement as keyof typeof elements] ?? 0}%), Tính chất chủ đạo là ${dominantModality} (${modalities[dominantModality as keyof typeof modalities] ?? 0}%). Điều này phản ánh xu hướng tiếp cận thế giới bằng sự linh hoạt, thực tế và nhạy bén.`;
  }

  // 8. Growth Tensions & Actionable Guidance
  const growthTensionsVi: string[] = [];
  const hardAspects = aspects.filter((a) => ['square', 'opposition'].includes(a.name) && a.orbDifference <= 3.5);
  if (hardAspects.length > 0) {
    hardAspects.slice(0, 2).forEach((asp) => {
      growthTensionsVi.push(
        `Thử thách tăng trưởng: Góc ${asp.name === 'square' ? 'Vuông góc' : 'Đối đỉnh'} giữa ${asp.objectAName} và ${asp.objectBName} (${asp.orbDifference.toFixed(1)}° orb) nhắc nhở bạn cần dung hòa giữa việc khẳng định mục tiêu cá nhân và thấu hiểu nhu cầu của đối phương.`,
      );
    });
  } else {
    growthTensionsVi.push(
      'Lá số có nhiều góc chiếu hòa hợp, bạn dễ dàng tiếp cận các cơ hội nhưng cần chủ động tạo áp lực tự thân để không rơi vào vùng an toàn quá sớm.',
    );
  }

  const actionableGuidanceVi = `Kim chỉ nam hành động: Lấy năng lượng của Cung Mọc ${asc.signVi} làm phong thái tiếp cận thế giới, phát huy phẩm chất của ${sun?.nameVi ?? 'Mặt Trời'} ${sun?.signVi ?? ''} tại Nhà ${sun?.house ?? 10} để khẳng định thành tựu, và nuôi dưỡng sự cân bằng cảm xúc theo chỉ dẫn của ${moon?.nameVi ?? 'Mặt Trăng'} ${moon?.signVi ?? ''} tại Nhà ${moon?.house ?? 1}.`;

  return {
    sect: {
      isDiurnal,
      sectLight,
      sectBenefit,
      descriptionVi: sectDescriptionVi,
    },
    moonPhaseReadingVi,
    bigThreeSynthesisVi,
    chartRulerSynthesisVi,
    midheavenReadingVi,
    objectSyntheses,
    dominantPatternsVi,
    elementalBalanceVi,
    growthTensionsVi,
    actionableGuidanceVi,
  };
}
