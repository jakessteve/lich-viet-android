import { resolveTuViBirthContext, createTuViStarChart } from "./tuvi.js";
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

export function calculateSynastry(profileA, profileB, westernSynastryData, vedicSynastryData) {
  // 1. Tu Vi Synastry logic
  let tuViScore = 40; // Base neutral starting point derived dynamically from interactions
  const tuViInsights = [];
  
  if (profileA.tuViContext && profileB.tuViContext) {
    const aCan = profileA.tuViContext.yearCanIndex;
    const bCan = profileB.tuViContext.yearCanIndex;
    const aChi = profileA.tuViContext.yearBranchIndex;
    const bChi = profileB.tuViContext.yearBranchIndex;

    // Can compatibility
    if (aCan !== undefined && bCan !== undefined) {
      if (aCan === bCan) {
        tuViScore += 10;
        tuViInsights.push("Thiên Can tương hòa (cùng Can)");
      } else if (Math.abs(aCan - bCan) === 5) {
        tuViScore += 15;
        tuViInsights.push("Thiên Can tương hợp (Tốt)");
      } else if ((aCan + 4) % 10 === bCan || (bCan + 4) % 10 === aCan) {
        tuViScore -= 10;
        tuViInsights.push("Thiên Can tương khắc (Xấu)");
      } else {
        tuViScore += 5;
        tuViInsights.push("Thiên Can bình hòa");
      }
    }

    // Chi compatibility
    if (aChi !== undefined && bChi !== undefined) {
      if (aChi === bChi) {
        tuViScore += 10;
        tuViInsights.push("Địa Chi tương đồng");
      } else if (Math.abs(aChi - bChi) === 6) {
        tuViScore -= 15;
        tuViInsights.push("Địa Chi lục xung (Rất xấu)");
      } else if ((aChi + bChi) % 12 === 1) {
        tuViScore += 15;
        tuViInsights.push("Địa Chi lục hợp (Rất tốt)");
      } else if (Math.abs(aChi - bChi) === 4 || Math.abs(aChi - bChi) === 8) {
        tuViScore += 20;
        tuViInsights.push("Địa Chi tam hợp (Đại cát)");
      } else if ((aChi + bChi) % 12 === 7) {
        tuViScore -= 10;
        tuViInsights.push("Địa Chi lục hại (Xấu)");
      } else {
        tuViScore += 5;
        tuViInsights.push("Địa Chi bình hòa");
      }
    }

    // Phu The Palace compatibility
    if (profileA.tuViContext.phuThePalace && profileB.tuViContext.phuThePalace) {
      const aPhuTheStars = profileA.tuViContext.phuThePalace.chinhTinh.map(s => s.name);
      const bPhuTheStars = profileB.tuViContext.phuThePalace.chinhTinh.map(s => s.name);
      
      const intersection = aPhuTheStars.filter(s => bPhuTheStars.includes(s));
      if (intersection.length > 0) {
        tuViScore += 20;
        tuViInsights.push(`Cung Phu Thê có sao tương phùng: ${intersection.join(", ")} (Rất tốt)`);
      } else {
        tuViInsights.push("Cung Phu Thê không có sao chính tinh trùng khớp.");
      }
    }
    
    // Mệnh Palace element matching (if available)
    if (profileA.tuViContext.chart && profileB.tuViContext.chart) {
       const aMenh = profileA.tuViContext.chart.palaces.find(p => p.name === "Mệnh");
       const bMenh = profileB.tuViContext.chart.palaces.find(p => p.name === "Mệnh");
       if (aMenh && bMenh && aMenh.canChi && bMenh.canChi) {
         if (aMenh.canChi === bMenh.canChi) {
           tuViScore += 10;
           tuViInsights.push("Mệnh cung tương đồng (Khá)");
         }
       }
    }
  }
  
  tuViScore = Math.max(0, Math.min(100, tuViScore));

  // 2. Western Synastry logic (Inter-aspects, composite chart)
  let westernScore = 0;
  const westernInsights = [];
  
  if (profileA.westernContext?.planets && profileB.westernContext?.planets) {
    const importantBodies = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn"];
    const aPlanets = profileA.westernContext.planets.filter(p => importantBodies.includes(p.body));
    const bPlanets = profileB.westernContext.planets.filter(p => importantBodies.includes(p.body));
    
    let totalAspectScore = 40; // Dynamic neutral base
    for (const pA of aPlanets) {
      for (const pB of bPlanets) {
        const diff = Math.abs(normalizeDegrees(pA.tropicalLongitude - pB.tropicalLongitude));
        const minDiff = Math.min(diff, 360 - diff);
        
        if (minDiff < 5) {
          totalAspectScore += (pA.body === 'sun' || pA.body === 'moon') ? 8 : 4;
          if (pA.body === 'sun' && pB.body === 'moon') westernInsights.push("Sun-Moon Conjunction (Strong emotional bond)");
          if (pA.body === 'venus' && pB.body === 'mars') westernInsights.push("Venus-Mars Conjunction (Passionate connection)");
        } else if (Math.abs(minDiff - 120) < 5) {
          totalAspectScore += (pA.body === 'sun' || pA.body === 'moon') ? 6 : 3;
          if (pA.body === 'sun' && pB.body === 'moon') westernInsights.push("Sun-Moon Trine (Harmonious relationship)");
        } else if (Math.abs(minDiff - 60) < 5) {
          totalAspectScore += 2;
        } else if (Math.abs(minDiff - 90) < 5) {
          totalAspectScore -= (pA.body === 'sun' || pA.body === 'moon') ? 5 : 2;
        } else if (Math.abs(minDiff - 180) < 5) {
          totalAspectScore -= (pA.body === 'sun' || pA.body === 'moon') ? 6 : 3;
        }
      }
    }
    westernScore = Math.max(0, Math.min(100, totalAspectScore));
    if (westernInsights.length === 0) {
      westernInsights.push(`Dynamic geometric aspect score: ${westernScore}`);
    }
  } else if (westernSynastryData) {
    westernScore = westernSynastryData.score || 0;
    westernInsights.push(...(westernSynastryData.aspects || []));
  }

  // 3. Vedic Synastry logic (Ashtakoot Gunas)
  let vedicScore = 0; 
  const vedicInsights = [];
  if (profileA.vedicContext && profileB.vedicContext) {
    const ashtakoot = computeAshtakoot(
      profileA.vedicContext.moonSiderealLongitude || 0,
      profileB.vedicContext.moonSiderealLongitude || 0
    );
    vedicScore = (ashtakoot.score / 36) * 100;
    vedicInsights.push(`Ashtakoot Score: ${ashtakoot.score}/36`);
    vedicInsights.push(`Nadi: ${ashtakoot.breakdown.nadi}/8, Bhakoot: ${ashtakoot.breakdown.bhakoot}/7`);
  } else if (vedicSynastryData) {
    vedicScore = ((vedicSynastryData.ashtakootScore || 0) / 36) * 100;
    vedicInsights.push(`Ashtakoot Score: ${vedicSynastryData.ashtakootScore || 0}/36 (fallback)`);
  }

  // Combine scores
  const combinedScore = (tuViScore + westernScore + vedicScore) / 3;

  return {
    combinedScore: Math.round(combinedScore),
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
        score: Math.round(vedicScore),
        insights: vedicInsights,
        rawBreakdown: profileA.vedicContext && profileB.vedicContext ? computeAshtakoot(profileA.vedicContext.moonSiderealLongitude || 0, profileB.vedicContext.moonSiderealLongitude || 0).breakdown : {}
      }
    }
  };
}
