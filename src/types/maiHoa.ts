// ── Mai Hoa Dịch Số Type Definitions ────────────────────────────
// Epic 1 (US_MH_D04): Strict interfaces for the entire Mai Hoa engine.
// No `any` types. All JSON data files are typed through these interfaces.

/** Ngũ Hành — The Five Elements */
export type NguHanh = 'Kim' | 'Thủy' | 'Mộc' | 'Hỏa' | 'Thổ';

/** Nature of a Trigram (Thiên/Địa/Lôi/Phong/Thủy/Hỏa/Sơn/Trạch) */
export type TrigramNature = 'Thiên' | 'Địa' | 'Lôi' | 'Phong' | 'Thủy' | 'Hỏa' | 'Sơn' | 'Trạch';

/**
 * A single Trigram (Quẻ Đơn) from the Bát Quái.
 * Ordered by Tiên Thiên Bát Quái numbering (1–8).
 */
export interface Trigram {
  /** Tiên Thiên ordering: 1=Càn, 2=Đoài, 3=Ly, 4=Chấn, 5=Tốn, 6=Khảm, 7=Cấn, 8=Khôn */
  readonly id: number;
  /** Vietnamese name: "Càn", "Đoài", etc. */
  readonly name: string;
  /** Ngũ Hành element of this Trigram */
  readonly element: NguHanh;
  /**
   * 3-boolean array representing the 3 lines.
   * Index 0 = bottom line, Index 2 = top line.
   * true = Dương (solid), false = Âm (broken).
   */
  readonly lines: readonly [boolean, boolean, boolean];
  /** Nature/Image of the trigram: Thiên, Địa, etc. */
  readonly nature: TrigramNature;
}

/**
 * Classical text and commentary for a single hào (line) within a hexagram.
 * Sourced from Kinh Dịch references (e.g., Nguyễn Hiến Lê).
 */
export interface HaoText {
  /** Line position (1=bottom, 6=top) */
  readonly position: number;
  /** Original Chinese text (Hào Từ), e.g. "井泥不食" */
  readonly original: string;
  /** Vietnamese translation/interpretation */
  readonly meaning: string;
  /** Detailed commentary explaining the line */
  readonly commentary?: string;
}

/**
 * Category-specific predictions (Luận Đoán Theo Sự Việc Cụ Thể).
 * Each field provides a short prediction for a specific life area.
 * All fields are optional — hexagrams may have partial data.
 */
export interface HexagramCategoryPredictions {
  /** Xem thế vận — Current fortune/luck */
  readonly theVan?: string;
  /** Xem hy vọng — Hopes/expectations */
  readonly hyVong?: string;
  /** Xem tài lộc — Wealth/finances */
  readonly taiLoc?: string;
  /** Xem sự nghiệp — Career */
  readonly suNghiep?: string;
  /** Xem nhậm chức — Appointment/promotion */
  readonly nhamChuc?: string;
  /** Xem nghề nghiệp — Profession/job */
  readonly ngheNghiep?: string;
  /** Xem tình yêu — Love/romance */
  readonly tinhYeu?: string;
  /** Xem hôn nhân — Marriage */
  readonly honNhan?: string;
  /** Xem đợi người — Waiting for someone */
  readonly doiNguoi?: string;
  /** Xem đi xa — Traveling */
  readonly diXa?: string;
  /** Xem pháp lý — Legal matters */
  readonly phapLy?: string;
  /** Xem sự việc — General affairs */
  readonly suViec?: string;
  /** Xem bệnh tật — Illness/health */
  readonly benhTat?: string;
  /** Xem thi cử — Exams/education */
  readonly thiCu?: string;
  /** Xem mất của — Lost property */
  readonly matCua?: string;
  /** Xem người ra đi — Person who left */
  readonly nguoiRaDi?: string;
}

/**
 * Moving-line specific predictions (Luận Đoán Hào Động).
 * These provide additional interpretation when a specific hào is the moving line.
 */
export interface MovingLinePrediction {
  /** Main interpretation text for the moving line */
  readonly meaning: string;
  /** Optional sub-predictions for business/finance context */
  readonly business?: {
    readonly taiVan?: string;
    readonly khaiTruong?: string;
    readonly buonBan?: string;
  };
}

/**
 * A single Hexagram (Quẻ Kép) from the 64 Hexagrams.
 */
export interface Hexagram {
  /** Sequential ID (1–64) */
  readonly id: number;
  /** Hán Việt name, e.g. "Thiên Địa Bĩ" */
  readonly name: string;
  /** ID of the upper (outer) trigram (1–8) */
  readonly upper: number;
  /** ID of the lower (inner) trigram (1–8) */
  readonly lower: number;
  /** Brief interpretive meaning in Vietnamese */
  readonly meaning: string;
  /** Symbolic image (Tượng) description in Vietnamese */
  readonly image: string;
  /** Chinese name in Hán tự, e.g. "比 bỉ" */
  readonly chineseName?: string;
  /** Quẻ diagram notation, e.g. "::::|:" */
  readonly diagram?: string;
  /** Brief interpretation keywords, e.g. "Tư dã. Chọn lọc." */
  readonly briefExplanation?: string;
  /** Thoán Từ (Judgment) by Văn Vương — original Chinese + Vietnamese meaning */
  readonly thoanTu?: {
    readonly original: string;
    readonly meaning: string;
  };
  /** Overall scholarly commentary (e.g. Nguyễn Hiến Lê) */
  readonly commentary?: string;
  /** Lời Triệu — Prophecy phrase (e.g. "Khô tỉnh sinh tuyền") */
  readonly prophecy?: string;
  /** Extended meaning paragraph from reference texts */
  readonly deepMeaning?: string;
  /** Category-specific predictions for life areas */
  readonly categoryPredictions?: HexagramCategoryPredictions;
  /** Classical Hào Từ texts for each line (1–6) */
  readonly haoTexts?: readonly HaoText[];
  /** Moving-line specific predictions, keyed by line position (1–6) */
  readonly movingLinePredictions?: Readonly<Record<number, MovingLinePrediction>>;
}

/**
 * Describes the relationship between two Ngũ Hành elements.
 */
export type NguHanhRelation =
  | 'Sinh' // A generates B
  | 'Khắc' // A controls B
  | 'Bị Sinh' // A is generated by B (inverse of Sinh)
  | 'Bị Khắc' // A is controlled by B (inverse of Khắc)
  | 'Tỷ Hòa'; // A and B are the same element

/**
 * Seasonal strength of an element.
 * Vượng (Prosperous) → Tướng (Phase) → Hưu (Rest) → Tù (Prisoner) → Tử (Dead)
 */
export type ElementStrength = 'Vượng' | 'Tướng' | 'Hưu' | 'Tù' | 'Tử';

/**
 * The interaction matrix entry for Ngũ Hành.
 * Key: source element. Value: mapping of target element → relation.
 */
export type NguHanhInteractionMatrix = Readonly<Record<NguHanh, Readonly<Record<NguHanh, NguHanhRelation>>>>;

/**
 * Seasonal element strength mapping.
 * Key: element. Value: mapping of season → strength.
 */
export type SeasonalStrengthMatrix = Readonly<Record<NguHanh, Readonly<Record<string, ElementStrength>>>>;

/**
 * Full Ngũ Hành interaction data file shape.
 */
export interface NguHanhInteractionData {
  /** 5×5 matrix: for each element pair, the relationship */
  readonly interactionMatrix: NguHanhInteractionMatrix;
  /** 5×4 matrix: for each element and season, the strength */
  readonly seasonalStrength: SeasonalStrengthMatrix;
}

/**
 * The assessment of Thể-Dụng elemental relationship.
 */
export interface TheDungAssessment {
  /** The relationship direction, e.g. "Dụng Sinh Thể" */
  readonly relationship: string;
  /** The Ngũ Hành relation type */
  readonly relationType: NguHanhRelation;
  /** Human-readable verdict text in Vietnamese */
  readonly meaning: string;
  /** Quality simplified: "Cát" (auspicious), "Hung" (inauspicious), "Bình" (neutral) */
  readonly verdict: 'Cát' | 'Hung' | 'Bình';
}

/**
 * Complete result of a single Mai Hoa divination.
 */
export interface DivinationResult {
  /** The Main Hexagram (Quẻ Chủ) — beginning of the matter */
  readonly mainHexagram: Hexagram;
  /** The Mutual Hexagram (Quẻ Hỗ) — middle/process */
  readonly mutualHexagram: Hexagram;
  /** The Changed Hexagram (Quẻ Biến) — end/result */
  readonly changedHexagram: Hexagram;
  /** The Moving Line position (1–6, 1=bottom) */
  readonly movingLine: number;
  /** Which part of the Main Hexagram is Thể (upper or lower) */
  readonly theTrigram: 'upper' | 'lower';
  /** Which part of the Main Hexagram is Dụng (upper or lower) */
  readonly dungTrigram: 'upper' | 'lower';
  /** The Ngũ Hành elements involved */
  readonly elements: {
    readonly theElement: NguHanh;
    readonly dungElement: NguHanh;
  };
  /** Per-hào metadata for all 3 hexagrams (Phase 3A) */
  readonly mainHaoDetails?: readonly HaoDetail[];
  readonly mutualHaoDetails?: readonly HaoDetail[];
  readonly changedHaoDetails?: readonly HaoDetail[];
  /** Temporal context bridged from Phase 1 (Phase 3A) */
  readonly context?: DivinationContext;
}

// ── Phase 3A: Lục Thân (Six Relations) ────────────────────────

/**
 * The six familial relations in I-Ching divination.
 * Derived from the hexagram's Palace (Cung) element vs each hào's element.
 */
export type LucThan =
  | 'Huynh Đệ' // Same element as Cung (Brother)
  | 'Tử Tôn' // Cung generates hào (Offspring)
  | 'Thê Tài' // Cung controls hào (Wife/Wealth)
  | 'Quan Quỷ' // Hào controls Cung (Official/Ghost)
  | 'Phụ Mẫu'; // Hào generates Cung (Parent)

/**
 * Metadata for a single hào (line) in a hexagram.
 * Includes Nạp Giáp Can-Chi assignment and Lục Thân derivation.
 */
export interface HaoDetail {
  /** Line position (1=bottom, 6=top) */
  readonly position: number;
  /** Whether the line is solid (Dương) or broken (Âm) */
  readonly isSolid: boolean;
  /** Heavenly Stem from Nạp Giáp assignment */
  readonly can: string;
  /** Earthly Branch from Nạp Giáp assignment */
  readonly chi: string;
  /** Ngũ Hành element of the Chi */
  readonly element: NguHanh;
  /** Lục Thân relation (relative to the hexagram's Cung element) */
  readonly lucThan: LucThan;
  /** Whether this is the Thế (世) position */
  readonly isTh?: boolean;
  /** Whether this is the Ứng (應) position */
  readonly isUng?: boolean;
  /** Whether this is the moving line (Hào Động) */
  readonly isMoving?: boolean;
}

// ── Phase 3A: Calendar Mode ───────────────────────────────────

/**
 * Which calendar system to use for determining the month in divination.
 * - 'lunar': Standard Lunar Calendar month (New Moon → New Moon)
 * - 'tietKhi': Solar Term month (based on Sun longitude, 315° = Lập Xuân = Month 1/Dần)
 */
export type CalendarMode = 'lunar' | 'tietKhi';

// ── Phase 3A: Divination Context ──────────────────────────────

/**
 * Temporal context for a divination reading.
 * Bridges Phase 1 calendar data into Phase 2 divination display.
 */
export interface DivinationContext {
  /** Full Can Chi of the divination moment */
  readonly canChi: {
    readonly year: string;
    readonly month: string;
    readonly day: string;
    readonly hour: string;
  };
  /** Current Solar Term name (e.g., "Vũ Thủy") */
  readonly tietKhi: string;
  /** Day's Can-Chi element (Nhật Thần), e.g. "Hợi-Thủy" */
  readonly nhatThan: string;
  /** Month's Chi element (Nguyệt Lệnh), e.g. "Dần-Mộc" */
  readonly nguyetLenh: string;
  /** Which calendar mode was used */
  readonly calendarMode: CalendarMode;
  /** The effective month number used in calculation */
  readonly effectiveMonth: number;
  /** Solar date string */
  readonly solarDate: string;
  /** Lunar date string */
  readonly lunarDate: string;
  /** Divination method label */
  readonly method: 'Mai Hoa' | 'Nhập Số';
  /** User's query/question (optional) */
  readonly query?: string;
}

/**
 * Complete divine reading summary (output of interpretation engine).
 */
export interface DivineReadingSummary {
  /** Overall auspiciousness: "Cát", "Hung", or "Bình" */
  readonly overallVerdict: 'Cát' | 'Hung' | 'Bình';
  /** Thể-Dụng relationship assessment */
  readonly theDungAssessment: TheDungAssessment;
  /** Temporal influence on the Thể element */
  readonly temporalInfluence: {
    readonly strength: ElementStrength;
    readonly description: string;
  };
  /** Traditional meaning of the Main Hexagram */
  readonly hexagramMeaning: {
    readonly name: string;
    readonly image: string;
    readonly meaning: string;
  };
  /** Full human-readable explanation in Vietnamese */
  readonly detailedExplanation: string;
  /** Element breakdown for display */
  readonly elementBreakdown: {
    readonly theElement: NguHanh;
    readonly dungElement: NguHanh;
    readonly relation: NguHanhRelation;
  };
  /** Prophecy phrase (Lời Triệu) from the main hexagram, if available */
  readonly prophecy?: string;
  /** Deep meaning text, if available */
  readonly deepMeaning?: string;
  /** Hào Từ text for the specific moving line, if available */
  readonly movingLineText?: HaoText;
  /** Moving-line-specific prediction, if available */
  readonly movingLinePrediction?: MovingLinePrediction;
  /** Category-specific predictions, if available */
  readonly categoryPredictions?: HexagramCategoryPredictions;
  /** Chinese name of the hexagram, e.g. "比 bỉ" */
  readonly chineseName?: string;
  /** Brief explanation keywords */
  readonly briefExplanation?: string;
  /** Thoán Từ (Judgment) by Văn Vương */
  readonly thoanTu?: { readonly original: string; readonly meaning: string };
  /** All 6 Hào Từ classical texts (not just the moving line) */
  readonly allHaoTexts?: readonly HaoText[];
  /** Overall scholarly commentary */
  readonly commentary?: string;
  /** Hỗ quẻ deep analysis (element relation to Thể) */
  readonly hoQueAnalysis?: {
    readonly hexagramName: string;
    readonly upperElement: NguHanh;
    readonly lowerElement: NguHanh;
    readonly relationToThe: NguHanhRelation;
    readonly verdict: 'Cát' | 'Hung' | 'Bình';
    readonly interpretation: string;
  };
  /** Biến quẻ deep analysis (element relation to Thể) */
  readonly bienQueAnalysis?: {
    readonly hexagramName: string;
    readonly upperElement: NguHanh;
    readonly lowerElement: NguHanh;
    readonly relationToThe: NguHanhRelation;
    readonly verdict: 'Cát' | 'Hung' | 'Bình';
    readonly interpretation: string;
  };
}

/**
 * Input parameters for time-based divination.
 */
export interface TimeBasedInput {
  /** Chi index of the Lunar Year (1=Tý, 2=Sửu, ..., 12=Hợi) */
  readonly yearChiIndex: number;
  /** Lunar month number (1–12) */
  readonly lunarMonth: number;
  /** Lunar day number (1–30) */
  readonly lunarDay: number;
  /** Chi index of the current hour (1=Tý, 2=Sửu, ..., 12=Hợi) */
  readonly hourChiIndex: number;
}

/**
 * Input parameters for number-based divination.
 */
export interface NumberBasedInput {
  /** First number (positive integer) */
  readonly num1: number;
  /** Second number (positive integer) */
  readonly num2: number;
}
