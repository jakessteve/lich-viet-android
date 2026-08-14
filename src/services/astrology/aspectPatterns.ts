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

/**
 * Detects special geometric aspect patterns in a natal chart.
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

  const patterns: AspectPattern[] = [];
  const n = planets.length;
  if (n < 3) return patterns;

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
      patterns.push({
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
          patterns.push({
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
      patterns.push({
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
      // p1 and p2 are in opposition. Find apex planet squaring both
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

  // 4. Grand Cross (2 T-Squares with same opposition or 2 oppositions mutually squaring)
  const usedTSquares = new Set<number>();
  for (let i = 0; i < tSquares.length; i++) {
    for (let j = i + 1; j < tSquares.length; j++) {
      const ts1 = tSquares[i];
      const ts2 = tSquares[j];
      // Check if they form a Grand Cross with 4 distinct planets
      const set = new Set([ts1.p1.id, ts1.p2.id, ts1.apex.id, ts2.p1.id, ts2.p2.id, ts2.apex.id]);
      if (set.size === 4) {
        usedTSquares.add(i);
        usedTSquares.add(j);
        const allPlanets = [ts1.p1, ts1.p2, ts1.apex, ts2.apex];
        const existingCross = patterns.find((p) => p.type === 'grand_cross');
        if (!existingCross) {
          patterns.push({
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
      patterns.push({
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

  // 5. Yods (Finger of God: 2 planets in sextile 60°, both quincunx 150° to apex)
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
          patterns.push({
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

  // 6. Mystic Rectangle (2 oppositions, connected by 2 trines and 2 sextiles)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(planets[i].longitude, planets[j].longitude, 180, oppOrb)) continue;
      for (let k = j + 1; k < n; k++) {
        for (let m = k + 1; m < n; m++) {
          if (!isAspect(planets[k].longitude, planets[m].longitude, 180, oppOrb)) continue;
          const p1 = planets[i], p2 = planets[j], p3 = planets[k], p4 = planets[m];
          // Check connections
          const hasTrineAndSextile =
            (isAspect(p1.longitude, p3.longitude, 120, trineOrb) && isAspect(p1.longitude, p4.longitude, 60, sexOrb) &&
             isAspect(p2.longitude, p4.longitude, 120, trineOrb) && isAspect(p2.longitude, p3.longitude, 60, sexOrb)) ||
            (isAspect(p1.longitude, p4.longitude, 120, trineOrb) && isAspect(p1.longitude, p3.longitude, 60, sexOrb) &&
             isAspect(p2.longitude, p3.longitude, 120, trineOrb) && isAspect(p2.longitude, p4.longitude, 60, sexOrb));

          if (hasTrineAndSextile) {
            patterns.push({
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

  return patterns;
}
