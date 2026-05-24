/**
 * QMDJ Engine — Kỳ Môn Độn Giáp Chart Construction
 *
 * Implements the 7-step algorithm to generate a QMDJ chart
 * for any given date and 2-hour time block.
 */

import type { Can, Chi } from '../types/calendar';
import type {
  QmdjChart,
  QmdjPalace,
  QmdjDoorInfo,
  QmdjStarInfo,
  QmdjDeityInfo,
  QmdjFormationMatch,
} from '../types/qmdj';
import { getSolarTerm, getJDN, findSolarTermStart } from './foundationalLayer';
import { getHourCanChi } from './hourEngine';
import gameTableData from '../data/qmdj/qmdjGameTable.json';
import doorsData from '../data/qmdj/qmdjDoors.json';
import starsData from '../data/qmdj/qmdjStars.json';
import deitiesData from '../data/qmdj/qmdjDeities.json';
import formationsData from '../data/qmdj/qmdjFormations.json';

// ── Constants ──────────────────────────────────────────────────

const CAN_LIST: Can[] = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI_LIST: Chi[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** Lạc Thư palace order (clockwise traversal from palace 1): 1→8→3→4→9→2→7→6. Palace 5 is center (skipped). */
const PALACE_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];

/** Palace metadata (directions and trigrams) */
const PALACE_META: Record<number, { direction: string; trigram: string; element: string }> = {
  1: { direction: 'Bắc', trigram: 'Khảm', element: 'Thủy' },
  2: { direction: 'Tây Nam', trigram: 'Khôn', element: 'Thổ' },
  3: { direction: 'Đông', trigram: 'Chấn', element: 'Mộc' },
  4: { direction: 'Đông Nam', trigram: 'Tốn', element: 'Mộc' },
  5: { direction: 'Trung', trigram: 'Trung', element: 'Thổ' },
  6: { direction: 'Tây Bắc', trigram: 'Càn', element: 'Kim' },
  7: { direction: 'Tây', trigram: 'Đoài', element: 'Kim' },
  8: { direction: 'Đông Bắc', trigram: 'Cấn', element: 'Thổ' },
  9: { direction: 'Nam', trigram: 'Ly', element: 'Hỏa' },
};

/**
 * Three Nobles + Six Nghi order: Mậu, Kỷ, Canh, Tân, Nhâm, Quý, Đinh, Bính, Ất
 * This is the fixed order for placing stems on the Earth plate.
 */
const STEM_ORDER: Can[] = ['Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', 'Đinh', 'Bính', 'Ất'];

/**
 * Tuần Thủ (Sexagenary Head) mapping: which Mậu(Jiǎ) group the hour belongs to.
 * Each 旬 covers 10 stems starting from a Giáp.
 * The Tuần Thủ determines which palace holds the Trực Phù (directing star).
 */
const TUAN_THU_MAP: Record<string, Can> = {
  'Giáp Tý': 'Mậu',
  'Giáp Tuất': 'Kỷ',
  'Giáp Thân': 'Canh',
  'Giáp Ngọ': 'Tân',
  'Giáp Thìn': 'Nhâm',
  'Giáp Dần': 'Quý',
};

// Pre-process data
const doorsList = doorsData.doors as Array<{
  id: string;
  nameVi: string;
  nameCn: string;
  element: string;
  homePalace: number;
  auspiciousness: string;
  description: string;
}>;
const starsList = starsData.stars as Array<{
  id: string;
  nameVi: string;
  nameCn: string;
  element: string;
  homePalace: number;
  auspiciousness: string;
  description: string;
}>;
const deityList = deitiesData.deities as Array<{
  id: string;
  nameVi: string;
  nameCn: string;
  auspiciousness: string;
  description: string;
}>;

function normalizeSolarTermName(term: string): string {
  return term.trim().toLowerCase();
}

const NORMALIZED_YANG_DUN_TERMS = new Set(
  (gameTableData.yangDunTerms as string[]).map((term) => normalizeSolarTermName(term)),
);

const NORMALIZED_YANG_DUN_TABLE = new Map(
  Object.entries(gameTableData.yangDun as Record<string, Record<string, number>>).map(([term, table]) => [
    normalizeSolarTermName(term),
    table,
  ]),
);

const NORMALIZED_YIN_DUN_TABLE = new Map(
  Object.entries(gameTableData.yinDun as Record<string, Record<string, number>>).map(([term, table]) => [
    normalizeSolarTermName(term),
    table,
  ]),
);

// ── Helper Functions ───────────────────────────────────────────

/** Determine if the given solar term falls in the Yang Dun (Dương Độn) period. */
export function isDuongDon(solarTerm: string): boolean {
  return NORMALIZED_YANG_DUN_TERMS.has(normalizeSolarTermName(solarTerm));
}

/** Determine the Yuan (Upper/Middle/Lower) for a given date within its solar term. */
export function getYuanForDate(date: Date): 'upper' | 'middle' | 'lower' {
  const termStart = findSolarTermStart(date);
  const dayDiff = Math.floor((date.getTime() - termStart.date.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff < 5) return 'upper';
  if (dayDiff < 10) return 'middle';
  return 'lower';
}

/** Get the Game Number (Cục Số) for a given solar term and yuan. */
function getGameNumber(solarTerm: string, yuan: 'upper' | 'middle' | 'lower', duongDon: boolean): number {
  const table = duongDon ? NORMALIZED_YANG_DUN_TABLE : NORMALIZED_YIN_DUN_TABLE;
  const termEntry = table.get(normalizeSolarTermName(solarTerm));
  if (!termEntry) return 1; // fallback

  return termEntry[yuan] || 1;
}

/** Get the GanZhi of the day for a given Date. */
function getDayGanZhi(date: Date): { can: Can; chi: Chi; canIndex: number; chiIndex: number } {
  const jd = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const canIndex = (jd + 9) % 10;
  const chiIndex = (jd + 1) % 12;
  return { can: CAN_LIST[canIndex], chi: CHI_LIST[chiIndex], canIndex, chiIndex };
}

/** Get the hour's GanZhi. */
function getHourGanZhi(dayCan: Can, hourChi: Chi): { can: Can; chi: Chi; canIndex: number; chiIndex: number } {
  const hourCanChi = getHourCanChi(dayCan, hourChi);
  const canIndex = CAN_LIST.indexOf(hourCanChi.can);
  const chiIndex = CHI_LIST.indexOf(hourCanChi.chi);
  return { can: hourCanChi.can, chi: hourCanChi.chi, canIndex, chiIndex };
}

/** Find the Tuần Thủ (sexagenary head) for a given Can-Chi pair. */
function findTuanThu(canIndex: number, chiIndex: number): { head: string; stemInHead: Can } {
  // The distance from the Giáp in this cycle
  const distFromJia = canIndex % 10; // How far from the nearest Giáp
  // Step back to find the Giáp of this 旬
  const headCanIndex = (canIndex - distFromJia + 10) % 10;
  const headChiIndex = (chiIndex - distFromJia + 12) % 12;
  const headStr = `${CAN_LIST[headCanIndex]} ${CHI_LIST[headChiIndex]}`;
  const stemInHead = TUAN_THU_MAP[headStr] || 'Mậu';
  return { head: headStr, stemInHead };
}

/** Get the palace number where a given stem is placed on the Earth plate. */
function findStemPalace(earthPlate: Map<number, Can>, stem: Can): number {
  for (const [palace, s] of earthPlate) {
    if (s === stem) return palace;
  }
  return 1; // fallback
}

// ── Main Chart Generation ──────────────────────────────────────

/**
 * Generate a full QMDJ chart for a given date and hour.
 */
export function generateQmdjChart(date: Date, hourChi: Chi): QmdjChart {
  const jd = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const solarTerm = getSolarTerm(jd);

  // Step 1: GanZhi
  const dayGZ = getDayGanZhi(date);
  const hourGZ = getHourGanZhi(dayGZ.can, hourChi);

  // Step 2: Dương Độn / Âm Độn
  const duongDon = isDuongDon(solarTerm);

  // Step 3: Game Number
  const yuan = getYuanForDate(date);
  const gameNumber = getGameNumber(solarTerm, yuan, duongDon);

  // Step 4: Earth Plate (Địa Bàn) — place stems on palaces
  const earthPlate = layEarthPlate(gameNumber, duongDon);

  // Step 5: Heaven Plate (Thiên Bàn / Cửu Tinh)
  const tuanThu = findTuanThu(hourGZ.canIndex, hourGZ.chiIndex);
  const trucPhuStemPalace = findStemPalace(earthPlate, tuanThu.stemInHead);
  // Trực Phù star = the star whose home palace matches trucPhuStemPalace
  const trucPhuStar = starsList.find((s) => s.homePalace === trucPhuStemPalace) || starsList[0];

  // The hour stem's palace on earth plate
  const hourStemTarget = hourGZ.can === 'Giáp' ? tuanThu.stemInHead : hourGZ.can;
  const hourStemPalace = findStemPalace(earthPlate, hourStemTarget);

  const heavenPlate = layHeavenPlate(trucPhuStar, hourStemPalace, duongDon, earthPlate);

  // Step 6: Human Plate (Nhân Bàn / Bát Môn)
  const trucSuDoor = doorsList.find((d) => d.homePalace === trucPhuStemPalace) || doorsList[0];
  const hourChiIndex = CHI_LIST.indexOf(hourChi);
  const trucSuPalace = navigatePalacesByCount(trucSuDoor.homePalace, hourChiIndex, duongDon);
  const humanPlate = layHumanPlate(trucSuDoor, trucSuPalace, duongDon);

  // Step 7: Divine Plate (Thần Bàn / Bát Thần)
  const divinePlate = layDivinePlate(hourStemPalace, duongDon);

  // Assemble palaces
  const palaces: QmdjPalace[] = [];
  for (let p = 1; p <= 9; p++) {
    const meta = PALACE_META[p];
    palaces.push({
      number: p,
      direction: meta.direction,
      trigram: meta.trigram,
      element: meta.element,
      earthStem: earthPlate.get(p) || null,
      heavenlyStem: p === 5 ? earthPlate.get(5) || null : heavenPlate.stems.get(p) || null,
      star: heavenPlate.stars.get(p) || null,
      door: p === 5 ? null : humanPlate.get(p) || null,
      deity: p === 5 ? null : divinePlate.get(p) || null,
    });
  }

  // Detect formations
  const formations = detectFormations(palaces, duongDon);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return {
    date: `${yyyy}-${mm}-${dd}`,
    hourChi,
    hourCan: hourGZ.can,
    isDuongDon: duongDon,
    gameNumber,
    solarTerm,
    yuan,
    palaces,
    trucPhuStarId: trucPhuStar.id,
    trucSuDoorId: trucSuDoor.id,
    formations,
  };
}

// ── Step 4: Earth Plate ────────────────────────────────────────

function layEarthPlate(gameNumber: number, duongDon: boolean): Map<number, Can> {
  const plate = new Map<number, Can>();

  // Find starting palace index in PALACE_ORDER
  const startPalaceIdx = PALACE_ORDER.indexOf(gameNumber);
  const startIdx = startPalaceIdx !== -1 ? startPalaceIdx : 0;

  for (let i = 0; i < STEM_ORDER.length; i++) {
    let palaceIdx: number;
    if (i < 8) {
      if (duongDon) {
        palaceIdx = (startIdx + i) % 8;
      } else {
        palaceIdx = (((startIdx - i) % 8) + 8) % 8;
      }
      plate.set(PALACE_ORDER[palaceIdx], STEM_ORDER[i]);
    } else {
      // 9th stem (Thiên Cầm/center) goes to center palace 5 (or host on palace 2)
      plate.set(5, STEM_ORDER[i]);
    }
  }

  return plate;
}

// ── Step 5: Heaven Plate ───────────────────────────────────────

function layHeavenPlate(
  trucPhuStar: (typeof starsList)[0],
  targetPalace: number,
  duongDon: boolean,
  earthPlate: Map<number, Can>,
): { stars: Map<number, QmdjStarInfo>; stems: Map<number, Can> } {
  const stars = new Map<number, QmdjStarInfo>();
  const stems = new Map<number, Can>();

  // Place Trực Phù star at target palace
  const starOrder = buildRotationOrder(starsList, trucPhuStar, duongDon);

  // Start from targetPalace and rotate
  const startIdx = PALACE_ORDER.indexOf(targetPalace);
  const validStart = startIdx !== -1 ? startIdx : 0;

  for (let i = 0; i < Math.min(starOrder.length, 8); i++) {
    const palaceIdx = (validStart + i) % 8;
    const palace = PALACE_ORDER[palaceIdx];
    const star = starOrder[i];
    stars.set(palace, {
      id: star.id,
      nameVi: star.nameVi,
      element: star.element,
      auspiciousness: star.auspiciousness as 'cat' | 'trung_binh' | 'hung',
      description: star.description,
    });

    // Heaven plate stems follow the stars from their home palace on the earth plate
    // If the star's home palace is center (5), it usually hosts at 2 (Khôn).
    // Here we strictly carry the homePalace's earth stem.
    const carriedStem = earthPlate.get(star.homePalace === 5 ? 2 : star.homePalace);
    if (carriedStem) {
      stems.set(palace, carriedStem);
    }
  }

  // Place Thiên Cầm at center (palace 5) — or follow Trực Phù
  const thienCam = starsList.find((s) => s.id === 'thienCam');
  if (thienCam) {
    stars.set(5, {
      id: thienCam.id,
      nameVi: thienCam.nameVi,
      element: thienCam.element,
      auspiciousness: thienCam.auspiciousness as 'cat' | 'trung_binh' | 'hung',
      description: thienCam.description,
    });
    // Center heavenly stem is generally static Ký Cung
    const centerStem = earthPlate.get(5);
    if (centerStem) {
      stems.set(5, centerStem);
    }
  }

  return { stars, stems };
}

function buildRotationOrder<T extends { homePalace: number }>(items: T[], first: T, _duongDon: boolean): T[] {
  // Build the list starting from 'first', following palace order
  const eightItems = items.filter((i) => i.homePalace !== 5); // Exclude center palace item
  const firstIdx = eightItems.indexOf(first);
  if (firstIdx === -1) return eightItems;

  const ordered: T[] = [];
  for (let i = 0; i < eightItems.length; i++) {
    ordered.push(eightItems[(firstIdx + i) % eightItems.length]);
  }
  return ordered;
}

// ── Step 6: Human Plate ────────────────────────────────────────

function navigatePalacesByCount(startPalace: number, count: number, duongDon: boolean): number {
  const startIdx = PALACE_ORDER.indexOf(startPalace);
  if (startIdx === -1) return PALACE_ORDER[0];

  let idx: number;
  if (duongDon) {
    idx = (startIdx + count) % 8;
  } else {
    idx = (((startIdx - count) % 8) + 8) % 8;
  }
  return PALACE_ORDER[idx];
}

function layHumanPlate(
  trucSuDoor: (typeof doorsList)[0],
  targetPalace: number,
  duongDon: boolean,
): Map<number, QmdjDoorInfo> {
  const plate = new Map<number, QmdjDoorInfo>();
  const doorOrder = buildRotationOrder(doorsList, trucSuDoor, duongDon);

  const startIdx = PALACE_ORDER.indexOf(targetPalace);
  const validStart = startIdx !== -1 ? startIdx : 0;

  for (let i = 0; i < Math.min(doorOrder.length, 8); i++) {
    const palaceIdx = (validStart + i) % 8;
    const palace = PALACE_ORDER[palaceIdx];
    const door = doorOrder[i];
    plate.set(palace, {
      id: door.id,
      nameVi: door.nameVi,
      element: door.element,
      auspiciousness: door.auspiciousness as QmdjDoorInfo['auspiciousness'],
      description: door.description,
    });
  }

  return plate;
}

// ── Step 7: Divine Plate ───────────────────────────────────────

function layDivinePlate(trucPhuPalace: number, duongDon: boolean): Map<number, QmdjDeityInfo> {
  const plate = new Map<number, QmdjDeityInfo>();
  const deities = duongDon
    ? deityList
    : deityList.map((d) => {
        if (d.id === 'bachHo')
          return { ...(deitiesData.yinDunReplacements as Record<string, (typeof deityList)[0]>).bachHo };
        if (d.id === 'huyenVu')
          return { ...(deitiesData.yinDunReplacements as Record<string, (typeof deityList)[0]>).huyenVu };
        return d;
      });

  const startIdx = PALACE_ORDER.indexOf(trucPhuPalace);
  const validStart = startIdx !== -1 ? startIdx : 0;

  for (let i = 0; i < Math.min(deities.length, 8); i++) {
    let palaceIdx: number;
    if (duongDon) {
      palaceIdx = (validStart + i) % 8;
    } else {
      palaceIdx = (((validStart - i) % 8) + 8) % 8;
    }
    const palace = PALACE_ORDER[palaceIdx];
    const deity = deities[i];
    plate.set(palace, {
      id: deity.id,
      nameVi: deity.nameVi,
      auspiciousness: deity.auspiciousness as QmdjDeityInfo['auspiciousness'],
      description: deity.description,
    });
  }

  return plate;
}

// ── Formation Detection ────────────────────────────────────────

function detectFormations(palaces: QmdjPalace[], _duongDon: boolean): QmdjFormationMatch[] {
  const matches: QmdjFormationMatch[] = [];

  // Check stem-based formations
  for (const palace of palaces) {
    if (!palace.earthStem || !palace.heavenlyStem) continue;

    // Check auspicious formations
    for (const f of formationsData.auspicious) {
      const condition = f.condition as { heavenlyStem?: string; earthlyStem?: string };
      if (condition.heavenlyStem && condition.earthlyStem) {
        if (palace.heavenlyStem === condition.heavenlyStem && palace.earthStem === condition.earthlyStem) {
          matches.push({
            id: f.id,
            nameVi: f.nameVi,
            nameCn: f.nameCn,
            effect: f.effect as QmdjFormationMatch['effect'],
            description: f.description,
            palaceNumber: palace.number,
          });
        }
      }
    }

    // Check inauspicious formations
    for (const f of formationsData.inauspicious) {
      const condition = f.condition as {
        heavenlyStem?: string;
        earthlyStem?: string;
        allPlatesHome?: boolean;
        allPlatesOpposite?: boolean;
      };
      if (condition.heavenlyStem && condition.earthlyStem) {
        if (palace.heavenlyStem === condition.heavenlyStem && palace.earthStem === condition.earthlyStem) {
          matches.push({
            id: f.id,
            nameVi: f.nameVi,
            nameCn: f.nameCn,
            effect: f.effect as QmdjFormationMatch['effect'],
            description: f.description,
            palaceNumber: palace.number,
          });
        }
      }
    }
  }

  return matches;
}

// ── Tuần Không (Empty Stems) ──────────────────────────────────

/**
 * Calculate Tuần Không (旬空) empty branches for the QMDJ chart.
 * In each sexagenary decade (旬), 10 Stems pair with 10 of 12 Branches,
 * leaving 2 Branches "empty". These empty branches weaken their palaces.
 *
 * @param hourCan - Heavenly Stem of the hour
 * @param hourChi - Earthly Branch of the hour
 * @returns The two empty branches and their palace numbers
 */
export function calculateTuanKhong(
  hourCan: Can,
  hourChi: Chi,
): {
  emptyBranch1: Chi;
  emptyBranch2: Chi;
  affectedPalaces: number[];
  explanation: string;
} {
  const canIdx = CAN_LIST.indexOf(hourCan);
  const chiIdx = CHI_LIST.indexOf(hourChi);

  // Find the two empty branches
  const emptyIdx1 = (chiIdx + (10 - canIdx) + 12) % 12;
  const emptyIdx2 = (chiIdx + (11 - canIdx) + 12) % 12;

  const emptyBranch1 = CHI_LIST[emptyIdx1];
  const emptyBranch2 = CHI_LIST[emptyIdx2];

  // Heuristic mapping from empty branches to affected palaces.
  const branchToPalace: Record<string, number> = {
    Tý: 1,
    Sửu: 8,
    Dần: 8,
    Mão: 3,
    Thìn: 4,
    Tỵ: 9,
    Ngọ: 9,
    Mùi: 2,
    Thân: 7,
    Dậu: 7,
    Tuất: 6,
    Hợi: 6,
  };

  const affectedPalaces = [branchToPalace[emptyBranch1] || 5, branchToPalace[emptyBranch2] || 5].filter(
    (v, i, a) => a.indexOf(v) === i,
  ); // deduplicate

  return {
    emptyBranch1,
    emptyBranch2,
    affectedPalaces,
    explanation: `Tuần Không tại ${emptyBranch1}, ${emptyBranch2}. Cung ${affectedPalaces.join(', ')} bị giảm lực — chiếm cung Không thì sự việc khó thành.`,
  };
}

// ── Ngũ Hành (Five Elements) Interaction ────────────────────────

type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
type ElementRelation = 'sinh' | 'khac' | 'bi_sinh' | 'bi_khac' | 'ty_hoa';

/** Standard Ngũ Hành generation cycle: Mộc → Hỏa → Thổ → Kim → Thủy → Mộc */
const NGU_HANH_SINH: Record<NguHanh, NguHanh> = {
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
  Kim: 'Thủy',
  Thủy: 'Mộc',
};

/**
 * Determine the Ngũ Hành relationship between two elements.
 * "source" acts upon "target":
 * - sinh: source generates target
 * - khac: source overcomes target
 * - bi_sinh: source is generated by target (= target sinh source)
 * - bi_khac: source is overcome by target (= target khac source)
 * - ty_hoa: same element
 */
function getElementRelation(source: string, target: string): ElementRelation {
  if (source === target) return 'ty_hoa';
  if (NGU_HANH_SINH[source as NguHanh] === target) return 'sinh';
  if (NGU_HANH_SINH[target as NguHanh] === source) return 'bi_sinh';
  // Overcome cycle: Mộc → Thổ → Thủy → Hỏa → Kim → Mộc
  const NGU_HANH_KHAC: Record<NguHanh, NguHanh> = {
    Mộc: 'Thổ',
    Thổ: 'Thủy',
    Thủy: 'Hỏa',
    Hỏa: 'Kim',
    Kim: 'Mộc',
  };
  if (NGU_HANH_KHAC[source as NguHanh] === target) return 'khac';
  return 'bi_khac';
}

/** Map ElementRelation to a score modifier for overall palace strength. */
function elementRelationScore(rel: ElementRelation): number {
  switch (rel) {
    case 'sinh':
      return 2;
    case 'bi_sinh':
      return 1;
    case 'ty_hoa':
      return 0;
    case 'bi_khac':
      return -1;
    case 'khac':
      return -2;
  }
}

// ── QMDJ Palace Interpretation ─────────────────────────────────

import qmdjInterpretation from '../data/qmdj/qmdjInterpretation.json';

export interface ElementInteraction {
  relation: ElementRelation;
  label: string; // Vietnamese label for the relation
  description: string; // Interpretive description
  score: number; // -2 to +2
}

export interface QmdjPalaceInterpretation {
  palaceNumber: number;
  direction: string;
  doorStarCombo: string;
  deityInfluence: string;
  deityAdvice: string;
  overallAuspiciousness: 'cat' | 'hung' | 'trung';
  /** I1: Ngũ Hành interaction between Palace element and Door/Star elements */
  palaceDoorElement: ElementInteraction | null;
  palaceStarElement: ElementInteraction | null;
  doorStarElement: ElementInteraction | null;
  /** Composite element score (sum of 3 interaction scores, range -6 to +6) */
  elementScore: number;
  /** I3: Purpose-specific domain advice for this palace */
  domainAdvice?: string;
  /** I4: Stem clash or harmony note, if any */
  stemNote?: string;
}

const RELATION_LABELS: Record<ElementRelation, string> = {
  sinh: 'Sinh',
  khac: 'Khắc',
  bi_sinh: 'Bị Sinh',
  bi_khac: 'Bị Khắc',
  ty_hoa: 'Tỷ Hòa',
};

function buildElementInteraction(
  sourceElement: string | undefined,
  targetElement: string | undefined,
  sourceName: string,
  targetName: string,
): ElementInteraction | null {
  if (!sourceElement || !targetElement) return null;
  const interpretData = qmdjInterpretation as {
    palaceElementInteraction: Record<string, string>;
  };
  const relation = getElementRelation(sourceElement, targetElement);
  const score = elementRelationScore(relation);
  const description = interpretData.palaceElementInteraction[relation] || '';

  return {
    relation,
    label: `${sourceName} (${sourceElement}) ${RELATION_LABELS[relation]} ${targetName} (${targetElement})`,
    description,
    score,
  };
}

// ── I3: Purpose-Specific Palace Domain Mapping ─────────────

const PALACE_DOMAINS: Record<number, { domain: string; catAdvice: string; hungAdvice: string }> = {
  1: {
    domain: 'Sự nghiệp',
    catAdvice: 'Thuận lợi cho sự nghiệp, thăng tiến, học tập.',
    hungAdvice: 'Cẩn thận với các quyết định nghề nghiệp.',
  },
  2: {
    domain: 'Tài lộc',
    catAdvice: 'Cơ hội tài chính tốt, đầu tư có lợi.',
    hungAdvice: 'Không nên đầu tư lớn, giữ cẩn thận tiền bạc.',
  },
  3: {
    domain: 'Sức khỏe',
    catAdvice: 'Sức khỏe tốt, phù hợp chữa bệnh, phấu thuật.',
    hungAdvice: 'Cẩn thận sức khỏe, không nên mạo hiểm.',
  },
  4: { domain: 'Học vấn', catAdvice: 'Học tập, thi cử thuận lợi.', hungAdvice: 'Kết quả học tập có thể không như ý.' },
  6: {
    domain: 'Công danh',
    catAdvice: 'Thuận lợi cho việc quan, thăng quan tiến chức.',
    hungAdvice: 'Tiểu nhân quấy phá, cẩn thận chính trị công sở.',
  },
  7: {
    domain: 'Hôn nhân',
    catAdvice: 'Tình duyên tốt, hôn nhân hạnh phúc.',
    hungAdvice: 'Tình cảm có trắc trở, không nên vội vàng.',
  },
  8: {
    domain: 'Di chuyển',
    catAdvice: 'Xuất hành thuận lợi, đi xa gặp may.',
    hungAdvice: 'Nên hoãn chuyến đi hoặc cẩn thận đường đi.',
  },
  9: {
    domain: 'Gia đình',
    catAdvice: 'Gia đình hòa thuận, việc nhà suôn sẻ.',
    hungAdvice: 'Bất hòa gia đình, cẩn thận xung đột.',
  },
};

// ── I4: Stem Clash/Harmony Detection ───────────────────

/** Heaven Stem element lookup */
const STEM_ELEMENTS: Record<string, NguHanh> = {
  甲: 'Mộc',
  乙: 'Mộc',
  丙: 'Hỏa',
  丁: 'Hỏa',
  戊: 'Thổ',
  己: 'Thổ',
  庚: 'Kim',
  辛: 'Kim',
  壬: 'Thủy',
  癸: 'Thủy',
  Giáp: 'Mộc',
  Ất: 'Mộc',
  Bính: 'Hỏa',
  Đinh: 'Hỏa',
  Mậu: 'Thổ',
  Kỷ: 'Thổ',
  Canh: 'Kim',
  Tân: 'Kim',
  Nhâm: 'Thủy',
  Quý: 'Thủy',
};

function detectStemClash(heavenStem: string | undefined, earthStem: string | undefined): string | undefined {
  if (!heavenStem || !earthStem) return undefined;
  const hElement = STEM_ELEMENTS[heavenStem];
  const eElement = STEM_ELEMENTS[earthStem];
  if (!hElement || !eElement) return undefined;

  const rel = getElementRelation(hElement, eElement);
  if (rel === 'khac') {
    return `⚠️ Thiên Can ${heavenStem} (${hElement}) khắc Địa Can ${earthStem} (${eElement}) — Xung đột, cần thận.`;
  } else if (rel === 'bi_khac') {
    return `⚠️ Địa Can ${earthStem} (${eElement}) khắc Thiên Can ${heavenStem} (${hElement}) — Bị kiềm chế.`;
  } else if (rel === 'sinh') {
    return `✨ Thiên Can ${heavenStem} (${hElement}) sinh Địa Can ${earthStem} (${eElement}) — Hòa hợp tốt.`;
  } else if (rel === 'ty_hoa') {
    return `✨ Thiên Can và Địa Can cùng hành (${hElement}) — Tỷ Hòa, ổn định.`;
  }
  return undefined;
}

/**
 * Generate rich interpretation for each palace in a QMDJ chart.
 *
 * I1: Ngũ Hành element interaction scoring (Palace ↔ Door ↔ Star).
 * I2: Per-Door×Star combination lookup from 72-entry interpretation data.
 * I3: Purpose-specific domain advice per palace.
 * I4: Stem clash/harmony detection per palace.
 */
export function interpretQmdjChart(chart: QmdjChart): QmdjPalaceInterpretation[] {
  const interpretData = qmdjInterpretation as {
    doorStarCombinations: Record<string, string>;
    deityInfluence: Record<string, { influence: string; advice: string }>;
  };

  const results: QmdjPalaceInterpretation[] = [];

  for (const palace of chart.palaces) {
    if (palace.number === 5) continue; // Center palace has no door/deity

    const doorId = palace.door?.id || '';
    const starId = palace.star?.id || '';
    const doorElement = palace.door?.element;
    const starElement = palace.star?.element;
    const palaceElement = palace.element;

    // I2: Per-Door×Star combination lookup (e.g., "khai_thienTam")
    const specificKey = `${doorId}_${starId}`;
    let doorStarCombo = interpretData.doorStarCombinations[specificKey] || '';

    // Fallback to generic combo if specific entry not found
    if (!doorStarCombo) {
      const doorAusp = palace.door?.auspiciousness || 'trung_binh';
      const starAusp = palace.star?.auspiciousness || 'trung_binh';
      const doorCat = doorAusp === 'dai_cat' || doorAusp === 'cat';
      const starCat = starAusp === 'cat';
      const fallbackKey = doorCat
        ? starCat
          ? 'catDoor_catStar'
          : 'catDoor_hungStar'
        : starCat
          ? 'hungDoor_catStar'
          : 'hungDoor_hungStar';
      doorStarCombo = interpretData.doorStarCombinations[fallbackKey] || '';
    }

    // I1: Ngũ Hành element interactions
    const palaceDoorElement = buildElementInteraction(palaceElement, doorElement, 'Cung', 'Cửa');
    const palaceStarElement = buildElementInteraction(palaceElement, starElement, 'Cung', 'Tinh');
    const doorStarElement = buildElementInteraction(doorElement, starElement, 'Cửa', 'Tinh');
    const elementScore =
      (palaceDoorElement?.score || 0) + (palaceStarElement?.score || 0) + (doorStarElement?.score || 0);

    // Deity influence
    const deityId = palace.deity?.id || '';
    const deityKey = deityId
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
    const deityData = interpretData.deityInfluence[deityKey] || interpretData.deityInfluence[deityId];
    const deityInfluence = deityData?.influence || palace.deity?.description || '';
    const deityAdvice = deityData?.advice || '';

    // Overall auspiciousness — now includes element score
    const doorAusp = palace.door?.auspiciousness || 'trung_binh';
    const starAusp = palace.star?.auspiciousness || 'trung_binh';
    const doorCat = doorAusp === 'dai_cat' || doorAusp === 'cat';
    const starCat = starAusp === 'cat';
    let baseScore = 0;
    if (doorCat) baseScore += 2;
    if (starCat) baseScore += 2;
    if (doorAusp === 'dai_cat') baseScore += 1;
    if (doorAusp === 'dai_hung' || doorAusp === 'hung') baseScore -= 2;
    if (starAusp === 'hung') baseScore -= 2;
    const adjustedScore = baseScore + elementScore;
    let overall: 'cat' | 'hung' | 'trung' = 'trung';
    if (adjustedScore >= 2) overall = 'cat';
    else if (adjustedScore <= -2) overall = 'hung';

    results.push({
      palaceNumber: palace.number,
      direction: palace.direction,
      doorStarCombo,
      deityInfluence,
      deityAdvice,
      overallAuspiciousness: overall,
      palaceDoorElement,
      palaceStarElement,
      doorStarElement,
      elementScore,
      // I3: Domain advice
      domainAdvice: PALACE_DOMAINS[palace.number]
        ? `${PALACE_DOMAINS[palace.number].domain}: ${overall === 'cat' ? PALACE_DOMAINS[palace.number].catAdvice : overall === 'hung' ? PALACE_DOMAINS[palace.number].hungAdvice : ''}`
        : undefined,
      // I4: Stem clash/harmony
      stemNote: detectStemClash(palace.heavenlyStem ?? undefined, palace.earthStem ?? undefined),
    });
  }

  return results;
}
