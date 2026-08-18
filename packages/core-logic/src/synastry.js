import { resolveTuViBirthContext, createTuViStarChart, getNapAmIndex, NAP_AM_NAMES } from "./tuvi.js";
import { getLunarDate } from "./calendar.js";
import { normalizeDegrees, computeTopocentricPlanetarySnapshot, computeHouseCusps } from "./astronomy.js";
import { computeVimshottariDasha, computeAshtakoot, computeManglikDosha } from "./vedic.js";

const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

const QUAI_MAP = {
  1: { index: 1, name: "Khảm", element: "Thủy", group: "Đông Tứ" },
  2: { index: 2, name: "Khôn", element: "Thổ", group: "Tây Tứ" },
  3: { index: 3, name: "Chấn", element: "Mộc", group: "Đông Tứ" },
  4: { index: 4, name: "Tốn", element: "Mộc", group: "Đông Tứ" },
  6: { index: 6, name: "Càn", element: "Kim", group: "Tây Tứ" },
  7: { index: 7, name: "Đoài", element: "Kim", group: "Tây Tứ" },
  8: { index: 8, name: "Cấn", element: "Thổ", group: "Tây Tứ" },
  9: { index: 9, name: "Ly", element: "Hỏa", group: "Đông Tứ" }
};

// Bát Trạch Matrix: [Quái A][Quái B] -> { name, tone, scoreDelta, desc }
const BAT_TRACH_MATRIX = {
  1: { 1: { name: "Phục Vị", cat: true, delta: 8 }, 4: { name: "Sinh Khí", cat: true, delta: 15 }, 3: { name: "Thiên Y", cat: true, delta: 10 }, 9: { name: "Diên Niên", cat: true, delta: 12 }, 2: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 8: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 6: { name: "Lục Sát", cat: false, delta: -8 }, 7: { name: "Họa Hại", cat: false, delta: -6 } },
  2: { 8: { name: "Sinh Khí", cat: true, delta: 15 }, 7: { name: "Thiên Y", cat: true, delta: 10 }, 6: { name: "Diên Niên", cat: true, delta: 12 }, 2: { name: "Phục Vị", cat: true, delta: 8 }, 1: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 4: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 9: { name: "Lục Sát", cat: false, delta: -8 }, 3: { name: "Họa Hại", cat: false, delta: -6 } },
  3: { 9: { name: "Sinh Khí", cat: true, delta: 15 }, 1: { name: "Thiên Y", cat: true, delta: 10 }, 4: { name: "Diên Niên", cat: true, delta: 12 }, 3: { name: "Phục Vị", cat: true, delta: 8 }, 7: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 6: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 8: { name: "Lục Sát", cat: false, delta: -8 }, 2: { name: "Họa Hại", cat: false, delta: -6 } },
  4: { 1: { name: "Sinh Khí", cat: true, delta: 15 }, 9: { name: "Thiên Y", cat: true, delta: 10 }, 3: { name: "Diên Niên", cat: true, delta: 12 }, 4: { name: "Phục Vị", cat: true, delta: 8 }, 8: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 2: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 7: { name: "Lục Sát", cat: false, delta: -8 }, 6: { name: "Họa Hại", cat: false, delta: -6 } },
  6: { 7: { name: "Sinh Khí", cat: true, delta: 15 }, 8: { name: "Thiên Y", cat: true, delta: 10 }, 2: { name: "Diên Niên", cat: true, delta: 12 }, 6: { name: "Phục Vị", cat: true, delta: 8 }, 9: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 3: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 1: { name: "Lục Sát", cat: false, delta: -8 }, 4: { name: "Họa Hại", cat: false, delta: -6 } },
  7: { 6: { name: "Sinh Khí", cat: true, delta: 15 }, 2: { name: "Thiên Y", cat: true, delta: 10 }, 8: { name: "Diên Niên", cat: true, delta: 12 }, 7: { name: "Phục Vị", cat: true, delta: 8 }, 3: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 9: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 4: { name: "Lục Sát", cat: false, delta: -8 }, 1: { name: "Họa Hại", cat: false, delta: -6 } },
  8: { 2: { name: "Sinh Khí", cat: true, delta: 15 }, 6: { name: "Thiên Y", cat: true, delta: 10 }, 7: { name: "Diên Niên", cat: true, delta: 12 }, 8: { name: "Phục Vị", cat: true, delta: 8 }, 4: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 1: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 3: { name: "Lục Sát", cat: false, delta: -8 }, 9: { name: "Họa Hại", cat: false, delta: -6 } },
  9: { 3: { name: "Sinh Khí", cat: true, delta: 15 }, 4: { name: "Thiên Y", cat: true, delta: 10 }, 1: { name: "Diên Niên", cat: true, delta: 12 }, 9: { name: "Phục Vị", cat: true, delta: 8 }, 6: { name: "Tuyệt Mệnh", cat: false, delta: -15 }, 7: { name: "Ngũ Quỷ", cat: false, delta: -10 }, 2: { name: "Lục Sát", cat: false, delta: -8 }, 8: { name: "Họa Hại", cat: false, delta: -6 } }
};

export function computeCungPhi(lunarYear, gender) {
  const sumDigits = (Math.abs(lunarYear) % 9) || 9;
  let quaiIndex;
  const isMale = gender === "male" || gender === "nam";
  if (isMale) {
    quaiIndex = (11 - (sumDigits % 9)) % 9;
    if (quaiIndex === 0) quaiIndex = 9;
    if (quaiIndex === 5) quaiIndex = 2; // Nam 5 -> Khôn (2)
  } else {
    quaiIndex = (4 + (sumDigits % 9)) % 9;
    if (quaiIndex === 0) quaiIndex = 9;
    if (quaiIndex === 5) quaiIndex = 8; // Nữ 5 -> Cấn (8)
  }
  return QUAI_MAP[quaiIndex] || QUAI_MAP[1];
}

export function generateUnifiedBirthProfile(input) {
  const { birthTimestamp, latitude, longitude, gender, timezone } = input;
  const solarDate = new Date(birthTimestamp);
  
  const birthLocation = { lat: latitude, lng: longitude, timezone };
  const tuViContext = resolveTuViBirthContext({
    solarDate,
    gender,
    birthLocation,
    timePolicy: "historical-vietnam"
  });

  const lunarDate = getLunarDate(tuViContext.metaphysicalDate, birthLocation, 7.0);

  const julianDay = birthTimestamp / 86400000 + 2440587.5;
  const observer = { latitude, longitude, altitudeMeters: 0, julianDay };
  const snapshot = computeTopocentricPlanetarySnapshot(observer, "lahiri");
  const houses = computeHouseCusps(observer);
  
  const moon = snapshot.find(b => b.body === "moon");
  const sun = snapshot.find(b => b.body === "sun");
  const mars = snapshot.find(b => b.body === "mars");
  const venus = snapshot.find(b => b.body === "venus");

  // Exact Day Can-Chi from Julian Day
  const dayCanIndex = ((Math.floor(julianDay + 0.5) + 9) % 10 + 10) % 10;
  const dayChiIndex = ((Math.floor(julianDay + 0.5) + 1) % 12 + 12) % 12;

  // Cung Phi Bát Trạch
  const cungPhi = computeCungPhi(lunarDate.year, gender);

  const fullTuViChart = createTuViStarChart({
    yearCanIndex: (lunarDate.year + 6) % 10,
    yearChiIndex: ((lunarDate.year - 4) % 12 + 12) % 12,
    lunarMonth: lunarDate.month,
    lunarDay: lunarDate.day,
    birthHour: tuViContext.hourBranchIndex,
    gender: gender
  });

  const age = new Date().getFullYear() - (solarDate.getFullYear() || 2000);
  const manglik = computeManglikDosha({
    marsSiderealLon: mars ? mars.siderealLongitude : 0,
    ascSiderealLon: houses ? houses.ascendant - 24 : 0,
    moonSiderealLon: moon ? moon.siderealLongitude : 0,
    venusSiderealLon: venus ? venus.siderealLongitude : 0,
    age
  });
  
  return {
    profileId: input.profileId || "anonymous",
    birthTimestamp,
    latitude,
    longitude,
    gender,
    tuViContext: {
      lunarDate,
      hourBranchIndex: tuViContext.hourBranchIndex,
      yearBranchIndex: ((lunarDate.year - 4) % 12 + 12) % 12,
      yearCanIndex: (lunarDate.year + 6) % 10,
      dayCanIndex,
      dayBranchIndex: dayChiIndex,
      cungPhi,
      isDayShifted: tuViContext.isDayShifted,
      chart: fullTuViChart,
      phuThePalace: fullTuViChart.palaces.find(p => p.name === "Phu Thê") || null
    },
    crossEngineMapping: {
      westernHouses: TUVI_TO_WESTERN_HOUSE_MAP,
      vedicBhavas: TUVI_TO_VEDIC_BHAVA_MAP
    },
    vedicContext: {
      moonSiderealLongitude: moon ? moon.siderealLongitude : 0,
      moonNakshatraIndex: moon && moon.nakshatra ? moon.nakshatra.index : undefined,
      marsSiderealLongitude: mars ? mars.siderealLongitude : 0,
      manglik
    },
    westernContext: {
      sunTropicalLongitude: sun ? sun.tropicalLongitude : 0,
      moonTropicalLongitude: moon ? moon.tropicalLongitude : 0,
      planets: snapshot,
      houses
    }
  };
}

const TUVI_TO_WESTERN_HOUSE_MAP = {
  "Mệnh": { primary: 1, related: [], nuance: "Focus on Self, vitality, destiny path. Closely matches Ascendant (1st house)." },
  "Huynh Đệ": { primary: 3, related: [11], nuance: "Siblings (3rd house) and close peers. Different from Western 11th which is broader network." },
  "Phu Thê": { primary: 7, related: [], nuance: "Spouse and serious partnerships. Directly maps to 7th house." },
  "Tử Tức": { primary: 5, related: [], nuance: "Children and legacy. Maps to 5th house, though Western 5th includes romance/creativity." },
  "Tài Bạch": { primary: 2, related: [8], nuance: "Wealth generation. Maps to 2nd house (personal assets). 8th house for shared wealth." },
  "Tật Ách": { primary: 6, related: [8], nuance: "Health and disasters. 6th house (illness) and 8th house (death/crisis)." },
  "Thiên Di": { primary: 9, related: [3], nuance: "Travel and outside world. Maps to 9th (long journeys) but also general external environment." },
  "Nô Bộc": { primary: 11, related: [6], nuance: "Friends and subordinates. 11th house (networks) and 6th (servants/employees)." },
  "Quan Lộc": { primary: 10, related: [], nuance: "Career and public standing. Directly maps to Midheaven / 10th house." },
  "Điền Trạch": { primary: 4, related: [], nuance: "Real estate and home. Directly maps to IC / 4th house." },
  "Phúc Đức": { primary: 12, related: [9], nuance: "Karma, mental state, ancestors. 12th house (subconscious/karma) and 9th (belief/merit)." },
  "Phụ Mẫu": { primary: 4, related: [10], nuance: "Parents. Western splits parents across 4th and 10th houses. Tu Vi separates home (Điền) from parents (Phụ Mẫu)." }
};

const TUVI_TO_VEDIC_BHAVA_MAP = {
  "Mệnh": { primary: 1, related: [], nuance: "Lagna (1st Bhava). Dharma, physical body, self." },
  "Huynh Đệ": { primary: 3, related: [11], nuance: "Sahaja Bhava (3rd) - younger siblings. 11th for elder siblings." },
  "Phu Thê": { primary: 7, related: [], nuance: "Yuvati Bhava (7th) - spouse and partnerships." },
  "Tử Tức": { primary: 5, related: [], nuance: "Putra Bhava (5th) - children, intelligence, past life merit." },
  "Tài Bạch": { primary: 2, related: [11], nuance: "Dhana Bhava (2nd) - accumulated wealth. Labha Bhava (11th) - income/gains." },
  "Tật Ách": { primary: 6, related: [8], nuance: "Ari Bhava (6th) - diseases, debts, enemies. Randhra Bhava (8th) - longevity/accidents." },
  "Thiên Di": { primary: 9, related: [12], nuance: "Bhagya Bhava (9th) - fortunes, long travel. 12th for foreign lands." },
  "Nô Bộc": { primary: 6, related: [11], nuance: "6th Bhava for servants/subordinates. 11th for friends/associations." },
  "Quan Lộc": { primary: 10, related: [], nuance: "Karma Bhava (10th) - profession and action in society." },
  "Điền Trạch": { primary: 4, related: [], nuance: "Bandhu Bhava (4th) - fixed assets, vehicles, inner peace." },
  "Phúc Đức": { primary: 9, related: [5], nuance: "9th Bhava (Dharma/Bhagya) for merit and spiritual inclinations. 5th for poorva punya." },
  "Phụ Mẫu": { primary: 4, related: [9], nuance: "4th Bhava (Mother). 9th Bhava (Father in Parashari system)." }
};

export function generateUnifiedTimeline(tuviChart, westernChart, vedicChart, targetYear, birthYear) {
  let daiHan = null;
  let luuNien = null;
  
  if (tuviChart && tuviChart.palaces) {
    const age = targetYear - (birthYear || targetYear) + 1;
    daiHan = tuviChart.palaces.find(p => {
      if (!p.daiHanAgeRange) return false;
      const [min, max] = p.daiHanAgeRange.split('-').map(Number);
      return age >= min && age <= max;
    })?.name || null;
    
    const chiNames = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
    const targetChi = chiNames[((targetYear - 4) % 12 + 12) % 12];
    luuNien = tuviChart.palaces.find(p => p.chi === targetChi)?.name || null;
  }

  const timeline = {
    year: targetYear,
    convergenceEvents: [],
    engines: {
      tuVi: {
        daiHan: daiHan,
        luuNien: luuNien
      },
      western: {
        transits: westernChart?.transits?.[targetYear] || [],
        progressions: westernChart?.progressions?.[targetYear] || []
      },
      vedic: {
        dasha: computeVimshottariDasha(
          vedicChart?.moonSiderealLongitude || 0,
          vedicChart?.julianDay || 0,
          birthYear || targetYear
        ).find(d => d.startYear <= targetYear && d.endYear >= targetYear) || null
      }
    }
  };
  return timeline;
}

function getNapAmName(canIndex, chiIndex) {
  try {
    const idx = getNapAmIndex(canIndex, chiIndex);
    return NAP_AM_NAMES[idx] || "";
  } catch {
    return "";
  }
}

function getElementFromNapAm(napAmName) {
  if (!napAmName) return null;
  const parts = napAmName.trim().split(/\s+/);
  return parts[parts.length - 1]; // Kim, Mộc, Thủy, Hỏa, Thổ
}

const ELEMENT_RELATIONS = {
  Kim: { sinh: "Thủy", khac: "Mộc", duocSinh: "Thổ", biKhac: "Hỏa" },
  Mộc: { sinh: "Hỏa", khac: "Thổ", duocSinh: "Thủy", biKhac: "Kim" },
  Thủy: { sinh: "Mộc", khac: "Hỏa", duocSinh: "Kim", biKhac: "Thổ" },
  Hỏa: { sinh: "Thổ", khac: "Kim", duocSinh: "Mộc", biKhac: "Thủy" },
  Thổ: { sinh: "Kim", khac: "Thủy", duocSinh: "Hỏa", biKhac: "Mộc" },
};

function getHouseFromLongitude(lon, cusps) {
  if (!cusps || cusps.length < 12) return 1;
  const normLon = normalizeDegrees(lon);
  for (let i = 0; i < 12; i++) {
    const cur = cusps[i];
    const nxt = cusps[(i + 1) % 12];
    if (nxt > cur) {
      if (normLon >= cur && normLon < nxt) return i + 1;
    } else {
      if (normLon >= cur || normLon < nxt) return i + 1;
    }
  }
  return 1;
}

export function calculateSynastry(profileA, profileB, westernSynastryData, vedicSynastryData) {
  // ══════════════════════════════════════════════════════════
  // 1. Á Đông / Tử Vi & Bát Tự Hợp Hôn (Eastern Synastry)
  // ══════════════════════════════════════════════════════════
  let tuViScore = 40; // Base neutral score
  const tuViInsights = [];
  let batTrachResult = null;
  
  if (profileA.tuViContext && profileB.tuViContext) {
    const aCan = profileA.tuViContext.yearCanIndex;
    const bCan = profileB.tuViContext.yearCanIndex;
    const aChi = profileA.tuViContext.yearBranchIndex;
    const bChi = profileB.tuViContext.yearBranchIndex;
    const aDayCan = profileA.tuViContext.dayCanIndex;
    const bDayCan = profileB.tuViContext.dayCanIndex;
    const aDayChi = profileA.tuViContext.dayBranchIndex;
    const bDayChi = profileB.tuViContext.dayBranchIndex;

    // A. Nạp Âm Ngũ Hành năm sinh
    if (aCan !== undefined && aChi !== undefined && bCan !== undefined && bChi !== undefined) {
      const aNapAm = getNapAmName(aCan, aChi);
      const bNapAm = getNapAmName(bCan, bChi);
      const aElem = getElementFromNapAm(aNapAm);
      const bElem = getElementFromNapAm(bNapAm);

      if (aElem && bElem) {
        if (aElem === bElem) {
          tuViScore += 8;
          tuViInsights.push(`Nạp Âm bình hòa (${aNapAm} & ${bNapAm}): Đồng hành tương trợ, hòa hợp tự nhiên`);
        } else if (ELEMENT_RELATIONS[aElem]?.sinh === bElem || ELEMENT_RELATIONS[bElem]?.sinh === aElem) {
          tuViScore += 12;
          tuViInsights.push(`Nạp Âm tương sinh (${aNapAm} - ${bNapAm}): Tương sinh nâng đỡ, vượng khí tài lộc`);
        } else if (ELEMENT_RELATIONS[aElem]?.khac === bElem || ELEMENT_RELATIONS[bElem]?.khac === aElem) {
          tuViScore -= 8;
          tuViInsights.push(`Nạp Âm tương khắc (${aNapAm} - ${bNapAm}): Cần nhường nhịn, chế hóa tính cách`);
        }
      }
    }

    // B. Thiên Can năm sinh hợp/khắc
    if (aCan !== undefined && bCan !== undefined) {
      if (Math.abs(aCan - bCan) === 5) {
        tuViScore += 10;
        tuViInsights.push(`Thiên Can ngũ hợp (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]}): Duyên lành trời định (Rất tốt)`);
      } else if (aCan === bCan) {
        tuViScore += 6;
        tuViInsights.push(`Thiên Can đồng hành (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]}): Tương hòa chia sẻ`);
      } else if ((aCan + 4) % 10 === bCan || (bCan + 4) % 10 === aCan) {
        tuViScore -= 6;
        tuViInsights.push(`Thiên Can tương khắc (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]}): Khác biệt quan điểm sống`);
      } else {
        tuViScore += 4;
        tuViInsights.push(`Thiên Can bình hòa (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]})`);
      }
    }

    // C. Địa Chi năm sinh hợp/xung
    if (aChi !== undefined && bChi !== undefined) {
      if (Math.abs(aChi - bChi) === 4 || Math.abs(aChi - bChi) === 8) {
        tuViScore += 12;
        tuViInsights.push(`Địa Chi tam hợp (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Đại cát, gắn kết lý tưởng`);
      } else if ((aChi + bChi) % 12 === 1) {
        tuViScore += 10;
        tuViInsights.push(`Địa Chi lục hợp (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Quý nhân tương hợp, thấu hiểu mật thiết`);
      } else if (aChi === bChi) {
        tuViScore += 5;
        tuViInsights.push(`Địa Chi đồng chi (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Thấu hiểu thói quen của nhau`);
      } else if (Math.abs(aChi - bChi) === 6) {
        tuViScore -= 10;
        tuViInsights.push(`Địa Chi lục xung (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Dễ nảy sinh xung đột tính cách`);
      } else if ((aChi + bChi) % 12 === 7) {
        tuViScore -= 8;
        tuViInsights.push(`Địa Chi lục hại (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Cần cẩn trọng trong giao tiếp gia đạo`);
      } else {
        tuViScore += 3;
        tuViInsights.push(`Địa Chi bình hòa (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]})`);
      }
    }

    // D. Bát Tự Trụ Ngày (Day Pillar - Cung Phối) - Primary Seat of Marriage
    if (aDayChi !== undefined && bDayChi !== undefined) {
      const dayChiDiff = Math.abs(aDayChi - bDayChi);
      if (dayChiDiff === 4 || dayChiDiff === 8) {
        tuViScore += 12;
        tuViInsights.push(`Trụ Ngày (Cung Phối) Tam Hợp (${CHI_NAMES[aDayChi]} - ${CHI_NAMES[bDayChi]}): Hôn nhân keo sơn bền chặt`);
      } else if ((aDayChi + bDayChi) % 12 === 1) {
        tuViScore += 10;
        tuViInsights.push(`Trụ Ngày (Cung Phối) Lục Hợp (${CHI_NAMES[aDayChi]} - ${CHI_NAMES[bDayChi]}): Vợ chồng hòa thuận, tri âm tri kỷ`);
      } else if (dayChiDiff === 6) {
        tuViScore -= 8;
        tuViInsights.push(`Trụ Ngày Tương Xung (${CHI_NAMES[aDayChi]} - ${CHI_NAMES[bDayChi]}): Cần học cách tôn trọng không gian riêng của nhau`);
      } else {
        tuViScore += 4;
        tuViInsights.push(`Trụ Ngày Bình Hòa (${CHI_NAMES[aDayChi]} - ${CHI_NAMES[bDayChi]})`);
      }
    }

    // E. Cung Phi Bát Trạch (Quái Mệnh)
    const quaiA = profileA.tuViContext.cungPhi?.index;
    const quaiB = profileB.tuViContext.cungPhi?.index;
    if (quaiA && quaiB && BAT_TRACH_MATRIX[quaiA]?.[quaiB]) {
      const match = BAT_TRACH_MATRIX[quaiA][quaiB];
      tuViScore += match.delta;
      batTrachResult = {
        quaiA: profileA.tuViContext.cungPhi.name,
        quaiB: profileB.tuViContext.cungPhi.name,
        relationship: match.name,
        isCat: match.cat,
        delta: match.delta
      };
      tuViInsights.push(`Cung Phi Bát Trạch (${profileA.tuViContext.cungPhi.name} - ${profileB.tuViContext.cungPhi.name}): Phối thành ${match.name} (${match.cat ? "Đại Cát" : "Cần hóa giải"})`);
    }

    // F. Cung Phu Thê & Cung Mệnh
    if (profileA.tuViContext.phuThePalace && profileB.tuViContext.phuThePalace) {
      const aPhuTheStars = profileA.tuViContext.phuThePalace.chinhTinh.map(s => s.name);
      const bPhuTheStars = profileB.tuViContext.phuThePalace.chinhTinh.map(s => s.name);
      const intersection = aPhuTheStars.filter(s => bPhuTheStars.includes(s));
      if (intersection.length > 0) {
        tuViScore += 10;
        tuViInsights.push(`Cung Phu Thê tương phùng sao chính tinh: ${intersection.join(", ")} (Tương hợp bền vững)`);
      }
    }
  }
  
  tuViScore = Math.max(0, Math.min(100, tuViScore));

  // ══════════════════════════════════════════════════════════
  // 2. Tây Phương / Liên Góc Chiếu & House Overlays (Western Synastry)
  // ══════════════════════════════════════════════════════════
  let westernScore = 0;
  const westernInsights = [];
  const houseOverlays = [];
  
  if (profileA.westernContext?.planets && profileB.westernContext?.planets) {
    const importantBodies = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn", "uranus", "neptune", "pluto"];
    const aPlanets = profileA.westernContext.planets.filter(p => importantBodies.includes(p.body));
    const bPlanets = profileB.westernContext.planets.filter(p => importantBodies.includes(p.body));
    
    let totalAspectScore = 48; // Base score
    const detectedPairs = new Set();

    for (const pA of aPlanets) {
      for (const pB of bPlanets) {
        const diff = Math.abs(normalizeDegrees(pA.tropicalLongitude - pB.tropicalLongitude));
        const minDiff = Math.min(diff, 360 - diff);
        const pairKey = [pA.body, pB.body].sort().join('-');

        const checkAspect = (targetAngle, maxOrb, nameVi, harmonic) => {
          const orb = Math.abs(minDiff - targetAngle);
          if (orb <= maxOrb) {
            const orbWeight = 1 - orb / maxOrb;
            return { matched: true, orbWeight, orb, nameVi, harmonic };
          }
          return { matched: false, orbWeight: 0, orb: 0, nameVi: '', harmonic: true };
        };

        const conj = checkAspect(0, (pA.body === 'sun' || pA.body === 'moon' || pB.body === 'sun' || pB.body === 'moon') ? 8 : 6, 'Trùng tụ', true);
        const trine = checkAspect(120, 7, 'Tam hợp', true);
        const sextile = checkAspect(60, 5, 'Lục hợp', true);
        const opp = checkAspect(180, 7, 'Đối đỉnh', false);
        const square = checkAspect(90, 6, 'Vuông góc', false);

        const activeAspect = [conj, trine, sextile, opp, square].find(a => a.matched);
        if (!activeAspect) continue;

        const { orbWeight, harmonic, nameVi } = activeAspect;

        // 1. Sun - Moon (Luminaries bond)
        if ((pA.body === 'sun' && pB.body === 'moon') || (pA.body === 'moon' && pB.body === 'sun')) {
          if (!detectedPairs.has('sun-moon')) {
            detectedPairs.add('sun-moon');
            if (harmonic) {
              totalAspectScore += Math.round(14 * orbWeight);
              westernInsights.push(`Mặt Trời - Mặt Trăng ${nameVi}: Đồng điệu tâm hồn sâu sắc & thấu cảm`);
            } else {
              totalAspectScore -= Math.round(6 * orbWeight);
              westernInsights.push(`Mặt Trời - Mặt Trăng ${nameVi}: Cần học cách dung hòa nhịp sống`);
            }
          }
        }
        // 2. Venus - Mars (Passionate romantic chemistry)
        else if ((pA.body === 'venus' && pB.body === 'mars') || (pA.body === 'mars' && pB.body === 'venus')) {
          if (!detectedPairs.has('venus-mars')) {
            detectedPairs.add('venus-mars');
            if (activeAspect === opp) {
              totalAspectScore += Math.round(8 * orbWeight);
              westernInsights.push(`Kim Tinh - Hỏa Tinh Đối đỉnh: Sức hút nam nữ mãnh liệt (Vừa đối lập vừa thu hút)`);
            } else if (harmonic) {
              totalAspectScore += Math.round(12 * orbWeight);
              westernInsights.push(`Kim Tinh - Hỏa Tinh ${nameVi}: Sức hút tình cảm và đam mê hòa hợp`);
            } else {
              totalAspectScore -= Math.round(4 * orbWeight);
              westernInsights.push(`Kim Tinh - Hỏa Tinh Vuông góc: Cảm xúc nồng nhiệt nhưng dễ va chạm cái tôi`);
            }
          }
        }
        // 3. Sun - Venus
        else if ((pA.body === 'sun' && pB.body === 'venus') || (pA.body === 'venus' && pB.body === 'sun')) {
          if (!detectedPairs.has('sun-venus')) {
            detectedPairs.add('sun-venus');
            if (harmonic) {
              totalAspectScore += Math.round(9 * orbWeight);
              westernInsights.push(`Mặt Trời - Kim Tinh ${nameVi}: Trân quý, yêu thương và ấm áp`);
            }
          }
        }
        // 4. Moon - Venus
        else if ((pA.body === 'moon' && pB.body === 'venus') || (pA.body === 'venus' && pB.body === 'moon')) {
          if (!detectedPairs.has('moon-venus')) {
            detectedPairs.add('moon-venus');
            if (harmonic) {
              totalAspectScore += Math.round(9 * orbWeight);
              westernInsights.push(`Mặt Trăng - Kim Tinh ${nameVi}: Dịu dàng, an tâm và gắn kết êm ấm`);
            }
          }
        }
        // 5. Moon - Moon
        else if (pA.body === 'moon' && pB.body === 'moon') {
          if (!detectedPairs.has('moon-moon')) {
            detectedPairs.add('moon-moon');
            if (harmonic) {
              totalAspectScore += Math.round(9 * orbWeight);
              westernInsights.push(`Mặt Trăng - Mặt Trăng ${nameVi}: Thấu hiểu cảm xúc tự nhiên, dễ chia sẻ`);
            } else {
              totalAspectScore -= Math.round(5 * orbWeight);
              westernInsights.push(`Mặt Trăng - Mặt Trăng ${nameVi}: Nhu cầu an toàn cảm xúc khác biệt`);
            }
          }
        }
        // 6. Mercury - Mercury / Sun
        else if (pA.body === 'mercury' && (pB.body === 'mercury' || pB.body === 'sun')) {
          if (!detectedPairs.has(`mercury-${pB.body}`)) {
            detectedPairs.add(`mercury-${pB.body}`);
            if (harmonic) {
              totalAspectScore += Math.round(7 * orbWeight);
              westernInsights.push(`Thủy Tinh ${nameVi} (${pB.body === 'sun' ? 'Mặt Trời' : 'Thủy Tinh'}): Giao tiếp ăn ý, đồng điệu tư duy`);
            }
          }
        }
        // 7. Jupiter
        else if ((pA.body === 'jupiter' && ['sun', 'moon', 'venus'].includes(pB.body)) || (pB.body === 'jupiter' && ['sun', 'moon', 'venus'].includes(pA.body))) {
          if (!detectedPairs.has(`jupiter-${pairKey}`)) {
            detectedPairs.add(`jupiter-${pairKey}`);
            if (harmonic) {
              totalAspectScore += Math.round(6 * orbWeight);
              westernInsights.push(`Mộc Tinh tương trợ ${nameVi}: Đem lại may mắn, bao dung và phát triển`);
            }
          }
        }
        // 8. Saturn
        else if ((pA.body === 'saturn' && ['sun', 'moon', 'venus'].includes(pB.body)) || (pB.body === 'saturn' && ['sun', 'moon', 'venus'].includes(pA.body))) {
          if (!detectedPairs.has(`saturn-${pairKey}`)) {
            detectedPairs.add(`saturn-${pairKey}`);
            if (harmonic) {
              totalAspectScore += Math.round(6 * orbWeight);
              westernInsights.push(`Thổ Tinh che chở ${nameVi}: Nền tảng cam kết vững chắc, trung thành`);
            } else {
              totalAspectScore -= Math.round(5 * orbWeight);
              westernInsights.push(`Thổ Tinh áp lực ${nameVi}: Tránh tạo cảm giác gò bó hay khắt khe`);
            }
          }
        }
      }
    }

    // House Overlays (Person A in Person B's Houses)
    const bCusps = profileB.westernContext?.houses?.cusps;
    if (bCusps && bCusps.length === 12) {
      const aSun = aPlanets.find(p => p.body === 'sun');
      const aMoon = aPlanets.find(p => p.body === 'moon');
      const aVenus = aPlanets.find(p => p.body === 'venus');
      
      if (aSun) {
        const h = getHouseFromLongitude(aSun.tropicalLongitude, bCusps);
        houseOverlays.push({ planet: 'Mặt Trời (A)', house: h, desc: h === 7 ? 'Chiếu Cung 7: Đối tác & Người thương lý tưởng' : h === 5 ? 'Chiếu Cung 5: Tình yêu & Thăng hoa lãng mạn' : h === 4 ? 'Chiếu Cung 4: Cảm giác ấm áp như gia đình' : `Chiếu Cung ${h}` });
      }
      if (aMoon) {
        const h = getHouseFromLongitude(aMoon.tropicalLongitude, bCusps);
        houseOverlays.push({ planet: 'Mặt Trăng (A)', house: h, desc: h === 7 ? 'Chiếu Cung 7: Thấu cảm tâm tư bạn đời' : h === 4 ? 'Chiếu Cung 4: Chốn về bình yên, gắn kết tổ ấm' : h === 8 ? 'Chiếu Cung 8: Liên kết cảm xúc sâu sắc' : `Chiếu Cung ${h}` });
      }
      if (aVenus) {
        const h = getHouseFromLongitude(aVenus.tropicalLongitude, bCusps);
        houseOverlays.push({ planet: 'Kim Tinh (A)', house: h, desc: h === 7 ? 'Chiếu Cung 7: Duyên lành yêu thương gắn kết' : h === 5 ? 'Chiếu Cung 5: Niềm vui và đam mê ngọt ngào' : `Chiếu Cung ${h}` });
      }
    }

    westernScore = Math.max(0, Math.min(100, totalAspectScore));
    if (westernInsights.length === 0) {
      westernInsights.push(`Điểm góc chiếu tổng hợp: ${westernScore}/100 (Các hành tinh ở thế cân bằng)`);
    }
  } else if (westernSynastryData) {
    westernScore = westernSynastryData.score || 0;
    westernInsights.push(...(westernSynastryData.aspects || []));
  }

  // ══════════════════════════════════════════════════════════
  // 3. Vệ Đà / Ashtakoot & Manglik Dosha (Vedic Synastry)
  // ══════════════════════════════════════════════════════════
  let vedicScore = 0; 
  const vedicInsights = [];
  let ashtakootBreakdown = {};
  let pariharasList = [];
  let manglikStatus = { isCompatible: true, label: "Hài hòa", details: [] };

  if (profileA.vedicContext && profileB.vedicContext) {
    const ashtakoot = computeAshtakoot(
      profileA.vedicContext.moonSiderealLongitude || 0,
      profileB.vedicContext.moonSiderealLongitude || 0
    );
    ashtakootBreakdown = ashtakoot.breakdown || {};
    pariharasList = ashtakoot.pariharas || [];
    vedicScore = Math.round((ashtakoot.score / 36) * 100);

    const verdictLabel = ashtakoot.score >= 28 ? "Đại cát" : ashtakoot.score >= 20 ? "Tốt" : ashtakoot.score >= 18 ? "Khá" : "Cần hóa giải";
    vedicInsights.push(`Ashtakoot Guna Milan: ${ashtakoot.score}/36 điểm (${verdictLabel})`);
    vedicInsights.push(`Tâm hồn (Varna): ${ashtakootBreakdown.varna ?? 0}/1, Sức hút (Vashya): ${ashtakootBreakdown.vashya ?? 0}/2`);
    vedicInsights.push(`Khí chất (Gana): ${ashtakootBreakdown.gana ?? 0}/6, Tình bạn (Graha Maitri): ${ashtakootBreakdown.grahaMaitri ?? 0}/5`);
    vedicInsights.push(`Gia đạo (Bhakoot): ${ashtakootBreakdown.bhakoot ?? 0}/7, Sức khỏe & Hậu duệ (Nadi): ${ashtakootBreakdown.nadi ?? 0}/8`);

    // Manglik Check
    const manglikA = profileA.vedicContext.manglik;
    const manglikB = profileB.vedicContext.manglik;
    if (manglikA && manglikB) {
      if (manglikA.isManglik && manglikB.isManglik) {
        manglikStatus = { isCompatible: true, label: "Đồng hóa giải", details: ["Cả hai cùng có Kuja Dosha -> Âm dương tự cân bằng"] };
        vedicInsights.push("Manglik Dosha: Cả hai cùng mang năng lượng Hỏa Tinh, tự nhiên tương hóa");
      } else if (!manglikA.isManglik && !manglikB.isManglik) {
        manglikStatus = { isCompatible: true, label: "Hài hòa", details: ["Không bị ảnh hưởng bởi sát khí Kuja Dosha"] };
        vedicInsights.push("Manglik Dosha: Cả hai đều không vướng sát khí Kuja Dosha");
      } else {
        const personWithDosha = manglikA.isManglik ? "Người A" : "Người B";
        manglikStatus = { isCompatible: false, label: "Cần chú ý", details: [`${personWithDosha} mang Kuja Dosha, cần bình tĩnh hóa giải trong giao tiếp`] };
        vedicInsights.push(`Manglik Dosha: ${personWithDosha} có năng lượng Hỏa Tinh mạnh, cần nhường nhịn khi nóng giận`);
      }
    }
  } else if (vedicSynastryData) {
    vedicScore = Math.round(((vedicSynastryData.ashtakootScore || 0) / 36) * 100);
    vedicInsights.push(`Ashtakoot Score: ${vedicSynastryData.ashtakootScore || 0}/36`);
  }

  // ══════════════════════════════════════════════════════════
  // 4. Multi-Dimensional Synthesis (5 Relational Vectors)
  // ══════════════════════════════════════════════════════════
  const emotionalScore = Math.round((vedicScore * 0.4 + (ashtakootBreakdown.varna ? 100 : 70) * 0.3 + (westernScore * 0.3)));
  const chemistryScore = Math.round(((ashtakootBreakdown.yoni ? (ashtakootBreakdown.yoni / 4) * 100 : 70) * 0.4 + westernScore * 0.6));
  const intellectScore = Math.round(((ashtakootBreakdown.maitri ? (ashtakootBreakdown.maitri / 5) * 100 : 75) * 0.5 + (tuViScore * 0.5)));
  const stabilityScore = Math.round(((ashtakootBreakdown.nadi ? (ashtakootBreakdown.nadi / 8) * 100 : 75) * 0.4 + tuViScore * 0.6));
  const complementScore = Math.round((tuViScore * 0.5 + westernScore * 0.3 + (batTrachResult?.isCat ? 20 : 0)));

  const dimensions = {
    emotional: {
      score: Math.min(100, Math.max(0, emotionalScore)),
      label: "Tâm Hồn & Cảm Xúc",
      details: ["Thấu hiểu trực giác", "Đồng điệu cảm xúc Mặt Trăng", "An toàn tâm lý"]
    },
    chemistry: {
      score: Math.min(100, Math.max(0, chemistryScore)),
      label: "Tình Cảm & Hấp Dẫn",
      details: ["Sức hút nam nữ", "Gắn kết lãng mạn Kim - Hỏa", "Sự quyến rũ Yoni"]
    },
    intellect: {
      score: Math.min(100, Math.max(0, intellectScore)),
      label: "Trí Tuệ & Giao Tiếp",
      details: ["Đồng điệu quan điểm sống", "Tình bạn Graha Maitri", "Dễ thảo luận mục tiêu"]
    },
    stability: {
      score: Math.min(100, Math.max(0, stabilityScore)),
      label: "Gia Đạo & Bền Vững",
      details: ["Trụ Ngày vững chắc", "Cam kết hôn nhân lâu dài", "Sức khỏe & hậu duệ Nadi"]
    },
    complement: {
      score: Math.min(100, Math.max(0, complementScore)),
      label: "Bổ Trợ & Vận Hạn",
      details: ["Cung Phi Bát Trạch hòa hợp", "Bù trừ Ngũ Hành", "Nâng đỡ sự nghiệp"]
    }
  };

  // Weighted Combination Score
  const combinedScore = Math.round(
    dimensions.emotional.score * 0.25 +
    dimensions.chemistry.score * 0.25 +
    dimensions.intellect.score * 0.20 +
    dimensions.stability.score * 0.20 +
    dimensions.complement.score * 0.10
  );

  // Constructive Relationship Guidance
  const advice = [];
  if (combinedScore >= 75) {
    advice.push("Hai bạn sở hữu nền tảng hòa hợp rất cao trên cả 3 trụ cột Đông - Tây - Vệ Đà. Hãy tiếp tục phát huy sự tin tưởng và đồng hành chia sẻ.");
  } else if (combinedScore >= 55) {
    advice.push("Mối quan hệ có nhiều điểm sáng về cảm xúc và sự thu hút. Khi gặp bất đồng quan điểm, hãy lắng nghe chân thành thay vì cố gắng phân định thắng thua.");
  } else {
    advice.push("Hai bạn mang nhiều nét tính cách khác biệt tạo nên thử thách. Sự nhẫn nại, tôn trọng không gian riêng và lắng nghe không phán xét chính là chìa khóa vàng để chuyển hóa mối duyên này.");
  }

  if (pariharasList.length > 0) {
    advice.push(`Điểm sáng Vệ Đà: Đã hóa giải các yếu tố kiêng kỵ (${pariharasList.map(p => p.rule).join("; ")}).`);
  }

  return {
    combinedScore,
    dimensions,
    advice,
    engines: {
      tuVi: {
        score: tuViScore,
        insights: tuViInsights,
        batTrach: batTrachResult
      },
      western: {
        score: westernScore,
        insights: westernInsights,
        houseOverlays
      },
      vedic: {
        score: vedicScore,
        insights: vedicInsights,
        rawBreakdown: ashtakootBreakdown,
        pariharas: pariharasList,
        manglik: manglikStatus
      }
    }
  };
}
