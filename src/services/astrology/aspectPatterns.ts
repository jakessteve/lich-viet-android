export interface AspectPatternPlanet {
  id: string;
  name: string;
  nameVi: string;
  symbol: string;
  longitude: number;
  signVi: string;
  house?: number;
}

export type AspectPatternType =
  | 'grand_trine'
  | 't_square'
  | 'grand_cross'
  | 'stellium'
  | 'yod'
  | 'kite'
  | 'mystic_rectangle';

export interface AspectPattern {
  id: string;
  type: AspectPatternType;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  planets: AspectPatternPlanet[];
  elementOrModality?: string;
  apexPlanet?: AspectPatternPlanet;
  activatedHouses?: number[];
  apexDetails?: {
    planetName: string;
    sign: string;
    house?: number;
    focusAreaVi: string;
  };
  resolutionPoint?: {
    oppositeSignVi: string;
    oppositeHouse?: number;
    adviceVi: string;
  };
  personalizedSynthesis?: {
    coreChallengeVi: string;
    uniqueGiftVi: string;
    actionableAdviceVi: string;
  };
  lifeAreasVi?: string[];
}


const norm = (deg: number) => ((deg % 360) + 360) % 360;

function angleDiff(a: number, b: number): number {
  const diff = Math.abs(norm(a) - norm(b));
  return Math.min(diff, 360 - diff);
}

function isAspect(a: number, b: number, targetAngle: number, orb: number): boolean {
  return Math.abs(angleDiff(a, b) - targetAngle) <= orb;
}

const ELEMENT_BY_SIGN_INDEX = ['fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water'] as const;
const ELEMENT_NAMES_VI: Record<string, string> = {
  fire: 'Lửa',
  earth: 'Đất',
  air: 'Khí',
  water: 'Nước',
};

const MODALITY_BY_SIGN_INDEX = ['cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable'] as const;
const MODALITY_NAMES_VI: Record<string, string> = {
  cardinal: 'Thống Lĩnh',
  fixed: 'Kiên Định',
  mutable: 'Biến Đổi',
};

export const HOUSE_THEMES_VI: Record<number, { domain: string; description: string }> = {
  1: { domain: 'Bản thân & Diện mạo', description: 'Cá tính độc lập, phong thái lãnh đạo và cách tiếp cận thế giới' },
  2: { domain: 'Tài chính & Giá trị', description: 'Năng lực tài chính, của cải vật chất và giá trị tự thân' },
  3: { domain: 'Tư duy & Giao tiếp', description: 'Trí tuệ thực hành, ngôn ngữ, kỹ năng thích ứng và quan hệ thân cận' },
  4: { domain: 'Gia đình & Cội nguồn', description: 'Nền tảng nội tâm, mái ấm gia đình và sự bình yên cội rễ' },
  5: { domain: 'Sáng tạo & Tình cảm', description: 'Tài năng nghệ thuật, con cái, tình yêu và niềm vui tỏa sáng' },
  6: { domain: 'Sức khỏe & Phụng sự', description: 'Kỷ luật công việc, sự chu đáo, thói quen sinh hoạt và sức khỏe' },
  7: { domain: 'Hôn nhân & Đối tác', description: 'Quan hệ cộng tác, bạn đời, sự cân bằng và thấu hiểu tha nhân' },
  8: { domain: 'Chuyển hóa & Nguồn lực chung', description: 'Tài chính hợp tác, tâm lý học sâu sắc, sự tái sinh và vượt ngưỡng' },
  9: { domain: 'Triết lý & Khám phá', description: 'Học vấn bậc cao, du hành mở rộng tầm nhìn, niềm tin và thế giới quan' },
  10: { domain: 'Sự nghiệp & Danh vọng', description: 'Địa vị xã hội, hoài bão lớn, đỉnh cao danh tiếng và trách nhiệm cộng đồng' },
  11: { domain: 'Cộng đồng & Khát vọng', description: 'Mạng lưới kết nối, bạn bè chí hướng, lý tưởng tiến bộ xã hội' },
  12: { domain: 'Tiềm thức & Tâm linh', description: 'Trực giác thần bí, sự buông bỏ vị kỷ, năng lực chữa lành và thế giới nội tâm' },
};

const OPPOSITE_SIGN_MAP: Record<string, string> = {
  'Bạch Dương': 'Thiên Bình',
  'Kim Ngưu': 'Bọ Cạp',
  'Song Tử': 'Nhân Mã',
  'Cự Giải': 'Ma Kết',
  'Sư Tử': 'Bảo Bình',
  'Xử Nữ': 'Song Ngư',
  'Thiên Bình': 'Bạch Dương',
  'Bọ Cạp': 'Kim Ngưu',
  'Nhân Mã': 'Song Tử',
  'Ma Kết': 'Cự Giải',
  'Bảo Bình': 'Sư Tử',
  'Song Ngư': 'Xử Nữ',
};

function getOppositeHouse(house?: number): number | undefined {
  if (!house || house < 1 || house > 12) return undefined;
  return ((house + 5) % 12) + 1;
}

function enrichPatternDetails(pattern: AspectPattern): AspectPattern {
  const houses = Array.from(
    new Set(pattern.planets.map((p) => p.house).filter((h): h is number => typeof h === 'number' && h >= 1 && h <= 12))
  ).sort((a, b) => a - b);

  pattern.activatedHouses = houses;
  pattern.lifeAreasVi = houses.map((h) => `Nhà ${h} (${HOUSE_THEMES_VI[h]?.domain ?? ''})`);

  const apex = pattern.apexPlanet;
  if (apex) {
    const apexHouse = apex.house;
    const apexHouseTheme = apexHouse ? HOUSE_THEMES_VI[apexHouse] : undefined;
    pattern.apexDetails = {
      planetName: apex.nameVi,
      sign: apex.signVi,
      house: apexHouse,
      focusAreaVi: apexHouseTheme
        ? `${apexHouseTheme.domain}: ${apexHouseTheme.description}`
        : `Cung hoàng đạo ${apex.signVi}`,
    };

    const oppSign = OPPOSITE_SIGN_MAP[apex.signVi] || '';
    const oppHouse = getOppositeHouse(apexHouse);
    const oppHouseTheme = oppHouse ? HOUSE_THEMES_VI[oppHouse] : undefined;

    let adviceText = '';
    if (pattern.type === 't_square') {
      adviceText = oppHouseTheme
        ? `Tập trung phát triển phẩm chất của cung ${oppSign} và lĩnh vực Nhà ${oppHouse} (${oppHouseTheme.domain}) làm điểm tựa đối trọng để giải phóng áp lực nội tâm một cách lành mạnh.`
        : `Cân bằng năng lượng bằng cách rèn luyện phẩm chất hướng nội và đối trọng của cung ${oppSign}.`;
    } else if (pattern.type === 'kite') {
      adviceText = `Sử dụng năng lượng thực thi tại ${apex.nameVi} ở ${apex.signVi}${apexHouse ? ` (Nhà ${apexHouse})` : ''} để biến dòng chảy may mắn tự nhiên thành thành tựu hữu hình.`;
    } else if (pattern.type === 'yod') {
      adviceText = `Đón nhận sự điều chỉnh nhận thức linh hoạt tại ${apex.nameVi}${apexHouse ? ` (Nhà ${apexHouse})` : ''}, biến điểm nhạy cảm thành trực giác độc nhất vô nhị.`;
    }

    if (oppSign || oppHouse) {
      pattern.resolutionPoint = {
        oppositeSignVi: oppSign,
        oppositeHouse: oppHouse,
        adviceVi: adviceText,
      };
    }
  }

  // Generate multi-layered deeply personalized synthesis
  const planetDetails = pattern.planets.map((p) => `${p.nameVi} (${p.signVi}${p.house ? ` - Nhà ${p.house}` : ''})`).join(', ');
  const houseSummary = houses.length > 0 ? `tại các Nhà [${houses.join(', ')}]` : '';

  switch (pattern.type) {
    case 't_square': {
      const oppPlanets = pattern.planets.filter((p) => p.id !== apex?.id);
      const p1 = oppPlanets[0];
      const p2 = oppPlanets[1];
      const p1Desc = p1 ? `${p1.nameVi} (${p1.signVi}${p1.house ? ` - Nhà ${p1.house}` : ''})` : '';
      const p2Desc = p2 ? `${p2.nameVi} (${p2.signVi}${p2.house ? ` - Nhà ${p2.house}` : ''})` : '';
      const apexDesc = apex ? `${apex.nameVi} (${apex.signVi}${apex.house ? ` - Nhà ${apex.house}` : ''})` : 'hành tinh đỉnh';

      const p1Theme = p1?.house ? HOUSE_THEMES_VI[p1.house]?.domain : 'nội lực';
      const p2Theme = p2?.house ? HOUSE_THEMES_VI[p2.house]?.domain : 'môi trường bên ngoài';
      const apexTheme = apex?.house ? HOUSE_THEMES_VI[apex.house]?.domain : 'trọng tâm hành động';

      pattern.personalizedSynthesis = {
        coreChallengeVi: `Áp lực và trục đối kháng giữa ${p1Desc} và ${p2Desc} tạo ra sự giằng xé giữa ${p1Theme} và ${p2Theme}, dồn toàn bộ sức ép góc vuông (90°) lên đỉnh ${apexDesc}.`,
        uniqueGiftVi: `Nguồn động lực thép và ý chí chịu áp lực phi thường: Khi thuần phục được năng lượng tại ${apexDesc}, bạn sẽ bứt phá ngoạn mục và dẫn đầu trong phương diện ${apexTheme}.`,
        actionableAdviceVi: pattern.resolutionPoint?.adviceVi ?? `Giải phóng xung đột bằng cách rèn luyện phẩm chất của cung đối trọng và tạo khoảng nghỉ tĩnh tâm.`,
      };
      break;
    }
    case 'grand_trine': {
      const pList = pattern.planets.map((p) => `${p.nameVi} (${p.signVi}${p.house ? ` - Nhà ${p.house}` : ''})`).join(' · ');
      pattern.personalizedSynthesis = {
        coreChallengeVi: `Dòng chảy quá êm ả giữa [${pList}] có thể ru ngủ ý chí, khiến bạn dễ bằng lòng với vùng an toàn nếu không tự đặt ra các thách thức lớn hơn.`,
        uniqueGiftVi: `Thiên phú tự nhiên và phúc duyên lớn thuộc nguyên tố ${pattern.elementOrModality ?? 'hòa hợp'}, giúp kết nối liền mạch tài năng bẩm sinh qua các trục ${houseSummary}.`,
        actionableAdviceVi: `Chủ động thiết lập kỷ luật và dự án thực tế để chuyển hóa vận may tự nhiên thành thành tựu bền vững suốt đời.`,
      };
      break;
    }
    case 'kite': {
      const trinePlanets = pattern.planets.filter((p) => p.id !== apex?.id);
      const apexDesc = apex ? `${apex.nameVi} (${apex.signVi}${apex.house ? ` - Nhà ${apex.house}` : ''})` : 'mũi tên hành động';
      const apexTheme = apex?.house ? HOUSE_THEMES_VI[apex.house]?.domain : 'trọng tâm khai phóng';
      pattern.personalizedSynthesis = {
        coreChallengeVi: `Cần điều phối áp lực từ trục đối đỉnh để mũi nhọn ${apexDesc} không bị quá tải hay bộc phát nóng vội.`,
        uniqueGiftVi: `Cấu trúc lý tưởng bậc nhất: Tam Hợp Lớn cung cấp nội lực dồi dào, trong khi ${apexDesc} đóng vai trò mũi tên hành động biến thiên phú thành thành tựu hữu hình tại ${apexTheme}.`,
        actionableAdviceVi: `Tập trung cao độ nguồn lực vào lĩnh vực ${apexTheme} để dẫn dắt toàn bộ thế cục cuộc đời vươn tới đỉnh cao.`,
      };
      break;
    }
    case 'grand_cross': {
      pattern.personalizedSynthesis = {
        coreChallengeVi: `Căng thẳng 4 chiều bao trùm các trục đời sống cốt lõi ${houseSummary} (${pattern.elementOrModality ?? 'Thống Lĩnh/Kiên Định'}), đòi hỏi sự linh hoạt và cân bằng năng lượng liên tục.`,
        uniqueGiftVi: `Bản lĩnh kim cương, sức bền vô hạn trước nghịch cảnh và năng lực quản trị khủng hoảng xuất sắc hiếm ai sánh kịp.`,
        actionableAdviceVi: `Học cách phân quyền, không ôm đồm toàn bộ trách nhiệm và duy trì sự tĩnh tại nội tâm trước các biến cố bên ngoài.`,
      };
      break;
    }
    case 'stellium': {
      const signName = pattern.planets[0]?.signVi ?? 'Bản Cung';
      const primaryHouse = pattern.planets[0]?.house;
      const houseTheme = primaryHouse ? HOUSE_THEMES_VI[primaryHouse]?.domain : 'phương diện cuộc sống';
      pattern.personalizedSynthesis = {
        coreChallengeVi: `Tụ điểm năng lượng cực lớn tại cung ${signName} (${houseSummary}) khiến bạn dễ bị ám ảnh, dồn toàn bộ tâm trí vào ${houseTheme} mà xao nhãng các góc khác của cuộc đời.`,
        uniqueGiftVi: `Sức mạnh tập trung phi thường, tài năng chuyên biệt xuất chúng và sự nhạy bén vượt trội trong lĩnh vực ${houseTheme}.`,
        actionableAdviceVi: `Tận dụng tối đa sự thấu hiểu sâu sắc trong lĩnh vực ${houseTheme}, đồng thời chủ động bồi đắp cung đối xứng để duy trì sự cân bằng dài lâu.`,
      };
      break;
    }
    case 'yod': {
      const apexDesc = apex ? `${apex.nameVi} (${apex.signVi}${apex.house ? ` - Nhà ${apex.house}` : ''})` : 'ngón tay của số phận';
      pattern.personalizedSynthesis = {
        coreChallengeVi: `Cảm giác bất định và những bước ngoặt mang tính định mệnh buộc bạn phải liên tục thanh lọc và tái định hình bản thân tại ${apexDesc}.`,
        uniqueGiftVi: `Trực giác tâm linh thấu thị và năng lực giải quyết các bài toán phức tạp bằng góc nhìn vượt ra ngoài khuôn khổ thông thường.`,
        actionableAdviceVi: pattern.resolutionPoint?.adviceVi ?? `Lắng nghe trực giác bên trong và bình thản đón nhận những bước ngoặt tái sinh của cuộc đời.`,
      };
      break;
    }
    case 'mystic_rectangle': {
      pattern.personalizedSynthesis = {
        coreChallengeVi: `Phải giải quyết những mâu thuẫn đối lập giữa hai trục ${houseSummary} trước khi khai mở được sự đồng điệu trọn vẹn.`,
        uniqueGiftVi: `Năng lực tích hợp xung đột thành sức mạnh sáng tạo, tư duy cân bằng hoàn hảo và sự bình tĩnh hiếm có khi đối diện thử thách.`,
        actionableAdviceVi: `Dùng các góc tam hợp và lục hợp làm cầu nối để hòa giải những bất đồng trong công việc và cuộc sống.`,
      };
      break;
    }
  }

  return pattern;
}

/**
 * Detects special geometric aspect patterns in a natal chart and enriches them
 * with dynamic, personalized, DOB/POB-sensitive synthesis.
 */
export function detectAspectPatterns(
  planets: AspectPatternPlanet[],
  options: {
    trineOrb?: number;
    squareOrb?: number;
    oppositionOrb?: number;
    sextileOrb?: number;
    quincunxOrb?: number;
  } = {}
): AspectPattern[] {
  const trineOrb = options.trineOrb ?? 6;
  const squareOrb = options.squareOrb ?? 6;
  const oppOrb = options.oppositionOrb ?? 6;
  const sexOrb = options.sextileOrb ?? 5;
  const quinOrb = options.quincunxOrb ?? 4;

  const rawPatterns: AspectPattern[] = [];
  const n = planets.length;
  if (n < 3) return rawPatterns;

  // 1. Stelliums (3+ planets in same sign or within 8-10 degrees of each other)
  const signGroups = new Map<number, AspectPatternPlanet[]>();
  planets.forEach((p) => {
    const signIdx = Math.floor(norm(p.longitude) / 30);
    const list = signGroups.get(signIdx) ?? [];
    list.push(p);
    signGroups.set(signIdx, list);
  });

  signGroups.forEach((group, signIdx) => {
    if (group.length >= 3) {
      const signNames = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];
      rawPatterns.push({
        id: `stellium-${signIdx}`,
        type: 'stellium',
        nameVi: `Cụm Tinh Tú (${group.length} hành tinh tại ${signNames[signIdx]})`,
        nameEn: 'Stellium',
        descriptionVi: `Sự tập trung năng lượng đặc biệt lớn tại cung ${signNames[signIdx]}, tạo nên tài năng xuất chúng và trọng tâm cuộc đời không thể tách rời.`,
        planets: group,
        elementOrModality: ELEMENT_NAMES_VI[ELEMENT_BY_SIGN_INDEX[signIdx]],
      });
    }
  });

  // 2. Grand Trines & Kites
  const grandTrines: Array<{ p1: AspectPatternPlanet; p2: AspectPatternPlanet; p3: AspectPatternPlanet; element: string }> = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(planets[i].longitude, planets[j].longitude, 120, trineOrb)) continue;
      for (let k = j + 1; k < n; k++) {
        if (
          isAspect(planets[j].longitude, planets[k].longitude, 120, trineOrb) &&
          isAspect(planets[k].longitude, planets[i].longitude, 120, trineOrb)
        ) {
          const signI = Math.floor(norm(planets[i].longitude) / 30);
          const elem = ELEMENT_NAMES_VI[ELEMENT_BY_SIGN_INDEX[signI]] || 'Đặc biệt';
          grandTrines.push({ p1: planets[i], p2: planets[j], p3: planets[k], element: elem });
        }
      }
    }
  }

  // Check for Kites based on Grand Trines
  const grandTrineInKite = new Set<string>();
  grandTrines.forEach((gt, idx) => {
    const trio = [gt.p1, gt.p2, gt.p3];
    // Look for a 4th planet that opposes one of the trio and sextiles the other two
    for (let m = 0; m < n; m++) {
      const p4 = planets[m];
      if (trio.some((p) => p.id === p4.id)) continue;

      for (let apexIdx = 0; apexIdx < 3; apexIdx++) {
        const opposedApex = trio[apexIdx];
        const other1 = trio[(apexIdx + 1) % 3];
        const other2 = trio[(apexIdx + 2) % 3];

        if (
          isAspect(p4.longitude, opposedApex.longitude, 180, oppOrb) &&
          isAspect(p4.longitude, other1.longitude, 60, sexOrb) &&
          isAspect(p4.longitude, other2.longitude, 60, sexOrb)
        ) {
          grandTrineInKite.add(`${gt.p1.id}-${gt.p2.id}-${gt.p3.id}`);
          rawPatterns.push({
            id: `kite-${idx}-${p4.id}`,
            type: 'kite',
            nameVi: `Cánh Diều (Kite - ${gt.element})`,
            nameEn: 'Kite',
            descriptionVi: `Cấu trúc Tam Hợp Lớn kết hợp với trục đối đỉnh tại ${p4.nameVi}, giúp giải phóng tiềm năng và biến tài năng bẩm sinh thành hành động thực tế.`,
            planets: [...trio, p4],
            elementOrModality: gt.element,
            apexPlanet: p4,
          });
        }
      }
    }
  });

  // Add remaining Grand Trines that are not part of a Kite
  grandTrines.forEach((gt, idx) => {
    const key = `${gt.p1.id}-${gt.p2.id}-${gt.p3.id}`;
    if (!grandTrineInKite.has(key)) {
      rawPatterns.push({
        id: `grand-trine-${idx}`,
        type: 'grand_trine',
        nameVi: `Tam Hợp Lớn (Grand Trine - Nguyên tố ${gt.element})`,
        nameEn: 'Grand Trine',
        descriptionVi: `Dòng chảy năng lượng vô cùng êm ả và may mắn thuộc nhóm ${gt.element}, mang lại năng khiếu bẩm sinh, sự hài hòa và phúc lành tự nhiên.`,
        planets: [gt.p1, gt.p2, gt.p3],
        elementOrModality: gt.element,
      });
    }
  });

  // 3. T-Squares
  const tSquares: Array<{ p1: AspectPatternPlanet; p2: AspectPatternPlanet; apex: AspectPatternPlanet; modality: string }> = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(planets[i].longitude, planets[j].longitude, 180, oppOrb)) continue;
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const apex = planets[k];
        if (
          isAspect(planets[i].longitude, apex.longitude, 90, squareOrb) &&
          isAspect(planets[j].longitude, apex.longitude, 90, squareOrb)
        ) {
          const mod = MODALITY_NAMES_VI[MODALITY_BY_SIGN_INDEX[Math.floor(norm(apex.longitude) / 30)]] || '';
          tSquares.push({ p1: planets[i], p2: planets[j], apex, modality: mod });
        }
      }
    }
  }

  // 4. Grand Cross
  const usedTSquares = new Set<number>();
  for (let i = 0; i < tSquares.length; i++) {
    for (let j = i + 1; j < tSquares.length; j++) {
      const ts1 = tSquares[i];
      const ts2 = tSquares[j];
      const set = new Set([ts1.p1.id, ts1.p2.id, ts1.apex.id, ts2.p1.id, ts2.p2.id, ts2.apex.id]);
      if (set.size === 4) {
        usedTSquares.add(i);
        usedTSquares.add(j);
        const allPlanets = [ts1.p1, ts1.p2, ts1.apex, ts2.apex];
        const existingCross = rawPatterns.find((p) => p.type === 'grand_cross');
        if (!existingCross) {
          rawPatterns.push({
            id: `grand-cross-${i}-${j}`,
            type: 'grand_cross',
            nameVi: `Thập Tự Lớn (Grand Cross - ${ts1.modality})`,
            nameEn: 'Grand Cross',
            descriptionVi: `Cấu trúc thử thách và áp lực cực cao từ 4 góc vuông và 2 trục đối đỉnh, tạo ra ý chí thép và động lực kiên cường vượt qua nghịch cảnh.`,
            planets: allPlanets,
            elementOrModality: ts1.modality,
          });
        }
      }
    }
  }

  // Add individual T-Squares
  tSquares.forEach((ts, idx) => {
    if (!usedTSquares.has(idx)) {
      rawPatterns.push({
        id: `t-square-${idx}`,
        type: 't_square',
        nameVi: `Chữ T Vuông (T-Square - ${ts.modality})`,
        nameEn: 'T-Square',
        descriptionVi: `Căng thẳng nội tâm thúc đẩy hành động mạnh mẽ hướng về đỉnh ${ts.apex.nameVi}, là cội nguồn của tham vọng và thành tựu vượt trội.`,
        planets: [ts.p1, ts.p2, ts.apex],
        elementOrModality: ts.modality,
        apexPlanet: ts.apex,
      });
    }
  });

  // 5. Yods
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(planets[i].longitude, planets[j].longitude, 60, sexOrb)) continue;
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const apex = planets[k];
        if (
          isAspect(planets[i].longitude, apex.longitude, 150, quinOrb) &&
          isAspect(planets[j].longitude, apex.longitude, 150, quinOrb)
        ) {
          rawPatterns.push({
            id: `yod-${i}-${j}-${k}`,
            type: 'yod',
            nameVi: `Ngón Tay Thượng Đế (Yod)`,
            nameEn: 'Yod (Finger of God)',
            descriptionVi: `Cấu trúc định mệnh tâm linh chỉ thẳng vào ${apex.nameVi}, báo hiệu một sứ mệnh cuộc đời đặc biệt cần điều chỉnh nhận thức để khai mở.`,
            planets: [planets[i], planets[j], apex],
            apexPlanet: apex,
          });
        }
      }
    }
  }

  // 6. Mystic Rectangle
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(planets[i].longitude, planets[j].longitude, 180, oppOrb)) continue;
      for (let k = j + 1; k < n; k++) {
        for (let m = k + 1; m < n; m++) {
          if (!isAspect(planets[k].longitude, planets[m].longitude, 180, oppOrb)) continue;
          const p1 = planets[i], p2 = planets[j], p3 = planets[k], p4 = planets[m];
          const hasTrineAndSextile =
            (isAspect(p1.longitude, p3.longitude, 120, trineOrb) && isAspect(p1.longitude, p4.longitude, 60, sexOrb) &&
             isAspect(p2.longitude, p4.longitude, 120, trineOrb) && isAspect(p2.longitude, p3.longitude, 60, sexOrb)) ||
            (isAspect(p1.longitude, p4.longitude, 120, trineOrb) && isAspect(p1.longitude, p3.longitude, 60, sexOrb) &&
             isAspect(p2.longitude, p3.longitude, 120, trineOrb) && isAspect(p2.longitude, p4.longitude, 60, sexOrb));

          if (hasTrineAndSextile) {
            rawPatterns.push({
              id: `mystic-rectangle-${i}-${j}-${k}-${m}`,
              type: 'mystic_rectangle',
              nameVi: `Chữ Nhật Huyền Bí (Mystic Rectangle)`,
              nameEn: 'Mystic Rectangle',
              descriptionVi: `Sự kết hợp hoàn hảo giữa năng lượng đối kháng và năng lượng hòa giải, giúp chuyển hóa xung đột thành khả năng sáng tạo và trực giác phi thường.`,
              planets: [p1, p2, p3, p4],
            });
          }
        }
      }
    }
  }

  return rawPatterns.map(enrichPatternDetails);
}

