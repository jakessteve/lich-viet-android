/**
 * Flying Star Engine — Huyền Không Phi Tinh
 *
 * Feng Shui spatial analysis using the Xuan Kong Flying Star system.
 * - Period Star (based on construction year → 20-year period)
 * - Mountain Star & Water Star (from facing direction + period)
 * - 24 Mountains compass system
 * - Interpretations & remedies
 *
 * Auto-detects Period 9 (2024-2043), manual override available.
 */

// ── Types ──────────────────────────────────────────────────────

export type FlyingStar = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PalaceInfo {
  position: string; // N, NE, E, SE, S, SW, W, NW, Center
  positionVi: string;
  periodStar: FlyingStar;
  mountainStar: FlyingStar;
  waterStar: FlyingStar;
  combination: string; // e.g. "Double 8", "Reversed"
  nature: 'cat' | 'hung' | 'trung';
  interpretation: string;
  remedy: string;
}

export interface FlyingStarChart {
  period: number;
  periodRange: string;
  facingDirection: string;
  facingDirectionVi: string;
  palaces: PalaceInfo[];
  overallAssessment: string;
  mainRemedies: string[];
}

// ── Constants ──────────────────────────────────────────────────

/** 24 Mountains compass directions */
export const COMPASS_DIRECTIONS = [
  { id: 'N1', vi: 'Nhâm', degrees: '337.5°–352.5°', group: 'Bắc' },
  { id: 'N2', vi: 'Tý', degrees: '352.5°–7.5°', group: 'Bắc' },
  { id: 'N3', vi: 'Quý', degrees: '7.5°–22.5°', group: 'Bắc' },
  { id: 'NE1', vi: 'Sửu', degrees: '22.5°–37.5°', group: 'Đông Bắc' },
  { id: 'NE2', vi: 'Cấn', degrees: '37.5°–52.5°', group: 'Đông Bắc' },
  { id: 'NE3', vi: 'Dần', degrees: '52.5°–67.5°', group: 'Đông Bắc' },
  { id: 'E1', vi: 'Giáp', degrees: '67.5°–82.5°', group: 'Đông' },
  { id: 'E2', vi: 'Mão', degrees: '82.5°–97.5°', group: 'Đông' },
  { id: 'E3', vi: 'Ất', degrees: '97.5°–112.5°', group: 'Đông' },
  { id: 'SE1', vi: 'Thìn', degrees: '112.5°–127.5°', group: 'Đông Nam' },
  { id: 'SE2', vi: 'Tốn', degrees: '127.5°–142.5°', group: 'Đông Nam' },
  { id: 'SE3', vi: 'Tỵ', degrees: '142.5°–157.5°', group: 'Đông Nam' },
  { id: 'S1', vi: 'Bính', degrees: '157.5°–172.5°', group: 'Nam' },
  { id: 'S2', vi: 'Ngọ', degrees: '172.5°–187.5°', group: 'Nam' },
  { id: 'S3', vi: 'Đinh', degrees: '187.5°–202.5°', group: 'Nam' },
  { id: 'SW1', vi: 'Mùi', degrees: '202.5°–217.5°', group: 'Tây Nam' },
  { id: 'SW2', vi: 'Khôn', degrees: '217.5°–232.5°', group: 'Tây Nam' },
  { id: 'SW3', vi: 'Thân', degrees: '232.5°–247.5°', group: 'Tây Nam' },
  { id: 'W1', vi: 'Canh', degrees: '247.5°–262.5°', group: 'Tây' },
  { id: 'W2', vi: 'Dậu', degrees: '262.5°–277.5°', group: 'Tây' },
  { id: 'W3', vi: 'Tân', degrees: '277.5°–292.5°', group: 'Tây' },
  { id: 'NW1', vi: 'Tuất', degrees: '292.5°–307.5°', group: 'Tây Bắc' },
  { id: 'NW2', vi: 'Càn', degrees: '307.5°–322.5°', group: 'Tây Bắc' },
  { id: 'NW3', vi: 'Hợi', degrees: '322.5°–337.5°', group: 'Tây Bắc' },
];

/** Period determination from construction year */
function getPeriod(constructionYear: number): { period: number; range: string } {
  if (constructionYear >= 2044) return { period: 1, range: '2044-2063' };
  if (constructionYear >= 2024) return { period: 9, range: '2024-2043' };
  if (constructionYear >= 2004) return { period: 8, range: '2004-2023' };
  if (constructionYear >= 1984) return { period: 7, range: '1984-2003' };
  if (constructionYear >= 1964) return { period: 6, range: '1964-1983' };
  if (constructionYear >= 1944) return { period: 5, range: '1944-1963' };
  if (constructionYear >= 1924) return { period: 4, range: '1924-1943' };
  if (constructionYear >= 1904) return { period: 3, range: '1904-1923' };
  if (constructionYear >= 1884) return { period: 2, range: '1884-1903' };
  return { period: 1, range: '1864-1883' };
}

/**
 * Flying star path through 9 palaces (Luo Shu flight path)
 * standard 1-9 Luo Shu indices:
 * 5=Center, 6=NW, 7=W, 8=NE, 9=S, 1=N, 2=SW, 3=E, 4=SE
 */
const FLIGHT_PATH = [5, 6, 7, 8, 9, 1, 2, 3, 4];

/** Map Luoshu palace number (1-9) to grid position [row, col] */
// standard mapping: S is top (row 0), N is bottom (row 2)
// 4 (SE) | 9 (S) | 2 (SW)  row 0
// 3 (E)  | 5 (C) | 7 (W)   row 1
// 8 (NE) | 1 (N) | 6 (NW)  row 2
const LUOSHU_TO_GRID: Record<number, [number, number]> = {
  1: [2, 1], // N
  2: [0, 2], // SW
  3: [1, 0], // E
  4: [0, 0], // SE
  5: [1, 1], // Center
  6: [2, 2], // NW
  7: [1, 2], // W
  8: [2, 0], // NE
  9: [0, 1], // S
};

/** Map Direction groups to Luoshu Palace Numbers */
const DIR_TO_LUOSHU: Record<string, number> = {
  Bắc: 1,
  'Đông Bắc': 8,
  Đông: 3,
  'Đông Nam': 4,
  Nam: 9,
  'Tây Nam': 2,
  Tây: 7,
  'Tây Bắc': 6,
  'Trung Tâm': 5,
};

/**
 * Generate a flying star grid for a given center star value.
 * Stars fly through the Luo Shu path.
 */
function generateStarGrid(centerStar: FlyingStar, reverse = false): FlyingStar[][] {
  const grid: FlyingStar[][] = Array.from({ length: 3 }, () => [1, 1, 1] as FlyingStar[]);

  for (let i = 0; i < 9; i++) {
    const luoshuBase = FLIGHT_PATH[i]; // 5, 6, 7...
    let star: number;
    if (reverse) {
      star = ((centerStar - 1 - i + 9) % 9) + 1;
    } else {
      star = ((centerStar - 1 + i) % 9) + 1;
    }
    const [row, col] = LUOSHU_TO_GRID[luoshuBase];
    grid[row][col] = star as FlyingStar;
  }
  return grid;
}

// ── Yin/Yang for 24 Mountains (Academic Standard) ────────────

/**
 * Trigrams and their 3 mountains (Thiên, Địa, Nhân).
 * Determines polarity for forward/reverse flight.
 */
const LUOSHU_MOUNTAIN_POLARITIES: Record<number, { mountains: string[]; polarities: ('yang' | 'yin')[] }> = {
  1: { mountains: ['Nhâm', 'Tý', 'Quý'], polarities: ['yang', 'yin', 'yin'] },
  2: { mountains: ['Mùi', 'Khôn', 'Thân'], polarities: ['yin', 'yang', 'yang'] },
  3: { mountains: ['Giáp', 'Mão', 'Ất'], polarities: ['yang', 'yin', 'yin'] },
  4: { mountains: ['Thìn', 'Tốn', 'Tỵ'], polarities: ['yin', 'yang', 'yang'] },
  6: { mountains: ['Tuất', 'Càn', 'Hợi'], polarities: ['yin', 'yang', 'yang'] },
  7: { mountains: ['Canh', 'Dậu', 'Tân'], polarities: ['yang', 'yin', 'yin'] },
  8: { mountains: ['Sửu', 'Cấn', 'Dần'], polarities: ['yin', 'yang', 'yang'] },
  9: { mountains: ['Bính', 'Ngọ', 'Đinh'], polarities: ['yang', 'yin', 'yin'] },
};

/**
 * Determine if stars should fly forward or reverse.
 *
 * Rule:
 * 1. The original house sits/faces a specific mountain (e.g., Mùi).
 * 2. This mountain is one of 3 types: Địa (0), Thiên (1), or Nhân (2) Nguyên Long.
 * 3. Find the same Nguyên Long type on the Trigram of the `centerStar` entering the center.
 * 4. Use the Yin/Yang of THAT target mountain.
 * 5. If Center Star is 5, it uses the original house palace's Yin/Yang directly.
 */
function shouldFlyReverse(centerStar: FlyingStar, originalHouseLuoshu: number, subDirection: string): boolean {
  if (!subDirection) return false;

  // Find which Yuan (Earth=0, Heaven=1, Man=2) the house belongs to
  const originalHouseData = LUOSHU_MOUNTAIN_POLARITIES[originalHouseLuoshu];
  if (!originalHouseData) return false;

  const yuanIndex = originalHouseData.mountains.indexOf(subDirection);
  if (yuanIndex === -1) return false; // Shouldn't happen

  // Star 5 has no trigram, it borrows the original house's polarity
  const targetLuoshu = centerStar === 5 ? originalHouseLuoshu : centerStar;
  const targetData = LUOSHU_MOUNTAIN_POLARITIES[targetLuoshu];
  if (!targetData) return false;

  const polarity = targetData.polarities[yuanIndex];
  return polarity === 'yin'; // Yin = Reverse (Nghịch), Yang = Forward (Thuận)
}

function getGridStarForDirection(grid: FlyingStar[][], directionGroup: string): FlyingStar {
  const luoshu = DIR_TO_LUOSHU[directionGroup];
  if (!luoshu) return 5 as FlyingStar;
  const [row, col] = LUOSHU_TO_GRID[luoshu];
  return grid[row][col];
}

function getStarInterpretation(
  periodStar: FlyingStar,
  mountainStar: FlyingStar,
  waterStar: FlyingStar,
  period: number,
): {
  combination: string;
  nature: PalaceInfo['nature'];
  interpretation: string;
  remedy: string;
} {
  const timely = [period as FlyingStar, (period === 9 ? 1 : period + 1) as FlyingStar];
  const isTimelyMt = timely.includes(mountainStar);
  const isTimelyWt = timely.includes(waterStar);

  if (mountainStar === waterStar && timely.includes(mountainStar)) {
    return {
      combination: `Song Tinh ${mountainStar} — Đại Cát`,
      nature: 'cat',
      interpretation: `Cung gặp Song Tinh ${mountainStar}, rất tốt cho cả sức khỏe (Sơn) và tài lộc (Thủy). Nên tận dụng tối đa.`,
      remedy: 'Kích hoạt cung này bằng nước chảy và cây xanh.',
    };
  }

  if ((mountainStar === 2 && waterStar === 5) || (mountainStar === 5 && waterStar === 2)) {
    return {
      combination: 'Nhị Ngũ Giao Gia — Hung',
      nature: 'hung',
      interpretation: 'Sao 2-5 kết hợp gây bệnh tật nặng và tai nạn. Cung này rất nguy hiểm.',
      remedy: 'Treo chuông gió 6 ống đồng, nước muối, và tránh hoạt động ở vùng này.',
    };
  }

  if (mountainStar === 5 || waterStar === 5) {
    return {
      combination: 'Ngũ Hoàng — Đại Hung',
      nature: 'hung',
      interpretation: 'Sao 5 Hoàng (Ngũ Hoàng Đại Sát) mang năng lượng cực hung, cần hóa giải nghiêm ngặt.',
      remedy: 'Đặt chuông gió kim loại 6 ống hoặc vật phẩm Ngũ Đế Tiền ở cung này. Tuyệt đối không khuấy động.',
    };
  }

  if (isTimelyMt && isTimelyWt) {
    return {
      combination: `Sơn Thủy Đương Vận (${mountainStar}-${waterStar})`,
      nature: 'cat',
      interpretation: `Cả Sơn tinh (${mountainStar}) và Thủy tinh (${waterStar}) đều đương vận, rất tốt.`,
      remedy: 'Duy trì không gian sạch sẽ và thoáng khí.',
    };
  }

  if (isTimelyMt || isTimelyWt) {
    return {
      combination: `${isTimelyMt ? 'Sơn' : 'Thủy'} Đương Vận (${isTimelyMt ? mountainStar : waterStar})`,
      nature: 'trung',
      interpretation: `${isTimelyMt ? 'Sơn tinh đương vận, tốt cho sức khỏe.' : 'Thủy tinh đương vận, tốt cho tài lộc.'} Cung ở mức trung bình.`,
      remedy: isTimelyMt ? 'Thêm núi đá hoặc vật nặng hỗ trợ.' : 'Thêm nước chảy hoặc bể cá kích hoạt.',
    };
  }

  return {
    combination: `Thất Vận (${mountainStar}-${waterStar})`,
    nature: 'hung',
    interpretation: `Sơn (${mountainStar}) và Thủy (${waterStar}) đều thất vận, cung này kém may mắn.`,
    remedy: 'Hạn chế sử dụng vùng này, giữ yên tĩnh và sạch sẽ.',
  };
}

// ── Palace grid positions mapping ──────────────────────────────

const GRID_TO_PALACE: string[] = [
  'SE',
  'S',
  'SW', // row 0: [0,0]=SE, [0,1]=S, [0,2]=SW
  'E',
  'Center',
  'W', // row 1
  'NE',
  'N',
  'NW', // row 2
];

const PALACE_VI: Record<string, string> = {
  N: 'Bắc',
  NE: 'Đông Bắc',
  E: 'Đông',
  SE: 'Đông Nam',
  S: 'Nam',
  SW: 'Tây Nam',
  W: 'Tây',
  NW: 'Tây Bắc',
  Center: 'Trung Tâm',
};

// ── Main Public API ────────────────────────────────────────────

/**
 * Generate a Flying Star chart.
 *
 * @param constructionYear Year of construction (or manual period override)
 * @param facingDirection Compass direction group the building faces (e.g., 'Nam', 'Đông Bắc')
 * @param manualPeriod Optional manual period override (1-9)
 */
export function generateFlyingStarChart(
  constructionYear: number,
  facingDirection: string,
  manualPeriod?: number,
  subDirection?: string,
): FlyingStarChart {
  const { period: autoPeriod, range } = getPeriod(constructionYear);
  const period = manualPeriod || autoPeriod;
  const periodRange = manualPeriod ? `Vận ${manualPeriod} (thủ công)` : `Vận ${autoPeriod} (${range})`;

  // Generate star grids — Step 1: Period Grid
  const periodGrid = generateStarGrid(period as FlyingStar);

  // Step 2: Determine Facing (Water) and Sitting (Mountain) Center Stars
  const opposites: Record<string, string> = {
    Bắc: 'Nam',
    Nam: 'Bắc',
    Đông: 'Tây',
    Tây: 'Đông',
    'Đông Bắc': 'Tây Nam',
    'Tây Nam': 'Đông Bắc',
    'Đông Nam': 'Tây Bắc',
    'Tây Bắc': 'Đông Nam',
  };
  const sittingDirection = opposites[facingDirection] || 'Nam';

  const waterCenter = getGridStarForDirection(periodGrid, facingDirection);
  const mountainCenter = getGridStarForDirection(periodGrid, sittingDirection);

  // Determine facing/sitting sub-directions (for reverse check)
  const facingSubDir = subDirection || COMPASS_DIRECTIONS.find((d) => d.group === facingDirection)?.vi;
  const sittingSubDir = COMPASS_DIRECTIONS.find((d) => d.group === sittingDirection)?.vi;

  const originalFacingLuoshu = DIR_TO_LUOSHU[facingDirection] || 9;
  const originalSittingLuoshu = DIR_TO_LUOSHU[sittingDirection] || 1;

  // Validate forward/reverse flight path using the Trigram mountains rule
  const reverseWater = shouldFlyReverse(waterCenter, originalFacingLuoshu, facingSubDir || 'Bính');
  const reverseMountain = shouldFlyReverse(mountainCenter, originalSittingLuoshu, sittingSubDir || 'Nhâm');

  const waterGrid = generateStarGrid(waterCenter, reverseWater);
  const mountainGrid = generateStarGrid(mountainCenter, reverseMountain);

  // Build palace info
  const palaces: PalaceInfo[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const position = GRID_TO_PALACE[idx];
      const ps = periodGrid[r][c] as FlyingStar;
      const ms = mountainGrid[r][c] as FlyingStar;
      const ws = waterGrid[r][c] as FlyingStar;

      const interp = getStarInterpretation(ps, ms, ws, period);

      palaces.push({
        position,
        positionVi: PALACE_VI[position],
        periodStar: ps,
        mountainStar: ms,
        waterStar: ws,
        ...interp,
      });
    }
  }

  // Overall assessment
  const catCount = palaces.filter((p) => p.nature === 'cat').length;
  const hungCount = palaces.filter((p) => p.nature === 'hung').length;

  let overallAssessment: string;
  if (catCount >= 5) {
    overallAssessment = 'Nhà ở vận thế rất tốt, nhiều cung cát lợi. Phong thủy tổng thể thuận lợi cho gia chủ.';
  } else if (hungCount >= 5) {
    overallAssessment = 'Nhà ở cần hóa giải nhiều cung hung. Nên tham khảo chuyên gia phong thủy để bố trí lại.';
  } else {
    overallAssessment = 'Phong thủy tổng thể ở mức trung bình. Một số cung tốt, một số cần hóa giải.';
  }

  // Main remedies
  const mainRemedies: string[] = [];
  const hungPalaces = palaces.filter((p) => p.nature === 'hung');
  if (hungPalaces.length > 0) {
    mainRemedies.push(`Hóa giải ${hungPalaces.length} cung hung: ${hungPalaces.map((p) => p.positionVi).join(', ')}`);
  }
  const star5Palaces = palaces.filter((p) => p.mountainStar === 5 || p.waterStar === 5);
  if (star5Palaces.length > 0) {
    mainRemedies.push('Đặt chuông gió kim loại 6 ống ở các cung có sao 5 Hoàng');
  }
  const catPalaces = palaces.filter((p) => p.nature === 'cat');
  if (catPalaces.length > 0) {
    mainRemedies.push(`Kích hoạt ${catPalaces.length} cung cát: ${catPalaces.map((p) => p.positionVi).join(', ')}`);
  }

  const facingDir = COMPASS_DIRECTIONS.find((d) => d.group === facingDirection);

  return {
    period,
    periodRange,
    facingDirection,
    facingDirectionVi: facingDir?.vi || facingDirection,
    palaces,
    overallAssessment,
    mainRemedies,
  };
}

// ── P2.7: Annual & Monthly Star Overlays ───────────────────────

/**
 * P2.7: Calculate the annual Flying Star center number.
 * Uses the standard Lạc Thư reverse formula:
 * For years in the current Upper Period: center = (11 - (year - 1864) % 9) % 9 || 9
 * This determines which star occupies the center palace for the year.
 */
export function calculateAnnualStar(year: number): {
  centerStar: number;
  starGrid: number[][];
  interpretation: string;
} {
  // Standard formula: reverse Lạc Thư cycle, anchored to known reference
  const raw = (11 - ((year - 1864) % 9)) % 9 || 9;
  const centerStar = raw > 0 ? raw : 9;

  // Generate the 3x3 grid from the center star using Lạc Thư ordering
  const lacThuOrder = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];
  const offset = centerStar - 5;
  const starGrid = lacThuOrder.map((row) => row.map((cell) => ((cell + offset - 1 + 9) % 9) + 1));

  const starNames: Record<number, string> = {
    1: 'Nhất Bạch (Thủy)',
    2: 'Nhị Hắc (Thổ)',
    3: 'Tam Bích (Mộc)',
    4: 'Tứ Lục (Mộc)',
    5: 'Ngũ Hoàng (Thổ)',
    6: 'Lục Bạch (Kim)',
    7: 'Thất Xích (Kim)',
    8: 'Bát Bạch (Thổ)',
    9: 'Cửu Tử (Hỏa)',
  };

  return {
    centerStar,
    starGrid,
    interpretation: `Năm ${centerStar}: Sao ${starNames[centerStar] || ''} nhập trung cung. ${
      [1, 6, 8].includes(centerStar)
        ? 'Năm tài lộc, may mắn.'
        : [2, 5].includes(centerStar)
          ? 'Năm cần cẩn trọng sức khỏe, đặt hóa giải tại trung cung.'
          : centerStar === 9
            ? 'Năm phát triển, danh tiếng.'
            : 'Năm bình thường, giữ ổn định.'
    }`,
  };
}

/**
 * P2.7: Calculate monthly Flying Star center number.
 * Each month shifts the annual center star by a fixed offset.
 */
export function calculateMonthlyStar(
  year: number,
  lunarMonth: number,
): {
  centerStar: number;
  interpretation: string;
} {
  // Monthly offset: based on which "group" the year belongs to
  const yearGroup = (year - 1864) % 3; // 0, 1, 2
  const monthBase = [2, 5, 8][yearGroup]; // Starting month center for each group
  const centerStar = ((monthBase + lunarMonth - 1 - 1 + 9) % 9) + 1;

  const starNames: Record<number, string> = {
    1: 'Nhất Bạch',
    2: 'Nhị Hắc',
    3: 'Tam Bích',
    4: 'Tứ Lục',
    5: 'Ngũ Hoàng',
    6: 'Lục Bạch',
    7: 'Thất Xích',
    8: 'Bát Bạch',
    9: 'Cửu Tử',
  };

  return {
    centerStar,
    interpretation: `Tháng ${lunarMonth}: Sao ${starNames[centerStar] || ''} nhập trung. ${
      [2, 5].includes(centerStar)
        ? 'Tháng cần hóa giải.'
        : [1, 6, 8].includes(centerStar)
          ? 'Tháng thuận lợi.'
          : 'Tháng bình thường.'
    }`,
  };
}
