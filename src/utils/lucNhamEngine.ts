/**
 * Lục Nhâm Engine — Đại Lục Nhâm Chart Construction
 *
 * Implements the personal oracle divination engine with:
 * - Nguyệt Tướng determination from solar position
 * - Thiên Bàn / Địa Bàn rotation
 * - Tứ Khóa (Four Lessons) derivation
 * - Tam Truyền (Three Transmissions) derivation
 * - Khóa Thức (Course Type) identification
 * - Verdict and interpretation assembly
 */

import type {
  BranchId,
  LucNhamChart,
  BoardPosition,
  ThienTuong,
  TuKhoa,
  TuKhoaLesson,
  TamTruyen,
  TamTruyenStep,
  KhoaThuc,
  Verdict,
  VerdictLevel,
  NguyetTuong,
  CategoryInterpretation,
  FullInterpretation,
  InterpretationCategory,
} from '../types/lucNham';
import { getCanChiDay } from './calendarEngine';
import { getJDN, getSolarTerm } from './foundationalLayer';
import generalsData from '../data/lucNham/lucNhamGenerals.json';
import coursesData from '../data/lucNham/lucNhamCourses.json';
import interpData from '../data/lucNham/lucNhamInterpretations.json';

// ── Constants ──────────────────────────────────────────────────

const BRANCHES: BranchId[] = ['ti', 'suu', 'dan', 'mao', 'thin', 'ty', 'ngo', 'mui', 'than', 'dau', 'tuat', 'hoi'];
const BRANCH_NAMES = generalsData.branchNames as Record<BranchId, { vi: string; cn: string }>;
const GENERALS = generalsData.generals as ThienTuong[];
const COURSES = coursesData.courses as KhoaThuc[];
const COURSE_BY_ID = new Map(COURSES.map((course) => [course.id, course] as const));
const BRANCH_MEANINGS = interpData.tamTruyenNarratives.branchMeanings as Record<BranchId, string>;
const CATEGORY_INTERP = interpData.categoryInterpretations as Record<
  string,
  { label: string; icon: string; catAdvice: string; hungAdvice: string; neutralAdvice: string }
>;
const VERDICT_TEMPLATES = interpData.verdictTemplates as Record<
  VerdictLevel,
  { label: string; description: string; score: number }
>;

function getCourseById(id: string): KhoaThuc {
  return COURSE_BY_ID.get(id) ?? COURSES[0];
}

// ── L1: Ngũ Hành Element Mapping for Branches ─────────────────

type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
type ElementRelation = 'sinh' | 'khac' | 'bi_sinh' | 'bi_khac' | 'ty_hoa';

/** Each Earthly Branch has a fixed Ngũ Hành element. */
const BRANCH_ELEMENT: Record<BranchId, NguHanh> = {
  ti: 'Thủy',
  suu: 'Thổ',
  dan: 'Mộc',
  mao: 'Mộc',
  thin: 'Thổ',
  ty: 'Hỏa',
  ngo: 'Hỏa',
  mui: 'Thổ',
  than: 'Kim',
  dau: 'Kim',
  tuat: 'Thổ',
  hoi: 'Thủy',
};

/** Each Heavenly Stem has a fixed Ngũ Hành element. */
const STEM_ELEMENT: Record<string, NguHanh> = {
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

const NGU_HANH_SINH: Record<NguHanh, NguHanh> = {
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
  Kim: 'Thủy',
  Thủy: 'Mộc',
};
const NGU_HANH_KHAC: Record<NguHanh, NguHanh> = {
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
  Kim: 'Mộc',
};

function getElementRelation(source: NguHanh, target: NguHanh): ElementRelation {
  if (source === target) return 'ty_hoa';
  if (NGU_HANH_SINH[source] === target) return 'sinh';
  if (NGU_HANH_SINH[target] === source) return 'bi_sinh';
  if (NGU_HANH_KHAC[source] === target) return 'khac';
  return 'bi_khac';
}

const RELATION_LABELS_VI: Record<ElementRelation, string> = {
  sinh: 'Sinh',
  khac: 'Khắc',
  bi_sinh: 'Bị Sinh',
  bi_khac: 'Bị Khắc',
  ty_hoa: 'Tỷ Hòa',
};

// ── L2: Lục Thân (Six Relations) ──────────────────────────────

type LucThan = 'phụ_mẫu' | 'huynh_đệ' | 'tử_tôn' | 'thê_tài' | 'quan_quỷ';

const LUC_THAN_LABELS: Record<LucThan, string> = {
  phụ_mẫu: 'Phụ Mẫu',
  huynh_đệ: 'Huynh Đệ',
  tử_tôn: 'Tử Tôn',
  thê_tài: 'Thê Tài',
  quan_quỷ: 'Quan Quỷ',
};

/**
 * Derive Lục Thân from the Day Stem's element vs. target branch element.
 * - Same element → Huynh Đệ (siblings)
 * - Day Stem generates target → Tử Tôn (children)
 * - Day Stem overcomes target → Thê Tài (wealth/spouse)
 * - Target generates Day Stem → Phụ Mẫu (parents)
 * - Target overcomes Day Stem → Quan Quỷ (authority/ghost)
 */
function deriveLucThan(dayStemElement: NguHanh, targetElement: NguHanh): LucThan {
  const rel = getElementRelation(dayStemElement, targetElement);
  switch (rel) {
    case 'ty_hoa':
      return 'huynh_đệ';
    case 'sinh':
      return 'tử_tôn';
    case 'khac':
      return 'thê_tài';
    case 'bi_sinh':
      return 'phụ_mẫu';
    case 'bi_khac':
      return 'quan_quỷ';
  }
}

// ── L3: Thần Sát (Spirit Markers) ─────────────────────────

export interface ThanSat {
  id: string;
  nameVi: string;
  nature: 'cat' | 'hung';
  description: string;
}

/**
 * Thiên Đức Quý Nhân — the supreme auspicious spirit. Branch depends on Day Stem.
 * Giáp/Mậu → Sử/Mùi, Ất/Kỷ → Thân/Tý, Bính/Đinh → Hợi/Dậu, Canh/Tân → Dần/Ngọ, Nhâm/Quý → Tỵ/Mão
 */
const THIEN_AT_MAP: Record<string, BranchId[]> = {
  Giáp: ['suu', 'mui'],
  Mậu: ['suu', 'mui'],
  Ất: ['than', 'ti'],
  Kỷ: ['than', 'ti'],
  Bính: ['hoi', 'dau'],
  Đinh: ['hoi', 'dau'],
  Canh: ['dan', 'ngo'],
  Tân: ['dan', 'ngo'],
  Nhâm: ['ty', 'mao'],
  Quý: ['ty', 'mao'],
};

/** Thiên Đức: Month-based auspicious marker. Simplified to Day Stem's generative branch. */
const THIEN_DUC_MAP: Record<string, BranchId> = {
  Giáp: 'dan',
  Ất: 'mao',
  Bính: 'ty',
  Đinh: 'ngo',
  Mậu: 'ty',
  Kỷ: 'ngo',
  Canh: 'than',
  Tân: 'dau',
  Nhâm: 'hoi',
  Quý: 'ti',
};

/** Bạch Hổ (White Tiger): Fierce, inauspicious. At position opposite to Day Branch. */
function getBachHoBranch(dayBranchIndex: number): BranchId {
  return BRANCHES[(dayBranchIndex + 6) % 12]; // Xung position
}

/** Derive Thần Sát markers for a given branch in the chart context. */
function deriveThanSat(branch: BranchId, dayStem: string, dayBranchIndex: number): ThanSat[] {
  const markers: ThanSat[] = [];

  // Thiên Ất Quý Nhân
  const thienAt = THIEN_AT_MAP[dayStem];
  if (thienAt?.includes(branch)) {
    markers.push({
      id: 'thienAt',
      nameVi: 'Thiên Ất Quý Nhân',
      nature: 'cat',
      description: 'Quý nhân phò trợ, gặp người giúp đỡ, mọi việc thuận lợi.',
    });
  }

  // Thiên Đức
  if (THIEN_DUC_MAP[dayStem] === branch) {
    markers.push({
      id: 'thienDuc',
      nameVi: 'Thiên Đức',
      nature: 'cat',
      description: 'Cát thần hộ mệnh, giải trừ hạn xấu, tăng phúc lộc.',
    });
  }

  // Bạch Hổ
  if (branch === getBachHoBranch(dayBranchIndex)) {
    markers.push({
      id: 'bachHo',
      nameVi: 'Bạch Hổ',
      nature: 'hung',
      description: 'Thần dữ, cảnh báo tai nạn, bệnh tật, tranh chấp.',
    });
  }

  // Thái Tuế (same as Day Branch)
  if (branch === BRANCHES[dayBranchIndex]) {
    markers.push({
      id: 'thaiTue',
      nameVi: 'Thái Tuế',
      nature: 'hung',
      description: 'Năm chủ, không nên xung động. Cẩn trọng hành động.',
    });
  }

  return markers;
}

// Heavenly Stems
const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const BRANCH_NAMES_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** 24 solar terms in standard order for index lookup */
const SOLAR_TERMS_ORDER = [
  'Tiểu Hàn',
  'Đại Hàn',
  'Lập Xuân',
  'Vũ Thủy',
  'Kinh Trập',
  'Xuân Phân',
  'Thanh Minh',
  'Cốc Vũ',
  'Lập Hạ',
  'Tiểu Mãn',
  'Mang Chủng',
  'Hạ Chí',
  'Tiểu Thử',
  'Đại Thử',
  'Lập Thu',
  'Xử Thử',
  'Bạch Lộ',
  'Thu Phân',
  'Hàn Lộ',
  'Sương Giáng',
  'Lập Đông',
  'Tiểu Tuyết',
  'Đại Tuyết',
  'Đông Chí',
];

// ── Nguyệt Tướng (Monthly General) ─────────────────────────────

/**
 * Determine the Nguyệt Tướng based on the solar term.
 * Maps solar position to one of 12 Earthly Branches.
 */
function getNguyetTuong(date: Date): NguyetTuong {
  const jdn = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const solarTermName = getSolarTerm(jdn);

  // Find the index (0-23) from the name
  let solarTermIdx = SOLAR_TERMS_ORDER.indexOf(solarTermName);
  if (solarTermIdx === -1) solarTermIdx = 0; // fallback

  // Map solar term index (0-23) to Nguyệt Tướng branch
  // Each pair of solar terms maps to one branch, changing at Trung Khí (odd indices)
  const nguyetTuongByPair: BranchId[] = [
    'suu', // 0: Tiểu Hàn (TK)
    'ti', // 1: Đại Hàn (Trung Khí), 2: Lập Xuân (TK)
    'hoi', // 3: Vũ Thủy (Trung Khí), 4: Kinh Trập (TK)
    'tuat', // 5: Xuân Phân (Trung Khí), 6: Thanh Minh (TK)
    'dau', // 7: Cốc Vũ (Trung Khí), 8: Lập Hạ (TK)
    'than', // 9: Tiểu Mãn (Trung Khí), 10: Mang Chủng (TK)
    'mui', // 11: Hạ Chí (Trung Khí), 12: Tiểu Thử (TK)
    'ngo', // 13: Đại Thử (Trung Khí), 14: Lập Thu (TK)
    'ty', // 15: Xử Thử (Trung Khí), 16: Bạch Lộ (TK)
    'thin', // 17: Thu Phân (Trung Khí), 18: Hàn Lộ (TK)
    'mao', // 19: Sương Giáng (Trung Khí), 20: Lập Đông (TK)
    'dan', // 21: Tiểu Tuyết (Trung Khí), 22: Đại Tuyết (TK)
    // 23: Đông Chí (Trung Khí) -> maps back to 0 (Sửu)
  ];
  const pairIndex = Math.floor((solarTermIdx + 1) / 2) % 12;
  const branch = nguyetTuongByPair[pairIndex] || 'suu';

  return {
    branch,
    branchName: BRANCH_NAMES[branch].vi,
    solarLongitudeRange: `Tiết khí ${solarTermIdx}`,
  };
}

// ── Thiên Bàn Rotation ────────────────────────────────────────

/**
 * Build the 12-position board by rotating the Thiên Bàn.
 * Place Nguyệt Tướng at the hour branch position, then rotate all branches accordingly.
 */
function buildBoard(nguyetTuong: NguyetTuong, hourBranch: BranchId): BoardPosition[] {
  const nguyetIdx = BRANCHES.indexOf(nguyetTuong.branch);
  const hourIdx = BRANCHES.indexOf(hourBranch);
  // Offset: the Nguyệt Tướng sits at the hour position
  const offset = (hourIdx - nguyetIdx + 12) % 12;

  const board: BoardPosition[] = BRANCHES.map((diaBranch, i) => {
    // Thiên Bàn branch: rotate by offset
    const tianIdx = (i - offset + 12) % 12;
    const tianBranch = BRANCHES[tianIdx];

    // Find the general that matches this Thiên Bàn branch
    const general = GENERALS.find((g) => g.branch === tianBranch) || null;

    return {
      diaBan: diaBranch,
      tianBan: tianBranch,
      thienTuong: general,
      diaBanName: BRANCH_NAMES[diaBranch].vi,
      tianBanName: BRANCH_NAMES[tianBranch].vi,
    };
  });

  return board;
}

// ── Helper: Branch Index from Can Chi Day ───────────────────────

function parseDayStemBranch(date: Date): { stem: string; branch: string; stemIndex: number; branchIndex: number } {
  const canChi = getCanChiDay(date);
  // canChi format: "X Y" where X is stem and Y is branch
  const parts = canChi.split(' ');
  const stem = parts[0] || canChi;
  const branch = parts[1] || '';

  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCH_NAMES_VI.indexOf(branch);

  return { stem, branch, stemIndex: Math.max(0, stemIndex), branchIndex: Math.max(0, branchIndex) };
}

// ── Tứ Khóa Derivation ────────────────────────────────────────

/**
 * Day Stem lodging table (寄宮) from Đại Lục Nhâm theory.
 * Each Heavenly Stem has a fixed Earthly Branch "residence".
 */
const STEM_LODGE: Record<string, BranchId> = {
  Giáp: 'dan', // Giáp → Dần
  Ất: 'thin', // Ất → Thìn
  Bính: 'ty', // Bính → Tỵ
  Đinh: 'mui', // Đinh → Mùi
  Mậu: 'ty', // Mậu → Tỵ (same as Bính)
  Kỷ: 'mui', // Kỷ → Mùi (same as Đinh)
  Canh: 'than', // Canh → Thân
  Tân: 'tuat', // Tân → Tuất
  Nhâm: 'hoi', // Nhâm → Hợi
  Quý: 'suu', // Quý → Sửu
};

function deriveTuKhoa(board: BoardPosition[], dayStemIndex: number, dayBranchIndex: number): TuKhoa {
  const lessons: TuKhoaLesson[] = [];
  const dayStem = STEMS[dayStemIndex] || 'Giáp';
  const dayStemElement = STEM_ELEMENT[dayStem] || 'Mộc';

  /**
   * L1+L2: Build a lesson with true Ngũ Hành relationship and Lục Thân.
   */
  function buildLesson(
    index: number,
    upperBranch: BranchId,
    lowerBranch: BranchId,
    pos: BoardPosition | undefined,
  ): TuKhoaLesson {
    const upperElement = BRANCH_ELEMENT[upperBranch];
    const lowerElement = BRANCH_ELEMENT[lowerBranch];
    const relation = getElementRelation(upperElement, lowerElement);
    const lucThan = deriveLucThan(dayStemElement, upperElement);

    return {
      index,
      upperStem: pos?.tianBanName || '—',
      lowerBranch: BRANCH_NAMES[lowerBranch].vi,
      relationship: RELATION_LABELS_VI[relation],
      // L1: Element details
      upperElement,
      lowerElement,
      elementRelation: relation,
      // L2: Lục Thân
      lucThan,
      lucThanLabel: LUC_THAN_LABELS[lucThan],
    };
  }

  const stemBranch = STEM_LODGE[dayStem] || BRANCHES[0];
  const stemPos = board.find((b) => b.diaBan === stemBranch);
  const l1TianBranch = stemPos?.tianBan || BRANCHES[0];
  lessons.push(buildLesson(1, l1TianBranch, stemBranch, stemPos));

  // Lesson 2: From Lesson 1's Thiên Bàn → look up ITS position
  const l1Pos = board.find((b) => b.diaBan === l1TianBranch);
  const l2TianBranch = l1Pos?.tianBan || BRANCHES[0];
  lessons.push(buildLesson(2, l2TianBranch, l1TianBranch, l1Pos));

  // Lesson 3: Day Branch → Thiên Bàn above it
  const dayBranch = BRANCHES[dayBranchIndex];
  const dayPos = board.find((b) => b.diaBan === dayBranch);
  const l3TianBranch = dayPos?.tianBan || BRANCHES[0];
  lessons.push(buildLesson(3, l3TianBranch, dayBranch, dayPos));

  // Lesson 4: From Lesson 3's Thiên Bàn → look up ITS position
  const l3Pos = board.find((b) => b.diaBan === l3TianBranch);
  const l4TianBranch = l3Pos?.tianBan || BRANCHES[0];
  lessons.push(buildLesson(4, l4TianBranch, l3TianBranch, l3Pos));

  return { lessons };
}

// ── Tam Truyền Derivation (Khóa Thức-specific) ────────────────

function deriveTamTruyen(board: BoardPosition[], tuKhoa: TuKhoa, khoaThuc?: KhoaThuc): TamTruyen {
  const labels = ['Sơ Truyền', 'Trung Truyền', 'Mạt Truyền'];

  // Determine the starting branch based on Khóa Thức type
  const startingBranch = selectSoTruyenBranch(board, tuKhoa, khoaThuc);

  const steps: TamTruyenStep[] = [];
  let currentBranch: BranchId = startingBranch;

  for (let i = 0; i < 3; i++) {
    const pos = board.find((b) => b.diaBan === currentBranch);
    const general = pos?.thienTuong || null;

    steps.push({
      index: i + 1,
      label: labels[i],
      branch: currentBranch,
      branchName: BRANCH_NAMES[currentBranch].vi,
      thienTuong: general,
      interpretation: BRANCH_MEANINGS[currentBranch] || '',
    });

    // Next step: move to the Thiên Bàn at current position
    if (pos) {
      currentBranch = pos.tianBan;
    }
  }

  return { steps };
}

/**
 * Select the Sơ Truyền starting branch based on Khóa Thức type.
 *
 * Standard rules:
 * - Nguyên Thủ: Use the lesson where upper Khắc lower (first found)
 * - Trùng Thẩu: Multiple Khắc lessons — use the deepest (largest branch distance)
 * - Tri Nhất: Use the sole Khắc lesson
 * - Thiệp Hại: No Khắc — use the lesson with greatest branch depth
 * - Phục Ngâm / Phản Ngâm: Use day stem's lodging branch
 * - Others: Use first lesson upper
 */
function selectSoTruyenBranch(board: BoardPosition[], tuKhoa: TuKhoa, khoaThuc?: KhoaThuc): BranchId {
  const khoaId = khoaThuc?.id || '';
  const lessons = tuKhoa.lessons;

  if (khoaId === 'phucNgam' || khoaId === 'fanNgam') {
    // Phục/Phản Ngâm: Use the day stem's residence as starting point
    return board[0].tianBan;
  }

  // Find lessons with Khắc relationship
  const khacLessons = lessons.filter((l) => l.relationship === 'Khắc');

  if (khoaId === 'nguyenThu' && khacLessons.length > 0) {
    // Nguyên Thủ: first Khắc lesson's upper element
    const match = BRANCHES.find((b) => BRANCH_NAMES[b].vi === khacLessons[0].upperStem);
    return match || board[0].tianBan;
  }

  if (khoaId === 'trungThau' && khacLessons.length >= 2) {
    // Trùng Thẩu: use the Khắc lesson with maximum "depth"
    // Depth = distance of the upper branch index from the day stem branch
    let maxDepth = -1;
    let bestBranch: BranchId = board[0].tianBan;
    for (const lesson of khacLessons) {
      const match = BRANCHES.find((b) => BRANCH_NAMES[b].vi === lesson.upperStem);
      if (match) {
        const depth = BRANCHES.indexOf(match);
        if (depth > maxDepth) {
          maxDepth = depth;
          bestBranch = match;
        }
      }
    }
    return bestBranch;
  }

  if (khoaId === 'triNhat' && khacLessons.length === 1) {
    // Tri Nhất: the sole Khắc lesson
    const match = BRANCHES.find((b) => BRANCH_NAMES[b].vi === khacLessons[0].upperStem);
    return match || board[0].tianBan;
  }

  if (khoaId === 'thiepHai') {
    // Thiệp Hại: no Khắc, use lesson with greatest branch "depth" value
    let maxIdx = -1;
    let bestBranch: BranchId = board[0].tianBan;
    for (const lesson of lessons) {
      const match = BRANCHES.find((b) => BRANCH_NAMES[b].vi === lesson.upperStem);
      if (match) {
        const idx = BRANCHES.indexOf(match);
        if (idx > maxIdx) {
          maxIdx = idx;
          bestBranch = match;
        }
      }
    }
    return bestBranch;
  }

  // Default (Diêu Khắc, Muội Giản, Biệt Trách): first lesson's upper
  const firstUpperName = lessons[0]?.upperStem;
  const matchBranch = BRANCHES.find((b) => BRANCH_NAMES[b].vi === firstUpperName);
  return matchBranch || board[0].tianBan;
}

// ── Khóa Thức Identification ───────────────────────────────────

function identifyKhoaThuc(board: BoardPosition[], tuKhoa: TuKhoa, dayStemIndex: number): KhoaThuc {
  // Classification cascade:
  // Phục Ngâm → Phản Ngâm → Nguyên Thủ → Trùng Thẩu → Tri Nhất → Thiệp Hại → Diêu Khắc → Muội Giản → Biệt Trách

  // 1. Check for Phục Ngâm (Thiên Bàn = Địa Bàn everywhere)
  const isPhucNgam = board.every((b) => b.tianBan === b.diaBan);
  if (isPhucNgam) return getCourseById('phucNgam');

  // 2. Check for Phản Ngâm (Thiên Bàn xung Địa Bàn)
  const isPhanNgam = board.every((b) => {
    const diIdx = BRANCHES.indexOf(b.diaBan);
    const tiIdx = BRANCHES.indexOf(b.tianBan);
    return Math.abs(diIdx - tiIdx) === 6;
  });
  if (isPhanNgam) return getCourseById('fanNgam');

  // Analyze Khắc (overcomes) relationships in all 4 lessons using L1 element data
  // A lesson has Khắc when upper overcomes lower OR lower overcomes upper
  const khacLessons = tuKhoa.lessons.filter((l) => l.elementRelation === 'khac' || l.elementRelation === 'bi_khac');
  const khacCount = khacLessons.length;

  // 3. Nguyên Thủ: At least one lesson has Khắc, and the FIRST lesson with Khắc
  //    has upper overcoming lower (the standard starting course)
  if (
    khacCount > 0 &&
    (tuKhoa.lessons[0].elementRelation === 'khac' || tuKhoa.lessons[0].elementRelation === 'bi_khac')
  ) {
    return getCourseById('nguyenThu');
  }

  // 4. Trùng Thẩu: Multiple lessons have Khắc (2+), indicating complexity
  if (khacCount >= 2) {
    return getCourseById('trungThau');
  }

  // 5. Tri Nhất: Exactly one lesson has Khắc (only one controlling pair)
  if (khacCount === 1) {
    return getCourseById('triNhat');
  }

  // No Khắc at all — classify among the remaining types

  // 6. Thiệp Hại: No Khắc, determine by branch "depth" analysis
  //    (the lesson whose branch has deepest Thiệp Hại count)
  const upperBranches = tuKhoa.lessons.map((l) => l.upperStem);
  const hasDuplicateUppers = new Set(upperBranches).size < upperBranches.length;
  if (hasDuplicateUppers) {
    return getCourseById('thiepHai');
  }

  // 7. Diêu Khắc: Lessons form a distant/remote overcomes pattern
  //    When upper and lower are same polarity but no direct Khắc
  const lowerBranches = tuKhoa.lessons.map((l) => l.lowerBranch);
  const hasDistantRelation = upperBranches.some((u, i) => u !== lowerBranches[i] && u !== '—');
  if (hasDistantRelation && !hasDuplicateUppers) {
    return getCourseById('dieuKhac');
  }

  // 8. Mội Giản: All lessons are harmonious (Sinh), quiet pattern
  const allSinh = tuKhoa.lessons.every((l) => l.relationship === 'Sinh');
  if (allSinh) {
    return getCourseById('muoiGian');
  }

  // 9. Biệt Trách: Special/exceptional case (fallback)
  //    Day's stem is Yang and Lesson 1 upper = Day Branch area
  if (dayStemIndex % 2 === 0) {
    // Yang stem
    return getCourseById('bietTrach');
  }

  // Default fallback: Thiệp Mạch
  return getCourseById('thiMach');
}

// ── Verdict Calculation ────────────────────────────────────────

function calculateVerdict(tamTruyen: TamTruyen, khoaThuc: KhoaThuc): Verdict {
  let score = 5; // Base neutral

  // Course type boost
  if (khoaThuc.nature === 'cat') score += 3;
  else if (khoaThuc.nature === 'hung') score -= 3;

  // Tam Truyền general analysis
  for (const step of tamTruyen.steps) {
    if (step.thienTuong?.nature === 'cat') score += 1;
    else if (step.thienTuong?.nature === 'hung') score -= 1;
  }

  // Map score to verdict level
  let level: VerdictLevel;
  if (score >= 9) level = 'daiCat';
  else if (score >= 7) level = 'cat';
  else if (score >= 4) level = 'trungBinh';
  else if (score >= 2) level = 'hung';
  else level = 'daiHung';

  const template = VERDICT_TEMPLATES[level];
  return {
    level,
    label: template.label,
    description: template.description,
    score: template.score,
  };
}

// ── Main Chart Generation ──────────────────────────────────────

/**
 * Generate a full Lục Nhâm chart for divination.
 *
 * @param date - The date of the query
 * @param hourBranchId - Earthly Branch of the query hour (0-11 maps to Tý-Hợi)
 */
export function generateLucNhamChart(date: Date, hourBranchId: number): LucNhamChart {
  const hourBranch = BRANCHES[hourBranchId % 12];
  const { stem: dayStem, branch: dayBranch, stemIndex, branchIndex } = parseDayStemBranch(date);

  // Step 1: Nguyệt Tướng
  const nguyetTuong = getNguyetTuong(date);

  // Step 2: Build board
  const board = buildBoard(nguyetTuong, hourBranch);

  // Step 3: Tứ Khóa
  const tuKhoa = deriveTuKhoa(board, stemIndex, branchIndex);

  // Step 4: Khóa Thức (computed before Tam Truyền to inform selection)
  const khoaThuc = identifyKhoaThuc(board, tuKhoa, stemIndex);

  // Step 5: Tam Truyền (now Khóa Thức-aware)
  const tamTruyen = deriveTamTruyen(board, tuKhoa, khoaThuc);

  // Step 6: Verdict
  const verdict = calculateVerdict(tamTruyen, khoaThuc);

  // Step 7: L3 — Thần Sát markers for each Tứ Khóa lesson
  const allThanSat: ThanSat[] = [];
  for (const lesson of tuKhoa.lessons) {
    // Find branch ID from lesson's upperStem (which is actually the Thiên Bàn branch name)
    const upperBranchId = BRANCHES.find((b) => BRANCH_NAMES[b].vi === lesson.upperStem);
    if (upperBranchId) {
      const markers = deriveThanSat(upperBranchId, dayStem, branchIndex);
      lesson.thanSat = markers;
      allThanSat.push(...markers);
    }
  }

  return {
    date,
    hourBranch,
    hourBranchName: BRANCH_NAMES[hourBranch].vi,
    dayStem,
    dayBranch,
    nguyetTuong,
    board,
    tuKhoa,
    tamTruyen,
    khoaThuc,
    verdict,
    thanSat: allThanSat,
  };
}

/**
 * Get category-specific interpretation for a chart.
 */
export function interpretChart(chart: LucNhamChart, categories?: InterpretationCategory[]): FullInterpretation {
  const cats = categories || ['general', 'career', 'love', 'health', 'travel', 'finance'];

  const categoryAdvice: CategoryInterpretation[] = cats.map((cat) => {
    const interp = CATEGORY_INTERP[cat];
    if (!interp) return { category: cat, label: cat, icon: 'info', advice: '' };

    let advice: string;
    if (chart.verdict.level === 'daiCat' || chart.verdict.level === 'cat') {
      advice = interp.catAdvice;
    } else if (chart.verdict.level === 'hung' || chart.verdict.level === 'daiHung') {
      advice = interp.hungAdvice;
    } else {
      advice = interp.neutralAdvice;
    }

    return {
      category: cat,
      label: interp.label,
      icon: interp.icon,
      advice,
    };
  });

  // Build summary
  const summary = `${chart.khoaThuc.nameVi} — ${chart.verdict.label}: ${chart.verdict.description}`;

  return { chart, categoryAdvice, summary };
}

/**
 * Quick verdict for an activity (used by Dụng Sự quick check).
 */
export function getQuickVerdict(
  date: Date,
  hourBranchId: number,
): { label: string; isCat: boolean; explanation: string } {
  const chart = generateLucNhamChart(date, hourBranchId);
  const isCat = chart.verdict.level === 'daiCat' || chart.verdict.level === 'cat';
  return {
    label: chart.verdict.label,
    isCat,
    explanation: `${chart.khoaThuc.nameVi}: ${chart.khoaThuc.meaning}`,
  };
}
