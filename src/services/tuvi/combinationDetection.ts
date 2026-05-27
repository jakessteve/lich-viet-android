/**
 * Tử Vi Star Combination Detection
 *
 * Pure TypeScript module for detecting named star combinations (Cách Cục)
 * in a Tử Vi chart. No React dependencies.
 */

import type { TuViPalace, TuViCombination, CombinationPurity } from '../../types/tuvi';
import combinationsData from '../../data/tuvi/combinations.json';
import { TAM_HOP_GROUPS, DOI_CUNG_MAP } from './constants';

// ── Type Definitions ──────────────────────────────────────────

type CombinationCategory = 'cat' | 'hung' | 'trung';
type StandardConstraint = 'sameCung' | 'tamHop' | 'sameCungOrTamHop' | 'giap';
type CustomMatchKind =
  | 'menhBranchStars'
  | 'tamPhuongCluster'
  | 'menhBracketStars'
  | 'menhBracketMutagen'
  | 'minhChau'
  | 'sunMoonBright'
  | 'menhBranchMalefic'
  | 'hamPair';

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

/**
 * Returns the indices of the two Tam Hợp palaces for a given palace.
 * Each palace belongs to exactly one Tam Hợp group of 3 palaces.
 */
export function detectTamHopPalaces(palaceIndex: number): number[] {
  for (const group of TAM_HOP_GROUPS) {
    if (group.includes(palaceIndex)) {
      return group.filter((idx) => idx !== palaceIndex);
    }
  }
  return [];
}

/**
 * Returns the index of the Đối Cung (opposition palace).
 */
export function detectDoiCung(palaceIndex: number): number {
  return DOI_CUNG_MAP[palaceIndex];
}

// ── Star Extraction ───────────────────────────────────────────

/**
 * Returns all star names in a palace (Chính Tinh + Phụ Tinh + Sát Tinh).
 */
export function getStarsInPalace(palace: TuViPalace): string[] {
  return [
    ...palace.chinhTinh.map((s) => s.name),
    ...palace.phuTinh.map((s) => s.name),
    ...palace.satTinh.map((s) => s.name),
  ];
}

/**
 * Returns all star names in the Tam Phương Tứ Chính
 * (palace + 2 Tam Hợp + Đối Cung).
 */
export function getStarsInTamHop(palaces: TuViPalace[], palaceIndex: number): string[] {
  const tamHop = detectTamHopPalaces(palaceIndex);
  const doiCung = detectDoiCung(palaceIndex);
  const indices = [palaceIndex, ...tamHop, doiCung];
  const uniqueIndices = Array.from(new Set(indices));

  const stars: string[] = [];
  for (const idx of uniqueIndices) {
    stars.push(...getStarsInPalace(palaces[idx]));
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
export function checkCombinationPurity(
  involvedPalaces: TuViPalace[],
  satTinhNames: string[] = Array.from(ALL_SAT_TINH),
): CombinationPurity {
  const majorSet = new Set([...MAJOR_SAT_TINH].filter((n) => satTinhNames.includes(n)));
  const minorSet = new Set([...MINOR_SAT_TINH].filter((n) => satTinhNames.includes(n)));

  let hasMajor = false;
  let hasMinor = false;

  for (const palace of involvedPalaces) {
    for (const star of palace.satTinh) {
      if (majorSet.has(star.name)) {
        hasMajor = true;
      }
      if (minorSet.has(star.name)) {
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

  const matched =
    (leftHasFirst && rightHasSecond) ||
    (leftHasSecond && rightHasFirst);

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

  const matched =
    (leftHasStar && rightHasMutagen) ||
    (rightHasStar && leftHasMutagen);

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

  const firstPalaces = groupPalaces.filter((palace) => palace.brightness[firstStar] === 'Hãm' || palace.brightness[firstStar] === 'Bất');
  const secondPalaces = groupPalaces.filter((palace) => palace.brightness[secondStar] === 'Hãm' || palace.brightness[secondStar] === 'Bất');

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
