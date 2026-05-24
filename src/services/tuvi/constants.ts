// ── Tử Vi Engine Constants ────────────────────────────────────
// Pure TypeScript constants — no React imports.
// All data required for Tử Vi (Zi Wei Dou Shu) chart calculation.

// ── 12 Cung (Palaces) ─────────────────────────────────────────
/**
 * The 12 palaces in counter-clockwise order starting from the palace
 * that corresponds to Dần (index 2 in CHI_NAMES).
 *
 * Note: The actual palace names are assigned based on where Mệnh sits,
 * not fixed to Chi positions. This array gives the canonical palace order.
 */
export const PALACE_NAMES = [
  'Mệnh',
  'Huynh Đệ',
  'Phu Thê',
  'Tử Tức',
  'Tài Bạch',
  'Tật Ách',
  'Thiên Di',
  'Nô Bộc',
  'Quan Lộc',
  'Điền Trạch',
  'Phúc Đức',
  'Phụ Mẫu',
] as const;

/** Hán tự equivalents for the 12 palaces. */
export const PALACE_NAMES_HAN_VIET = [
  '命宮',
  '兄弟宮',
  '夫妻宮',
  '子女宮',
  '財帛宮',
  '疾厄宮',
  '遷移宮',
  '奴僕宮',
  '官祿宮',
  '田宅宮',
  '福德宮',
  '父母宮',
] as const;

// ── Thiên Can & Địa Chi ─────────────────────────────────────
/** 12 Địa Chi names in canonical order (Tý first). */
export const CHI_NAMES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;

/** 10 Thiên Can names in canonical order (Giáp first). */
export const CAN_NAMES = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;

// ── Ngũ Hành ──────────────────────────────────────────────────
/** The five elements. */
export const NGU_HANH = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as const;

/** Ngũ Hành Cục (Five-Element Fate) mapping to element and number. */
export const NGU_HANH_CUC: Record<string, { hanh: string; number: number }> = {
  'Thủy Nhị Cục': { hanh: 'Thủy', number: 2 },
  'Mộc Tam Cục': { hanh: 'Mộc', number: 3 },
  'Kim Tứ Cục': { hanh: 'Kim', number: 4 },
  'Thổ Ngũ Cục': { hanh: 'Thổ', number: 5 },
  'Hỏa Lục Cục': { hanh: 'Hỏa', number: 6 },
};

/**
 * Ngũ Hành Cục lookup table.
 *
 * Rows: Can groups (Giáp-Kỷ, Ất-Canh, Bính-Tân, Đinh-Nhâm, Mậu-Quý)
 * Columns: Chi pairs (Tý-Sửu, Dần-Mão, Thìn-Tỵ, Ngọ-Mùi, Thân-Dậu, Tuất-Hợi)
 * Values: Cục name
 */
export const CUC_LOOKUP_TABLE: string[][] = [
  // Giáp-Kỷ
  ['Thủy Nhị Cục', 'Hỏa Lục Cục', 'Mộc Tam Cục', 'Hỏa Lục Cục', 'Kim Tứ Cục', 'Thổ Ngũ Cục'],
  // Ất-Canh
  ['Hỏa Lục Cục', 'Thổ Ngũ Cục', 'Kim Tứ Cục', 'Mộc Tam Cục', 'Thủy Nhị Cục', 'Hỏa Lục Cục'],
  // Bính-Tân
  ['Thổ Ngũ Cục', 'Mộc Tam Cục', 'Thủy Nhị Cục', 'Thổ Ngũ Cục', 'Hỏa Lục Cục', 'Kim Tứ Cục'],
  // Đinh-Nhâm
  ['Kim Tứ Cục', 'Thủy Nhị Cục', 'Hỏa Lục Cục', 'Kim Tứ Cục', 'Thổ Ngũ Cục', 'Mộc Tam Cục'],
  // Mậu-Quý
  ['Mộc Tam Cục', 'Kim Tứ Cục', 'Thổ Ngũ Cục', 'Thủy Nhị Cục', 'Mộc Tam Cục', 'Thủy Nhị Cục'],
];

// ── Chính Tinh (14 Main Stars) ────────────────────────────────
/** The 14 main stars with their Ngũ Hành and group affiliation. */
export const CHINH_TINH_LIST: Array<{
  name: string;
  nguHanh: string;
  group: 'bacDau' | 'namDau' | 'trungThien';
}> = [
  { name: 'Tử Vi', nguHanh: 'Âm Thổ', group: 'bacDau' },
  { name: 'Thiên Cơ', nguHanh: 'Âm Mộc', group: 'bacDau' },
  { name: 'Thái Dương', nguHanh: 'Dương Hỏa', group: 'trungThien' },
  { name: 'Vũ Khúc', nguHanh: 'Âm Kim', group: 'bacDau' },
  { name: 'Thiên Đồng', nguHanh: 'Dương Thủy', group: 'bacDau' },
  { name: 'Liêm Trinh', nguHanh: 'Âm Hỏa', group: 'bacDau' },
  { name: 'Thiên Phủ', nguHanh: 'Dương Thổ', group: 'namDau' },
  { name: 'Thái Âm', nguHanh: 'Âm Thủy', group: 'trungThien' },
  { name: 'Tham Lang', nguHanh: 'Dương Mộc', group: 'bacDau' },
  { name: 'Cự Môn', nguHanh: 'Âm Thổ', group: 'bacDau' },
  { name: 'Thiên Tướng', nguHanh: 'Dương Thủy', group: 'namDau' },
  { name: 'Thiên Lương', nguHanh: 'Dương Thổ', group: 'namDau' },
  { name: 'Thất Sát', nguHanh: 'Dương Kim', group: 'namDau' },
  { name: 'Phá Quân', nguHanh: 'Âm Thủy', group: 'bacDau' },
];

// ── Phụ Tinh (Auxiliary Stars) ────────────────────────────────
/** Key auxiliary stars with their Ngũ Hành, type, and placement rule. */
export const PHU_TINH_LIST: Array<{
  name: string;
  nguHanh: string;
  type: 'cat' | 'sat' | 'hoa';
  placementRule: string;
}> = [
  // Lục Cát Tinh (6 Auspicious)
  { name: 'Văn Xương', nguHanh: 'Âm Kim', type: 'cat', placementRule: 'hourBranch' },
  { name: 'Văn Khúc', nguHanh: 'Âm Thủy', type: 'cat', placementRule: 'hourBranch' },
  { name: 'Tả Phụ', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Hữu Bật', nguHanh: 'Âm Thủy', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Thiên Khôi', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'yearCan' },
  { name: 'Thiên Việt', nguHanh: 'Âm Hỏa', type: 'cat', placementRule: 'yearCan' },
  // Lục Sát Tinh (6 Malefic)
  { name: 'Kình Dương', nguHanh: 'Dương Kim', type: 'sat', placementRule: 'yearCan' },
  { name: 'Đà La', nguHanh: 'Âm Kim', type: 'sat', placementRule: 'yearCan' },
  { name: 'Hỏa Tinh', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'yearBranchHourBranch' },
  { name: 'Linh Tinh', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'yearBranchHourBranch' },
  { name: 'Địa Không', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'hourBranch' },
  { name: 'Địa Kiếp', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'hourBranch' },
  // Other important stars
  { name: 'Lộc Tồn', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'yearCan' },
  { name: 'Thiên Mã', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'yearBranch' },
  { name: 'Đào Hoa', nguHanh: 'Âm Thủy', type: 'hoa', placementRule: 'yearBranch' },
  { name: 'Hồng Loan', nguHanh: 'Âm Thủy', type: 'hoa', placementRule: 'yearBranch' },
  { name: 'Thiên Hỉ', nguHanh: 'Dương Thủy', type: 'cat', placementRule: 'yearBranch' },
  { name: 'Thiên Đức', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Nguyệt Đức', nguHanh: 'Âm Thủy', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Tam Thai', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'dayFromTaPhu' },
  { name: 'Bát Tọa', nguHanh: 'Âm Thổ', type: 'cat', placementRule: 'dayFromHuuBat' },
  { name: 'Ân Quang', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'dayFromVanXuong' },
  { name: 'Thiên Quý', nguHanh: 'Âm Thổ', type: 'cat', placementRule: 'dayFromVanKhuc' },
  { name: 'Đài Phụ', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'hourBranch' },
  { name: 'Phong Cáo', nguHanh: 'Âm Thổ', type: 'cat', placementRule: 'hourBranch' },
  { name: 'Đẩu Quân', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'yearBranchMonthHour' },
  { name: 'Thiên Y', nguHanh: 'Âm Thổ', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Hoa Cái', nguHanh: 'Dương Kim', type: 'cat', placementRule: 'yearBranch' },
  { name: 'Cô Thần', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Quả Tú', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Thiên Tài', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'yearBranchMenh' },
  { name: 'Thiên Thọ', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'yearBranchThan' },
  { name: 'Thiên Trù', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'yearCan' },
  { name: 'Phá Toái', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Phi Liêm', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Long Trì', nguHanh: 'Dương Thủy', type: 'cat', placementRule: 'yearBranch' },
  { name: 'Phượng Các', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'yearBranch' },
  { name: 'Thiên Khốc', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Thiên Hư', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Thiên Quan', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'yearCan' },
  { name: 'Thiên Phúc', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'yearCan' },
  { name: 'Thiên Không', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Thiên Thương', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'menhPalace' },
  { name: 'Thiên Sứ', nguHanh: 'Âm Thủy', type: 'sat', placementRule: 'menhPalace' },
  { name: 'Kiếp Sát', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'yearBranch' },
  { name: 'Giải Thần', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'yearBranchMonth' },
  { name: 'Thiên Diêu', nguHanh: 'Âm Thủy', type: 'hoa', placementRule: 'monthBranch' },
  { name: 'Thiên Hình', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'monthBranch' },
  { name: 'Âm Sát', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'monthBranch' },
  { name: 'Thiên Nguyệt', nguHanh: 'Âm Thủy', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Thiên Vu', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Thiên Giải', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'monthBranch' },
  { name: 'Lưu Hà', nguHanh: 'Âm Thủy', type: 'sat', placementRule: 'yearCan' },
  { name: 'Đường Phù', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'locTon' },
  { name: 'Quốc Ấn', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'locTon' },
  { name: 'Thiên La', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'fixed' },
  { name: 'Địa Võng', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'fixed' },
  { name: 'Thái Tuế', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Thiếu Dương', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'thaiTue12' },
  { name: 'Tang Môn', nguHanh: 'Âm Mộc', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Thiếu Âm', nguHanh: 'Âm Thủy', type: 'cat', placementRule: 'thaiTue12' },
  { name: 'Quan Phù', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Tử Phù', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Tuế Phá', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Long Đức', nguHanh: 'Dương Thủy', type: 'cat', placementRule: 'thaiTue12' },
  { name: 'Bạch Hổ', nguHanh: 'Dương Kim', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Phúc Đức', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'thaiTue12' },
  { name: 'Điếu Khách', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Trực Phù', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'thaiTue12' },
  { name: 'Bác Sỹ', nguHanh: 'Dương Thủy', type: 'cat', placementRule: 'bacSi12' },
  { name: 'Lực Sỹ', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'bacSi12' },
  { name: 'Thanh Long', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'bacSi12' },
  { name: 'Tiểu Hao', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'bacSi12' },
  { name: 'Tướng Quân', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'bacSi12' },
  { name: 'Tấu Thư', nguHanh: 'Dương Kim', type: 'cat', placementRule: 'bacSi12' },
  { name: 'Hỷ Thần', nguHanh: 'Dương Hỏa', type: 'cat', placementRule: 'bacSi12' },
  { name: 'Bệnh Phù', nguHanh: 'Âm Thổ', type: 'sat', placementRule: 'bacSi12' },
  { name: 'Đại Hao', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'bacSi12' },
  { name: 'Phục Binh', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'bacSi12' },
  { name: 'Quan Phủ', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'bacSi12' },
  { name: 'Tướng Tinh', nguHanh: 'Dương Mộc', type: 'cat', placementRule: 'tuongTinh12' },
  { name: 'Phan Án', nguHanh: 'Dương Thổ', type: 'cat', placementRule: 'tuongTinh12' },
  { name: 'Tuế Dịch', nguHanh: 'Âm Mộc', type: 'sat', placementRule: 'tuongTinh12' },
  { name: 'Tức Thần', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'tuongTinh12' },
  { name: 'Tai Sát', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'tuongTinh12' },
  { name: 'Thiên Sát', nguHanh: 'Dương Hỏa', type: 'sat', placementRule: 'tuongTinh12' },
  { name: 'Chỉ Bối', nguHanh: 'Âm Thủy', type: 'sat', placementRule: 'tuongTinh12' },
  { name: 'Hàm Trì', nguHanh: 'Âm Thủy', type: 'hoa', placementRule: 'tuongTinh12' },
  { name: 'Nguyệt Sát', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'tuongTinh12' },
  { name: 'Vong Thần', nguHanh: 'Âm Hỏa', type: 'sat', placementRule: 'tuongTinh12' },
];

// ── Palace Geometry ─────────────────────────────────────────────
/**
 * The 4 Tam Hợp (Three Harmonies) triangle groups by Chi index.
 * Each group shares a Ngũ Hành: Water, Metal, Fire, Wood.
 */
export const TAM_HOP_GROUPS: number[][] = [
  [0, 4, 8], // Tý-Thìn-Thân (Water)
  [1, 5, 9], // Sửu-Tỵ-Dậu (Metal)
  [2, 6, 10], // Dần-Ngọ-Tuất (Fire)
  [3, 7, 11], // Mão-Mùi-Hợi (Wood)
];

/** Opposition palace pairs (Đối Cung) — maps each Chi index to its opposite. */
export const DOI_CUNG_MAP: Record<number, number> = {
  0: 6, // Tý ↔ Ngọ
  1: 7, // Sửu ↔ Mùi
  2: 8, // Dần ↔ Thân
  3: 9, // Mão ↔ Dậu
  4: 10, // Thìn ↔ Tuất
  5: 11, // Tỵ ↔ Hợi
  6: 0, // Ngọ ↔ Tý
  7: 1, // Mùi ↔ Sửu
  8: 2, // Thân ↔ Dần
  9: 3, // Dậu ↔ Mão
  10: 4, // Tuất ↔ Thìn
  11: 5, // Hợi ↔ Tỵ
};

// ── Nạp Âm (60 Can-Chi Sounding) ──────────────────────────────
/**
 * The 30 Nạp Âm names in order of the 60 Can-Chi pairs.
 * Each pair of adjacent Can-Chi shares one Nạp Âm.
 * Index formula: canIndex * 6 + Math.floor(chiIndex / 2)
 */
export const NAP_AM_NAMES: string[] = [
  'Hải Trung Kim', // 0  — Giáp Tý / Ất Sửu
  'Lô Trung Hỏa', // 1  — Bính Dần / Đinh Mão
  'Đại Lâm Mộc', // 2  — Mậu Thìn / Kỷ Tỵ
  'Lộ Bàng Thổ', // 3  — Canh Ngọ / Tân Mùi
  'Kiếm Phong Kim', // 4  — Nhâm Thân / Quý Dậu
  'Sơn Đầu Hỏa', // 5  — Giáp Tuất / Ất Hợi
  'Giản Hạ Thủy', // 6  — Bính Tý / Đinh Sửu
  'Thành Đầu Thổ', // 7  — Mậu Dần / Kỷ Mão
  'Bạch Lạp Kim', // 8  — Canh Thìn / Tân Tỵ
  'Dương Liễu Mộc', // 9  — Nhâm Ngọ / Quý Mùi
  'Tuyền Trung Thủy', // 10 — Giáp Thân / Ất Dậu
  'Ốc Thượng Thổ', // 11 — Bính Tuất / Đinh Hợi
  'Phích Lịch Hỏa', // 12 — Mậu Tý / Kỷ Sửu
  'Tùng Bách Mộc', // 13 — Canh Dần / Tân Mão
  'Trường Lưu Thủy', // 14 — Nhâm Thìn / Quý Tỵ
  'Sa Trung Kim', // 15 — Giáp Ngọ / Ất Mùi
  'Sơn Hạ Hỏa', // 16 — Bính Thân / Đinh Dậu
  'Bình Địa Mộc', // 17 — Mậu Tuất / Kỷ Hợi
  'Bích Thượng Thổ', // 18 — Canh Tý / Tân Sửu
  'Kim Bạc Kim', // 19 — Nhâm Dần / Quý Mão
  'Phúc Đăng Hỏa', // 20 — Giáp Thìn / Ất Tỵ
  'Thiên Hà Thủy', // 21 — Bính Ngọ / Đinh Mùi
  'Đại Dịch Thổ', // 22 — Mậu Thân / Kỷ Dậu
  'Thoa Xuyến Kim', // 23 — Canh Tuất / Tân Hợi
  'Tang Chá Mộc', // 24 — Nhâm Tý / Quý Sửu
  'Đại Khê Thủy', // 25 — Giáp Dần / Ất Mão
  'Sa Trung Thổ', // 26 — Bính Thìn / Đinh Tỵ
  'Thiên Thượng Hỏa', // 27 — Mậu Ngọ / Kỷ Mùi
  'Thạch Lựu Mộc', // 28 — Canh Thân / Tân Dậu
  'Đại Hải Thủy', // 29 — Nhâm Tuất / Quý Hợi
];

/**
 * Computes the Nạp Âm index from a Can index and Chi index.
 *
 * Walks the 60 Can-Chi cycle and maps each adjacent pair to one Nạp Âm.
 *
 * @param canIndex  — 0-based index into CAN_NAMES (0=Giáp … 9=Quý)
 * @param chiIndex  — 0-based index into CHI_NAMES (0=Tý … 11=Hợi)
 * @returns index into NAP_AM_NAMES (0–29)
 */
export function getNapAmIndex(canIndex: number, chiIndex: number): number {
  for (let ganzhiIndex = 0; ganzhiIndex < 60; ganzhiIndex++) {
    if (ganzhiIndex % 10 === canIndex && ganzhiIndex % 12 === chiIndex) {
      return Math.floor(ganzhiIndex / 2);
    }
  }
  throw new Error(`Invalid Can-Chi pair for Nạp Âm: can=${canIndex}, chi=${chiIndex}`);
}

// ─- Âm Dương ──────────────────────────────────────────────────
/** Maps each Thiên Can to its Âm/Dương polarity. */
export const CAN_AM_DUONG: Record<string, 'Dương' | 'Âm'> = {
  Giáp: 'Dương',
  Ất: 'Âm',
  Bính: 'Dương',
  Đinh: 'Âm',
  Mậu: 'Dương',
  Kỷ: 'Âm',
  Canh: 'Dương',
  Tân: 'Âm',
  Nhâm: 'Dương',
  Quý: 'Âm',
};

// ── Ngũ Hành Sinh – Khắc ──────────────────────────────────────
/** Generation cycle: each element generates the next. */
export const NGU_HANH_SINH: Record<string, string> = {
  Kim: 'Thủy',
  Thủy: 'Mộc',
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
};

/** Control cycle: each element overcomes the next. */
export const NGU_HANH_KHAC: Record<string, string> = {
  Kim: 'Mộc',
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
};

// ── UI / Display Helpers ──────────────────────────────────────
/**
 * Ngũ Hành-first star color mapping for UI rendering.
 *
 * Traditional chart references generally align the five elements with:
 * Thủy = black/dark, Hỏa = red, Mộc = green, Kim = white/silver, Thổ = yellow.
 * We keep the palette legible on a white chart while staying close to the academic
 * Hà Đồ convention.
 */
export const STAR_COLORS: Record<string, string> = {
  Kim: '#8a8a8a',
  Mộc: '#2e9730',
  Thủy: '#161617',
  Hỏa: '#da2828',
  Thổ: '#c28b08',
};

/** Short markers for non-neutral star brightness. */
export const BRIGHTNESS_MARKERS: Record<string, string> = {
  Miếu: '(M)',
  Vượng: '(V)',
  Đắc: '(Đ)',
  Địa: '(Đ)',
  Lợi: '(L)',
  Hãm: '(H)',
};

/** Ngũ Hành element for each Nạp Âm name. */
export const NAP_AM_HANH: Record<string, string> = {
  'Hải Trung Kim': 'Kim',
  'Lô Trung Hỏa': 'Hỏa',
  'Đại Lâm Mộc': 'Mộc',
  'Lộ Bàng Thổ': 'Thổ',
  'Kiếm Phong Kim': 'Kim',
  'Sơn Đầu Hỏa': 'Hỏa',
  'Giản Hạ Thủy': 'Thủy',
  'Thành Đầu Thổ': 'Thổ',
  'Bạch Lạp Kim': 'Kim',
  'Dương Liễu Mộc': 'Mộc',
  'Tuyền Trung Thủy': 'Thủy',
  'Ốc Thượng Thổ': 'Thổ',
  'Phích Lịch Hỏa': 'Hỏa',
  'Tùng Bách Mộc': 'Mộc',
  'Trường Lưu Thủy': 'Thủy',
  'Sa Trung Kim': 'Kim',
  'Sơn Hạ Hỏa': 'Hỏa',
  'Bình Địa Mộc': 'Mộc',
  'Bích Thượng Thổ': 'Thổ',
  'Kim Bạc Kim': 'Kim',
  'Phúc Đăng Hỏa': 'Hỏa',
  'Thiên Hà Thủy': 'Thủy',
  'Đại Dịch Thổ': 'Thổ',
  'Thoa Xuyến Kim': 'Kim',
  'Tang Chá Mộc': 'Mộc',
  'Đại Khê Thủy': 'Thủy',
  'Sa Trung Thổ': 'Thổ',
  'Thiên Thượng Hỏa': 'Hỏa',
  'Thạch Lựu Mộc': 'Mộc',
  'Đại Hải Thủy': 'Thủy',
};
