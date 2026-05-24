import { Can, Chi } from '../types/calendar';

// ── Scoring Thresholds ────────────────────────────────────────
/** All numeric scoring magic numbers for day and hour evaluation. */
export const SCORING = {
  /** Minimum finalScore to classify a day as "Tốt". */
  DAY_GRADE_GOOD_THRESHOLD: 10,
  /** Maximum finalScore (inclusive) to classify a day as "Đại Kỵ". */
  DAY_GRADE_BAD_THRESHOLD: -10,
  /** Starting base score for each hour calculation. */
  HOUR_BASE_SCORE: 50,
  /** Added to base score when the hour deity is auspicious (Hoàng Đạo). */
  HOUR_AUSPICIOUS_BONUS: 20,
  /** Subtracted from base score when the hour deity is inauspicious (Hắc Đạo). */
  HOUR_INAUSPICIOUS_PENALTY: 15,
  /** Subtracted when the hour Nạp Âm clashes with the day Nạp Âm. */
  HOUR_KHAC_PENALTY: 10,
  /** If a Hoàng Đạo hour score falls below this, label it "HOÀNG ĐẠO → HẮC ĐẠO". */
  HOUR_STATUS_OVERRIDE_LOW: 45,
  /** If a Hắc Đạo hour score exceeds this, label it "HẮC ĐẠO → HOÀNG ĐẠO". */
  HOUR_STATUS_OVERRIDE_HIGH: 60,
  /** Added to day baseScore when the day deity is auspicious. */
  DEITY_AUSPICIOUS_SCORE: 10,
  /** Subtracted from day baseScore when the day deity is inauspicious. */
  DEITY_INAUSPICIOUS_SCORE: -10,
  /** Added / subtracted for a Good / Bad Trực or Tú. */
  TRUC_TU_QUALITY_DELTA: 5,

  // ── Ngũ Hành Day-Type Scores ──────────────────────────────
  /** Chuyên nhật: Can & Chi share the same element. */
  NGU_HANH_CHUYEN_NHAT: 8,
  /** Nghĩa nhật: Chi generates Can. */
  NGU_HANH_NGHIA_NHAT: 5,
  /** Bảo nhật: Can generates Chi. */
  NGU_HANH_BAO_NHAT: 3,
  /** Chế nhật: Can controls Chi. */
  NGU_HANH_CHE_NHAT: 0,
  /** Phạt nhật: Chi controls Can (worst). */
  NGU_HANH_PHAT_NHAT: -8,

  // ── Hour Engine Action Thresholds ─────────────────────────
  /** Fallback weight when a star is not found in starWeight.json. */
  DEFAULT_STAR_WEIGHT: 5,
  /** Minimum fitness score (inclusive) for an action to qualify as "Nghi". */
  ACTION_BEST_THRESHOLD: 70,
  /** Maximum fitness score (inclusive) for an action to qualify as "Kỵ". */
  ACTION_WORST_THRESHOLD: 35,
  /** Maximum number of best/worst actions to display per hour. */
  ACTION_DISPLAY_COUNT: 3,
  /** Lower bound for hour score clamping. */
  HOUR_SCORE_MIN: 0,
  /** Upper bound for hour score clamping. */
  HOUR_SCORE_MAX: 100,
  /** Multiplier for action fitness base calculation. */
  ACTION_FITNESS_MULTIPLIER: 10,
  /** Normalizer divisor for action fitness scaling. */
  ACTION_FITNESS_NORMALIZER: 50,

  // ── Extra Star Default Weights ────────────────────────────
  /** Default weight assigned to a good extra star. */
  DEFAULT_GOOD_STAR_WEIGHT: 1,
  /** Default weight assigned to a bad extra star. */
  DEFAULT_BAD_STAR_WEIGHT: -1,
} as const;

// ── Astronomical Search Limits ────────────────────────────────
/** Maximum number of days to search backward when finding solar term start. */
export const SOLAR_TERM_SEARCH_LIMIT = 35;

// ── Tú (28 Mansions) ─────────────────────────────────────────
/** JDN offset used to compute the Tú index: (jd + TU_JD_OFFSET) % 28. */
export const TU_JD_OFFSET = 11;

// ── Calendar Layout ───────────────────────────────────────────
/** 6 weeks × 7 days — total cells in the month calendar grid. */
export const CALENDAR_GRID_CELLS = 6 * 7;

// ── Buddhist Calendar ─────────────────────────────────────────
/** Gregorian year + offset = Buddhist Era year. */
export const BUDDHIST_YEAR_OFFSET = 544;
/** Lunar month in which Vesak (Phật Đản) falls. */
export const VESAK_MONTH = 4;
/** Lunar day of Vesak — used to determine Buddhist New Year boundary. */
export const VESAK_DAY = 15;

// ── Hoàng Đạo Deity Indices ───────────────────────────────────
/**
 * Zero-based indices (within the 12 path-deities sequence) that are
 * considered auspicious (Hoàng Đạo): Thanh Long, Minh Đường, Kim Quỹ,
 * Bảo Quang, Ngọc Đường, Tư Mệnh.
 */
export const HOANG_DAO_DEITY_INDICES: readonly number[] = [0, 1, 4, 5, 7, 10];

// ── Ngũ Hoàng (Huyền Không) ───────────────────────────────────
/** Reference: 2024 (Giáp Thìn) Ngũ Hoàng flies to Palace 7 (Tây); derived anchor is 2017. */
export const NGU_HOANG_ANCHOR_YEAR = 2017;
/** Ngũ Hoàng completes one full palace rotation every 9 years. */
export const NGU_HOANG_CYCLE = 9;

// ── Season Helpers ────────────────────────────────────────────
/** Vietnamese seasonal names ordered Spring→Winter (index 0–3). */
export const SEASONS = ['Xuân', 'Hạ', 'Thu', 'Đông'] as const;
export type Season = (typeof SEASONS)[number];

/**
 * Returns the season index (0=Xuân, 1=Hạ, 2=Thu, 3=Đông) for a lunar month.
 * Months 1–3 → 0, 4–6 → 1, 7–9 → 2, 10–12 → 3.
 */
export function getSeasonIndex(lunarMonth: number): number {
  return Math.floor(((lunarMonth - 1) % 12) / 3);
}

// ── UI Text Arrays ────────────────────────────────────────────
export const DAY_OF_WEEK_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

/** 12 two-hour periods ordered by the 12 Chi (Tý first = 23:00–01:00). */
export const HOUR_RANGES = [
  '23:00 - 01:00',
  '01:00 - 03:00',
  '03:00 - 05:00',
  '05:00 - 07:00',
  '07:00 - 09:00',
  '09:00 - 11:00',
  '11:00 - 13:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00',
  '19:00 - 21:00',
  '21:00 - 23:00',
] as const;

// ── Sơn Ngân Days ─────────────────────────────────────────────
/** Sơn Ngân bad lunar days when the month has 30 days (Tháng đủ). */
export const SON_NGAN_DAYS_DU = [2, 8, 12, 27] as const;
/** Sơn Ngân bad lunar days when the month has 29 days (Tháng thiếu). */
export const SON_NGAN_DAYS_THIEU = [5, 14, 27] as const;

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;

export const TIET_KHI_NAMES = [
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
  'Tiểu Hàn',
  'Đại Hàn',
  'Lập Xuân',
  'Vũ Thủy',
  'Kinh Trập',
] as const;

export const NGU_HANH_MAPPING: Record<Can | Chi, string> = {
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
  Tý: 'Thủy',
  Hợi: 'Thủy',
  Dần: 'Mộc',
  Mão: 'Mộc',
  Tỵ: 'Hỏa',
  Ngọ: 'Hỏa',
  Thân: 'Kim',
  Dậu: 'Kim',
  Thìn: 'Thổ',
  Tuất: 'Thổ',
  Sửu: 'Thổ',
  Mùi: 'Thổ',
};

export const NAP_AM_MAPPING: Record<string, string> = {
  'Giáp Tý': 'Hải Trung Kim',
  'Ất Sửu': 'Hải Trung Kim',
  'Bính Dần': 'Lô Trung Hỏa',
  'Đinh Mão': 'Lô Trung Hỏa',
  'Mậu Thìn': 'Đại Lâm Mộc',
  'Kỷ Tỵ': 'Đại Lâm Mộc',
  'Canh Ngọ': 'Lộ Bàng Thổ',
  'Tân Mùi': 'Lộ Bàng Thổ',
  'Nhâm Thân': 'Kiếm Phong Kim',
  'Quý Dậu': 'Kiếm Phong Kim',
  'Giáp Tuất': 'Sơn Đầu Hỏa',
  'Ất Hợi': 'Sơn Đầu Hỏa',
  'Bính Tý': 'Giản Hạ Thủy',
  'Đinh Sửu': 'Giản Hạ Thủy',
  'Mậu Dần': 'Thành Đầu Thổ',
  'Kỷ Mão': 'Thành Đầu Thổ',
  'Canh Thìn': 'Bạch Lạp Kim',
  'Tân Tỵ': 'Bạch Lạp Kim',
  'Nhâm Ngọ': 'Dương Liễu Mộc',
  'Quý Mùi': 'Dương Liễu Mộc',
  'Giáp Thân': 'Tuyền Trung Thủy',
  'Ất Dậu': 'Tuyền Trung Thủy',
  'Bính Tuất': 'Ốc Thượng Thổ',
  'Đinh Hợi': 'Ốc Thượng Thổ',
  'Mậu Tý': 'Phích Lịch Hỏa',
  'Kỷ Sửu': 'Phích Lịch Hỏa',
  'Canh Dần': 'Tùng Bách Mộc',
  'Tân Mão': 'Tùng Bách Mộc',
  'Nhâm Thìn': 'Trường Lưu Thủy',
  'Quý Tỵ': 'Trường Lưu Thủy',
  'Giáp Ngọ': 'Sa Trung Kim',
  'Ất Mùi': 'Sa Trung Kim',
  'Bính Thân': 'Sơn Hạ Hỏa',
  'Đinh Dậu': 'Sơn Hạ Hỏa',
  'Mậu Tuất': 'Bình Địa Mộc',
  'Kỷ Hợi': 'Bình Địa Mộc',
  'Canh Tý': 'Bích Thượng Thổ',
  'Tân Sửu': 'Bích Thượng Thổ',
  'Nhâm Dần': 'Kim Bạc Kim',
  'Quý Mão': 'Kim Bạc Kim',
  'Giáp Thìn': 'Phúc Đăng Hỏa',
  'Ất Tỵ': 'Phúc Đăng Hỏa',
  'Bính Ngọ': 'Thiên Hà Thủy',
  'Đinh Mùi': 'Thiên Hà Thủy',
  'Mậu Thân': 'Đại Dịch Thổ',
  'Kỷ Dậu': 'Đại Dịch Thổ',
  'Canh Tuất': 'Thoa Xuyến Kim',
  'Tân Hợi': 'Thoa Xuyến Kim',
  'Nhâm Tý': 'Tang Chá Mộc',
  'Quý Sửu': 'Tang Chá Mộc',
  'Giáp Dần': 'Đại Khê Thủy',
  'Ất Mão': 'Đại Khê Thủy',
  'Bính Thìn': 'Sa Trung Thổ',
  'Đinh Tỵ': 'Sa Trung Thổ',
  'Mậu Ngọ': 'Thiên Thượng Hỏa',
  'Kỷ Mùi': 'Thiên Thượng Hỏa',
  'Canh Thân': 'Thạch Lựu Mộc',
  'Tân Dậu': 'Thạch Lựu Mộc',
  'Nhâm Tuất': 'Đại Hải Thủy',
  'Quý Hợi': 'Đại Hải Thủy',
};

export const HOANG_DAO_MAPPING: Record<Chi, Chi[]> = {
  Tý: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
  Ngọ: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
  Sửu: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
  Mùi: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
  Dần: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
  Thân: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
  Mão: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
  Dậu: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
  Thìn: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
  Tuất: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
  Tỵ: ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
  Hợi: ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
};

export const HY_THAN_MAPPING: Record<Can, string> = {
  Giáp: 'Đông Bắc',
  Kỷ: 'Đông Bắc',
  Ất: 'Tây Bắc',
  Canh: 'Tây Bắc',
  Bính: 'Tây Nam',
  Tân: 'Tây Nam',
  Đinh: 'Chính Nam',
  Nhâm: 'Chính Nam',
  Mậu: 'Đông Nam',
  Quý: 'Đông Nam',
};

export const TAI_THAN_MAPPING: Record<Can, string> = {
  Giáp: 'Đông Nam',
  Ất: 'Đông Nam',
  Bính: 'Chính Đông',
  Đinh: 'Chính Đông',
  Mậu: 'Chính Bắc',
  Kỷ: 'Chính Nam',
  Canh: 'Tây Nam',
  Tân: 'Tây Nam',
  Nhâm: 'Tây Bắc',
  Quý: 'Tây Bắc',
};

export const LUC_HOP: Record<Chi, Chi> = {
  Tý: 'Sửu',
  Sửu: 'Tý',
  Dần: 'Hợi',
  Hợi: 'Dần',
  Mão: 'Tuất',
  Tuất: 'Mão',
  Thìn: 'Dậu',
  Dậu: 'Thìn',
  Tỵ: 'Thân',
  Thân: 'Tỵ',
  Ngọ: 'Mùi',
  Mùi: 'Ngọ',
};
export const TAM_HOP: Record<Chi, string> = {
  Tý: 'Thìn, Thân',
  Sửu: 'Tỵ, Dậu',
  Dần: 'Ngọ, Tuất',
  Mão: 'Hợi, Mùi',
  Thìn: 'Tý, Thân',
  Tỵ: 'Sửu, Dậu',
  Ngọ: 'Dần, Tuất',
  Mùi: 'Mão, Hợi',
  Thân: 'Tý, Thìn',
  Dậu: 'Sửu, Tỵ',
  Tuất: 'Dần, Ngọ',
  Hợi: 'Mão, Mùi',
};
export const CHI_XUNG: Record<Chi, Chi> = {
  Tý: 'Ngọ',
  Ngọ: 'Tý',
  Sửu: 'Mùi',
  Mùi: 'Sửu',
  Dần: 'Thân',
  Thân: 'Dần',
  Mão: 'Dậu',
  Dậu: 'Mão',
  Thìn: 'Tuất',
  Tuất: 'Thìn',
  Tỵ: 'Hợi',
  Hợi: 'Tỵ',
};
export const CHI_HINH: Record<Chi, string> = {
  Tý: 'Mão',
  Mão: 'Tý',
  Dần: 'Tỵ, Thân',
  Tỵ: 'Dần, Thân',
  Thân: 'Dần, Tỵ',
  Sửu: 'Tuất, Mùi',
  Tuất: 'Sửu, Mùi',
  Mùi: 'Sửu, Tuất',
  Thìn: 'Thìn',
  Ngọ: 'Ngọ',
  Dậu: 'Dậu',
  Hợi: 'Hợi',
};
export const CHI_HAI: Record<Chi, Chi> = {
  Tý: 'Mùi',
  Mùi: 'Tý',
  Sửu: 'Ngọ',
  Ngọ: 'Sửu',
  Dần: 'Tỵ',
  Tỵ: 'Dần',
  Mão: 'Thìn',
  Thìn: 'Mão',
  Thân: 'Hợi',
  Hợi: 'Thân',
  Dậu: 'Tuất',
  Tuất: 'Dậu',
};
export const CHI_PHA: Record<Chi, Chi> = {
  Tý: 'Dậu',
  Dậu: 'Tý',
  Sửu: 'Thìn',
  Thìn: 'Sửu',
  Dần: 'Hợi',
  Hợi: 'Dần',
  Mão: 'Ngọ',
  Ngọ: 'Mão',
  Tỵ: 'Thân',
  Thân: 'Tỵ',
  Mùi: 'Tuất',
  Tuất: 'Mùi',
};
export const CHI_TUYET: Record<Chi, Chi> = {
  Tý: 'Tỵ',
  Tỵ: 'Tý',
  Sửu: 'Ngọ',
  Ngọ: 'Sửu',
  Dần: 'Mùi',
  Mùi: 'Dần',
  Mão: 'Thân',
  Thân: 'Mão',
  Thìn: 'Dậu',
  Dậu: 'Thìn',
  Tuất: 'Hợi',
  Hợi: 'Tuất',
};

export const HAC_THAN_MAPPING: Record<Can, string> = {
  Giáp: 'Tây Bắc',
  Kỷ: 'Tây Bắc',
  Ất: 'Tây',
  Canh: 'Tây',
  Bính: 'Tây Nam',
  Tân: 'Tây Nam',
  Đinh: 'Nam',
  Nhâm: 'Nam',
  Mậu: 'Đông Nam',
  Quý: 'Đông Nam',
};

export const TAM_HOP_CUC: Record<string, string> = {
  Tý: 'Thủy',
  Thìn: 'Thủy',
  Thân: 'Thủy',
  Sửu: 'Kim',
  Tỵ: 'Kim',
  Dậu: 'Kim',
  Dần: 'Hỏa',
  Ngọ: 'Hỏa',
  Tuất: 'Hỏa',
  Mão: 'Mộc',
  Mùi: 'Mộc',
  Hợi: 'Mộc',
};

export const TAM_SAT: Record<string, string> = {
  Dần: 'Hợi, Tý, Sửu',
  Ngọ: 'Hợi, Tý, Sửu',
  Tuất: 'Hợi, Tý, Sửu',
  Thân: 'Tỵ, Ngọ, Mùi',
  Tý: 'Tỵ, Ngọ, Mùi',
  Thìn: 'Tỵ, Ngọ, Mùi',
  Hợi: 'Thân, Dậu, Tuất',
  Mão: 'Thân, Dậu, Tuất',
  Mùi: 'Thân, Dậu, Tuất',
  Tỵ: 'Dần, Mão, Thìn',
  Dậu: 'Dần, Mão, Thìn',
  Sửu: 'Dần, Mão, Thìn',
};

export const KHONG_SO_KHAC: Record<string, string> = {
  Hỏa: 'Kim, đặc biệt tuổi: Nhâm Thân, Giáp Ngọ thuộc hành Kim không sợ Hỏa',
  Thủy: 'Hỏa, đặc biệt tuổi: Mậu Tý, Bính Thân thuộc hành Hỏa không sợ Thủy',
  Thổ: 'Thủy, đặc biệt tuổi: Bính Ngọ, Nhâm Tuất thuộc hành Thủy không sợ Thổ',
  Kim: 'Mộc, đặc biệt tuổi: Mậu Tuất, Nhâm Tý thuộc hành Mộc không sợ Kim',
  Mộc: 'Thổ, đặc biệt tuổi: Canh Ngọ, Mậu Thân thuộc hành Thổ không sợ Mộc',
};

export const DAY_DEITIES = [
  'Thanh Long',
  'Minh Đường',
  'Thiên Hình',
  'Chu Tước',
  'Kim Quỹ',
  'Bảo Quang',
  'Bạch Hổ',
  'Ngọc Đường',
  'Thiên Lao',
  'Huyền Vũ',
  'Tư Mệnh',
  'Câu Trận',
] as const;

export const DEITY_START_CHIS: Record<Chi, Chi> = {
  Dần: 'Tý',
  Thân: 'Tý',
  Mão: 'Dần',
  Dậu: 'Dần',
  Thìn: 'Thìn',
  Tuất: 'Thìn',
  Tỵ: 'Ngọ',
  Hợi: 'Ngọ',
  Tý: 'Thân',
  Ngọ: 'Thân',
  Sửu: 'Tuất',
  Mùi: 'Tuất',
};

export const NGU_HANH_SINH: Record<string, string> = { Kim: 'Thủy', Thủy: 'Mộc', Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim' };
export const NGU_HANH_KHAC: Record<string, string> = { Kim: 'Mộc', Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim' };

// ── Can Khắc (for Kị Tuổi calculation) ───────────────────────
/**
 * Maps each Can to the two Can it clashes with (Can khắc rule).
 * Used to compute the Kị Tuổi (age-avoidance) pairs on a given day.
 * e.g. Giáp clashes with the Can pair that produces the same Ngũ Hành
 * as Giáp's clashing element.
 */
export const CAN_KHAC_MAP: Record<Can, Can[]> = {
  Giáp: ['Mậu', 'Canh'],
  Ất: ['Kỷ', 'Tân'],
  Bính: ['Canh', 'Nhâm'],
  Đinh: ['Tân', 'Quý'],
  Mậu: ['Nhâm', 'Giáp'],
  Kỷ: ['Quý', 'Ất'],
  Canh: ['Giáp', 'Bính'],
  Tân: ['Ất', 'Đinh'],
  Nhâm: ['Bính', 'Mậu'],
  Quý: ['Đinh', 'Kỷ'],
};

// ── Tam Sát (Yearly) Directions ───────────────────────────────
/**
 * Year Chi groups and their corresponding Tam Sát forbidden direction.
 * Any construction / ground-breaking in that direction is inauspicious.
 */
export const TAM_SAT_YEARLY: Array<{
  chis: Chi[];
  direction: string;
  detail: string;
}> = [
  { chis: ['Dần', 'Ngọ', 'Tuất'], direction: 'Chính Bắc', detail: '(Hợi, Tý, Sửu)' },
  { chis: ['Thân', 'Tý', 'Thìn'], direction: 'Chính Nam', detail: '(Tỵ, Ngọ, Mùi)' },
  { chis: ['Hợi', 'Mão', 'Mùi'], direction: 'Chính Tây', detail: '(Thân, Dậu, Tuất)' },
  { chis: ['Tỵ', 'Dậu', 'Sửu'], direction: 'Chính Đông', detail: '(Dần, Mão, Thìn)' },
];

// ── Cửu Cung Palace Map (Huyền Không) ────────────────────────
/** Maps palace number (1–9) to compass direction and palace name. */
export const CUU_CUNG_PALACE_MAP: Record<number, { direction: string; detail: string }> = {
  1: { direction: 'Chính Bắc', detail: '(Khảm cung)' },
  2: { direction: 'Tây Nam', detail: '(Khôn cung)' },
  3: { direction: 'Chính Đông', detail: '(Chấn cung)' },
  4: { direction: 'Đông Nam', detail: '(Tốn cung)' },
  5: { direction: 'Trung Cung', detail: '(Giữa nhà)' },
  6: { direction: 'Tây Bắc', detail: '(Càn cung)' },
  7: { direction: 'Chính Tây', detail: '(Đoài cung)' },
  8: { direction: 'Đông Bắc', detail: '(Cấn cung)' },
  9: { direction: 'Chính Nam', detail: '(Ly cung)' },
};

// ── Dung Su Star Names ────────────────────────────────────────
/** Star name constants used for matching in Dụng Sự logic. */
export const CUU_KHO_BAT_CUNG_NAME = 'Cửu Khổ Bát Cùng';
export const SAT_SU_NHAT_NAME = 'Sát Sư Nhật';
export const BACH_SU_HUNG_LABEL = 'TRÁNH LÀM MỌI VIỆC (BÁCH SỰ HUNG)';
export const BACH_SU_HUNG_FALLBACK = 'Tránh làm mọi việc (Bách sự hung)';
export const MOI_VIEC_DEU_KY_LABEL = 'Mọi việc đều kỵ';

/** Stars whose presence triggers "Bách sự nghi dụng". */
export const BACH_SU_NGHI_STARS = ['Thiên Đức', 'Nguyệt Đức', 'Thiên Ân'] as const;

/** Major harmful stars that block construction/ceremony activities. */
export const MAJOR_HUNG_STARS = [
  'Thụ Tử',
  'Sát Chủ',
  'Tam Nương',
  'Nguyệt Kỵ',
  'Dương Công Kị',
  'Nguyệt Phá',
  'Thiên Cương',
] as const;

/** Activities forbidden on Sát Sư Nhật. */
export const SAT_SU_UNSUITABLE = [
  'Cúng tế',
  'Lễ bái',
  'Cầu phúc',
  'Cầu nguyện',
  'Khai trương',
  'Nhập học',
  'Nhận chức',
] as const;

/** Activities forbidden when major Hung stars are active. */
export const MAJOR_HUNG_UNSUITABLE = [
  'Cưới hỏi',
  'Khởi công xây dựng',
  'Xây dựng',
  'Khai trương',
  'Nhập trạch',
  'Chôn cất',
  'Mai táng',
  'Động thổ',
] as const;

// ── Global Priority Labels ────────────────────────────────────
/** Priority ranking for global-good statements in Dụng Sự logic. */
export const GLOBAL_GOOD_LABELS = ['Tốt cho mọi việc', 'Mọi việc đều tốt', 'Mọi việc trung bình'] as const;
/** Priority ranking for global-bad statements in Dụng Sự logic. */
export const GLOBAL_BAD_LABELS = [
  'Cực kỳ xấu cho mọi việc',
  'Mọi việc đều xấu',
  'Tránh làm mọi việc',
  'Hầu hết các việc',
  'Tránh làm việc lớn',
] as const;
