export const STAR_COLORS = Object.freeze({
  kim: "#8a8a8a",
  moc: "#2e9730",
  thuy: "#161617",
  hoa: "#da2828",
  tho: "#c28b08"
});

const CAN_LIST = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_LIST = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const PALACE_NAMES = [
  "Mệnh",
  "Huynh Đệ",
  "Phu Thê",
  "Tử Tức",
  "Tài Bạch",
  "Tật Ách",
  "Thiên Di",
  "Nô Bộc",
  "Quan Lộc",
  "Điền Trạch",
  "Phúc Đức",
  "Phụ Mẫu"
];
const PALACE_NAMES_HAN_VIET = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "遷移宮", "奴僕宮", "官祿宮", "田宅宮", "福德宮", "父母宮"];
const CHINH_TINH = Object.freeze({
  "Tử Vi": { nguHanh: "Dương Thổ", group: "bacDau" },
  "Thiên Cơ": { nguHanh: "Âm Mộc", group: "bacDau" },
  "Thái Dương": { nguHanh: "Dương Hỏa", group: "trungThien" },
  "Vũ Khúc": { nguHanh: "Âm Kim", group: "bacDau" },
  "Thiên Đồng": { nguHanh: "Dương Thủy", group: "bacDau" },
  "Liêm Trinh": { nguHanh: "Âm Hỏa", group: "bacDau" },
  "Thiên Phủ": { nguHanh: "Dương Thổ", group: "namDau" },
  "Thái Âm": { nguHanh: "Âm Thủy", group: "trungThien" },
  "Tham Lang": { nguHanh: "Âm Thủy", group: "bacDau" },
  "Cự Môn": { nguHanh: "Âm Thủy", group: "bacDau" },
  "Thiên Tướng": { nguHanh: "Dương Thủy", group: "namDau" },
  "Thiên Lương": { nguHanh: "Âm Mộc", group: "namDau" },
  "Thất Sát": { nguHanh: "Dương Kim", group: "namDau" },
  "Phá Quân": { nguHanh: "Âm Thủy", group: "bacDau" }
});
const PHU_TINH = Object.freeze({
  "Văn Xương": ["Dương Kim", "cat"], "Văn Khúc": ["Âm Thủy", "cat"], "Tả Phụ": ["Dương Thổ", "cat"], "Hữu Bật": ["Âm Thủy", "cat"],
  "Thiên Khôi": ["Dương Hỏa", "cat"], "Thiên Việt": ["Âm Hỏa", "cat"], "Kình Dương": ["Dương Kim", "sat"], "Đà La": ["Âm Kim", "sat"],
  "Hỏa Tinh": ["Dương Hỏa", "sat"], "Linh Tinh": ["Âm Hỏa", "sat"], "Địa Không": ["Âm Hỏa", "sat"], "Địa Kiếp": ["Dương Hỏa", "sat"],
  "Lộc Tồn": ["Âm Thổ", "cat"], "Thiên Mã": ["Dương Hỏa", "cat"], "Đào Hoa": ["Âm Thủy", "hoa"], "Hồng Loan": ["Âm Thủy", "hoa"],
  "Thiên Hỉ": ["Dương Thủy", "cat"], "Thiên Đức": ["Dương Thổ", "cat"], "Nguyệt Đức": ["Âm Thủy", "cat"], "Tam Thai": ["Dương Thổ", "cat"],
  "Bát Tọa": ["Âm Thổ", "cat"], "Ân Quang": ["Dương Mộc", "cat"], "Thiên Quý": ["Âm Thổ", "cat"], "Đài Phụ": ["Dương Thổ", "cat"],
  "Phong Cáo": ["Âm Thổ", "cat"], "Đẩu Quân": ["Dương Hỏa", "sat"], "Thiên Y": ["Âm Thổ", "cat"], "Hoa Cái": ["Dương Kim", "cat"],
  "Cô Thần": ["Âm Thổ", "sat"], "Quả Tú": ["Âm Thổ", "sat"], "Thiên Tài": ["Dương Thổ", "cat"], "Thiên Thọ": ["Dương Thổ", "cat"],
  "Thiên Trù": ["Dương Thổ", "cat"], "Phá Toái": ["Âm Hỏa", "sat"], "Phi Liêm": ["Dương Hỏa", "sat"], "Long Trì": ["Dương Thủy", "cat"],
  "Phượng Các": ["Dương Mộc", "cat"], "Thiên Khốc": ["Dương Hỏa", "sat"], "Thiên Hư": ["Âm Hỏa", "sat"], "Thiên Quan": ["Dương Hỏa", "cat"],
  "Thiên Phúc": ["Dương Thổ", "cat"], "Thiên Không": ["Âm Hỏa", "sat"], "Thiên Thương": ["Âm Thổ", "sat"], "Thiên Sứ": ["Âm Thủy", "sat"],
  "Kiếp Sát": ["Dương Hỏa", "sat"], "Giải Thần": ["Dương Mộc", "cat"], "Thiên Riêu": ["Âm Thủy", "hoa"], "Thiên Hình": ["Dương Hỏa", "sat"],
  "Âm Sát": ["Âm Hỏa", "sat"], "Thiên Nguyệt": ["Âm Thủy", "cat"], "Thiên Vu": ["Dương Mộc", "cat"], "Thiên Giải": ["Dương Hỏa", "cat"],
  "Lưu Hà": ["Âm Thủy", "sat"], "Đường Phù": ["Dương Mộc", "cat"], "Quốc Ấn": ["Dương Thổ", "cat"], "Thiên La": ["Âm Thổ", "sat"],
  "Địa Võng": ["Âm Thổ", "sat"], "Địa Giải": ["Âm Thổ", "cat"], "Thái Tuế": ["Dương Hỏa", "sat"], "Thiếu Dương": ["Dương Hỏa", "cat"], "Tang Môn": ["Âm Mộc", "sat"],
  "Thiếu Âm": ["Âm Thủy", "cat"], "Quan Phù": ["Dương Hỏa", "sat"], "Tử Phù": ["Âm Thổ", "sat"], "Tuế Phá": ["Dương Hỏa", "sat"],
  "Long Đức": ["Dương Thủy", "cat"], "Bạch Hổ": ["Dương Kim", "sat"], "Phúc Đức": ["Dương Thổ", "cat"], "Điếu Khách": ["Dương Hỏa", "sat"],
  "Trực Phù": ["Âm Hỏa", "sat"], "Bác Sỹ": ["Dương Thủy", "cat"], "Lực Sỹ": ["Dương Hỏa", "cat"], "Thanh Long": ["Dương Mộc", "cat"],
  "Tiểu Hao": ["Âm Hỏa", "sat"], "Tướng Quân": ["Dương Mộc", "cat"], "Tấu Thư": ["Dương Kim", "cat"], "Hỷ Thần": ["Dương Hỏa", "cat"],
  "Bệnh Phù": ["Âm Thổ", "sat"], "Đại Hao": ["Dương Hỏa", "sat"], "Phục Binh": ["Âm Hỏa", "sat"], "Quan Phủ": ["Dương Hỏa", "sat"],
  "Tướng Tinh": ["Dương Mộc", "cat"], "Phan Án": ["Dương Thổ", "cat"], "Tuế Dịch": ["Âm Mộc", "sat"], "Tức Thần": ["Âm Hỏa", "sat"],
  "Tai Sát": ["Dương Hỏa", "sat"], "Thiên Sát": ["Dương Hỏa", "sat"],
  "Chỉ Bối": ["Âm Thủy", "sat"], "Hàm Trì": ["Âm Thủy", "hoa"], "Nguyệt Sát": ["Âm Hỏa", "sat"], "Vong Thần": ["Âm Hỏa", "sat"],
  "Hối Khí": ["Âm Thổ", "sat"], "Quán Sách": ["Âm Hỏa", "sat"]
});
const VAN_XUONG_TABLE = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];
const VAN_KHUC_TABLE = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3];
const THIEN_KHOI_TABLE = [1, 0, 11, 11, 1, 0, 6, 6, 3, 3];
const THIEN_VIET_TABLE = [7, 8, 9, 9, 7, 8, 2, 2, 5, 5];
const LOC_TON_TABLE = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
const DIA_KHONG_TABLE = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const THIEN_MA_TABLE = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5];
const HONG_LOAN_TABLE = [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4];
const THIEN_HI_TABLE = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10];
const LUU_HA_TABLE = [9, 10, 7, 4, 5, 6, 8, 3, 11, 2];
const HOA_TINH_TABLE = [[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1], [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0], [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]];
const LINH_TINH_TABLE = [[10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2], [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]];
const THAI_TUE_12 = ["Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù"];
const BAC_PHAI_THAI_TUE_12 = ["Thái Tuế", "Hối Khí", "Tang Môn", "Quán Sách", "Quan Phù", "Tiểu Hao", "Tuế Phá", "Long Đức", "Bạch Hổ", "Thiên Đức", "Điếu Khách", "Bệnh Phù"];
const BAC_SI_12 = ["Bác Sỹ", "Lực Sỹ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ"];
const TUONG_TINH_12 = ["Tướng Tinh", "Phan Án", "Tuế Dịch", "Tức Thần", "Hoa Cái", "Kiếp Sát", "Tai Sát", "Thiên Sát", "Chỉ Bối", "Hàm Trì", "Nguyệt Sát", "Vong Thần"];
const TRUONG_SINH_12 = ["Trường Sinh", "Mục Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
const TU_HOA_TABLE = {
  "Giáp": { "Lộc": "Liêm Trinh", "Quyền": "Phá Quân", "Khoa": "Vũ Khúc", "Kỵ": "Thái Dương" },
  "Ất": { "Lộc": "Thiên Cơ", "Quyền": "Thiên Lương", "Khoa": "Tử Vi", "Kỵ": "Thái Âm" },
  "Bính": { "Lộc": "Thiên Đồng", "Quyền": "Thiên Cơ", "Khoa": "Văn Xương", "Kỵ": "Liêm Trinh" },
  "Đinh": { "Lộc": "Thái Âm", "Quyền": "Thiên Đồng", "Khoa": "Thiên Cơ", "Kỵ": "Cự Môn" },
  "Mậu": { "Lộc": "Tham Lang", "Quyền": "Thái Âm", "Khoa": "Hữu Bật", "Kỵ": "Thiên Cơ" },
  "Kỷ": { "Lộc": "Vũ Khúc", "Quyền": "Tham Lang", "Khoa": "Thiên Lương", "Kỵ": "Văn Khúc" },
  "Canh": { "Lộc": "Thái Dương", "Quyền": "Vũ Khúc", "Khoa": "Thái Âm", "Kỵ": "Thiên Đồng" },
  "Tân": { "Lộc": "Cự Môn", "Quyền": "Thái Dương", "Khoa": "Văn Khúc", "Kỵ": "Văn Xương" },
  "Nhâm": { "Lộc": "Thiên Lương", "Quyền": "Tử Vi", "Khoa": "Tả Phụ", "Kỵ": "Vũ Khúc" },
  "Quý": { "Lộc": "Phá Quân", "Quyền": "Cự Môn", "Khoa": "Thái Âm", "Kỵ": "Tham Lang" }
};
const TRUNG_CHAU_TU_HOA = {
  "Giáp": { "Lộc": "Liêm Trinh", "Quyền": "Phá Quân", "Khoa": "Vũ Khúc", "Kỵ": "Thái Dương" },
  "Ất": { "Lộc": "Thiên Cơ", "Quyền": "Thiên Lương", "Khoa": "Tử Vi", "Kỵ": "Thái Âm" },
  "Bính": { "Lộc": "Thiên Đồng", "Quyền": "Thiên Cơ", "Khoa": "Văn Xương", "Kỵ": "Liêm Trinh" },
  "Đinh": { "Lộc": "Thái Âm", "Quyền": "Thiên Đồng", "Khoa": "Thiên Cơ", "Kỵ": "Cự Môn" },
  "Mậu": { "Lộc": "Tham Lang", "Quyền": "Thái Âm", "Khoa": "Thái Dương", "Kỵ": "Thiên Cơ" },
  "Kỷ": { "Lộc": "Vũ Khúc", "Quyền": "Tham Lang", "Khoa": "Thiên Lương", "Kỵ": "Văn Khúc" },
  "Canh": { "Lộc": "Thái Dương", "Quyền": "Vũ Khúc", "Khoa": "Thái Âm", "Kỵ": "Thiên Đồng" },
  "Tân": { "Lộc": "Cự Môn", "Quyền": "Thái Dương", "Khoa": "Văn Khúc", "Kỵ": "Văn Xương" },
  "Nhâm": { "Lộc": "Thiên Lương", "Quyền": "Tử Vi", "Khoa": "Tả Phụ", "Kỵ": "Vũ Khúc" },
  "Quý": { "Lộc": "Phá Quân", "Quyền": "Cự Môn", "Khoa": "Thái Âm", "Kỵ": "Tham Lang" }
};

/**
 * Returns the hex color string for a given element attribute.
 * Supports case-insensitive matching.
 *
 * @param {string} element
 * @returns {string|null}
 */
export function getStarColor(element) {
  if (typeof element !== "string") {
    return null;
  }
  const key = element.toLowerCase();
  return STAR_COLORS[key] || null;
}

/**
 * Resolves the two Chi indices (0-11) affected by Triệt Không based on the birth year Can.
 * Supports both Can index (0-9) and Can name.
 *
 * @param {string|number} yearCan
 * @returns {[number, number]}
 */
export function getTrietPositions(yearCan) {
  const canIdx = typeof yearCan === "string" ? CAN_LIST.indexOf(yearCan) : yearCan;
  if (canIdx === -1 || canIdx < 0 || canIdx > 9 || !Number.isInteger(canIdx)) {
    throw new TypeError("Invalid year Can: must be an integer (0-9) or a valid Can name string");
  }

  const map = {
    0: [8, 9], // Giáp -> Thân, Dậu
    1: [6, 7], // Ất -> Ngọ, Mùi
    2: [4, 5], // Bính -> Thìn, Tỵ
    3: [2, 3], // Đinh -> Dần, Mão
    4: [0, 1], // Mậu -> Tý, Sửu
    5: [8, 9], // Kỷ -> Thân, Dậu
    6: [6, 7], // Canh -> Ngọ, Mùi
    7: [4, 5], // Tân -> Thìn, Tỵ
    8: [2, 3], // Nhâm -> Dần, Mão
    9: [0, 1]  // Quý -> Tý, Sửu
  };

  return map[canIdx];
}

/**
 * Resolves the two Chi indices (0-11) affected by Tuần Không based on the birth year Can and Chi.
 * Supports both index values and string names.
 *
 * @param {string|number} yearCan
 * @param {string|number} yearChi
 * @returns {[number, number]}
 */
export function getTuanPositions(yearCan, yearChi) {
  const canIdx = typeof yearCan === "string" ? CAN_LIST.indexOf(yearCan) : yearCan;
  if (canIdx === -1 || canIdx < 0 || canIdx > 9 || !Number.isInteger(canIdx)) {
    throw new TypeError("Invalid year Can: must be an integer (0-9) or a valid Can name string");
  }

  const chiIdx = typeof yearChi === "string" ? CHI_LIST.indexOf(yearChi) : yearChi;
  if (chiIdx === -1 || chiIdx < 0 || chiIdx > 11 || !Number.isInteger(chiIdx)) {
    throw new TypeError("Invalid year Chi: must be an integer (0-11) or a valid Chi name string");
  }

  const diff = (chiIdx - canIdx + 12) % 12;
  return [
    (diff - 2 + 12) % 12,
    (diff - 1 + 12) % 12
  ];
}

/**
 * Calculates the 10-year major cycle age boundaries for each of the 12 palaces.
 *
 * @param {object} input
 * @param {number} input.cucNumber - Palace element cycle start age (2 to 6)
 * @param {string} input.gender - Gender "nam" or "nữ" (also accepts "male" or "female")
 * @param {string|number} input.yearCan - Birth year Can name or index
 * @param {number} input.menhPalaceIndex - Index of the Cung Mệnh palace (0-11)
 * @returns {Array<{ startAge: number, endAge: number, rangeString: string }>} Array of 12 elements mapped by palace index
 */
export function calculateDaiHanAgeRanges({ cucNumber, gender, yearCan, menhPalaceIndex }) {
  if (![2, 3, 4, 5, 6].includes(cucNumber)) {
    throw new RangeError("Invalid cucNumber: must be 2, 3, 4, 5, or 6");
  }

  const canIdx = typeof yearCan === "string" ? CAN_LIST.indexOf(yearCan) : yearCan;
  if (canIdx === -1 || canIdx < 0 || canIdx > 9 || !Number.isInteger(canIdx)) {
    throw new TypeError("Invalid year Can: must be an integer (0-9) or a valid Can name string");
  }

  if (menhPalaceIndex < 0 || menhPalaceIndex > 11 || !Number.isInteger(menhPalaceIndex)) {
    throw new RangeError("Invalid menhPalaceIndex: must be an integer (0-11)");
  }

  const normGender = String(gender).toLowerCase();
  const isMale = normGender === "nam" || normGender === "male";
  const isFemale = normGender === "nữ" || normGender === "female" || normGender === "nu";
  if (!isMale && !isFemale) {
    throw new TypeError("Invalid gender: must be male or female");
  }

  const amDuong = canIdx % 2 === 0 ? "Dương" : "Âm";
  const thuanNghich = (amDuong === "Dương" && isMale) || (amDuong === "Âm" && isFemale) ? "Thuận" : "Nghịch";
  const isClockwise = thuanNghich === "Thuận";
  const step = isClockwise ? 1 : -1;

  const result = new Array(12);
  for (let chiIdx = 0; chiIdx < 12; chiIdx++) {
    const palaceOrderFromStart = ((step * (chiIdx - menhPalaceIndex)) % 12 + 12) % 12;
    const startAge = cucNumber + palaceOrderFromStart * 10;
    const endAge = startAge + 9;
    result[chiIdx] = {
      startAge,
      endAge,
      rangeString: `${startAge}–${endAge}`
    };
  }

  return result;
}

/**
 * Resolves the palace index corresponding to the given Gregorian view year
 * based on the birth year Chi, gender, and the canonical anchor index.
 *
 * @param {object} input
 * @param {string|number} input.birthYearChi - Birth year Chi name or index
 * @param {string} input.gender - Gender "nam" or "nữ"
 * @param {number} input.viewYear - Gregorian year to calculate for
 * @returns {number} Palace index (0-11)
 */
export function calculateTieuHanPalaceIndex({ birthYearChi, gender, viewYear }) {
  const birthChiIndex = typeof birthYearChi === "string" ? CHI_LIST.indexOf(birthYearChi) : birthYearChi;
  if (birthChiIndex === -1 || birthChiIndex < 0 || birthChiIndex > 11 || !Number.isInteger(birthChiIndex)) {
    throw new TypeError("Invalid birthYearChi: must be an integer (0-11) or a valid Chi name string");
  }

  if (typeof viewYear !== "number" || !Number.isFinite(viewYear)) {
    throw new TypeError("Invalid viewYear: must be a finite number");
  }

  const normGender = String(gender).toLowerCase();
  const isMale = normGender === "nam" || normGender === "male";
  const isFemale = normGender === "nữ" || normGender === "female" || normGender === "nu";
  if (!isMale && !isFemale) {
    throw new TypeError("Invalid gender: must be male or female");
  }

  // Determine the Tam Hợp group (0–3) from birth year Chi index
  let group;
  if ([0, 4, 8].includes(birthChiIndex)) {
    group = 0; // Tý-Thìn-Thân
  } else if ([1, 5, 9].includes(birthChiIndex)) {
    group = 1; // Sửu-Tỵ-Dậu
  } else if ([2, 6, 10].includes(birthChiIndex)) {
    group = 2; // Dần-Ngọ-Tuất
  } else {
    group = 3; // Mão-Mùi-Hợi
  }

  let anchor;
  if (group === 0) {
    anchor = 10; // Thân/Tý/Thìn -> Tuất
  } else if (group === 1) {
    anchor = 7;  // Tỵ/Dậu/Sửu -> Mùi
  } else if (group === 2) {
    anchor = 4;  // Dần/Ngọ/Tuất -> Thìn
  } else {
    anchor = 1;  // Hợi/Mão/Mùi -> Sửu
  }

  const viewYearChiIndex = ((viewYear - 4) % 12 + 12) % 12;
  const direction = isMale ? 1 : -1;
  const offset = (viewYearChiIndex - birthChiIndex + 12) % 12;

  return (anchor + direction * offset + 12) % 12;
}

/**
 * Calculates the ages (tuổi mụ, i.e. 1, 13, 25...) that fall on a specific palace index
 * for the Tiểu Hạn cycle.
 *
 * @param {object} input
 * @param {string|number} input.birthYearChi - Birth year Chi name or index
 * @param {string} input.gender - Gender "nam" or "nữ"
 * @param {number} input.palaceIndex - Index of the target palace (0-11)
 * @param {number} [input.maxAge=120] - Maximum age to generate for (default 120)
 * @returns {number[]} Array of ages
 */
export function calculateTieuHanAgesForPalace({ birthYearChi, gender, palaceIndex, maxAge = 120 }) {
  const birthChiIndex = typeof birthYearChi === "string" ? CHI_LIST.indexOf(birthYearChi) : birthYearChi;
  if (birthChiIndex === -1 || birthChiIndex < 0 || birthChiIndex > 11 || !Number.isInteger(birthChiIndex)) {
    throw new TypeError("Invalid birthYearChi: must be an integer (0-11) or a valid Chi name string");
  }

  if (palaceIndex < 0 || palaceIndex > 11 || !Number.isInteger(palaceIndex)) {
    throw new RangeError("Invalid palaceIndex: must be an integer (0-11)");
  }

  const normGender = String(gender).toLowerCase();
  const isMale = normGender === "nam" || normGender === "male";
  const isFemale = normGender === "nữ" || normGender === "female" || normGender === "nu";
  if (!isMale && !isFemale) {
    throw new TypeError("Invalid gender: must be male or female");
  }

  let group;
  if ([0, 4, 8].includes(birthChiIndex)) {
    group = 0;
  } else if ([1, 5, 9].includes(birthChiIndex)) {
    group = 1;
  } else if ([2, 6, 10].includes(birthChiIndex)) {
    group = 2;
  } else {
    group = 3;
  }

  let anchor;
  if (group === 0) anchor = 10;
  else if (group === 1) anchor = 7;
  else if (group === 2) anchor = 4;
  else anchor = 1;

  const direction = isMale ? 1 : -1;
  const baseDiff = ((direction * (palaceIndex - anchor)) % 12 + 12) % 12;
  const baseAge = 1 + baseDiff;

  const ages = [];
  for (let age = baseAge; age <= maxAge; age += 12) {
    ages.push(age);
  }
  return ages;
}

/**
 * Calculates the monthly Hạn (Nguyệt Hạn) palace indices for lunar months 1 to 12.
 *
 * @param {object} input
 * @param {number} input.tieuHanPalaceIndex - Current year's Tiểu Hạn palace index (0-11)
 * @param {number} input.birthMonth - Birth month (1-12)
 * @param {number} input.birthHour - Birth hour Chi index (0-11, where Tý = 0, Sửu = 1, etc.)
 * @returns {number[]} Array of 12 palace indices (index 0 is Month 1, index 11 is Month 12)
 */
export function calculateNguyetHanPalaces({ tieuHanPalaceIndex, birthMonth, birthHour }) {
  if (tieuHanPalaceIndex < 0 || tieuHanPalaceIndex > 11 || !Number.isInteger(tieuHanPalaceIndex)) {
    throw new RangeError("Invalid tieuHanPalaceIndex: must be an integer (0-11)");
  }
  if (birthMonth < 1 || birthMonth > 12 || !Number.isInteger(birthMonth)) {
    throw new RangeError("Invalid birthMonth: must be an integer (1-12)");
  }
  if (birthHour < 0 || birthHour > 11 || !Number.isInteger(birthHour)) {
    throw new RangeError("Invalid birthHour: must be an integer (0-11)");
  }

  const monthOnePalace = ((tieuHanPalaceIndex - (birthMonth - 1) + birthHour) % 12 + 12) % 12;
  const result = new Array(12);
  for (let month = 1; month <= 12; month++) {
    result[month - 1] = (monthOnePalace + month - 1) % 12;
  }
  return result;
}

/**
 * Converts a 24-hour clock hour to the Địa Chi branch index (0-11, where 0 = Tý, 1 = Sửu, etc.).
 *
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {number} Branch index (0-11)
 */
export function getHourBranch(hour) {
  const h = ((hour % 24) + 24) % 24;
  return Math.floor(((h + 1) % 24) / 2);
}

/**
 * Normalizes and resolves birth time, birthplace standard offsets (HTZC Registry),
 * true solar time correction, and the traditional metaphysical day-boundary shift (Dạ Tý shift at 23:00).
 *
 * @param {object} input
 * @param {Date|string} input.solarDate - Solar birth date
 * @param {number} [input.birthClockHour] - Local clock hour (0-23)
 * @param {number} [input.birthMinute] - Local minute (0-59)
 * @param {string} input.gender - Gender "nam" or "nữ"
 * @param {object} [input.birthLocation] - Location coordinates and timezone metadata
 * @param {string} [input.timePolicy="historical-vietnam"] - Normalization policy: "civil", "historical-vietnam", or "true-solar"
 * @returns {object} Resolved context metadata:
 *   - correctedDate {Date}: Local date after timezone/solar time correction
 *   - metaphysicalDate {Date}: Date used for lunar conversion and day Can-Chi (shifted if Dạ Tý)
 *   - hourBranchIndex {number}: resolved Chi index of the birth hour (0-11)
 *   - isDayShifted {boolean}: true if birth was in Dạ Tý (23:00 - 24:00) causing a day shift
 *   - offsetHours {number}: timezone offset applied
 *   - trueSolarCorrectionMinutes {number}: true solar correction in minutes
 */
export function resolveTuViBirthContext({
  solarDate,
  birthClockHour,
  birthMinute,
  gender,
  birthLocation,
  timePolicy = "historical-vietnam"
}) {
  const dateObj = solarDate instanceof Date ? new Date(solarDate.getTime()) : new Date(solarDate);
  if (isNaN(dateObj.getTime())) {
    throw new TypeError("Invalid solarDate");
  }

  const clockHour = typeof birthClockHour === "number" ? birthClockHour : dateObj.getHours();
  const clockMinute = typeof birthMinute === "number" ? birthMinute : dateObj.getMinutes();

  // Create local civil date
  const localDate = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    clockHour,
    clockMinute,
    0,
    0
  );

  let offsetHours = 7.0;
  let trueSolarCorrectionMinutes = 0.0;
  let correctedDate = new Date(localDate.getTime());

  const isVietnam = isVietnamBirthLocation(birthLocation);

  if (timePolicy === "historical-vietnam" || timePolicy === "true-solar") {
    if (isVietnam) {
      const region = birthLocation?.historicalRegion || inferHistoricalRegion(localDate, birthLocation);
      offsetHours = getVietnamHistoricalOffset(localDate, region);
      const targetOffset = 7.0; // unified Vietnam ICT offset
      const diffHours = targetOffset - offsetHours;
      correctedDate = new Date(localDate.getTime() + diffHours * 60 * 60 * 1000);
    } else if (birthLocation && typeof birthLocation.timezone === "number") {
      offsetHours = birthLocation.timezone;
    }
  } else if (birthLocation && typeof birthLocation.timezone === "number") {
    offsetHours = birthLocation.timezone;
  }

  if (timePolicy === "true-solar" && birthLocation && typeof birthLocation.lng === "number") {
    const stdMeridian = offsetHours * 15;
    trueSolarCorrectionMinutes = 4.0 * (birthLocation.lng - stdMeridian);
    correctedDate = new Date(correctedDate.getTime() + trueSolarCorrectionMinutes * 60 * 1000);
  }

  const localHour = correctedDate.getHours();
  const hourBranchIndex = getHourBranch(localHour);

  // Traditional Metaphysical Day boundary shift (Dạ Tý shift at 23:00)
  let metaphysicalDate = new Date(correctedDate.getTime());
  let isDayShifted = false;

  if (localHour === 23) {
    metaphysicalDate = new Date(correctedDate.getTime() + 24 * 60 * 60 * 1000);
    isDayShifted = true;
  }

  return {
    correctedDate,
    metaphysicalDate,
    hourBranchIndex,
    isDayShifted,
    offsetHours,
    trueSolarCorrectionMinutes
  };
}

function isVietnamBirthLocation(birthLocation) {
  if (!birthLocation) {
    return false;
  }

  const countryCode = birthLocation.countryCode?.trim()?.toUpperCase();
  if (countryCode) {
    return countryCode === "VN";
  }

  const countryName = birthLocation.countryName?.trim()?.toLowerCase();
  if (countryName) {
    return countryName.includes("vietnam") || countryName.includes("việt nam");
  }

  const locationName = birthLocation.locationName?.trim()?.toLowerCase();
  if (locationName && (locationName.includes("vietnam") || locationName.includes("việt nam"))) {
    return true;
  }

  if (typeof birthLocation.lat === "number" && typeof birthLocation.lng === "number") {
    return (
      birthLocation.lat >= 8.0 &&
      birthLocation.lat <= 24.0 &&
      birthLocation.lng >= 102.0 &&
      birthLocation.lng <= 110.8
    );
  }

  return false;
}

function inferHistoricalRegion(date, birthLocation) {
  const ymd = formatCivilDateYmd(date);
  if (ymd < "1955-07-01" || ymd > "1975-04-30") {
    return undefined;
  }

  const hint = birthLocation?.historicalRegion;
  if (hint) {
    return hint;
  }

  if (typeof birthLocation?.lat === "number") {
    if (birthLocation.lat >= 17.5) return "north";
    if (birthLocation.lat <= 16.0) return "south";
  }

  return undefined;
}

function getVietnamHistoricalOffset(date, historicalRegion) {
  const ymd = formatCivilDateYmd(date);

  if (ymd < "1911-05-01") return 7.0 + 6 / 60.0 + 30 / 3600.0;
  if (ymd < "1943-01-01") return 7.0;
  if (ymd < "1945-03-15") return 8.0;
  if (ymd < "1945-09-02") return 9.0;
  if (ymd < "1947-04-01") return 7.0;
  if (ymd < "1955-07-01") return 8.0;
  if (ymd < "1960-01-01") return 7.0;
  if (ymd < "1975-06-13") {
    return historicalRegion === "north" ? 7.0 : 8.0;
  }
  return 7.0;
}

function formatCivilDateYmd(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mod12(n) {
  return ((n % 12) + 12) % 12;
}

function mod10(n) {
  return ((n % 10) + 10) % 10;
}

function getTamHopGroup(chiIndex) {
  if ([0, 4, 8].includes(chiIndex)) return 0;
  if ([1, 5, 9].includes(chiIndex)) return 1;
  if ([2, 6, 10].includes(chiIndex)) return 2;
  return 3;
}

function getHoaCaiDaoHoa(yearChiIndex) {
  const group = getTamHopGroup(yearChiIndex);
  if (group === 0) return { hoaCai: 4, daoHoa: 9 };
  if (group === 1) return { hoaCai: 1, daoHoa: 6 };
  if (group === 2) return { hoaCai: 10, daoHoa: 3 };
  return { hoaCai: 7, daoHoa: 0 };
}

function getCoThanQuaTu(yearChiIndex) {
  if ([2, 3, 4].includes(yearChiIndex)) return { coThan: 5, quaTu: 1 };
  if ([5, 6, 7].includes(yearChiIndex)) return { coThan: 8, quaTu: 4 };
  if ([8, 9, 10].includes(yearChiIndex)) return { coThan: 11, quaTu: 7 };
  return { coThan: 2, quaTu: 10 };
}

function addRingStars(result, names, startIndex, direction = 1) {
  names.forEach((name, index) => {
    result[name] = mod12(startIndex + direction * index);
  });
}

function createRingLookup(names, startIndex, direction = 1) {
  const result = {};
  names.forEach((name, index) => {
    result[mod12(startIndex + direction * index)] = name;
  });
  return result;
}

function getTuongTinhStart(yearChiIndex) {
  const group = getTamHopGroup(yearChiIndex);
  if (group === 0) return 0;
  if (group === 1) return 9;
  if (group === 2) return 6;
  return 3;
}

function getTruongSinhStart(cucNumber) {
  if (cucNumber === 2 || cucNumber === 5) return 8;
  if (cucNumber === 3) return 11;
  if (cucNumber === 4) return 5;
  if (cucNumber === 6) return 2;
  return 8;
}

function calculatePalaceCans(yearCanIndex) {
  const danCan = mod10((yearCanIndex % 5) * 2 + 2);
  return Array.from({ length: 12 }, (_, chi) => mod10(danCan + mod12(chi - 2)));
}

function getStarBrightness(starName, chiIndex) {
  const map = {
    "Tử Vi": ["Bình", "Đắc", "Miếu", "Bình", "Vượng", "Miếu", "Miếu", "Đắc", "Miếu", "Bình", "Vượng", "Bình"],
    "Thiên Cơ": ["Đắc", "Đắc", "Hãm", "Miếu", "Miếu", "Vượng", "Đắc", "Đắc", "Vượng", "Miếu", "Miếu", "Hãm"],
    "Thái Dương": ["Hãm", "Đắc", "Vượng", "Vượng", "Vượng", "Miếu", "Miếu", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm"],
    "Vũ Khúc": ["Vượng", "Miếu", "Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Miếu", "Vượng", "Đắc", "Miếu", "Hãm"],
    "Thiên Đồng": ["Vượng", "Hãm", "Miếu", "Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Miếu", "Hãm", "Hãm", "Đắc"],
    "Liêm Trinh": ["Vượng", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm", "Vượng", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm"],
    "Thiên Phủ": ["Miếu", "Bình", "Miếu", "Bình", "Vượng", "Đắc", "Miếu", "Đắc", "Miếu", "Bình", "Vượng", "Đắc"],
    "Thái Âm": ["Vượng", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Vượng", "Miếu", "Miếu", "Miếu"],
    "Tham Lang": ["Hãm", "Miếu", "Đắc", "Hãm", "Vượng", "Hãm", "Hãm", "Miếu", "Đắc", "Hãm", "Vượng", "Hãm"],
    "Cự Môn": ["Vượng", "Hãm", "Vượng", "Miếu", "Hãm", "Hãm", "Vượng", "Hãm", "Đắc", "Miếu", "Hãm", "Đắc"],
    "Thiên Tướng": ["Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Đắc", "Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Đắc"],
    "Thiên Lương": ["Vượng", "Đắc", "Vượng", "Vượng", "Miếu", "Hãm", "Miếu", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm"],
    "Thất Sát": ["Miếu", "Đắc", "Miếu", "Hãm", "Hãm", "Vượng", "Miếu", "Đắc", "Miếu", "Hãm", "Hãm", "Vượng"],
    "Phá Quân": ["Miếu", "Vượng", "Hãm", "Hãm", "Đắc", "Hãm", "Miếu", "Vượng", "Hãm", "Hãm", "Đắc", "Hãm"],
    "Tả Phụ": ["Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình"],
    "Hữu Bật": ["Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình"],
    "Văn Xương": ["Hãm", "Đắc", "Hãm", "Đắc", "Đắc", "Đắc", "Hãm", "Đắc", "Hãm", "Đắc", "Đắc", "Đắc"],
    "Văn Khúc": ["Hãm", "Đắc", "Hãm", "Đắc", "Đắc", "Đắc", "Hãm", "Đắc", "Hãm", "Đắc", "Đắc", "Đắc"],
    "Thiên Khôi": ["Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình"],
    "Thiên Việt": ["Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình"],
    "Lộc Tồn": ["Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình", "Bình"],
    "Thiên Mã": ["Bình", "Bình", "Đắc", "Bình", "Bình", "Đắc", "Bình", "Bình", "Đắc", "Bình", "Bình", "Hãm"],
    "Kình Dương": ["Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm"],
    "Đà La": ["Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm"],
    "Địa Không": ["Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc"],
    "Địa Kiếp": ["Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc"],
    "Hỏa Tinh": ["Hãm", "Hãm", "Đắc", "Đắc", "Đắc", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm"],
    "Linh Tinh": ["Hãm", "Hãm", "Đắc", "Đắc", "Đắc", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm"],
    "Thiên Hình": ["Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm"],
    "Thiên Riêu": ["Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Đắc", "Hãm"],
    "Thiên Khốc": ["Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Hãm", "Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Hãm"],
    "Thiên Hư": ["Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Hãm", "Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Hãm"],
    "Đại Hao": ["Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm"],
    "Tiểu Hao": ["Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm"],
    "Bạch Hổ": ["Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm"],
    "Tang Môn": ["Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Đắc", "Hãm", "Hãm"],
    "Thiếu Dương": ["Hãm", "Hãm", "Đắc", "Đắc", "Đắc", "Đắc", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm"],
    "Hóa Kỵ": ["Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm", "Hãm", "Đắc", "Hãm"]
  };
  return map[starName]?.[chiIndex] ?? "Bình";
}

export function calculateMenhCanIndex(yearCanIndex, menhPalaceIndex) {
  const danCan = mod10((yearCanIndex % 5) * 2 + 2);
  return mod10(danCan + mod12(menhPalaceIndex - 2));
}

export function calculateTuViCucNumber(yearCanIndex, menhPalaceIndex) {
  const menhCanIndex = calculateMenhCanIndex(yearCanIndex, menhPalaceIndex);
  const stemNumber = Math.floor(mod10(menhCanIndex) / 2) + 1;
  const branchNumber = Math.floor((mod12(menhPalaceIndex) % 6) / 2) + 1;
  let classIndex = stemNumber + branchNumber;
  while (classIndex > 5) classIndex -= 5;
  return [3, 4, 2, 6, 5][classIndex - 1];
}

export function calculateMenhCungPosition(lunarMonth, birthHourBranch) {
  return mod12(2 + (lunarMonth - 1) - birthHourBranch);
}

export function calculateThanCungPosition(menhPosition, birthMonth, birthHourBranch = 0) {
  const danBasedMenh = mod12(menhPosition - (birthMonth - 1) + birthHourBranch);
  return mod12(danBasedMenh + (birthMonth - 1) + birthHourBranch);
}

export function placeTuViStar(cucNumber, lunarDay) {
  let offset = 0;
  while ((lunarDay + offset) % cucNumber !== 0) offset++;
  let ziweiIndex = Math.floor((lunarDay + offset) / cucNumber) - 1;
  ziweiIndex += offset % 2 === 0 ? offset : -offset;
  return mod12(ziweiIndex + 2);
}

export function placeChinhTinh(tuViPosition) {
  const p = mod12(tuViPosition);
  const thienPhu = mod12(16 - p);
  return {
    "Tử Vi": [p],
    "Thiên Cơ": [mod12(p + 11)],
    "Thái Dương": [mod12(p + 9)],
    "Vũ Khúc": [mod12(p + 8)],
    "Thiên Đồng": [mod12(p + 7)],
    "Liêm Trinh": [mod12(p + 4)],
    "Thiên Phủ": [thienPhu],
    "Thái Âm": [mod12(thienPhu + 1)],
    "Tham Lang": [mod12(thienPhu + 2)],
    "Cự Môn": [mod12(thienPhu + 3)],
    "Thiên Tướng": [mod12(thienPhu + 4)],
    "Thiên Lương": [mod12(thienPhu + 5)],
    "Thất Sát": [mod12(thienPhu + 6)],
    "Phá Quân": [mod12(thienPhu + 10)]
  };
}

export function placePhuTinh({
  yearCanIndex,
  yearChiIndex,
  lunarMonth,
  lunarDay,
  hourBranch,
  menhPosition,
  thanPosition,
  thuanNghich = "Thuận",
  school = "thien-luong"
}) {
  const locTon = LOC_TON_TABLE[mod10(yearCanIndex)];
  const group = getTamHopGroup(yearChiIndex);
  const monthOffset = lunarMonth - 1;
  const taPhu = mod12(4 + monthOffset);
  const huuBat = mod12(10 - monthOffset);
  const vanXuong = VAN_XUONG_TABLE[mod12(hourBranch)];
  const vanKhuc = VAN_KHUC_TABLE[mod12(hourBranch)];
  const dayOffset = lunarDay - 1;
  const { hoaCai, daoHoa } = getHoaCaiDaoHoa(yearChiIndex);
  const { coThan, quaTu } = getCoThanQuaTu(yearChiIndex);

  const locTonDirection = (school === "thien-luong" && thuanNghich === "Nghịch") ? -1 : 1;
  const khoi = THIEN_KHOI_TABLE[mod10(yearCanIndex)];
  const viet = THIEN_VIET_TABLE[mod10(yearCanIndex)];

  const result = {
    "Văn Xương": vanXuong,
    "Văn Khúc": vanKhuc,
    "Tả Phụ": taPhu,
    "Hữu Bật": huuBat,
    "Thiên Khôi": khoi,
    "Thiên Việt": viet,
    "Lộc Tồn": locTon,
    "Kình Dương": mod12(locTon + locTonDirection),
    "Đà La": mod12(locTon - locTonDirection),
    "Địa Không": DIA_KHONG_TABLE[mod12(hourBranch)],
    "Địa Kiếp": mod12(11 + hourBranch),
    "Hỏa Tinh": (thuanNghich === "Thuận") ? mod12([2, 3, 1, 9][group] + hourBranch) : mod12([2, 3, 1, 9][group] - hourBranch),
    "Linh Tinh": (thuanNghich === "Thuận") ? mod12([10, 10, 3, 10][group] - hourBranch) : mod12([10, 10, 3, 10][group] + hourBranch),
    "Thiên Mã": THIEN_MA_TABLE[mod12(yearChiIndex)],
    "Đào Hoa": daoHoa,
    "Hồng Loan": HONG_LOAN_TABLE[mod12(yearChiIndex)],
    "Thiên Hỉ": THIEN_HI_TABLE[mod12(yearChiIndex)],
    "Tam Thai": mod12(taPhu + dayOffset),
    "Bát Tọa": mod12(huuBat - dayOffset),
    "Ân Quang": mod12(vanXuong + dayOffset - 1),
    "Thiên Quý": mod12(vanKhuc - dayOffset + 1),
    "Đài Phụ": mod12(6 + hourBranch),
    "Phong Cáo": mod12(2 + hourBranch),
    "Đẩu Quân": mod12(yearChiIndex - monthOffset + hourBranch),
    "Thiên Y": mod12(lunarMonth),
    "Hoa Cái": hoaCai,
    "Cô Thần": coThan,
    "Quả Tú": quaTu,
    "Thiên Tài": mod12(menhPosition + yearChiIndex),
    "Thiên Thọ": mod12(thanPosition + yearChiIndex),
    "Thiên Trù": [5, 6, 0, 5, 6, 8, 2, 6, 9, 11][mod10(yearCanIndex)],
    "Phá Toái": [5, 1, 9][yearChiIndex % 3],
    "Phi Liêm": [8, 9, 10, 5, 6, 7, 2, 3, 4, 11, 0, 1][yearChiIndex],
    "Long Trì": mod12(4 + yearChiIndex),
    "Phượng Các": mod12(10 - yearChiIndex),
    "Thiên Khốc": mod12(6 - yearChiIndex),
    "Thiên Hư": mod12(6 + yearChiIndex),
    "Thiên Quan": [7, 4, 5, 2, 3, 9, 11, 9, 10, 6][mod10(yearCanIndex)],
    "Thiên Phúc": [9, 8, 0, 11, 3, 2, 6, 5, 6, 5][mod10(yearCanIndex)],
    "Thiên Đức": mod12(9 + yearChiIndex),
    "Nguyệt Đức": mod12(5 + yearChiIndex),
    "Thiên Không": mod12(yearChiIndex + 1),
    "Thiên Thương": mod12(menhPosition + 5),
    "Thiên Sứ": mod12(menhPosition + 7),
    "Kiếp Sát": [5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8][yearChiIndex],
    "Giải Thần": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11][yearChiIndex],
    "Lưu Hà": LUU_HA_TABLE[mod10(yearCanIndex)],
    "Thiên Riêu": mod12(1 + monthOffset),
    "Thiên Hình": mod12(9 + monthOffset),
    "Âm Sát": [2, 0, 10, 8, 6, 4][monthOffset % 6],
    "Thiên Nguyệt": [10, 5, 4, 2, 7, 3, 11, 7, 2, 6, 10, 2][monthOffset],
    "Thiên Vu": [5, 8, 2, 11][monthOffset % 4],
    "Thiên Giải": mod12(8 + monthOffset),
    "Địa Giải": mod12(7 + monthOffset),
    "Đường Phù": mod12(locTon + 5),
    "Quốc Ấn": mod12(locTon + 8),
    "Thiên La": 4,
    "Địa Võng": 10
  };
  const thaiTueRing = school === "bac-phai" ? BAC_PHAI_THAI_TUE_12 : THAI_TUE_12;
  addRingStars(result, thaiTueRing, yearChiIndex);
  addRingStars(result, BAC_SI_12, locTon, thuanNghich === "Thuận" ? 1 : -1);
  addRingStars(result, TUONG_TINH_12, getTuongTinhStart(yearChiIndex));
  return result;
}

function resolveTuHoa(yearCanIndex, starPositions, tuHoaTable = TU_HOA_TABLE) {
  const table = tuHoaTable[CAN_LIST[mod10(yearCanIndex)]];
  return Object.entries(table).map(([type, starName]) => ({
    type,
    starName,
    position: starPositions[starName] ?? -1
  }));
}

const COMBINATIONS = [
  {
    "id": "sat-pha-lang",
    "name": "Sát Phá Lang",
    "nameHanViet": "殺破狼",
    "category": "hung",
    "rarity": 3,
    "stars": ["Thất Sát", "Phá Quân", "Tham Lang"],
    "palaceConstraint": "tamHop",
    "description": "Cách cục vô cùng mạnh mẽ, đại diện cho sự khai sáng, tiên phong và những biến động lớn trong cuộc đời. Người có cách này thường quyết đoán, dám nghĩ dám làm, thích hợp với môi trường quân đội, kinh doanh rủi ro cao hoặc những lĩnh vực đòi hỏi sự đột phá. Tuổi trẻ thường nhiều vất vả, bôn ba.",
    "note": "Được phát hiện khi ba sao cùng xuất hiện trong một tam giác Tam Hợp."
  },
  {
    "id": "co-nguyet-dong-luong",
    "name": "Cơ Nguyệt Đồng Lương",
    "nameHanViet": "機月同梁",
    "category": "cat",
    "rarity": 4,
    "stars": ["Thiên Cơ", "Thái Âm", "Thiên Đồng", "Thiên Lương"],
    "palaceConstraint": "tamHop",
    "description": "Cách cục của sự ổn định, trí tuệ và mưu lược. Trái ngược với Sát Phá Lang, người có cách này thích sự an toàn, làm việc có kế hoạch, nề nếp. Rất phù hợp với công chức, nhà giáo, y bác sĩ hoặc quản lý hành chính. Cuộc đời thường bình hòa, ít sóng gió lớn.",
    "note": "Được phát hiện khi bốn sao xuất hiện trong Mệnh và tam hợp liên quan."
  },
  {
    "id": "cu-nhat-dong-cung",
    "name": "Cự Nhật Đồng Cung",
    "nameHanViet": "巨日同宮",
    "category": "cat",
    "rarity": 3,
    "stars": ["Cự Môn", "Thái Dương"],
    "palaceConstraint": "sameCung",
    "description": "Thái Dương (mặt trời) xua tan đi sự ám muội của Cự Môn. Người có cách này thường có tài ăn nói xuất chúng, khả năng thuyết phục cao và có uy quyền. Rất thích hợp với nghề luật sư, giáo viên, ngoại giao. Đẹp nhất khi ở cung Dần (mặt trời mọc).",
    "note": "Cự Môn và Thái Dương cùng một cung."
  },
  {
    "id": "tu-phu",
    "name": "Tử Phủ",
    "nameHanViet": "紫府",
    "category": "cat",
    "rarity": 4,
    "stars": ["Tử Vi", "Thiên Phủ"],
    "palaceConstraint": "sameCung",
    "description": "Hai đế tinh Tử Vi và Thiên Phủ cùng tọa thủ. Tượng trưng cho quyền lực tột đỉnh, khả năng lãnh đạo bẩm sinh và phú quý song toàn. Tuy nhiên, đôi khi ở vị trí quá cao dễ sinh ra cảm giác cô độc.",
    "note": "Tử Vi và Thiên Phủ cùng một cung."
  },
  {
    "id": "phu-tuong",
    "name": "Phủ Tướng",
    "nameHanViet": "府相",
    "category": "cat",
    "rarity": 3,
    "stars": ["Thiên Phủ", "Thiên Tướng"],
    "palaceConstraint": "tamHop",
    "description": "Thiên Phủ và Thiên Tướng hợp chiếu. Khả năng quản lý, điều hành tuyệt vời. Thường là những người làm rường cột cho quốc gia hoặc tập đoàn, tài trí vẹn toàn, phú quý bền vững.",
    "note": "Thiên Phủ và Thiên Tướng xuất hiện trong cùng vùng luận giải."
  },
  {
    "id": "nhat-nguyet",
    "name": "Nhật Nguyệt",
    "nameHanViet": "日月",
    "category": "cat",
    "rarity": 4,
    "stars": ["Thái Dương", "Thái Âm"],
    "palaceConstraint": "tamHop",
    "description": "Thái Dương và Thái Âm cùng sáng tỏ trong Mệnh hoặc Tam Phương Tứ Chính. Tượng trưng cho danh tiếng vang xa, sự nghiệp thuận lợi cả trong lẫn ngoài, thường được trọng vọng.",
    "note": "Thái Dương và Thái Âm xuất hiện trong cùng vùng lá số."
  },
  {
    "id": "loc-ma",
    "name": "Lộc Mã",
    "nameHanViet": "祿馬",
    "category": "cat",
    "rarity": 3,
    "stars": ["Lộc Tồn", "Thiên Mã"],
    "palaceConstraint": "sameCung",
    "description": "Lộc Tồn và Thiên Mã cùng tọa thủ một cung.",
    "note": "Lộc Tồn và Thiên Mã cùng một cung."
  },
  {
    "id": "tam-ky",
    "name": "Tam Kỳ",
    "nameHanViet": "三奇",
    "category": "cat",
    "rarity": 5,
    "stars": [],
    "palaceConstraint": "tamHop",
    "description": "Hóa Khoa, Hóa Quyền, Hóa Lộc cùng hội tụ ở Tam Phương Tứ Chính. Cách cục cực quý - danh, quyền, lộc hội đủ. Người có cách này thường được số phận ưu ái, thành đạt trên nhiều phương diện.",
    "note": "Hóa Lộc, Hóa Quyền và Hóa Khoa cùng xuất hiện trong cùng vùng luận giải.",
    "requiresTuHoa": true
  },
  {
    "id": "xuong-khuc",
    "name": "Xương Khúc",
    "nameHanViet": "昌曲",
    "category": "cat",
    "rarity": 3,
    "stars": ["Văn Xương", "Văn Khúc"],
    "palaceConstraint": "sameCungOrTamHop",
    "description": "Văn Xương và Văn Khúc cùng cư ở Sửu/Mùi. Tài hoa nghệ thuật xuất chúng, văn chương lỗi lạc, sáng tạo phong phú. Rất thích hợp với ngành sáng tạo, nghệ thuật, giáo dục.",
    "note": "Văn Xương và Văn Khúc cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "ta-huu",
    "name": "Tả Hữu",
    "nameHanViet": "左右",
    "category": "cat",
    "rarity": 3,
    "stars": ["Tả Phụ", "Hữu Bật"],
    "palaceConstraint": "sameCungOrTamHop",
    "description": "Tả Phụ và Hữu Bật kẹp hai bên Mệnh cung. 'Quân thần phò tá hai bên.' Biểu thị sự được trọng dụng, có nhiều người hỗ trợ, đắc lực trong sự nghiệp. Rất tốt cho người lãnh đạo, quản lý.",
    "note": "Tả Phụ và Hữu Bật cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "khuyet-viet",
    "name": "Khôi Việt",
    "nameHanViet": "魁鉞",
    "category": "cat",
    "rarity": 4,
    "stars": ["Thiên Khôi", "Thiên Việt"],
    "palaceConstraint": "sameCungOrTamHop",
    "description": "Thiên Khôi và Thiên Việt kẹp hai bên Mệnh cung. 'Ngồi trên quý nhân, hướng về quý nhân.' Cách cục đại diện cho sự được quý nhân phò trợ từ mọi phía, thăng tiến nhanh, ít gặp rủi ro.",
    "note": "Thiên Khôi và Thiên Việt cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "kinh-da",
    "name": "Kình Đà",
    "nameHanViet": "擎陀",
    "category": "hung",
    "rarity": 3,
    "stars": ["Kình Dương", "Đà La"],
    "palaceConstraint": "sameCungOrTamHop",
    "description": "Kình Dương và Đà La cùng xuất hiện trong cung Mệnh hoặc trong quan hệ Tam Hợp.",
    "note": "Kình Dương và Đà La cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "khong-kiep",
    "name": "Không Kiếp",
    "nameHanViet": "空劫",
    "category": "hung",
    "rarity": 4,
    "stars": ["Địa Không", "Địa Kiếp"],
    "palaceConstraint": "sameCungOrTamHop",
    "description": "Địa Không và Địa Kiếp cùng xuất hiện trong cung Mệnh hoặc trong quan hệ Tam Hợp.",
    "note": "Địa Không và Địa Kiếp cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "hoa-linh",
    "name": "Hỏa Linh",
    "nameHanViet": "火鈴",
    "category": "hung",
    "rarity": 3,
    "stars": ["Hỏa Tinh", "Linh Tinh"],
    "palaceConstraint": "sameCungOrTamHop",
    "description": "Hỏa Tinh và Linh Tinh cùng xuất hiện trong cung Mệnh hoặc trong quan hệ Tam Hợp.",
    "note": "Hỏa Tinh và Linh Tinh cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "giap-sat",
    "name": "Giáp Sát",
    "nameHanViet": "夾殺",
    "category": "hung",
    "rarity": 3,
    "stars": [],
    "palaceConstraint": "giap",
    "description": "Một cung bị Sát tinh kẹp hai bên.",
    "note": "Một cung bị các sát tinh kẹp hai bên.",
    "requiresGiap": true
  },
  {
    "id": "cuc-huong-ly-minh",
    "name": "Cực Hướng Ly Minh",
    "nameHanViet": "極向離明",
    "category": "cat",
    "rarity": 5,
    "matchKind": "menhBranchStars",
    "stars": ["Tử Vi"],
    "branches": ["Ngọ"],
    "description": "Tử Vi tọa thủ cung Mệnh và địa chi của cung là Ngọ.",
    "note": "Tử Vi tọa Mệnh ở Ngọ."
  },
  {
    "id": "minh-chau-xuat-hai",
    "name": "Minh Châu Xuất Hải",
    "nameHanViet": "明珠出海",
    "category": "cat",
    "rarity": 5,
    "matchKind": "minhChau",
    "stars": [],
    "branches": ["Sửu", "Mùi"],
    "description": "Mệnh vô chính diệu và bộ Nhật Nguyệt cùng an tại các địa chi sáng đã đối ứng.",
    "note": "Mệnh vô chính diệu với bộ Nhật Nguyệt ở các địa chi sáng đã đối ứng."
  },
  {
    "id": "duong-luong-xuong-loc",
    "name": "Dương Lương Xương Lộc",
    "nameHanViet": "陽梁昌祿",
    "category": "cat",
    "rarity": 4,
    "matchKind": "tamPhuongCluster",
    "stars": ["Thái Dương", "Thiên Lương", "Văn Xương", "Lộc Tồn"],
    "description": "Thái Dương, Thiên Lương, Văn Xương, Lộc Tồn cùng hội. Cách cục tốt nhất cho thi cử, khoa bảng, tuyển dụng. Trạng nguyên, tiến sĩ đời xưa thường có cách cục này.",
    "note": "Bốn sao yêu cầu cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "van-que-van-hoa",
    "name": "Văn Quế Văn Hoa",
    "nameHanViet": "文桂文華",
    "category": "cat",
    "rarity": 3,
    "matchKind": "menhBranchStars",
    "stars": ["Văn Xương", "Văn Khúc"],
    "branches": ["Sửu", "Mùi"],
    "description": "Văn Xương và Văn Khúc cùng tọa thủ cung Mệnh tại Sửu hoặc Mùi.",
    "note": "Văn Xương và Văn Khúc cùng thủ Mệnh tại Sửu hoặc Mùi."
  },
  {
    "id": "nhat-nguyet-tinh-minh",
    "name": "Nhật Nguyệt Tịnh Minh",
    "nameHanViet": "日月清明",
    "category": "cat",
    "rarity": 5,
    "matchKind": "sunMoonBright",
    "stars": ["Thái Dương", "Thái Âm"],
    "branches": ["Sửu", "Mùi"],
    "sunBranches": ["Thìn", "Tỵ", "Ngọ"],
    "moonBranches": ["Dậu", "Tuất", "Hợi", "Tý"],
    "description": "Mệnh ở Sửu hoặc Mùi và bộ Nhật Nguyệt hiện ở các địa chi sáng đã liệt kê.",
    "note": "Mệnh ở Sửu hoặc Mùi với Nhật Nguyệt tại các địa chi sáng đã liệt kê."
  },
  {
    "id": "toa-quy-huong-quy",
    "name": "Tọa Quý Hướng Quý",
    "nameHanViet": "坐貴向貴",
    "category": "cat",
    "rarity": 4,
    "matchKind": "menhBracketStars",
    "stars": ["Thiên Khôi", "Thiên Việt"],
    "description": "Thiên Khôi và Thiên Việt giáp hai bên cung Mệnh.",
    "note": "Thiên Khôi và Thiên Việt ngồi hai bên cung Mệnh."
  },
  {
    "id": "ta-huu-giap-menh",
    "name": "Tả Hữu Giáp Mệnh",
    "nameHanViet": "左右夾命",
    "category": "cat",
    "rarity": 3,
    "matchKind": "menhBracketStars",
    "stars": ["Tả Phụ", "Hữu Bật"],
    "description": "Tả Phụ và Hữu Bật giáp hai bên cung Mệnh.",
    "note": "Tả Phụ và Hữu Bật ngồi hai bên cung Mệnh."
  },
  {
    "id": "hinh-ky-giap-menh",
    "name": "Hình Kỵ Giáp Mệnh",
    "nameHanViet": "刑忌夾命",
    "category": "hung",
    "rarity": 4,
    "matchKind": "menhBracketMutagen",
    "stars": ["Thiên Hình"],
    "requiredTuHoa": ["Kỵ"],
    "description": "Thiên Hình và Hóa Kỵ giáp hai bên cung Mệnh.",
    "note": "Thiên Hình và Hóa Kỵ ngồi hai bên cung Mệnh."
  },
  {
    "id": "hoa-linh-giap-menh",
    "name": "Hỏa Linh Giáp Mệnh",
    "nameHanViet": "火鈴夾命",
    "category": "hung",
    "rarity": 4,
    "matchKind": "menhBracketStars",
    "stars": ["Hỏa Tinh", "Linh Tinh"],
    "description": "Hỏa Tinh và Linh Tinh giáp hai bên cung Mệnh.",
    "note": "Hỏa Tinh và Linh Tinh ngồi hai bên cung Mệnh."
  },
  {
    "id": "thien-la-dia-vong",
    "name": "Thiên La Địa Võng",
    "nameHanViet": "天羅地網",
    "category": "hung",
    "rarity": 4,
    "matchKind": "menhBranchMalefic",
    "branches": ["Thìn", "Tuất"],
    "description": "Mệnh ở Thìn hoặc Tuất và có ít nhất một sát tinh.",
    "note": "Mệnh ở Thìn hoặc Tuất với ít nhất một sát tinh."
  },
  {
    "id": "tu-sat-tu-hoi",
    "name": "Tứ Sát Tụ Hội",
    "nameHanViet": "四煞聚會",
    "category": "hung",
    "rarity": 5,
    "matchKind": "tamPhuongCluster",
    "stars": ["Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh"],
    "description": "Bốn sát tinh chính cùng xuất hiện trong cung Mệnh hoặc trong quan hệ Tam Hợp.",
    "note": "Bốn sát tinh chính cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "linh-xuong-da-vu",
    "name": "Linh Xương Đà Vũ",
    "nameHanViet": "鈴昌陀武",
    "category": "hung",
    "rarity": 5,
    "matchKind": "tamPhuongCluster",
    "stars": ["Linh Tinh", "Văn Xương", "Đà La", "Vũ Khúc"],
    "description": "Linh Tinh, Văn Xương, Đà La và Vũ Khúc cùng xuất hiện trong cung Mệnh hoặc trong quan hệ Tam Hợp.",
    "note": "Bốn sao yêu cầu cùng xuất hiện trong một vùng luận giải."
  },
  {
    "id": "loc-suy-ma-khon",
    "name": "Lộc Suy Mã Khốn",
    "nameHanViet": "祿衰馬困",
    "category": "hung",
    "rarity": 4,
    "matchKind": "hamPair",
    "stars": ["Lộc Tồn", "Thiên Mã"],
    "description": "Lộc Tồn và Thiên Mã đều hiện với trạng thái Hãm/Bất.",
    "note": "Lộc Tồn và Thiên Mã đều ở trạng thái suy yếu trong lá số."
  },
  {
    "id": "co-cu-dong-lam",
    "name": "Cơ Cự Đồng Lâm",
    "nameHanViet": "機巨同臨",
    "category": "cat",
    "rarity": 4,
    "matchKind": "menhBranchStars",
    "stars": ["Thiên Cơ", "Cự Môn"],
    "branches": ["Mão", "Dậu"],
    "description": "Thiên Cơ và Cự Môn cùng tọa thủ cung Mệnh tại Mão hoặc Dậu.",
    "note": "Thiên Cơ và Cự Môn cùng thủ Mệnh tại Mão hoặc Dậu."
  },
  {
    "id": "tu-tham-dong-cung",
    "name": "Tử Tham Đồng Cung",
    "nameHanViet": "紫貪同宮",
    "category": "trung",
    "rarity": 4,
    "matchKind": "menhBranchStars",
    "stars": ["Tử Vi", "Tham Lang"],
    "branches": ["Mão", "Dậu"],
    "description": "Tử Vi và Tham Lang cùng tọa thủ cung Mệnh tại Mão hoặc Dậu.",
    "note": "Tử Vi và Tham Lang cùng thủ Mệnh tại Mão hoặc Dậu."
  },
  {
    "id": "tham-vu-dong-hanh",
    "name": "Tham Vũ Đồng Hành",
    "nameHanViet": "貪武同行",
    "category": "trung",
    "rarity": 4,
    "matchKind": "menhBranchStars",
    "stars": ["Tham Lang", "Vũ Khúc"],
    "branches": ["Thìn", "Tuất", "Sửu", "Mùi"],
    "description": "Tham Lang and Vũ Khúc cùng tọa thủ cung Mệnh tại một trong bốn địa chi Mộ.",
    "note": "Tham Lang và Vũ Khúc cùng thủ Mệnh tại một địa chi Mộ."
  },
  {
    "id": "nhat-nguyet-dong-cung",
    "name": "Nhật Nguyệt Đồng Cung",
    "nameHanViet": "日月同宮",
    "category": "cat",
    "rarity": 4,
    "matchKind": "menhBranchStars",
    "stars": ["Thái Dương", "Thái Âm"],
    "branches": ["Sửu", "Mùi"],
    "description": "Thái Dương và Thái Âm cùng tọa thủ cung Mệnh tại Sửu hoặc Mùi.",
    "note": "Thái Dương và Thái Âm cùng thủ Mệnh tại Sửu hoặc Mùi."
  }
];

export function detectTuViCombinations(palaces) {
  const results = [];
  const seenKeys = new Set();

  const MAJOR_SAT_TINH = new Set(['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh']);
  const MINOR_SAT_TINH = new Set(['Địa Không', 'Địa Kiếp', 'Hóa Kỵ']);
  const ALL_SAT_TINH = new Set([...MAJOR_SAT_TINH, ...MINOR_SAT_TINH]);
  const BRIGHTNESS_SCORES = {
    Miếu: 2,
    Vượng: 1.5,
    Đắc: 1,
    Địa: 1,
    Lợi: 0.5,
    Bình: 0,
    Bất: -0.5,
    Hãm: -1
  };

  function detectTamHopPalaces(palaceIndex) {
    const groups = [
      [2, 6, 10], // Dần - Ngọ - Tuất
      [8, 0, 4],  // Thân - Tý - Thìn
      [5, 9, 1],  // Tỵ - Dậu - Sửu
      [11, 3, 7]  // Hợi - Mão - Mùi
    ];
    for (const group of groups) {
      if (group.includes(palaceIndex)) {
        return group.filter((idx) => idx !== palaceIndex);
      }
    }
    return [];
  }

  function detectDoiCung(palaceIndex) {
    return (palaceIndex + 6) % 12;
  }

  function getStarsInPalace(palace) {
    return [
      ...palace.chinhTinh.map((s) => s.name),
      ...palace.phuTinh.map((s) => s.name),
      ...palace.satTinh.map((s) => s.name)
    ];
  }

  function checkCombinationPurity(involvedPalaces) {
    let hasMajor = false;
    let hasMinor = false;
    for (const palace of involvedPalaces) {
      for (const star of palace.satTinh) {
        if (MAJOR_SAT_TINH.has(star.name)) {
          hasMajor = true;
        }
        if (MINOR_SAT_TINH.has(star.name)) {
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

  function calculateCombinationStrength(combination) {
    let score = combination.involvedStars.length * 2;
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

  function makeKey(name, cungNames) {
    return `${name}::${cungNames.slice().sort().join(',')}`;
  }

  function getMenhPalace() {
    return palaces.find((p) => p.isMenh);
  }

  function getPalaceByBranch(branch) {
    return palaces.find((p) => p.chi === branch);
  }

  function hasStar(palace, starName) {
    if (!palace) return false;
    return getStarsInPalace(palace).includes(starName);
  }

  function hasMutagen(palace, type) {
    if (!palace) return false;
    return palace.tuHoa.some((entry) => entry.type === type);
  }

  function hasAnyMalefic(palace) {
    if (!palace) return false;
    return palace.satTinh.some((star) => ALL_SAT_TINH.has(star.name));
  }

  function hasAllStars(haystack, needles) {
    if (needles.length === 0) return false;
    const set = new Set(haystack);
    return needles.every((n) => set.has(n));
  }

  function createCombination(def, involvedCung, involvedStars, detectionReason, purity) {
    const combo = {
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
    combo.strength = calculateCombinationStrength(combo);
    return combo;
  }

  function addCombination(def, involvedCung, involvedStars, detectionReason, purity) {
    const key = makeKey(def.name, involvedCung);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    results.push(createCombination(def, involvedCung, involvedStars, detectionReason, purity));
  }

  function getMenhRelationPalaces() {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return [];
    const tamHopIndices = detectTamHopPalaces(menhPalace.id);
    const doiCung = detectDoiCung(menhPalace.id);
    const groupIndices = Array.from(new Set([menhPalace.id, ...tamHopIndices, doiCung]));
    return groupIndices.map((idx) => palaces[idx]).filter(Boolean);
  }

  function detectSameCung(def) {
    for (const palace of palaces) {
      if (!hasAllStars(getStarsInPalace(palace), def.stars)) continue;
      addCombination(
        def,
        [palace.name],
        def.stars,
        `${def.stars.join(', ')} cùng cung ${palace.name}`,
        checkCombinationPurity([palace])
      );
    }
  }

  function detectTamHop(def) {
    if (def.requiresTuHoa) {
      detectTuHoaCombinations(def);
      return;
    }
    for (const palace of palaces) {
      const tamHopIndices = detectTamHopPalaces(palace.id);
      const groupPalaces = [palace, ...tamHopIndices.map((idx) => palaces[idx])];
      const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));
      if (!hasAllStars(groupStars, def.stars)) continue;

      const involvedCung = new Set();
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
        checkCombinationPurity(groupPalaces)
      );
    }
  }

  function detectSameCungOrTamHop(def) {
    for (const palace of palaces) {
      const stars = getStarsInPalace(palace);
      if (hasAllStars(stars, def.stars)) {
        addCombination(
          def,
          [palace.name],
          def.stars,
          `${def.stars.join(', ')} cùng cung ${palace.name}`,
          checkCombinationPurity([palace])
        );
        continue;
      }
      const tamHopIndices = detectTamHopPalaces(palace.id);
      const groupPalaces = [palace, ...tamHopIndices.map((idx) => palaces[idx])];
      const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));
      if (!hasAllStars(groupStars, def.stars)) continue;

      const involvedCung = new Set();
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
        checkCombinationPurity(groupPalaces)
      );
    }
  }

  function detectGiap(def) {
    for (const palace of palaces) {
      const leftIdx = (palace.id - 1 + 12) % 12;
      const rightIdx = (palace.id + 1) % 12;
      const leftPalace = palaces[leftIdx];
      const rightPalace = palaces[rightIdx];
      const leftSatStars = leftPalace.satTinh.filter((star) => ALL_SAT_TINH.has(star.name));
      const rightSatStars = rightPalace.satTinh.filter((star) => ALL_SAT_TINH.has(star.name));
      if (leftSatStars.length === 0 || rightSatStars.length === 0) continue;

      const involvedPalaces = [palace, leftPalace, rightPalace];
      const satStarNames = [...leftSatStars.map((s) => s.name), ...rightSatStars.map((s) => s.name)];
      addCombination(
        def,
        [palace.name, leftPalace.name, rightPalace.name],
        Array.from(new Set(satStarNames)),
        `${palace.name} bị giáp sát bởi ${leftPalace.name} và ${rightPalace.name}`,
        checkCombinationPurity(involvedPalaces)
      );
    }
  }

  function detectTuHoaCombinations(def) {
    const requiredTypes = new Set(['Lộc', 'Quyền', 'Khoa']);
    for (const palace of palaces) {
      const tamHopIndices = detectTamHopPalaces(palace.id);
      const doiCung = detectDoiCung(palace.id);
      const groupIndices = Array.from(new Set([palace.id, ...tamHopIndices, doiCung]));
      const groupPalaces = groupIndices.map((idx) => palaces[idx]);
      const foundTypes = new Set();
      const involvedCung = new Set();
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
        checkCombinationPurity(groupPalaces)
      );
    }
  }

  function detectMenhBranchStars(def) {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return;
    if (def.branches && !def.branches.includes(menhPalace.chi)) return;
    if (!hasAllStars(getStarsInPalace(menhPalace), def.stars)) return;
    addCombination(
      def,
      [menhPalace.name],
      def.stars,
      `${def.stars.join(', ')} tọa tại ${menhPalace.name}`,
      checkCombinationPurity([menhPalace])
    );
  }

  function detectTamPhuongCluster(def) {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return;
    const groupPalaces = getMenhRelationPalaces();
    const groupStars = groupPalaces.flatMap((p) => getStarsInPalace(p));
    if (!hasAllStars(groupStars, def.stars)) return;
    const involvedCung = new Set();
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
      checkCombinationPurity(groupPalaces)
    );
  }

  function detectMenhBracketStars(def) {
    const menhPalace = getMenhPalace();
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
      checkCombinationPurity([menhPalace, leftPalace, rightPalace])
    );
  }

  function detectMenhBracketMutagen(def) {
    const menhPalace = getMenhPalace();
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
      checkCombinationPurity([menhPalace, leftPalace, rightPalace])
    );
  }

  function detectMinhChau(def) {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return;
    if (menhPalace.chinhTinh.length > 0) return;
    if (def.branches && !def.branches.includes(menhPalace.chi)) return;
    const isMui = menhPalace.chi === 'Mùi';
    const sunBranch = isMui ? 'Mão' : 'Tỵ';
    const moonBranch = isMui ? 'Hợi' : 'Dậu';
    const sunPalace = getPalaceByBranch(sunBranch);
    const moonPalace = getPalaceByBranch(moonBranch);
    if (!hasStar(sunPalace, 'Thái Dương') || !hasStar(moonPalace, 'Thái Âm')) return;
    const involvedPalaces = [menhPalace, sunPalace, moonPalace].filter(Boolean);
    addCombination(
      def,
      involvedPalaces.map((palace) => palace.name),
      ['Thái Dương', 'Thái Âm'],
      `Mệnh vô chính diệu, Thái Dương ở ${sunBranch}, Thái Âm ở ${moonBranch}`,
      checkCombinationPurity(involvedPalaces)
    );
  }

  function detectSunMoonBright(def) {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return;
    if (def.branches && !def.branches.includes(menhPalace.chi)) return;
    const sunBranches = def.sunBranches ?? [];
    const moonBranches = def.moonBranches ?? [];
    const sunPalace = palaces.find(
      (palace) => sunBranches.includes(palace.chi) && palace.chinhTinh.some((star) => star.name === 'Thái Dương')
    );
    const moonPalace = palaces.find(
      (palace) => moonBranches.includes(palace.chi) && palace.chinhTinh.some((star) => star.name === 'Thái Âm')
    );
    if (!sunPalace || !moonPalace) return;
    const involvedPalaces = [menhPalace, sunPalace, moonPalace];
    addCombination(
      def,
      involvedPalaces.map((palace) => palace.name),
      ['Thái Dương', 'Thái Âm'],
      `Mệnh ở ${menhPalace.chi}, Thái Dương ở ${sunPalace.chi}, Thái Âm ở ${moonPalace.chi}`,
      checkCombinationPurity(involvedPalaces)
    );
  }

  function detectMenhBranchMalefic(def) {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return;
    if (def.branches && !def.branches.includes(menhPalace.chi)) return;
    if (!hasAnyMalefic(menhPalace)) return;
    addCombination(
      def,
      [menhPalace.name],
      getStarsInPalace(menhPalace).filter((star) => ALL_SAT_TINH.has(star)),
      `Mệnh ở ${menhPalace.chi} và có sát tinh tọa thủ`,
      checkCombinationPurity([menhPalace])
    );
  }

  function detectHamPair(def) {
    const menhPalace = getMenhPalace();
    if (!menhPalace) return;
    const groupPalaces = getMenhRelationPalaces();
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
      checkCombinationPurity(involvedPalaces)
    );
  }

  for (const def of COMBINATIONS) {
    switch (def.matchKind) {
      case 'menhBranchStars':
        detectMenhBranchStars(def);
        break;
      case 'tamPhuongCluster':
        detectTamPhuongCluster(def);
        break;
      case 'menhBracketStars':
        detectMenhBracketStars(def);
        break;
      case 'menhBracketMutagen':
        detectMenhBracketMutagen(def);
        break;
      case 'minhChau':
        detectMinhChau(def);
        break;
      case 'sunMoonBright':
        detectSunMoonBright(def);
        break;
      case 'menhBranchMalefic':
        detectMenhBranchMalefic(def);
        break;
      case 'hamPair':
        detectHamPair(def);
        break;
      default:
        switch (def.palaceConstraint) {
          case 'sameCung':
            detectSameCung(def);
            break;
          case 'tamHop':
            detectTamHop(def);
            break;
          case 'sameCungOrTamHop':
            detectSameCungOrTamHop(def);
            break;
          case 'giap':
            detectGiap(def);
            break;
        }
    }
  }

  const menh = getMenhPalace();
  if (menh && menh.chinhTinh.length === 0) {
    results.push({
      id: "menh_vo_chinh_dieu",
      name: "Mệnh vô chính diệu",
      nameHanViet: "命無正曜",
      rarity: 4,
      involvedStars: [],
      involvedCung: ["Mệnh"],
      detectionReason: "Cung Mệnh không có chính tinh tọa thủ",
      purity: checkCombinationPurity([menh]),
      strength: menh.satTinh.length ? 4 : 6,
      description: "Cung Mệnh không có chính tinh, cần xem tam phương tứ chính.",
      note: "Cung Mệnh trống chính tinh.",
      category: "trung",
      sourcePatternId: "menh_vo_chinh_dieu"
    });
  }

  return results;
}

export const NAP_AM_NAMES = [
  'Hải Trung Kim', 'Lô Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim',
  'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
  'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Phích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy',
  'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạc Kim',
  'Phúc Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Dịch Thổ', 'Thoa Xuyến Kim', 'Tang Chá Mộc',
  'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy'
];

export function getNapAmIndex(canIndex, chiIndex) {
  for (let ganzhiIndex = 0; ganzhiIndex < 60; ganzhiIndex++) {
    if (ganzhiIndex % 10 === canIndex && ganzhiIndex % 12 === chiIndex) {
      return Math.floor(ganzhiIndex / 2);
    }
  }
  throw new RangeError(`Invalid Can/Chi combination: ${canIndex}/${chiIndex} has no valid 60-cycle match`);
}

const CUC_SAO_TABLE = {
  "Thủy Nhị Cục": "Thiên Lương",
  "Mộc Tam Cục": "Thiên Cơ",
  "Kim Tứ Cục": "Vũ Khúc",
  "Thổ Ngũ Cục": "Thiên Phủ",
  "Hỏa Lục Cục": "Thất Sát"
};

const MENH_CHU_TABLE = {
  "Tý": "Tham Lang",
  "Sửu": "Cự Môn",
  "Dần": "Lộc Tồn",
  "Mão": "Văn Khúc",
  "Thìn": "Liêm Trinh",
  "Tỵ": "Vũ Khúc",
  "Ngọ": "Phá Quân",
  "Mùi": "Vũ Khúc",
  "Thân": "Liêm Trinh",
  "Dậu": "Văn Khúc",
  "Tuất": "Lộc Tồn",
  "Hợi": "Cự Môn"
};

const THAN_CHU_TABLE = {
  "Giáp": "Liêm Trinh",
  "Ất": "Thiên Lương",
  "Bính": "Phá Quân",
  "Đinh": "Tham Lang",
  "Mậu": "Tham Lang",
  "Kỷ": "Thiên Lương",
  "Canh": "Vũ Khúc",
  "Tân": "Văn Khúc",
  "Nhâm": "Tử Vi",
  "Quý": "Thiên Phủ"
};

function calculateLaiNhanCung(yearCanIndex, palaces) {
  const yearCan = CAN_LIST[yearCanIndex];
  for (let i = palaces.length - 1; i >= 0; i--) {
    if (palaces[i]?.can === yearCan) {
      return palaces[i]?.name ?? CHI_LIST[i];
    }
  }
  return "";
}

function calculateNguyenThan(yearCanIndex, palaces) {
  const pos = (2 + (yearCanIndex % 5)) % 12;
  const palace = palaces[pos];
  return palace?.chinhTinh?.[0]?.name ?? CHI_LIST[pos];
}

function calculatePhiTinhMatrix(palaces) {
  const matrix = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => []));
  const starToPalace = {};
  for (let i = 0; i < 12; i++) {
    const palace = palaces[i];
    const stars = [...palace.chinhTinh, ...palace.phuTinh, ...palace.satTinh].map(s => s.name);
    for (const star of stars) {
      starToPalace[star] = i;
    }
  }

  for (let i = 0; i < 12; i++) {
    const sourceCan = palaces[i].can;
    const tuHoa = TRUNG_CHAU_TU_HOA[sourceCan];
    if (!tuHoa) continue;
    
    for (const [hoaType, starName] of Object.entries(tuHoa)) {
      const targetPalaceIdx = starToPalace[starName];
      if (targetPalaceIdx !== undefined) {
        matrix[i][targetPalaceIdx].push({
          type: hoaType,
          starName: starName
        });
      }
    }
  }
  return matrix;
}

function evaluateBacPhaiCombinations(phiTinhMatrix, palaces) {
  const bacPhaiCombs = [];
  // Example Bắc Phái patterns: 
  // 1. Lộc Xuất: Cung Mệnh phi Hóa Lộc sang cung Thiên Di.
  // 2. Kỵ Nhập: Cung Thiên Di phi Hóa Kỵ vào cung Mệnh.
  
  const menhIdx = palaces.findIndex(p => p.name === "Mệnh");
  const diIdx = palaces.findIndex(p => p.name === "Thiên Di");
  const taiIdx = palaces.findIndex(p => p.name === "Tài Bạch");
  const quanIdx = palaces.findIndex(p => p.name === "Quan Lộc");
  
  if (menhIdx !== -1 && diIdx !== -1) {
    const menhToDi = phiTinhMatrix[menhIdx][diIdx];
    if (menhToDi.some(h => h.type === "Lộc")) {
      bacPhaiCombs.push({
        id: "loc-xuat-di",
        name: "Mệnh Phi Lộc Xuất Di",
        involvedCung: ["Mệnh", "Thiên Di"],
        description: "Cung Mệnh phi Hóa Lộc sang cung Thiên Di. Người hay phải đi xa để lập nghiệp, ra ngoài dễ kiếm tiền, được người ngoài giúp đỡ.",
        isGood: true
      });
    }
    const diToMenh = phiTinhMatrix[diIdx][menhIdx];
    if (diToMenh.some(h => h.type === "Kỵ")) {
      bacPhaiCombs.push({
        id: "ky-nhap-menh",
        name: "Di Phi Kỵ Nhập Mệnh",
        involvedCung: ["Mệnh", "Thiên Di"],
        description: "Cung Thiên Di phi Hóa Kỵ vào cung Mệnh. Đi xa thường chuốc lấy phiền muộn, hoặc ra ngoài hay gặp tiểu nhân ám hại.",
        isGood: false
      });
    }
  }
  
  if (menhIdx !== -1 && taiIdx !== -1) {
    const menhToTai = phiTinhMatrix[menhIdx][taiIdx];
    if (menhToTai.some(h => h.type === "Lộc")) {
      bacPhaiCombs.push({
        id: "menh-phi-loc-tai",
        name: "Mệnh Phi Lộc Tài Bạch",
        involvedCung: ["Mệnh", "Tài Bạch"],
        description: "Mệnh phi Hóa Lộc vào Tài Bạch. Tâm trí luôn hướng về việc kiếm tiền, tự lực cánh sinh kiếm tiền tốt.",
        isGood: true
      });
    }
  }

  return bacPhaiCombs;
}

export function createTuViStarChart(input) {
  const yearCanIndex = mod10(input.yearCanIndex);
  const yearChiIndex = mod12(input.yearChiIndex);
  const lunarMonth = input.lunarMonth;
  const lunarDay = input.lunarDay;
  const birthHour = mod12(input.birthHour);
  const gender = String(input.gender || "male").toLowerCase();
  const isMale = gender === "nam" || gender === "male";
  const isFemale = gender === "nữ" || gender === "female" || gender === "nu";
  const amDuong = yearCanIndex % 2 === 0 ? "Dương" : "Âm";
  const thuanNghich = (amDuong === "Dương" && isMale) || (amDuong === "Âm" && isFemale) ? "Thuận" : "Nghịch";
  const menhPalaceIndex = input.menhPalaceIndex ?? calculateMenhCungPosition(lunarMonth, birthHour);
  const thanPalaceIndex = input.thanPalaceIndex ?? calculateThanCungPosition(menhPalaceIndex, lunarMonth, birthHour);
  const menhCanIndex = calculateMenhCanIndex(yearCanIndex, menhPalaceIndex);
  const cucNumber = input.cucNumber ?? calculateTuViCucNumber(yearCanIndex, menhPalaceIndex);
  const tuViPosition = placeTuViStar(cucNumber, lunarDay);
  const chinhTinhMap = placeChinhTinh(tuViPosition);
  const school = input.school || "thien-luong";
  const phuTinhMap = placePhuTinh({ yearCanIndex, yearChiIndex, lunarMonth, lunarDay, hourBranch: birthHour, menhPosition: menhPalaceIndex, thanPosition: thanPalaceIndex, thuanNghich, school });
  const allStarPositions = {};
  for (const [name, positions] of Object.entries(chinhTinhMap)) allStarPositions[name] = positions[0];
  Object.assign(allStarPositions, phuTinhMap);
  const tuHoaTable = school === "bac-phai" ? TRUNG_CHAU_TU_HOA : TU_HOA_TABLE;
  const tuHoa = resolveTuHoa(yearCanIndex, allStarPositions, tuHoaTable);
  const trietPositions = getTrietPositions(yearCanIndex);
  const tuanPositions = getTuanPositions(yearCanIndex, yearChiIndex);
  const daiHanAgeRanges = calculateDaiHanAgeRanges({ cucNumber, gender, yearCan: yearCanIndex, menhPalaceIndex });
  const palaceCans = calculatePalaceCans(yearCanIndex);
  const rings = {
    truongSinh: createRingLookup(TRUONG_SINH_12, getTruongSinhStart(cucNumber), thuanNghich === "Thuận" ? 1 : -1),
    bacSi: createRingLookup(BAC_SI_12, LOC_TON_TABLE[yearCanIndex], thuanNghich === "Thuận" ? 1 : -1),
    thaiTue: createRingLookup(school === "bac-phai" ? BAC_PHAI_THAI_TUE_12 : THAI_TUE_12, yearChiIndex),
    tuongTinh: createRingLookup(TUONG_TINH_12, getTuongTinhStart(yearChiIndex))
  };
  const palaces = [];
  for (let chiIdx = 0; chiIdx < 12; chiIdx++) {
    const palaceNameIndex = mod12(menhPalaceIndex - chiIdx);
    const chinhTinh = Object.entries(chinhTinhMap)
      .filter(([, positions]) => positions.includes(chiIdx))
      .map(([name]) => ({ name, type: "chinhTinh", nguHanh: CHINH_TINH[name]?.nguHanh ?? "", brightness: getStarBrightness(name, chiIdx) }));
    const phuTinh = [];
    const satTinh = [];
    for (const [name, pos] of Object.entries(phuTinhMap)) {
      if (pos !== chiIdx) continue;
      const meta = PHU_TINH[name];
      if (!meta) continue;
      const star = { name, type: meta[1] === "sat" ? "satTinh" : "phuTinh", nguHanh: meta[0], brightness: getStarBrightness(name, chiIdx) };
      if (meta[1] === "sat") satTinh.push(star);
      else phuTinh.push(star);
    }
    const tuHoaList = tuHoa.filter((entry) => entry.position === chiIdx).map((entry) => ({
      type: entry.type,
      starName: entry.starName,
      sourceCan: CAN_LIST[yearCanIndex],
      brightness: getStarBrightness(`Hóa ${entry.type}`, chiIdx)
    }));
    palaces.push({
      id: chiIdx,
      chi: CHI_LIST[chiIdx],
      name: PALACE_NAMES[palaceNameIndex],
      nameHanViet: PALACE_NAMES_HAN_VIET[palaceNameIndex],
      can: CAN_LIST[palaceCans[chiIdx]],
      canChi: `${CAN_LIST[palaceCans[chiIdx]]} ${CHI_LIST[chiIdx]}`,
      chinhTinh,
      phuTinh,
      satTinh,
      tuHoa: tuHoaList,
      rings: {
        truongSinh: rings.truongSinh[chiIdx],
        bacSi: rings.bacSi[chiIdx],
        thaiTue: rings.thaiTue[chiIdx],
        tuongTinh: rings.tuongTinh[chiIdx]
      },
      brightness: Object.fromEntries([...chinhTinh, ...phuTinh, ...satTinh].map((star) => [star.name, star.brightness])),
      daiHanAgeRange: daiHanAgeRanges[chiIdx].rangeString,
      isMenh: chiIdx === menhPalaceIndex,
      isThan: chiIdx === thanPalaceIndex,
      hasTuan: tuanPositions.includes(chiIdx),
      hasTriet: trietPositions.includes(chiIdx)
    });
  }

  const menhPalace = palaces[menhPalaceIndex];
  const menhCanIdx = CAN_LIST.indexOf(menhPalace.can);
  const menhChiIdx = CHI_LIST.indexOf(menhPalace.chi);
  const napAmIdx = getNapAmIndex(menhCanIdx, menhChiIdx);
  const menhNapAm = NAP_AM_NAMES[napAmIdx] ?? "";

  const cucName = { 2: "Thủy Nhị Cục", 3: "Mộc Tam Cục", 4: "Kim Tứ Cục", 5: "Thổ Ngũ Cục", 6: "Hỏa Lục Cục" }[cucNumber] ?? "";
  const saoChuCuc = CUC_SAO_TABLE[cucName] ?? "";
  const menhChu = MENH_CHU_TABLE[menhPalace.chi] ?? "";
  const thanChu = THAN_CHU_TABLE[CAN_LIST[yearCanIndex]] ?? "";
  const laiNhanCung = calculateLaiNhanCung(yearCanIndex, palaces);
  const nguyenThan = calculateNguyenThan(yearCanIndex, palaces);

  const result = {
    status: "v1_backed_star_chart_ready",
    lineageProfile: {
      id: "lich_viet_v1_thien_luong_display_profile",
      label: "Lịch Việt v1 / Thiên Lương display profile",
      claimScope: "placement_table_and_named_pattern_detection",
      synthesisStatus: "bounded_lineage_profile_ready"
    },
    amDuong,
    thuanNghich,
    menhPalaceIndex,
    thanPalaceIndex,
    menhCanIndex,
    cucNumber,
    tuViPosition,
    trietPositions,
    tuanPositions,
    daiHanAgeRanges,
    palaces,
    combinations: detectTuViCombinations(palaces),
    sourceRefs: ["lich_viet_v1_tuvi_star_placement", "lich_viet_v1_tuvi_combination_detection"],
    menhNapAm,
    saoChuCuc,
    menhChu,
    thanChu,
    laiNhanCung,
    nguyenThan
  };
  
  const phiTinhMatrix = calculatePhiTinhMatrix(palaces);
  if (school === "bac-phai") {
    const bacPhaiCombs = evaluateBacPhaiCombinations(phiTinhMatrix, palaces);
    result.combinations.push(...bacPhaiCombs);
  }
  result.phiTinhMatrix = phiTinhMatrix;

  return result;
}

/**
 * Resolves relationship type between two branch indexes or names (0-11).
 * Returns one of: "xung", "hai", "hop_tam", "hop_luc", "tu_hinh", "binh_hoa".
 *
 * @param {string|number} branchA
 * @param {string|number} branchB
 * @returns {string}
 */
export function getBranchRelationship(branchA, branchB) {
  const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const CHI_NAMES_ENG = ["Ty", "Suu", "Dan", "Mao", "Thin", "Ti", "Ngo", "Mui", "Than", "Dau", "Tuat", "Hoi"];

  function getIdx(branch) {
    if (typeof branch === "number") return branch;
    let idx = CHI_NAMES.findIndex(n => n.toLowerCase() === branch.toLowerCase());
    if (idx === -1) {
      idx = CHI_NAMES_ENG.findIndex(n => n.toLowerCase() === branch.toLowerCase());
    }
    return idx;
  }

  const idxA = getIdx(branchA);
  const idxB = getIdx(branchB);

  if (idxA === -1 || idxB === -1 || idxA < 0 || idxA > 11 || idxB < 0 || idxB > 11) {
    throw new TypeError("Invalid branch parameters");
  }

  const phaPairs = ["0,9", "9,0", "1,4", "4,1", "2,11", "11,2", "3,6", "6,3", "5,8", "8,5", "7,10", "10,7"];
  const tuyetPairs = ["0,5", "5,0", "6,11", "11,6", "2,9", "9,2", "3,8", "8,3"];
  const hinhPairs = ["0,3", "3,0", "2,5", "5,2", "5,8", "8,5", "2,8", "8,2", "1,7", "7,1", "7,10", "10,7", "1,10", "10,1"];

  const pairKey = `${idxA},${idxB}`;

  if (idxA === idxB) {
    return [4, 6, 9, 11].includes(idxA) ? "tu_hinh" : "binh_hoa";
  }

  if (Math.abs(idxA - idxB) === 6) {
    return "xung";
  }

  if (tuyetPairs.includes(pairKey)) {
    return "tuyet";
  }

  if ((idxA + idxB) % 12 === 7) {
    return "hai";
  }

  if (hinhPairs.includes(pairKey)) {
    return "hinh";
  }

  if (phaPairs.includes(pairKey)) {
    return "pha";
  }

  if (Math.abs(idxA - idxB) === 4 || Math.abs(idxA - idxB) === 8) {
    return "hop_tam";
  }

  if ((idxA + idxB) % 12 === 1) {
    return "hop_luc";
  }

  return "binh_hoa";
}

/**
 * Calculates Tarabala Nakshatra compatibility score delta.
 *
 * @param {number} natalNakshatraIndex - 0 to 26
 * @param {number} transitNakshatraIndex - 0 to 26
 * @returns {{ tarabala: number, scoreDelta: number }}
 */
