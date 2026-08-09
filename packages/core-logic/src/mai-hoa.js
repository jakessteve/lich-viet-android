import { getBranchNumber } from "./utils.js";

const TRIGRAMS = Object.freeze([
  { id: "qian", number: 1, element: "metal", labelVi: "Càn", meaning: "Thiên" },
  { id: "dui", number: 2, element: "metal", labelVi: "Đoài", meaning: "Trạch" },
  { id: "li", number: 3, element: "fire", labelVi: "Ly", meaning: "Hỏa" },
  { id: "zhen", number: 4, element: "wood", labelVi: "Chấn", meaning: "Lôi" },
  { id: "xun", number: 5, element: "wood", labelVi: "Tốn", meaning: "Phong" },
  { id: "kan", number: 6, element: "water", labelVi: "Khảm", meaning: "Thủy" },
  { id: "gen", number: 7, element: "earth", labelVi: "Cấn", meaning: "Sơn" },
  { id: "kun", number: 8, element: "earth", labelVi: "Khôn", meaning: "Địa" }
]);

const HEXAGRAMS_BY_KING_WEN = {
  "qian-qian": 1, "kun-kun": 2, "kan-zhen": 3, "gen-kan": 4, "kan-qian": 5, "qian-kan": 6, "kun-kan": 7, "kan-kun": 8,
  "xun-qian": 9, "qian-dui": 10, "kun-qian": 11, "qian-kun": 12, "qian-li": 13, "li-qian": 14, "kun-gen": 15, "zhen-kun": 16,
  "dui-zhen": 17, "gen-xun": 18, "kun-dui": 19, "xun-kun": 20, "li-zhen": 21, "gen-li": 22, "gen-kun": 23, "kun-zhen": 24,
  "qian-zhen": 25, "gen-qian": 26, "gen-zhen": 27, "dui-xun": 28, "kan-kan": 29, "li-li": 30, "dui-gen": 31, "zhen-xun": 32,
  "qian-gen": 33, "zhen-qian": 34, "li-kun": 35, "kun-li": 36, "xun-li": 37, "li-dui": 38, "kan-gen": 39, "zhen-kan": 40,
  "gen-dui": 41, "xun-zhen": 42, "dui-qian": 43, "qian-xun": 44, "dui-kun": 45, "kun-xun": 46, "dui-kan": 47, "kan-xun": 48,
  "dui-li": 49, "li-xun": 50, "zhen-zhen": 51, "gen-gen": 52, "xun-gen": 53, "zhen-dui": 54, "zhen-li": 55, "li-gen": 56,
  "xun-xun": 57, "dui-dui": 58, "xun-kan": 59, "kan-dui": 60, "xun-dui": 61, "zhen-gen": 62, "kan-li": 63, "li-kan": 64
};

function getTrigramByNumber(num) {
  let normalized = num % 8;
  if (normalized === 0) normalized = 8;
  return TRIGRAMS.find(t => t.number === normalized);
}

function getHexagramId(upperTrigram, lowerTrigram) {
  const key = `${upperTrigram.id}-${lowerTrigram.id}`;
  return HEXAGRAMS_BY_KING_WEN[key] || 1;
}

function getElementRelationship(theTrigram, dungTrigram) {
  const elements = {
    metal: { generates: "water", overcomes: "wood" },
    water: { generates: "wood", overcomes: "fire" },
    wood: { generates: "fire", overcomes: "earth" },
    fire: { generates: "earth", overcomes: "metal" },
    earth: { generates: "metal", overcomes: "water" }
  };
  
  if (theTrigram.element === dungTrigram.element) {
    return { type: "ty_hoa", labelVi: "Tỷ Hòa", isAuspicious: true, description: "Bình ổn, thuận lợi" };
  }
  if (elements[dungTrigram.element].generates === theTrigram.element) {
    return { type: "dung_sinh_the", labelVi: "Dụng sinh Thể", isAuspicious: true, description: "Đại cát, thu lợi" };
  }
  if (elements[theTrigram.element].generates === dungTrigram.element) {
    return { type: "the_sinh_dung", labelVi: "Thể sinh Dụng", isAuspicious: false, description: "Hao tài, tốn sức" };
  }
  if (elements[theTrigram.element].overcomes === dungTrigram.element) {
    return { type: "the_khac_dung", labelVi: "Thể khắc Dụng", isAuspicious: true, description: "Khó trước dễ sau, có thành tựu" };
  }
  if (elements[dungTrigram.element].overcomes === theTrigram.element) {
    return { type: "dung_khac_the", labelVi: "Dụng khắc Thể", isAuspicious: false, description: "Đại hung, hung hiểm" };
  }
  return { type: "unknown", labelVi: "Không rõ", isAuspicious: false, description: "" };
}

const TRIGRAM_BINARY = {
  qian: [1, 1, 1], dui: [1, 1, 0], li: [1, 0, 1], zhen: [1, 0, 0],
  xun: [0, 1, 1], kan: [0, 1, 0], gen: [0, 0, 1], kun: [0, 0, 0]
};

function getBinaryForHexagram(upperId, lowerId) {
  return [...TRIGRAM_BINARY[lowerId], ...TRIGRAM_BINARY[upperId]];
}

function getTrigramFromBinary(binary) {
  for (const [id, bin] of Object.entries(TRIGRAM_BINARY)) {
    if (bin[0] === binary[0] && bin[1] === binary[1] && bin[2] === binary[2]) {
      return TRIGRAMS.find(t => t.id === id);
    }
  }
  return TRIGRAMS[0];
}

function getMutualHexagram(upperTrigram, lowerTrigram) {
  const binary = getBinaryForHexagram(upperTrigram.id, lowerTrigram.id);
  const mutualLower = getTrigramFromBinary([binary[1], binary[2], binary[3]]);
  const mutualUpper = getTrigramFromBinary([binary[2], binary[3], binary[4]]);
  
  return {
    upper: mutualUpper,
    lower: mutualLower,
    hexagramId: getHexagramId(mutualUpper, mutualLower)
  };
}

export function calculateTraditionalMaiHoa(params) {
  const { yearChi, lunarMonth, lunarDay, hourChi, customNumbers } = params;
  
  let upperNum, lowerNum, movingLine;
  
  if (customNumbers && customNumbers.length >= 2) {
    upperNum = customNumbers[0];
    lowerNum = customNumbers[1];
    movingLine = (upperNum + lowerNum) % 6;
    if (movingLine === 0) movingLine = 6;
  } else {
    const y = getBranchNumber(yearChi);
    const m = lunarMonth;
    const d = lunarDay;
    const h = getBranchNumber(hourChi);
    
    upperNum = y + m + d;
    lowerNum = y + m + d + h;
    movingLine = lowerNum % 6;
    if (movingLine === 0) movingLine = 6;
  }
  
  const upperTrigram = getTrigramByNumber(upperNum);
  const lowerTrigram = getTrigramByNumber(lowerNum);
  const mainHexagramId = getHexagramId(upperTrigram, lowerTrigram);
  
  const movingTrigram = movingLine <= 3 ? "lower" : "upper";
  const bodyTrigram = movingTrigram === "lower" ? upperTrigram : lowerTrigram;
  const useTrigram = movingTrigram === "lower" ? lowerTrigram : upperTrigram;
  
  const mutual = getMutualHexagram(upperTrigram, lowerTrigram);
  
  const binary = getBinaryForHexagram(upperTrigram.id, lowerTrigram.id);
  const changedBinary = [...binary];
  changedBinary[movingLine - 1] = changedBinary[movingLine - 1] === 1 ? 0 : 1;
  const changedLower = getTrigramFromBinary([changedBinary[0], changedBinary[1], changedBinary[2]]);
  const changedUpper = getTrigramFromBinary([changedBinary[3], changedBinary[4], changedBinary[5]]);
  
  return {
    status: "bounded_specialist_ready",
    mainHexagram: {
      id: mainHexagramId,
      upper: upperTrigram,
      lower: lowerTrigram
    },
    mutualHexagram: {
      id: mutual.hexagramId,
      upper: mutual.upper,
      lower: mutual.lower
    },
    changedHexagram: {
      id: getHexagramId(changedUpper, changedLower),
      upper: changedUpper,
      lower: changedLower
    },
    movingLine,
    theDung: {
      bodyTrigram,
      useTrigram,
      movingTrigram,
      relationship: getElementRelationship(bodyTrigram, useTrigram)
    }
  };
}
