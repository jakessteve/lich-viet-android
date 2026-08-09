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


// Simplified Bounded QMDJ evaluation (Time-based Proxy for Ju and Palace)
// In a full system, this would map Solar Term + Day Can Chi to a specific Dun/Ju
// and generate the full 9-palace board. For bounded readiness, we generate the active palace.
function evaluateQMDJ(solarTermLongitude, dayChi, hourChi) {
  const isYangDun = solarTermLongitude >= 270 || solarTermLongitude < 90; // Winter Solstice to Summer Solstice
  
  const d = getBranchNumber(dayChi);
  const h = getBranchNumber(hourChi);
  
  // Deterministic deterministic assignment for the query palace based on Day/Hour
  const activePalaceIndex = (d + h) % 9;
  
  // Deterministic mapping for Gate/Star/Deity in the active palace
  const gate = QMDJ_GATES[(d + h + (isYangDun ? 1 : 0)) % 8];
  const star = QMDJ_STARS[(d * h) % 9];
  const deity = QMDJ_DEITIES[(h + activePalaceIndex) % 8];
  
  const qmdjScore = gate.score + (star.type === "cat" ? 10 : star.type === "hung" ? -10 : 0) + (deity.type === "cat" ? 10 : -10);
  const normalizedScore = Math.max(0, Math.min(100, qmdjScore));
  
  let verdict = "trung_binh";
  if (normalizedScore >= 70) verdict = "cat";
  else if (normalizedScore < 40) verdict = "hung";
  
  return {
    status: "bounded_specialist_ready",
    dun: isYangDun ? "duong_don" : "am_don",
    activePalace: activePalaceIndex + 1,
    queryComponents: {
      gate,
      star,
      deity
    },
    score: normalizedScore,
    verdict,
    limitations: ["uses_deterministic_mapping_for_active_palace_rather_than_full_1080_ju_board_generation"]
  };
}

export function evaluateTamThucScore(params) {
  const { solarTermLongitude, dayChi, hourChi, monthChi } = params;
  
  // Qi Men Dun Jia (bounded specialist ready)
  const qmdj = evaluateQMDJ(solarTermLongitude, dayChi, hourChi);
  
  // Da Liu Ren (bootstrap proxy)
  const m = getBranchNumber(monthChi);
  const h = getBranchNumber(hourChi);
  const daiLucNhamScore = 52 + ((m + h) % 5) * 4;
  
  // Tai Yi (bootstrap proxy)
  const thaiAtScore = 50 + ((m * h) % 6) * 3;
  
  const consensusScore = Math.round((qmdj.score + daiLucNhamScore + thaiAtScore) / 3);
  
  let consensusVerdict = "trung_binh";
  if (consensusScore >= 70) consensusVerdict = "cat";
  else if (consensusScore < 40) consensusVerdict = "hung";
  
  return {
    qmdj,
    daiLucNham: {
      status: "bootstrap_month_proxy",
      score: daiLucNhamScore,
      verdict: "trung_binh"
    },
    thaiAt: {
      status: "bootstrap_cycle_proxy",
      score: thaiAtScore,
      verdict: "trung_binh"
    },
    consensus: {
      status: "bootstrap_consensus_proxy",
      score: consensusScore,
      verdict: consensusVerdict,
      disagreementFlags: Math.abs(qmdj.score - daiLucNhamScore) > 30 ? ["high_variance_between_qmdj_and_liu_ren"] : []
    }
  };
}
