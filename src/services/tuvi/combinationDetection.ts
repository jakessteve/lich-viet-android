/**
 * Tử Vi Star Combination Detection
 *
 * Pure TypeScript module for detecting named star combinations (Cách Cục)
 * in a Tử Vi chart. No React dependencies.
 */

import type {
  TuViPalace,
  TuViCombination,
  CombinationPurity,
  PositionalSemantic,
  CombinationCategory,
} from '../../types/tuvi';
import combinationsData from '../../data/tuvi/combinations.json';
import {
  evaluateResidentInteractions,
  evaluateOppositionInteractions,
  evaluateTrineInteractions,
  evaluateBracketInteractions,
} from './starInteractionRules';

// ── Type Definitions ──────────────────────────────────────────

type StandardConstraint = 'sameCung' | 'tamHop' | 'sameCungOrTamHop' | 'giap';
type CustomMatchKind =
  | 'menhBranchStars'
  | 'tamPhuongCluster'
  | 'menhBracketStars'
  | 'menhBracketMutagen'
  | 'minhChau'
  | 'sunMoonBright'
  | 'menhBranchMalefic'
  | 'hamPair'
  | 'thachTrungAnNgoc'
  | 'songLocTrieuVien'
  | 'phongVanTeHoi';

interface CombinationDefinition {
  id: string;
  name: string;
  nameHanViet: string;
  category: CombinationCategory;
  rarity?: number;
  stars: string[];
  palaceConstraint?: StandardConstraint;
  matchKind?: CustomMatchKind;
  description: string;
  note: string;
  requiresTuHoa?: boolean;
  requiresGiap?: boolean;
  branches?: string[];
  sunBranches?: string[];
  moonBranches?: string[];
  requiredTuHoa?: Array<'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ'>;
}

const COMBINATIONS: CombinationDefinition[] = combinationsData.combinations as CombinationDefinition[];

/** Major Sát Tinh that break a combination (phá). */
const MAJOR_SAT_TINH = new Set(['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh']);

/** Minor Sát Tinh that dilute a combination (bán). */
const MINOR_SAT_TINH = new Set(['Địa Không', 'Địa Kiếp', 'Hóa Kỵ']);

/** All Sát Tinh names for purity checks. */
const ALL_SAT_TINH = new Set([...MAJOR_SAT_TINH, ...MINOR_SAT_TINH]);

/** Brightness score weights for strength calculation. */
const BRIGHTNESS_SCORES: Record<string, number> = {
  Miếu: 2,
  Vượng: 1.5,
  Đắc: 1,
  Địa: 1,
  Lợi: 0.5,
  Bình: 0,
  Bất: -0.5,
  Hãm: -1,
};

// ── Geometry Helpers ──────────────────────────────────────────
import {
  normalizePalaceIndex,
  detectTamHopPalaces,
  detectDoiCung,
  detectNhiHopPalace,
  getAdjacentPalaceIndices,
} from './palaceGeometry';

export { normalizePalaceIndex, detectTamHopPalaces, detectDoiCung, detectNhiHopPalace, getAdjacentPalaceIndices };

// ── Star Extraction ───────────────────────────────────────────

/**
 * Returns all star names in a palace (Chính Tinh + Phụ Tinh + Sát Tinh).
 */
export function getStarsInPalace(palace: TuViPalace): string[] {
  if (!palace) return [];
  return [
    ...palace.chinhTinh.map((s) => s.name),
    ...palace.phuTinh.map((s) => s.name),
    ...palace.satTinh.map((s) => s.name),
  ];
}

/**
 * Returns all star names in the Nhị Hợp paired palace.
 */
export function getStarsInNhiHop(palaces: TuViPalace[], palaceIndex: number): string[] {
  const nhiHopIdx = detectNhiHopPalace(palaceIndex);
  const pairedPalace = palaces[nhiHopIdx];
  return pairedPalace ? getStarsInPalace(pairedPalace) : [];
}

/**
 * Returns all star names in the Tam Phương Tứ Chính
 * (palace + 2 Tam Hợp + Đối Cung).
 */
export function getStarsInTamHop(palaces: TuViPalace[], palaceIndex: number): string[] {
  const normIdx = normalizePalaceIndex(palaceIndex);
  const tamHop = detectTamHopPalaces(normIdx);
  const doiCung = detectDoiCung(normIdx);
  const indices = [normIdx, ...tamHop, doiCung];
  const uniqueIndices = Array.from(new Set(indices));

  const stars: string[] = [];
  for (const idx of uniqueIndices) {
    const p = palaces[idx];
    if (p) {
      stars.push(...getStarsInPalace(p));
    }
  }
  return stars;
}

// ── Purity Check ──────────────────────────────────────────────

/**
 * Checks if a combination is pure (thuần), mixed (bán), or broken (phá).
 *
 * - thuần: no Sát Tinh present
 * - bán:  minor Sát Tinh present (Địa Không, Địa Kiếp, Hóa Kỵ)
 * - phá:  major Sát Tinh present (Kình Dương, Đà La, Hỏa Tinh, Linh Tinh)
 */
export function checkCombinationPurity(involvedPalaces: TuViPalace[], satTinhNames?: string[]): CombinationPurity {
  const customMajor = satTinhNames ? new Set(satTinhNames.filter((n) => MAJOR_SAT_TINH.has(n))) : MAJOR_SAT_TINH;
  const customMinor = satTinhNames ? new Set(satTinhNames.filter((n) => MINOR_SAT_TINH.has(n))) : MINOR_SAT_TINH;

  let hasMajor = false;
  let hasMinor = false;

  for (const palace of involvedPalaces) {
    if (!palace) continue;
    for (const star of palace.satTinh) {
      if (customMajor.has(star.name)) {
        hasMajor = true;
      }
      if (customMinor.has(star.name)) {
        hasMinor = true;
      }
    }
    for (const tuHoa of palace.tuHoa) {
      if (tuHoa.type === 'Kỵ') {
        hasMinor = true;
      }
    }
  }

  if (hasMajor) return 'phá';
  if (hasMinor) return 'bán';
  return 'thuần';
}

// ── Strength Calculation ──────────────────────────────────────

/**
 * Calculates a strength score (1–10) for a detected combination.
 *
 * Factors:
 * - Star brightness (Miếu/Vượng = higher)
 * - Purity (thuần > bán > phá)
 * - Whether any involved palace is the Mệnh palace
 */
export function calculateCombinationStrength(combination: TuViCombination, palaces: TuViPalace[]): number {
  let score = 5;

  const involvedPalaceSet = new Set(combination.involvedCung);
  for (const palace of palaces) {
    if (!involvedPalaceSet.has(palace.name)) continue;

    for (const starName of combination.involvedStars) {
      const brightness = palace.brightness[starName];
      if (brightness) {
        score += BRIGHTNESS_SCORES[brightness] ?? 0;
      }
    }
  }

  switch (combination.purity) {
    case 'thuần':
      score += 2;
      break;
    case 'bán':
      score += 0;
      break;
    case 'phá':
      score -= 2;
      break;
  }

  const menhPalace = palaces.find((p) => p.isMenh);
  if (menhPalace && combination.involvedCung.includes(menhPalace.name)) {
    score += 1;
  }

  return Math.max(1, Math.min(10, Math.round(score)));
}

// ── Combination Detection ─────────────────────────────────────

/**
 * Scans all 12 palaces for named star combinations.
 *
 * Uses the combinations.json data for pattern definitions.
 * For each combination, checks if the required stars are present
 * in the specified palace constraint.
 */
export function detectCombinations(palaces: TuViPalace[]): TuViCombination[] {
  const results: TuViCombination[] = [];
  const seenKeys = new Set<string>();

  for (const def of COMBINATIONS) {
    switch (def.matchKind) {
      case 'menhBranchStars':
        detectMenhBranchStars(palaces, def, results, seenKeys);
        break;
      case 'tamPhuongCluster':
        detectTamPhuongCluster(palaces, def, results, seenKeys);
        break;
      case 'menhBracketStars':
        detectMenhBracketStars(palaces, def, results, seenKeys);
        break;
      case 'menhBracketMutagen':
        detectMenhBracketMutagen(palaces, def, results, seenKeys);
        break;
      case 'minhChau':
        detectMinhChau(palaces, def, results, seenKeys);
        break;
      case 'sunMoonBright':
        detectSunMoonBright(palaces, def, results, seenKeys);
        break;
      case 'menhBranchMalefic':
        detectMenhBranchMalefic(palaces, def, results, seenKeys);
        break;
      case 'hamPair':
        detectHamPair(palaces, def, results, seenKeys);
        break;
      case 'thachTrungAnNgoc':
        detectThachTrungAnNgoc(palaces, def, results, seenKeys);
        break;
      case 'songLocTrieuVien':
        detectSongLocTrieuVien(palaces, def, results, seenKeys);
        break;
      case 'phongVanTeHoi':
        detectPhongVanTeHoi(palaces, def, results, seenKeys);
        break;
      default:
        switch (def.palaceConstraint) {
          case 'sameCung':
            detectSameCung(palaces, def, results, seenKeys);
            break;
          case 'tamHop':
            detectTamHop(palaces, def, results, seenKeys);
            break;
          case 'sameCungOrTamHop':
            detectSameCungOrTamHop(palaces, def, results, seenKeys);
            break;
          case 'giap':
            detectGiap(palaces, def, results, seenKeys);
            break;
        }
    }
  }

  return results;
}

// ── Internal Detectors ────────────────────────────────────────

function makeKey(name: string, cungNames: string[]): string {
  return `${name}::${cungNames.slice().sort().join(',')}`;
}

function getMenhPalace(palaces: TuViPalace[]): TuViPalace | undefined {
  return palaces.find((palace) => palace.isMenh);
}

function getPalaceByBranch(palaces: TuViPalace[], branch: string): TuViPalace | undefined {
  return palaces.find((palace) => palace.chi === branch);
}

function hasStar(palace: TuViPalace | undefined, starName: string): boolean {
  if (!palace) return false;
  return getStarsInPalace(palace).includes(starName);
}

function hasMutagen(palace: TuViPalace | undefined, type: 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ'): boolean {
  if (!palace) return false;
  return palace.tuHoa.some((entry) => entry.type === type);
}

function hasAnyMalefic(palace: TuViPalace | undefined): boolean {
  if (!palace) return false;
  return palace.satTinh.some((star) => MAJOR_SAT_TINH.has(star.name) || MINOR_SAT_TINH.has(star.name));
}

function hasAllStars(haystack: string[], needles: string[]): boolean {
  if (needles.length === 0) return false;
  const set = new Set(haystack);
  return needles.every((n) => set.has(n));
}

function buildContextualCombinationDetails(
  def: CombinationDefinition,
  involvedCung: string[],
  involvedStars: string[],
  purity: CombinationPurity,
  palaces: TuViPalace[],
): TuViCombination['contextualDetails'] {
  const involvedPalaceObjs = palaces.filter((p) => involvedCung.includes(p.name));
  const isMenhThanInvolved = involvedPalaceObjs.some((p) => p.isMenh || p.isThan);

  // Primary Palace
  const menhPalace = involvedPalaceObjs.find((p) => p.isMenh);
  const thanPalace = involvedPalaceObjs.find((p) => p.isThan);
  const quanPalace = involvedPalaceObjs.find((p) => p.name === 'Quan Lộc');
  const taiPalace = involvedPalaceObjs.find((p) => p.name === 'Tài Bạch');
  const primaryPalace = menhPalace ?? thanPalace ?? quanPalace ?? taiPalace ?? involvedPalaceObjs[0];
  const primaryPalaceName = primaryPalace ? primaryPalace.name : (involvedCung[0] ?? 'Bản Cung');

  // Tứ Hóa effects
  const tuHoaEffects: string[] = [];
  involvedPalaceObjs.forEach((p) => {
    p.tuHoa.forEach((th) => {
      if (involvedStars.includes(th.starName)) {
        if (th.type === 'Lộc') {
          tuHoaEffects.push(
            `Hóa Lộc tại ${th.starName} (Cung ${p.name}): Kích hoạt tài vận dồi dào, cơ hội sinh lời và sự trợ lực từ quý nhân.`,
          );
        } else if (th.type === 'Quyền') {
          tuHoaEffects.push(
            `Hóa Quyền tại ${th.starName} (Cung ${p.name}): Tăng cường uy quyền, năng lực quản trị, sự quyết đoán và vai trò dẫn dắt.`,
          );
        } else if (th.type === 'Khoa') {
          tuHoaEffects.push(
            `Hóa Khoa tại ${th.starName} (Cung ${p.name}): Mang lại danh tiếng, học vấn thông tuệ, khả năng giải cứu hung họa và sự kính trọng xã hội.`,
          );
        } else if (th.type === 'Kỵ') {
          tuHoaEffects.push(
            `Hóa Kỵ tại ${th.starName} (Cung ${p.name}): Cảnh báo những biến động tâm lý, trở ngại hoặc đàm tiếu thị phi cần sự cẩn trọng.`,
          );
        }
      }
    });
  });

  // Tuần Triệt impact
  let tuanTrietImpact: string | undefined;
  const primaryPalaceForTuanTriet = primaryPalace ?? involvedPalaceObjs[0];
  if (primaryPalaceForTuanTriet) {
    if (primaryPalaceForTuanTriet.hasTriet && primaryPalaceForTuanTriet.hasTuan) {
      tuanTrietImpact = `Cung ${primaryPalaceForTuanTriet.name} ngộ cả Tuần lẫn Triệt: Gặp nhiều thử thách, thăng trầm tiền vận nhưng tạo nên nội lực sâu sắc và hậu vận ổn định.`;
    } else if (primaryPalaceForTuanTriet.hasTriet) {
      tuanTrietImpact = `Cung ${primaryPalaceForTuanTriet.name} có Triệt Không: Thử thách và tôi luyện ý chí ở giai đoạn tiền vận (trước 30 tuổi), sau đó sẽ dần bộc phát sức mạnh.`;
    } else if (primaryPalaceForTuanTriet.hasTuan) {
      tuanTrietImpact = `Cung ${primaryPalaceForTuanTriet.name} có Tuần Không: Giữ cho năng lượng cách cục được điều tiết êm ả, giảm bớt sự bộc phát thái quá và duy trì thế bền bỉ.`;
    }

    const otherPalacesWithKhong = involvedPalaceObjs
      .filter((p) => p.id !== primaryPalaceForTuanTriet.id && (p.hasTuan || p.hasTriet))
      .map((p) => {
        if (p.hasTuan && p.hasTriet) return `Cung ${p.name} cũng ngộ Tuần - Triệt`;
        if (p.hasTriet) return `Cung ${p.name} ngộ Triệt`;
        return `Cung ${p.name} ngộ Tuần`;
      });

    if (otherPalacesWithKhong.length > 0) {
      const secondaryNote = `(${otherPalacesWithKhong.join('; ')}).`;
      tuanTrietImpact = tuanTrietImpact ? `${tuanTrietImpact} ${secondaryNote}` : secondaryNote;
    }
  }

  // Career and life guidance
  let careerAndLifeGuidance = '';
  if (isMenhThanInvolved) {
    careerAndLifeGuidance = `Cách cục nằm tại trục Mệnh/Thân định hình phong cách sống, bản lĩnh cá nhân và năng lực cốt lõi. Nên kiên trì phát huy thế mạnh của ${involvedStars.join(', ')} trong lĩnh vực sở trường.`;
  } else if (primaryPalaceName === 'Quan Lộc') {
    careerAndLifeGuidance = `Cách cục hội tụ tại Cung Quan Lộc hỗ trợ mạnh mẽ cho sự nghiệp, khả năng thăng tiến và khẳng định chuyên môn trong công việc.`;
  } else if (primaryPalaceName === 'Tài Bạch') {
    careerAndLifeGuidance = `Cách cục hội tụ tại Cung Tài Bạch mở ra các cơ hội tích lũy tài chính, đầu tư và quản trị dòng tiền hiệu quả.`;
  } else if (primaryPalaceName === 'Thiên Di') {
    careerAndLifeGuidance = `Cách cục tại Cung Thiên Di cho thấy môi trường đối ngoại, xuất ngoại hoặc công tác xa là đòn bẩy lớn nhất để phát triển.`;
  } else {
    careerAndLifeGuidance = `Cách cục tại Cung ${primaryPalaceName} tạo nên thế tương trợ quan trọng giữa các mối quan hệ và nền tảng cuộc sống của đương số.`;
  }

  // Dynamic Synthesis
  const purityLabel =
    purity === 'thuần'
      ? 'cách cục thuần túy, đắc lực'
      : purity === 'bán'
        ? 'cách cục có sự hòa lẫn cát hung'
        : 'cách cục bị sát tinh phân tán, cần tôi luyện vượt khó';
  const dynamicSynthesisVi = `Cách cục ${def.name} (${def.nameHanViet}) định hình tại Cung ${involvedCung.join(', ')} (${purityLabel}). ${tuHoaEffects.length > 0 ? tuHoaEffects.join(' ') : ''} ${tuanTrietImpact ?? ''}`;

  return {
    primaryPalaceName,
    isMenhThanInvolved,
    tuHoaEffects,
    tuanTrietImpact,
    careerAndLifeGuidance,
    dynamicSynthesisVi,
  };
}

function createCombination(
  def: CombinationDefinition,
  involvedCung: string[],
  involvedStars: string[],
  detectionReason: string,
  purity: CombinationPurity,
  palaces: TuViPalace[],
): TuViCombination {
  const combo: TuViCombination = {
    id: def.id,
    name: def.name,
    nameHanViet: def.nameHanViet,
    rarity: def.rarity,
    involvedStars,
    involvedCung,
    detectionReason,
    purity,
    strength: 0,
    note: def.note,
    description: def.description,
    category: def.category,
    sourcePatternId: def.id,
    contextualDetails: buildContextualCombinationDetails(def, involvedCung, involvedStars, purity, palaces),
  };
  combo.strength = calculateCombinationStrength(combo, palaces);
  return combo;
}

function addCombination(
  def: CombinationDefinition,
  involvedCung: string[],
  involvedStars: string[],
  detectionReason: string,
  purity: CombinationPurity,
  palaces: TuViPalace[],
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const key = makeKey(def.name, involvedCung);
  if (seenKeys.has(key)) return;
  seenKeys.add(key);
  results.push(createCombination(def, involvedCung, involvedStars, detectionReason, purity, palaces));
}

function getMenhRelationPalaces(palaces: TuViPalace[]): TuViPalace[] {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return [];

  const tamHopIndices = detectTamHopPalaces(menhPalace.id);
  const doiCung = detectDoiCung(menhPalace.id);
  const groupIndices = Array.from(new Set([menhPalace.id, ...tamHopIndices, doiCung]));
  return groupIndices.map((idx) => palaces[idx]).filter((palace): palace is TuViPalace => Boolean(palace));
}

function detectSameCung(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  for (const palace of palaces) {
    if (!hasAllStars(getStarsInPalace(palace), def.stars)) continue;
    addCombination(
      def,
      [palace.name],
      def.stars,
      `${def.stars.join(', ')} cùng cung ${palace.name}`,
      checkCombinationPurity([palace]),
      palaces,
      results,
      seenKeys,
    );
  }
}

function detectTamHop(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  if (def.requiresTuHoa) {
    detectTuHoaCombinations(palaces, def, results, seenKeys);
    return;
  }

  for (const palace of palaces) {
    const tamHopIndices = detectTamHopPalaces(palace.id);
    const groupPalaces = [palace, ...tamHopIndices.map((idx) => palaces[idx])];
    const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));

    if (!hasAllStars(groupStars, def.stars)) continue;

    const involvedCung = new Set<string>();
    for (const starName of def.stars) {
      for (const p of groupPalaces) {
        if (getStarsInPalace(p).includes(starName)) {
          involvedCung.add(p.name);
        }
      }
    }

    const cungNames = Array.from(involvedCung);
    addCombination(
      def,
      cungNames,
      def.stars,
      `${def.stars.join(', ')} tam hợp tại ${cungNames.join(', ')}`,
      checkCombinationPurity(groupPalaces),
      palaces,
      results,
      seenKeys,
    );
  }
}

function detectSameCungOrTamHop(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  for (const palace of palaces) {
    const stars = getStarsInPalace(palace);

    if (hasAllStars(stars, def.stars)) {
      addCombination(
        def,
        [palace.name],
        def.stars,
        `${def.stars.join(', ')} cùng cung ${palace.name}`,
        checkCombinationPurity([palace]),
        palaces,
        results,
        seenKeys,
      );
      continue;
    }

    const tamHopIndices = detectTamHopPalaces(palace.id);
    const groupPalaces = [palace, ...tamHopIndices.map((idx) => palaces[idx])];
    const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));

    if (!hasAllStars(groupStars, def.stars)) continue;

    const involvedCung = new Set<string>();
    for (const starName of def.stars) {
      for (const p of groupPalaces) {
        if (getStarsInPalace(p).includes(starName)) {
          involvedCung.add(p.name);
        }
      }
    }

    const cungNames = Array.from(involvedCung);
    addCombination(
      def,
      cungNames,
      def.stars,
      `${def.stars.join(', ')} tam hợp tại ${cungNames.join(', ')}`,
      checkCombinationPurity(groupPalaces),
      palaces,
      results,
      seenKeys,
    );
  }
}

function detectGiap(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  for (const palace of palaces) {
    const leftIdx = (palace.id - 1 + 12) % 12;
    const rightIdx = (palace.id + 1) % 12;
    const leftPalace = palaces[leftIdx];
    const rightPalace = palaces[rightIdx];

    const leftSatStars = leftPalace.satTinh.filter((star) => ALL_SAT_TINH.has(star.name));
    const rightSatStars = rightPalace.satTinh.filter((star) => ALL_SAT_TINH.has(star.name));
    const leftHasSat = leftSatStars.length > 0;
    const rightHasSat = rightSatStars.length > 0;

    if (!leftHasSat || !rightHasSat) continue;

    const involvedPalaces = [palace, leftPalace, rightPalace];
    const satStarNames = [...leftSatStars.map((s) => s.name), ...rightSatStars.map((s) => s.name)];
    addCombination(
      def,
      [palace.name, leftPalace.name, rightPalace.name],
      Array.from(new Set(satStarNames)),
      `${palace.name} bị giáp sát bởi ${leftPalace.name} và ${rightPalace.name}`,
      checkCombinationPurity(involvedPalaces),
      palaces,
      results,
      seenKeys,
    );
  }
}

function detectTuHoaCombinations(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const requiredTypes = new Set(['Lộc', 'Quyền', 'Khoa']);

  for (const palace of palaces) {
    const tamHopIndices = detectTamHopPalaces(palace.id);
    const doiCung = detectDoiCung(palace.id);
    const groupIndices = Array.from(new Set([palace.id, ...tamHopIndices, doiCung]));
    const groupPalaces = groupIndices.map((idx) => palaces[idx]);

    const foundTypes = new Set<string>();
    const involvedCung = new Set<string>();

    for (const p of groupPalaces) {
      for (const tuHoa of p.tuHoa) {
        if (requiredTypes.has(tuHoa.type)) {
          foundTypes.add(tuHoa.type);
          involvedCung.add(p.name);
        }
      }
    }

    if (foundTypes.size !== requiredTypes.size) continue;

    const cungNames = Array.from(involvedCung);
    addCombination(
      def,
      cungNames,
      ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa'],
      `Hóa Lộc, Hóa Quyền, Hóa Khoa đồng cung/tam hợp tại ${cungNames.join(', ')}`,
      checkCombinationPurity(groupPalaces),
      palaces,
      results,
      seenKeys,
    );
  }
}

function detectMenhBranchStars(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;
  if (def.branches && !def.branches.includes(menhPalace.chi)) return;
  if (!hasAllStars(getStarsInPalace(menhPalace), def.stars)) return;

  addCombination(
    def,
    [menhPalace.name],
    def.stars,
    `${def.stars.join(', ')} tọa tại ${menhPalace.name}`,
    checkCombinationPurity([menhPalace]),
    palaces,
    results,
    seenKeys,
  );
}

function detectTamPhuongCluster(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;

  const groupPalaces = getMenhRelationPalaces(palaces);
  const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));
  if (!hasAllStars(groupStars, def.stars)) return;

  const involvedCung = new Set<string>();
  for (const starName of def.stars) {
    for (const palace of groupPalaces) {
      if (getStarsInPalace(palace).includes(starName)) {
        involvedCung.add(palace.name);
      }
    }
  }

  const cungNames = Array.from(involvedCung);
  addCombination(
    def,
    cungNames,
    def.stars,
    `${def.stars.join(', ')} xuất hiện tại ${cungNames.join(', ')}`,
    checkCombinationPurity(groupPalaces),
    palaces,
    results,
    seenKeys,
  );
}

function detectMenhBracketStars(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;

  const leftPalace = palaces[(menhPalace.id - 1 + 12) % 12];
  const rightPalace = palaces[(menhPalace.id + 1) % 12];
  const [firstStar, secondStar] = def.stars;
  if (!firstStar || !secondStar) return;

  const leftHasFirst = hasStar(leftPalace, firstStar);
  const rightHasSecond = hasStar(rightPalace, secondStar);
  const leftHasSecond = hasStar(leftPalace, secondStar);
  const rightHasFirst = hasStar(rightPalace, firstStar);

  const matched = (leftHasFirst && rightHasSecond) || (leftHasSecond && rightHasFirst);

  if (!matched) return;

  addCombination(
    def,
    [menhPalace.name, leftPalace.name, rightPalace.name],
    def.stars,
    `${def.stars.join(', ')} giáp ${menhPalace.name}`,
    checkCombinationPurity([menhPalace, leftPalace, rightPalace]),
    palaces,
    results,
    seenKeys,
  );
}

function detectMenhBracketMutagen(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;

  const leftPalace = palaces[(menhPalace.id - 1 + 12) % 12];
  const rightPalace = palaces[(menhPalace.id + 1) % 12];
  const requiredStar = def.stars[0];
  const requiredTuHoa = def.requiredTuHoa?.[0];
  if (!requiredStar || !requiredTuHoa) return;

  const leftHasStar = hasStar(leftPalace, requiredStar);
  const rightHasStar = hasStar(rightPalace, requiredStar);
  const leftHasMutagen = hasMutagen(leftPalace, requiredTuHoa);
  const rightHasMutagen = hasMutagen(rightPalace, requiredTuHoa);

  const matched = (leftHasStar && rightHasMutagen) || (rightHasStar && leftHasMutagen);

  if (!matched) return;

  addCombination(
    def,
    [menhPalace.name, leftPalace.name, rightPalace.name],
    [requiredStar, `Hóa ${requiredTuHoa}`],
    `${requiredStar} và Hóa ${requiredTuHoa} giáp ${menhPalace.name}`,
    checkCombinationPurity([menhPalace, leftPalace, rightPalace]),
    palaces,
    results,
    seenKeys,
  );
}

function detectMinhChau(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;
  if (menhPalace.chinhTinh.length > 0) return;
  if (def.branches && !def.branches.includes(menhPalace.chi)) return;

  const isMui = menhPalace.chi === 'Mùi';
  const sunBranch = isMui ? 'Mão' : 'Tỵ';
  const moonBranch = isMui ? 'Hợi' : 'Dậu';
  const sunPalace = getPalaceByBranch(palaces, sunBranch);
  const moonPalace = getPalaceByBranch(palaces, moonBranch);

  if (!hasStar(sunPalace, 'Thái Dương') || !hasStar(moonPalace, 'Thái Âm')) return;

  const involvedPalaces = [menhPalace, sunPalace, moonPalace].filter(Boolean) as TuViPalace[];
  addCombination(
    def,
    involvedPalaces.map((palace) => palace.name),
    ['Thái Dương', 'Thái Âm'],
    `Mệnh vô chính diệu, Thái Dương ở ${sunBranch}, Thái Âm ở ${moonBranch}`,
    checkCombinationPurity(involvedPalaces),
    palaces,
    results,
    seenKeys,
  );
}

function detectSunMoonBright(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;
  if (def.branches && !def.branches.includes(menhPalace.chi)) return;

  const sunBranches = def.sunBranches ?? [];
  const moonBranches = def.moonBranches ?? [];
  const sunPalace = palaces.find(
    (palace) => sunBranches.includes(palace.chi) && palace.chinhTinh.some((star) => star.name === 'Thái Dương'),
  );
  const moonPalace = palaces.find(
    (palace) => moonBranches.includes(palace.chi) && palace.chinhTinh.some((star) => star.name === 'Thái Âm'),
  );

  if (!sunPalace || !moonPalace) return;

  const involvedPalaces = [menhPalace, sunPalace, moonPalace];
  addCombination(
    def,
    involvedPalaces.map((palace) => palace.name),
    ['Thái Dương', 'Thái Âm'],
    `Mệnh ở ${menhPalace.chi}, Thái Dương ở ${sunPalace.chi}, Thái Âm ở ${moonPalace.chi}`,
    checkCombinationPurity(involvedPalaces),
    palaces,
    results,
    seenKeys,
  );
}

function detectMenhBranchMalefic(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;
  if (def.branches && !def.branches.includes(menhPalace.chi)) return;
  if (!hasAnyMalefic(menhPalace)) return;

  addCombination(
    def,
    [menhPalace.name],
    getStarsInPalace(menhPalace).filter((star) => MINOR_SAT_TINH.has(star) || MAJOR_SAT_TINH.has(star)),
    `Mệnh ở ${menhPalace.chi} và có sát tinh tọa thủ`,
    checkCombinationPurity([menhPalace]),
    palaces,
    results,
    seenKeys,
  );
}

function detectHamPair(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;

  const groupPalaces = getMenhRelationPalaces(palaces);
  const [firstStar, secondStar] = def.stars;
  if (!firstStar || !secondStar) return;

  const firstPalaces = groupPalaces.filter(
    (palace) => palace.brightness[firstStar] === 'Hãm' || palace.brightness[firstStar] === 'Bất',
  );
  const secondPalaces = groupPalaces.filter(
    (palace) => palace.brightness[secondStar] === 'Hãm' || palace.brightness[secondStar] === 'Bất',
  );

  if (firstPalaces.length === 0 || secondPalaces.length === 0) return;

  const involvedPalaces = Array.from(new Set([menhPalace, ...firstPalaces, ...secondPalaces]));
  addCombination(
    def,
    involvedPalaces.map((palace) => palace.name),
    def.stars,
    `${def.stars.join(', ')} đều ở trạng thái Hãm/Bất`,
    checkCombinationPurity(involvedPalaces),
    palaces,
    results,
    seenKeys,
  );
}

function detectThachTrungAnNgoc(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;
  if (!['Tý', 'Ngọ'].includes(menhPalace.chi)) return;
  if (!hasStar(menhPalace, 'Cự Môn')) return;

  const tamHopIndices = detectTamHopPalaces(menhPalace.id);
  const doiCungIdx = detectDoiCung(menhPalace.id);
  const groupPalaces = [menhPalace, ...tamHopIndices.map((idx) => palaces[idx]), palaces[doiCungIdx]];

  const hasLocTon = groupPalaces.some((p) => hasStar(p, 'Lộc Tồn'));
  const hasHoaLoc = groupPalaces.some((p) => p.tuHoa.some((th) => th.type === 'Lộc'));
  const hasHoaQuyenOrKhoa = groupPalaces.some((p) => p.tuHoa.some((th) => th.type === 'Quyền' || th.type === 'Khoa'));

  if (!hasLocTon && !hasHoaLoc && !hasHoaQuyenOrKhoa) return;

  const involvedPalaces = groupPalaces.filter(
    (p) => hasStar(p, 'Cự Môn') || hasStar(p, 'Lộc Tồn') || p.tuHoa.length > 0,
  );
  addCombination(
    def,
    involvedPalaces.map((p) => p.name),
    ['Cự Môn', ...(hasLocTon ? ['Lộc Tồn'] : [])],
    `Cự Môn thủ Mệnh tại ${menhPalace.chi} hội tụ cát hóa (Lộc/Quyền/Khoa)`,
    checkCombinationPurity(groupPalaces),
    palaces,
    results,
    seenKeys,
  );
}

function detectSongLocTrieuVien(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;

  const tamHopIndices = detectTamHopPalaces(menhPalace.id);
  const doiCungIdx = detectDoiCung(menhPalace.id);
  const groupPalaces = [menhPalace, ...tamHopIndices.map((idx) => palaces[idx]), palaces[doiCungIdx]];

  const hasLocTon = groupPalaces.some((p) => hasStar(p, 'Lộc Tồn'));
  const hasHoaLoc = groupPalaces.some((p) => p.tuHoa.some((th) => th.type === 'Lộc'));

  if (!hasLocTon || !hasHoaLoc) return;

  const involvedPalaces = groupPalaces.filter((p) => hasStar(p, 'Lộc Tồn') || p.tuHoa.some((th) => th.type === 'Lộc'));
  addCombination(
    def,
    involvedPalaces.map((p) => p.name),
    ['Lộc Tồn', 'Hóa Lộc'],
    `Song Lộc (Lộc Tồn & Hóa Lộc) cùng hội tụ tại Tam Phương Tứ Chính chầu về ${menhPalace.name}`,
    checkCombinationPurity(groupPalaces),
    palaces,
    results,
    seenKeys,
  );
}

function detectPhongVanTeHoi(
  palaces: TuViPalace[],
  def: CombinationDefinition,
  results: TuViCombination[],
  seenKeys: Set<string>,
): void {
  const menhPalace = getMenhPalace(palaces);
  if (!menhPalace) return;

  const tamHopIndices = detectTamHopPalaces(menhPalace.id);
  const doiCungIdx = detectDoiCung(menhPalace.id);
  const groupPalaces = [menhPalace, ...tamHopIndices.map((idx) => palaces[idx]), palaces[doiCungIdx]];
  const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));

  const lucCat = ['Thiên Khôi', 'Thiên Việt', 'Tả Phụ', 'Hữu Bật', 'Văn Xương', 'Văn Khúc'];
  const presentCat = lucCat.filter((s) => groupStars.includes(s));

  if (presentCat.length < 4) return;

  const involvedPalaces = groupPalaces.filter((p) => getStarsInPalace(p).some((s) => presentCat.includes(s)));
  addCombination(
    def,
    involvedPalaces.map((p) => p.name),
    presentCat,
    `Hội tụ ${presentCat.length} cát tinh quý trợ (${presentCat.join(', ')}) trong Tam Phương Tứ Chính`,
    checkCombinationPurity(groupPalaces),
    palaces,
    results,
    seenKeys,
  );
}

// ── Positional Semantics (Tọa, Cứ, Triều, Xung, Củng, Hiệp, Hiếp) ──

/**
 * Evaluates the 7 classical positional interaction dynamics for a given palace
 * in relation to its surrounding geometry (Bản cung, Đối cung, Tam hợp, Giáp cung).
 */
export function detectPositionalSemantics(palace: TuViPalace, palaces: TuViPalace[]): PositionalSemantic[] {
  const residentSemantics = evaluateResidentInteractions(palace);
  const oppSemantics = evaluateOppositionInteractions(palace, palaces);
  const trineSemantics = evaluateTrineInteractions(palace, palaces);
  const bracketSemantics = evaluateBracketInteractions(palace, palaces);

  const all = [...residentSemantics, ...oppSemantics, ...trineSemantics, ...bracketSemantics];

  const typeOrder: Record<string, number> = {
    toa: 1,
    cu: 2,
    trieu: 3,
    xung: 4,
    cung: 5,
    hiep: 6,
    hiepHung: 7,
  };

  return all.sort((a, b) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99));
}
