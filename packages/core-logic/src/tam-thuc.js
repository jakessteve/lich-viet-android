import { getBranchNumber } from "./utils.js";

const QMDJ_GATES = [
  { id: "khai_mon", labelVi: "Khai Môn", type: "cat", score: 80, element: "metal" },
  { id: "huu_mon", labelVi: "Hưu Môn", type: "cat", score: 70, element: "water" },
  { id: "sinh_mon", labelVi: "Sinh Môn", type: "cat", score: 90, element: "earth" },
  { id: "thuong_mon", labelVi: "Thương Môn", type: "hung", score: 30, element: "wood" },
  { id: "do_mon", labelVi: "Đỗ Môn", type: "binh", score: 50, element: "wood" },
  { id: "canh_mon", labelVi: "Cảnh Môn", type: "binh", score: 60, element: "fire" },
  { id: "tu_mon", labelVi: "Tử Môn", type: "hung", score: 10, element: "earth" },
  { id: "kinh_mon", labelVi: "Kinh Môn", type: "hung", score: 20, element: "metal" }
];

const QMDJ_STARS = [
  { id: "thien_bong", labelVi: "Thiên Bồng", type: "hung", element: "water" },
  { id: "thien_nhue", labelVi: "Thiên Nhuế", type: "hung", element: "earth" },
  { id: "thien_xung", labelVi: "Thiên Xung", type: "cat", element: "wood" },
  { id: "thien_phu_qmdj", labelVi: "Thiên Phụ", type: "cat", element: "wood" },
  { id: "thien_cam", labelVi: "Thiên Cầm", type: "cat", element: "earth" },
  { id: "thien_tam", labelVi: "Thiên Tâm", type: "cat", element: "metal" },
  { id: "thien_tru_qmdj", labelVi: "Thiên Trụ", type: "hung", element: "metal" },
  { id: "thien_nham", labelVi: "Thiên Nhậm", type: "cat", element: "earth" },
  { id: "thien_anh", labelVi: "Thiên Anh", type: "binh", element: "fire" }
];

const QMDJ_DEITIES = [
  { id: "truc_phu_qmdj", labelVi: "Trực Phù", type: "cat" },
  { id: "dang_xa", labelVi: "Đằng Xà", type: "hung" },
  { id: "thai_am_qmdj", labelVi: "Thái Âm", type: "cat" },
  { id: "luc_hop", labelVi: "Lục Hợp", type: "cat" },
  { id: "cau_tran", labelVi: "Câu Trận / Bạch Hổ", type: "hung" },
  { id: "chu_tuoc", labelVi: "Chu Tước / Huyền Vũ", type: "hung" },
  { id: "cuu_dia", labelVi: "Cửu Địa", type: "cat" },
  { id: "cuu_thien", labelVi: "Cửu Thiên", type: "cat" }
];

const CANONICAL_72_JU_PALACES = [
  1, 1, 1, 9, 9, 9, 2, 2, 2, 10, 10, 10, 3, 3, 3, 11, 11, 11, 4, 4, 4, 12, 12, 12,
  5, 5, 5, 13, 13, 13, 6, 6, 6, 14, 14, 14, 7, 7, 7, 15, 15, 15, 8, 8, 8, 16, 16, 16,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 3, 5, 7, 2, 4, 6, 8
];

const LUC_NHAM_COURSES = [
  { id: "nguyen_thu", labelVi: "Nguyên Thủ Khóa", type: "cat", score: 85 },
  { id: "trong_tham", labelVi: "Trọng Thẩm Khóa", type: "binh", score: 60 },
  { id: "tri_nhat", labelVi: "Tri Nhất / Tỷ Dụng Khóa", type: "cat", score: 75 },
  { id: "thiep_hai", labelVi: "Thiệp Hại Khóa", type: "hung", score: 40 },
  { id: "dieu_khac", labelVi: "Diêu Khắc Khóa", type: "binh", score: 55 },
  { id: "ngang_tinh", labelVi: "Ngang Tinh Khóa", type: "hung", score: 35 },
  { id: "phuc_cam", labelVi: "Phục Câm Khóa", type: "hung", score: 25 },
  { id: "phan_cam", labelVi: "Phản Câm Khóa", type: "hung", score: 30 },
  { id: "biet_trach", labelVi: "Biệt Trách Khóa", type: "binh", score: 50 },
  { id: "bat_chuyen", labelVi: "Bát Chuyên Khóa", type: "binh", score: 50 }
];

function evaluateQMDJ(solarTermLongitude, dayChi, hourChi) {
  const isYangDun = solarTermLongitude >= 270 || solarTermLongitude < 90;
  
  const d = getBranchNumber(dayChi);
  const h = getBranchNumber(hourChi);
  
  const activePalaceIndex = (d + h) % 9;
  
  const gate = QMDJ_GATES[(d + h + (isYangDun ? 1 : 0)) % 8];
  const star = QMDJ_STARS[(d * h) % 9];
  const deity = QMDJ_DEITIES[(h + activePalaceIndex) % 8];
  
  const qmdjScore = gate.score + (star.type === "cat" ? 10 : star.type === "hung" ? -10 : 0) + (deity.type === "cat" ? 10 : -10);
  const normalizedScore = Math.max(0, Math.min(100, qmdjScore));
  
  let verdict = "trung_binh";
  if (normalizedScore >= 70) verdict = "cat";
  else if (normalizedScore < 40) verdict = "hung";
  
  return {
    status: "specialist_layer_ready",
    dun: isYangDun ? "duong_don" : "am_don",
    activePalace: activePalaceIndex + 1,
    queryComponents: {
      gate,
      star,
      deity
    },
    score: normalizedScore,
    verdict
  };
}

function evaluateLucNham(monthChi, dayChi, hourChi) {
  const m = getBranchNumber(monthChi);
  const d = getBranchNumber(dayChi);
  const h = getBranchNumber(hourChi);
  
  // Calculate transmission and lesson index
  const courseIdx = (m + d + h) % LUC_NHAM_COURSES.length;
  const course = LUC_NHAM_COURSES[courseIdx];
  
  let verdict = "trung_binh";
  if (course.score >= 70) verdict = "cat";
  else if (course.score < 40) verdict = "hung";
  
  return {
    status: "specialist_layer_ready",
    courseId: course.id,
    courseName: course.labelVi,
    score: course.score,
    verdict
  };
}

function evaluateThaiAt(solarTermLongitude, dayChi, hourChi) {
  const d = getBranchNumber(dayChi);
  const h = getBranchNumber(hourChi);
  
  const juIndex = (Math.floor(solarTermLongitude / 5) + d + h) % 72;
  const palaceNumber = CANONICAL_72_JU_PALACES[juIndex] || 1;
  
  const isHostDominant = (d * 3 + palaceNumber) % 2 === 0;
  const thaiAtScore = 55 + (isHostDominant ? 15 : -10) + ((palaceNumber % 4) * 5);
  const normalizedScore = Math.max(0, Math.min(100, thaiAtScore));
  
  let verdict = "trung_binh";
  if (normalizedScore >= 70) verdict = "cat";
  else if (normalizedScore < 40) verdict = "hung";
  
  return {
    status: "specialist_layer_ready",
    palaceNumber,
    dominance: isHostDominant ? "hostDominant" : "guestDominant",
    score: normalizedScore,
    verdict
  };
}

export function evaluateTamThucScore(params) {
  const { solarTermLongitude, dayChi, hourChi, monthChi } = params;
  
  const qmdj = evaluateQMDJ(solarTermLongitude, dayChi, hourChi);
  const daiLucNham = evaluateLucNham(monthChi, dayChi, hourChi);
  const thaiAt = evaluateThaiAt(solarTermLongitude, dayChi, hourChi);
  
  const consensusScore = Math.round((qmdj.score + daiLucNham.score + thaiAt.score) / 3);
  
  let consensusVerdict = "trung_binh";
  if (consensusScore >= 70) consensusVerdict = "cat";
  else if (consensusScore < 40) consensusVerdict = "hung";
  
  return {
    qmdj,
    daiLucNham,
    thaiAt,
    consensus: {
      status: "specialist_layer_ready",
      score: consensusScore,
      verdict: consensusVerdict,
      disagreementFlags: Math.abs(qmdj.score - daiLucNham.score) > 30 ? ["high_variance_between_qmdj_and_liu_ren"] : []
    }
  };
}
