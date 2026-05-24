/**
 * Tử Vi Đẩu Số Engine — Barrel Exports
 *
 * Pure TypeScript calculation engine for Thiên Lương school Tử Vi.
 * Zero React dependencies.
 */

// ── Constants ────────────────────────────────────────────────
export {
  PALACE_NAMES,
  PALACE_NAMES_HAN_VIET,
  CHI_NAMES,
  CAN_NAMES,
  NGU_HANH,
  NGU_HANH_CUC,
  CUC_LOOKUP_TABLE,
  CHINH_TINH_LIST,
  PHU_TINH_LIST,
  TAM_HOP_GROUPS,
  DOI_CUNG_MAP,
  NAP_AM_NAMES,
  CAN_AM_DUONG,
  NGU_HANH_SINH,
  NGU_HANH_KHAC,
  STAR_COLORS,
  BRIGHTNESS_MARKERS,
  getNapAmIndex,
} from './constants';
export { getTuViCatalogSummary, getTuViStarLayer } from './catalogLayers';

// ── Time Normalization ────────────────────────────────────────
export { normalizeBirthTime, getVietnamUtcOffset, getHourBranch, getHourCan, formatCanChi } from './timeNormalization';

// ── Star Placement ────────────────────────────────────────────
export {
  calculateMenhCungPosition,
  calculateThanCungPosition,
  calculateCuc,
  calculateMenhCan,
  placeTuViStar,
  placeChinhTinh,
  placePhuTinh,
  calculateTuHoa,
  calculatePalaceCans,
  calculateHanContext,
  generateChart,
} from './starPlacement';

export { DEFAULT_TU_VI_SCHOOL, TU_VI_SCHOOL_PROFILES, resolveTuViSchoolProfile } from './schoolProfiles';
export { buildTuViBirthContext } from './birthContext';
export { normalizeBirthTimeWithPolicy } from './timeNormalization';

// ── Center Metadata ────────────────────────────────────────────
export {
  calculateCenterInfo,
  calculateLaiNhanCung,
  calculateNguyenThan,
  formatAmDuongLabel,
  formatLunarDate,
  getPalaceNameByPosition,
} from './centerMetadata';

// ── Star Grouping ─────────────────────────────────────────────
export {
  groupStarsByType,
  groupStarsByNguHanh,
  getStarColor,
  getStarBrightnessMarker,
  formatPalaceStars,
  isChinhTinh,
  isSatTinh,
} from './starGrouping';

// ── Combination Detection ──────────────────────────────────────
export {
  detectCombinations,
  detectTamHopPalaces,
  detectDoiCung,
  getStarsInPalace,
  getStarsInTamHop,
  checkCombinationPurity,
  calculateCombinationStrength,
} from './combinationDetection';

// ── Huyền Khí ──────────────────────────────────────────────────
export { calculateHuyenKhi, calculatePalaceScore } from './huyenKhi';

// ── Mệnh-Cục Relation ──────────────────────────────────────────
export { calculateMenhCucRelation, getMenhHanh, getCucHanh } from './menhCucRelation';

// ── Markdown Formatter ─────────────────────────────────────────
export {
  formatTuViChartAsMarkdown,
  formatCenterInfoAsMarkdown,
  formatPalacesAsMarkdown,
  formatCombinationsAsMarkdown,
  generatePromptHeader,
} from './markdownFormatter';
