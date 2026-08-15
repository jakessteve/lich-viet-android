import { resolveTuViBirthContext, createTuViStarChart, getNapAmIndex, NAP_AM_NAMES } from "./tuvi.js";
import { getLunarDate } from "./calendar.js";
import { normalizeDegrees, computeTopocentricPlanetarySnapshot } from "./astronomy.js";
import { computeVimshottariDasha, computeAshtakoot } from "./vedic.js";

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
  
  const moon = snapshot.find(b => b.body === "moon");
  const sun = snapshot.find(b => b.body === "sun");

  // We bootstrap the eastern/TuVi layer.
  // The Vedic and Western layers are now also bootstrapped dynamically using the native astronomy pipeline.
  
    const fullTuViChart = createTuViStarChart({
      yearCanIndex: (lunarDate.year + 6) % 10,
      yearChiIndex: ((lunarDate.year - 4) % 12 + 12) % 12,
      lunarMonth: lunarDate.month,
      lunarDay: lunarDate.day,
      birthHour: tuViContext.hourBranchIndex,
      gender: gender
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
        moonNakshatraIndex: moon && moon.nakshatra ? moon.nakshatra.index : undefined
      },
      westernContext: {
        sunTropicalLongitude: sun ? sun.tropicalLongitude : 0,
        moonTropicalLongitude: moon ? moon.tropicalLongitude : 0,
        planets: snapshot // Include all planets for dynamic western synastry
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

  // Aggregate predictive systems across engines for a given year
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

const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

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

export function calculateSynastry(profileA, profileB, westernSynastryData, vedicSynastryData) {
  // ══════════════════════════════════════════════════════════
  // 1. Á Đông / Tử Vi & Bát Tự Hợp Hôn (Eastern Synastry)
  // ══════════════════════════════════════════════════════════
  let tuViScore = 40; // Base neutral score
  const tuViInsights = [];
  
  if (profileA.tuViContext && profileB.tuViContext) {
    const aCan = profileA.tuViContext.yearCanIndex;
    const bCan = profileB.tuViContext.yearCanIndex;
    const aChi = profileA.tuViContext.yearBranchIndex;
    const bChi = profileB.tuViContext.yearBranchIndex;

    // A. Nạp Âm Ngũ Hành năm sinh
    if (aCan !== undefined && aChi !== undefined && bCan !== undefined && bChi !== undefined) {
      const aNapAm = getNapAmName(aCan, aChi);
      const bNapAm = getNapAmName(bCan, bChi);
      const aElem = getElementFromNapAm(aNapAm);
      const bElem = getElementFromNapAm(bNapAm);

      if (aElem && bElem) {
        if (aElem === bElem) {
          tuViScore += 10;
          tuViInsights.push(`Nạp Âm bình hòa (${aNapAm} & ${bNapAm}): Đồng hành tương trợ, hòa hợp tự nhiên`);
        } else if (ELEMENT_RELATIONS[aElem]?.sinh === bElem || ELEMENT_RELATIONS[bElem]?.sinh === aElem) {
          tuViScore += 15;
          tuViInsights.push(`Nạp Âm tương sinh (${aNapAm} - ${bNapAm}): Tương sinh nâng đỡ, vượng khí tài lộc`);
        } else if (ELEMENT_RELATIONS[aElem]?.khac === bElem || ELEMENT_RELATIONS[bElem]?.khac === aElem) {
          tuViScore -= 10;
          tuViInsights.push(`Nạp Âm tương khắc (${aNapAm} - ${bNapAm}): Cần nhường nhịn, chế hóa tính cách`);
        }
      }
    }

    // B. Thiên Can hợp/khắc
    if (aCan !== undefined && bCan !== undefined) {
      if (Math.abs(aCan - bCan) === 5) {
        tuViScore += 15;
        tuViInsights.push(`Thiên Can ngũ hợp (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]}): Duyên lành trời định (Rất tốt)`);
      } else if (aCan === bCan) {
        tuViScore += 8;
        tuViInsights.push(`Thiên Can đồng hành (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]}): Tương hòa chia sẻ`);
      } else if ((aCan + 4) % 10 === bCan || (bCan + 4) % 10 === aCan) {
        tuViScore -= 8;
        tuViInsights.push(`Thiên Can tương khắc (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]}): Khác biệt quan điểm sống`);
      } else {
        tuViScore += 5;
        tuViInsights.push(`Thiên Can bình hòa (${CAN_NAMES[aCan]} - ${CAN_NAMES[bCan]})`);
      }
    }

    // C. Địa Chi hợp/xung
    if (aChi !== undefined && bChi !== undefined) {
      if (Math.abs(aChi - bChi) === 4 || Math.abs(aChi - bChi) === 8) {
        tuViScore += 20;
        tuViInsights.push(`Địa Chi tam hợp (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Đại cát, gắn kết lý tưởng`);
      } else if ((aChi + bChi) % 12 === 1) {
        tuViScore += 15;
        tuViInsights.push(`Địa Chi lục hợp (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Quý nhân tương hợp, thấu hiểu mật thiết`);
      } else if (aChi === bChi) {
        tuViScore += 8;
        tuViInsights.push(`Địa Chi đồng chi (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Thấu hiểu thói quen của nhau`);
      } else if (Math.abs(aChi - bChi) === 6) {
        tuViScore -= 15;
        tuViInsights.push(`Địa Chi lục xung (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Dễ nảy sinh xung đột tính cách`);
      } else if ((aChi + bChi) % 12 === 7) {
        tuViScore -= 10;
        tuViInsights.push(`Địa Chi lục hại (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]}): Cần cẩn trọng trong giao tiếp gia đạo`);
      } else {
        tuViScore += 5;
        tuViInsights.push(`Địa Chi bình hòa (${CHI_NAMES[aChi]} - ${CHI_NAMES[bChi]})`);
      }
    }

    // D. Cung Phu Thê & Cung Mệnh
    if (profileA.tuViContext.phuThePalace && profileB.tuViContext.phuThePalace) {
      const aPhuTheStars = profileA.tuViContext.phuThePalace.chinhTinh.map(s => s.name);
      const bPhuTheStars = profileB.tuViContext.phuThePalace.chinhTinh.map(s => s.name);
      const intersection = aPhuTheStars.filter(s => bPhuTheStars.includes(s));
      if (intersection.length > 0) {
        tuViScore += 15;
        tuViInsights.push(`Cung Phu Thê tương phùng sao chính tinh: ${intersection.join(", ")} (Tương hợp bền vững)`);
      }
    }
  }
  
  tuViScore = Math.max(0, Math.min(100, tuViScore));

  // ══════════════════════════════════════════════════════════
  // 2. Tây Phương / Liên Góc Chiếu Inter-Aspects (Western Synastry)
  // ══════════════════════════════════════════════════════════
  let westernScore = 0;
  const westernInsights = [];
  
  if (profileA.westernContext?.planets && profileB.westernContext?.planets) {
    const importantBodies = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn"];
    const aPlanets = profileA.westernContext.planets.filter(p => importantBodies.includes(p.body));
    const bPlanets = profileB.westernContext.planets.filter(p => importantBodies.includes(p.body));
    
    let totalAspectScore = 45; // Neutral base score
    const detectedPairs = new Set();

    for (const pA of aPlanets) {
      for (const pB of bPlanets) {
        const diff = Math.abs(normalizeDegrees(pA.tropicalLongitude - pB.tropicalLongitude));
        const minDiff = Math.min(diff, 360 - diff);
        const pairKey = [pA.body, pB.body].sort().join('-');

        const checkAspect = (targetAngle, maxOrb, nameVi, harmonic) => {
          const orb = Math.abs(minDiff - targetAngle);
          if (orb <= maxOrb) {
            const orbWeight = 1 - orb / maxOrb; // 1.0 (exact) down to 0.0 (wide)
            return { matched: true, orbWeight, orb, nameVi, harmonic };
          }
          return { matched: false, orbWeight: 0, orb: 0, nameVi: '', harmonic: true };
        };

        // Aspect definitions with academic orb limits
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
              totalAspectScore += Math.round(12 * orbWeight);
              westernInsights.push(`Mặt Trời - Mặt Trăng ${nameVi} (${pA.body === 'sun' ? 'A-B' : 'B-A'}): Đồng điệu tâm hồn sâu sắc & thấu cảm`);
            } else {
              totalAspectScore -= Math.round(6 * orbWeight);
              westernInsights.push(`Mặt Trời - Mặt Trăng ${nameVi}: Cần học cách dung hòa nhịp sống và thói quen`);
            }
          }
        }

        // 2. Venus - Mars (Passionate romantic chemistry)
        else if ((pA.body === 'venus' && pB.body === 'mars') || (pA.body === 'mars' && pB.body === 'venus')) {
          if (!detectedPairs.has('venus-mars')) {
            detectedPairs.add('venus-mars');
            if (activeAspect === opp) {
              totalAspectScore += Math.round(7 * orbWeight);
              westernInsights.push(`Kim Tinh - Hỏa Tinh Đối đỉnh: Sức hút nam nữ mãnh liệt (Vừa đối lập vừa thu hút)`);
            } else if (harmonic) {
              totalAspectScore += Math.round(10 * orbWeight);
              westernInsights.push(`Kim Tinh - Hỏa Tinh ${nameVi}: Sức hút tình cảm và đam mê hòa hợp lý tưởng`);
            } else {
              totalAspectScore -= Math.round(4 * orbWeight);
              westernInsights.push(`Kim Tinh - Hỏa Tinh Vuông góc: Cảm xúc nồng nhiệt nhưng dễ va chạm cái tôi`);
            }
          }
        }

        // 3. Sun - Venus (Mutual adoration & warmth)
        else if ((pA.body === 'sun' && pB.body === 'venus') || (pA.body === 'venus' && pB.body === 'sun')) {
          if (!detectedPairs.has('sun-venus')) {
            detectedPairs.add('sun-venus');
            if (harmonic) {
              totalAspectScore += Math.round(8 * orbWeight);
              westernInsights.push(`Mặt Trời - Kim Tinh ${nameVi}: Trân quý, yêu thương và tạo cảm giác ấm áp`);
            }
          }
        }

        // 4. Moon - Venus (Affection & emotional ease)
        else if ((pA.body === 'moon' && pB.body === 'venus') || (pA.body === 'venus' && pB.body === 'moon')) {
          if (!detectedPairs.has('moon-venus')) {
            detectedPairs.add('moon-venus');
            if (harmonic) {
              totalAspectScore += Math.round(8 * orbWeight);
              westernInsights.push(`Mặt Trăng - Kim Tinh ${nameVi}: Dịu dàng, an tâm và gắn kết êm ấm`);
            }
          }
        }

        // 5. Moon - Moon (Emotional resonance)
        else if (pA.body === 'moon' && pB.body === 'moon') {
          if (!detectedPairs.has('moon-moon')) {
            detectedPairs.add('moon-moon');
            if (harmonic) {
              totalAspectScore += Math.round(8 * orbWeight);
              westernInsights.push(`Mặt Trăng - Mặt Trăng ${nameVi}: Thấu hiểu cảm xúc tự nhiên, dễ chia sẻ`);
            } else {
              totalAspectScore -= Math.round(5 * orbWeight);
              westernInsights.push(`Mặt Trăng - Mặt Trăng ${nameVi}: Cách biểu đạt cảm xúc và nhu cầu an toàn khác biệt`);
            }
          }
        }

        // 6. Jupiter (Growth & optimism)
        else if ((pA.body === 'jupiter' && ['sun', 'moon', 'venus'].includes(pB.body)) || (pB.body === 'jupiter' && ['sun', 'moon', 'venus'].includes(pA.body))) {
          if (!detectedPairs.has(`jupiter-${pairKey}`)) {
            detectedPairs.add(`jupiter-${pairKey}`);
            if (harmonic) {
              totalAspectScore += Math.round(6 * orbWeight);
              westernInsights.push(`Mộc Tinh tương trợ ${nameVi}: Đem lại may mắn, sự bao dung và phát triển`);
            }
          }
        }

        // 7. Saturn (Loyalty & commitment)
        else if ((pA.body === 'saturn' && ['sun', 'moon', 'venus'].includes(pB.body)) || (pB.body === 'saturn' && ['sun', 'moon', 'venus'].includes(pA.body))) {
          if (!detectedPairs.has(`saturn-${pairKey}`)) {
            detectedPairs.add(`saturn-${pairKey}`);
            if (harmonic) {
              totalAspectScore += Math.round(6 * orbWeight);
              westernInsights.push(`Thổ Tinh che chở ${nameVi}: Nền tảng cam kết vững chắc, trung thành`);
            } else {
              totalAspectScore -= Math.round(5 * orbWeight);
              westernInsights.push(`Thổ Tinh áp lực ${nameVi}: Cần tránh tạo cảm giác gò bó hay khắt khe`);
            }
          }
        }
      }
    }

    westernScore = Math.max(0, Math.min(100, totalAspectScore));
    if (westernInsights.length === 0) {
      westernInsights.push(`Điểm góc chiếu tổng hợp: ${westernScore}/100 (Các hành tinh ở thế cân bằng tương đối)`);
    }
  } else if (westernSynastryData) {
    westernScore = westernSynastryData.score || 0;
    westernInsights.push(...(westernSynastryData.aspects || []));
  }

  // ══════════════════════════════════════════════════════════
  // 3. Vệ Đà / 8 Tiêu Chí Ashtakoot Guna Milan (Vedic Synastry)
  // ══════════════════════════════════════════════════════════
  let vedicScore = 0; 
  const vedicInsights = [];
  let ashtakootBreakdown = {};

  if (profileA.vedicContext && profileB.vedicContext) {
    const ashtakoot = computeAshtakoot(
      profileA.vedicContext.moonSiderealLongitude || 0,
      profileB.vedicContext.moonSiderealLongitude || 0
    );
    ashtakootBreakdown = ashtakoot.breakdown || {};
    vedicScore = Math.round((ashtakoot.score / 36) * 100);

    const verdictLabel = ashtakoot.score >= 28 ? "Đại cát" : ashtakoot.score >= 20 ? "Tốt" : ashtakoot.score >= 18 ? "Khá" : "Cần hóa giải";
    vedicInsights.push(`Ashtakoot: ${ashtakoot.score}/36 điểm (${verdictLabel})`);
    vedicInsights.push(`Tâm hồn (Varna): ${ashtakootBreakdown.varna ?? 0}/1, Sức hút (Vashya): ${ashtakootBreakdown.vashya ?? 0}/2`);
    vedicInsights.push(`Khí chất (Gana): ${ashtakootBreakdown.gana ?? 0}/6, Tình bạn (Graha Maitri): ${ashtakootBreakdown.grahaMaitri ?? 0}/5`);
    vedicInsights.push(`Gia đạo (Bhakoot): ${ashtakootBreakdown.bhakoot ?? 0}/7, Sức khỏe & Con cái (Nadi): ${ashtakootBreakdown.nadi ?? 0}/8`);
  } else if (vedicSynastryData) {
    vedicScore = Math.round(((vedicSynastryData.ashtakootScore || 0) / 36) * 100);
    vedicInsights.push(`Ashtakoot Score: ${vedicSynastryData.ashtakootScore || 0}/36`);
  }

  // Combine scores
  const combinedScore = Math.round((tuViScore + westernScore + vedicScore) / 3);

  return {
    combinedScore,
    engines: {
      tuVi: {
        score: tuViScore,
        insights: tuViInsights
      },
      western: {
        score: westernScore,
        insights: westernInsights
      },
      vedic: {
        score: vedicScore,
        insights: vedicInsights,
        rawBreakdown: ashtakootBreakdown
      }
    }
  };
}

