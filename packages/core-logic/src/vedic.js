import { normalizeDegrees } from "./astronomy.js";

const DASHA_SEQUENCE = [
  { lord: "ketu", years: 7 },
  { lord: "venus", years: 20 },
  { lord: "sun", years: 6 },
  { lord: "moon", years: 10 },
  { lord: "mars", years: 7 },
  { lord: "rahu", years: 18 },
  { lord: "jupiter", years: 16 },
  { lord: "saturn", years: 19 },
  { lord: "mercury", years: 17 }
];

export const SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces"
];

export function computeHora(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const isOdd = sign % 2 === 0;
  const d2Sign = isOdd ? (deg < 15 ? 4 : 3) : (deg < 15 ? 3 : 4);
  return SIGNS[d2Sign];
}

export function computeDrekkana(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const decan = Math.floor(deg / 10);
  const d3Sign = (sign + decan * 4) % 12;
  return SIGNS[d3Sign];
}

export function computeChaturthamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 7.5);
  const d4Sign = (sign + part * 3) % 12;
  return SIGNS[d4Sign];
}

export function computeSaptamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / (30 / 7));
  const isOdd = sign % 2 === 0;
  const d7Sign = isOdd ? (sign + part) % 12 : (sign + 6 + part) % 12;
  return SIGNS[d7Sign];
}

export function computeNavamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const degreeInSign = normLon % 30;
  const navamshaIndex = Math.floor(degreeInSign / (30 / 9)); 
  
  let startingSign;
  // Navamsha mapping mathematically groups signs by element:
  // Fire signs (Aries, Leo, Sag) -> sign % 4 === 0 -> starts from Aries (0)
  // Earth signs (Taurus, Virgo, Cap) -> sign % 4 === 1 -> starts from Capricorn (9)
  // Air signs (Gemini, Libra, Aqua) -> sign % 4 === 2 -> starts from Libra (6)
  // Water signs (Cancer, Scorpio, Pisces) -> sign % 4 === 3 -> starts from Cancer (3)
  if (sign % 4 === 0) startingSign = 0; 
  else if (sign % 4 === 1) startingSign = 9; 
  else if (sign % 4 === 2) startingSign = 6; 
  else startingSign = 3; 

  const d9Sign = (startingSign + navamshaIndex) % 12;
  return SIGNS[d9Sign];
}

export function computeDashamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 3);
  const isOdd = sign % 2 === 0;
  const d10Sign = isOdd ? (sign + part) % 12 : (sign + 8 + part) % 12;
  return SIGNS[d10Sign];
}

export function computeDvadashamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 2.5);
  const d12Sign = (sign + part) % 12;
  return SIGNS[d12Sign];
}

export function computeShodashamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / (30 / 16));
  const signMod3 = sign % 3;
  const start = signMod3 === 0 ? 0 : (signMod3 === 1 ? 4 : 8);
  const d16Sign = (start + part) % 12;
  return SIGNS[d16Sign];
}

export function computeVimshamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 1.5);
  const signMod3 = sign % 3;
  const start = signMod3 === 0 ? 0 : (signMod3 === 1 ? 8 : 4);
  const d20Sign = (start + part) % 12;
  return SIGNS[d20Sign];
}

export function computeChaturvimshamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 1.25);
  const isOdd = sign % 2 === 0;
  const start = isOdd ? 4 : 3;
  const d24Sign = (start + part) % 12;
  return SIGNS[d24Sign];
}

export function computeSaptavimshamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / (30 / 27));
  const signMod4 = sign % 4;
  const start = signMod4 === 0 ? 0 : (signMod4 === 1 ? 3 : (signMod4 === 2 ? 6 : 9));
  const d27Sign = (start + part) % 12;
  return SIGNS[d27Sign];
}

export function computeTrimsamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const isOdd = sign % 2 === 0;
  let d30Sign;
  if (isOdd) {
    if (deg < 5) d30Sign = 0;
    else if (deg < 10) d30Sign = 10;
    else if (deg < 18) d30Sign = 8;
    else if (deg < 25) d30Sign = 2;
    else d30Sign = 6;
  } else {
    if (deg < 5) d30Sign = 1;
    else if (deg < 12) d30Sign = 5;
    else if (deg < 20) d30Sign = 11;
    else if (deg < 25) d30Sign = 9;
    else d30Sign = 7;
  }
  return SIGNS[d30Sign];
}

export function computeKhavedamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 0.75);
  const isOdd = sign % 2 === 0;
  const start = isOdd ? 0 : 6;
  const d40Sign = (start + part) % 12;
  return SIGNS[d40Sign];
}

export function computeAkshavedamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / (30 / 45));
  const signMod3 = sign % 3;
  const start = signMod3 === 0 ? 0 : (signMod3 === 1 ? 4 : 8);
  const d45Sign = (start + part) % 12;
  return SIGNS[d45Sign];
}

export function computeShashtiamsha(siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const deg = normLon % 30;
  const part = Math.floor(deg / 0.5);
  const d60Sign = (sign + part) % 12;
  return SIGNS[d60Sign];
}

export function computeShodashavargaMap(siderealLongitude) {
  return {
    d1: SIGNS[Math.floor(normalizeDegrees(siderealLongitude) / 30)],
    d2: computeHora(siderealLongitude),
    d3: computeDrekkana(siderealLongitude),
    d4: computeChaturthamsha(siderealLongitude),
    d7: computeSaptamsha(siderealLongitude),
    d9: computeNavamsha(siderealLongitude),
    d10: computeDashamsha(siderealLongitude),
    d12: computeDvadashamsha(siderealLongitude),
    d16: computeShodashamsha(siderealLongitude),
    d20: computeVimshamsha(siderealLongitude),
    d24: computeChaturvimshamsha(siderealLongitude),
    d27: computeSaptavimshamsha(siderealLongitude),
    d30: computeTrimsamsha(siderealLongitude),
    d40: computeKhavedamsha(siderealLongitude),
    d45: computeAkshavedamsha(siderealLongitude),
    d60: computeShashtiamsha(siderealLongitude),
  };
}

export function computeVimshottariDasha(moonSidereal, birthJulianDay, birthYear) {
  const normMoon = normalizeDegrees(moonSidereal);
  const nakshatraExact = normMoon / (360 / 27);
  const nakshatraIndex = Math.floor(nakshatraExact);
  const fractionPassed = nakshatraExact - nakshatraIndex;
  const fractionRemaining = 1 - fractionPassed;

  const startingLordIndex = nakshatraIndex % 9;
  const startingDasha = DASHA_SEQUENCE[startingLordIndex];
  
  const balanceYears = startingDasha.years * fractionRemaining;
  
  const dashas = [];
  let currentYear = birthYear;
  
  dashas.push({
    lord: startingDasha.lord,
    startYear: currentYear,
    endYear: currentYear + balanceYears,
    duration: balanceYears
  });
  
  currentYear += balanceYears;
  
  for (let i = 1; i < 9; i++) {
    const nextLordIndex = (startingLordIndex + i) % 9;
    const nextDasha = DASHA_SEQUENCE[nextLordIndex];
    dashas.push({
      lord: nextDasha.lord,
      startYear: currentYear,
      endYear: currentYear + nextDasha.years,
      duration: nextDasha.years
    });
    currentYear += nextDasha.years;
  }
  
  return dashas;
}

export function computeVimshottariAntardashas(mahadashaLord, startYear, durationYears) {
  const mahadashaIndex = DASHA_SEQUENCE.findIndex((d) => d.lord === mahadashaLord);
  if (mahadashaIndex === -1) return [];

  const mahaYears = DASHA_SEQUENCE[mahadashaIndex].years;
  const antardashas = [];
  let currentStart = startYear;

  for (let i = 0; i < 9; i++) {
    const subLordIndex = (mahadashaIndex + i) % 9;
    const subDasha = DASHA_SEQUENCE[subLordIndex];
    const antardashaYears = (durationYears * subDasha.years) / 120;
    const endYear = currentStart + antardashaYears;
    antardashas.push({
      lord: subDasha.lord,
      startYear: currentStart,
      endYear,
      duration: antardashaYears,
    });
    currentStart = endYear;
  }
  return antardashas;
}

/**
 * Classical Parashara Ashtakavarga benefic point rules from natal positions.
 */
export const ASHTAKAVARGA_RULES = {
  sun: {
    sun: [1, 2, 4, 7, 8, 9, 10, 11],
    moon: [3, 6, 10, 11],
    mars: [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [3, 5, 6, 9, 10, 11, 12],
    jupiter: [5, 6, 9, 11],
    venus: [6, 7, 12],
    saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    ascendant: [3, 4, 6, 10, 11, 12],
  },
  moon: {
    sun: [3, 6, 7, 8, 10, 11],
    moon: [1, 3, 6, 7, 10, 11],
    mars: [2, 3, 5, 6, 9, 10, 11],
    mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    jupiter: [1, 4, 7, 8, 10, 11, 12],
    venus: [3, 4, 5, 7, 9, 10, 11],
    saturn: [3, 5, 6, 11],
    ascendant: [3, 6, 10, 11],
  },
  mars: {
    sun: [3, 5, 6, 10, 11],
    moon: [3, 6, 11],
    mars: [1, 2, 4, 7, 8, 10, 11],
    mercury: [3, 5, 6, 11],
    jupiter: [6, 10, 11, 12],
    venus: [6, 8, 11, 12],
    saturn: [1, 4, 7, 8, 9, 10, 11],
    ascendant: [1, 3, 6, 10, 11],
  },
  mercury: {
    sun: [5, 6, 9, 11, 12],
    moon: [2, 4, 6, 8, 10, 11],
    mars: [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    jupiter: [6, 8, 11, 12],
    venus: [1, 2, 3, 4, 5, 8, 9, 11],
    saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    ascendant: [1, 2, 4, 6, 8, 10, 11],
  },
  jupiter: {
    sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    moon: [2, 5, 7, 9, 11],
    mars: [1, 2, 4, 7, 8, 10, 11],
    mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    venus: [2, 5, 6, 9, 10, 11],
    saturn: [3, 5, 6, 12],
    ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  venus: {
    sun: [8, 11, 12],
    moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    mars: [3, 5, 6, 9, 11, 12],
    mercury: [3, 5, 6, 9, 11],
    jupiter: [5, 8, 9, 10, 11],
    venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    saturn: [3, 4, 5, 8, 9, 10, 11],
    ascendant: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  saturn: {
    sun: [1, 2, 4, 7, 8, 10, 11],
    moon: [3, 6, 11],
    mars: [3, 5, 6, 10, 11, 12],
    mercury: [6, 8, 9, 10, 11, 12],
    jupiter: [5, 6, 11, 12],
    venus: [6, 11, 12],
    saturn: [3, 5, 6, 11],
    ascendant: [1, 3, 4, 6, 10, 11],
  },
};

export function computeBhinnashtakavarga(planetSigns) {
  const bav = {};
  const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

  for (const targetPlanet of planets) {
    const rules = ASHTAKAVARGA_RULES[targetPlanet];
    const points = Array(12).fill(0);
    if (rules) {
      for (const [sourceBody, houses] of Object.entries(rules)) {
        const sourceSign = planetSigns[sourceBody];
        if (sourceSign !== undefined) {
          for (const h of houses) {
            const destSign = (sourceSign + h - 1) % 12;
            points[destSign] += 1;
          }
        }
      }
    }
    bav[targetPlanet] = points;
  }
  return bav;
}

export function computeSarvashtakavarga(bav) {
  const sav = Array(12).fill(0);
  for (const points of Object.values(bav)) {
    for (let i = 0; i < 12; i++) {
      sav[i] += points[i];
    }
  }
  return sav;
}

const NAKSHATRA_NADI = [
  "adi", "madhya", "antya", "antya", "madhya", "adi",
  "adi", "madhya", "antya", "antya", "madhya", "adi",
  "adi", "madhya", "antya", "antya", "madhya", "adi",
  "adi", "madhya", "antya", "antya", "madhya", "adi",
  "adi", "madhya", "antya"
];

const NAKSHATRA_GANA = [
  "deva", "manushya", "rakshasa", "manushya", "deva", "manushya",
  "deva", "deva", "rakshasa", "rakshasa", "manushya", "manushya",
  "deva", "rakshasa", "deva", "rakshasa", "deva", "rakshasa",
  "rakshasa", "manushya", "manushya", "deva", "rakshasa", "rakshasa",
  "manushya", "manushya", "deva"
];

const NAKSHATRA_YONI = [
  "horse", "elephant", "sheep", "serpent", "serpent", "dog",
  "cat", "sheep", "cat", "rat", "rat", "cow",
  "buffalo", "tiger", "buffalo", "tiger", "hare", "hare",
  "dog", "monkey", "mongoose", "monkey", "lion", "horse",
  "lion", "cow", "elephant"
];

const YONI_INDEX = { "horse": 0, "elephant": 1, "sheep": 2, "serpent": 3, "dog": 4, "cat": 5, "rat": 6, "cow": 7, "buffalo": 8, "tiger": 9, "hare": 10, "monkey": 11, "mongoose": 12, "lion": 13 };

const YONI_MATRIX = Array(14).fill(null).map(() => Array(14).fill(2));
for (let i = 0; i < 14; i++) YONI_MATRIX[i][i] = 4;
YONI_MATRIX[YONI_INDEX.cow][YONI_INDEX.tiger] = 1;
YONI_MATRIX[YONI_INDEX.tiger][YONI_INDEX.cow] = 1;
YONI_MATRIX[YONI_INDEX.serpent][YONI_INDEX.mongoose] = 0;
YONI_MATRIX[YONI_INDEX.mongoose][YONI_INDEX.serpent] = 0;
YONI_MATRIX[YONI_INDEX.dog][YONI_INDEX.hare] = 1;
YONI_MATRIX[YONI_INDEX.hare][YONI_INDEX.dog] = 1;
YONI_MATRIX[YONI_INDEX.cat][YONI_INDEX.rat] = 0;
YONI_MATRIX[YONI_INDEX.rat][YONI_INDEX.cat] = 0;

export function computeAshtakoot(moonSiderealA, moonSiderealB) {
  const nakA = Math.floor(normalizeDegrees(moonSiderealA) / (360 / 27));
  const nakB = Math.floor(normalizeDegrees(moonSiderealB) / (360 / 27));
  const rasiA = Math.floor(normalizeDegrees(moonSiderealA) / 30);
  const rasiB = Math.floor(normalizeDegrees(moonSiderealB) / 30);

  const varnaScore = rasiA === rasiB ? 1 : (rasiA % 4 <= rasiB % 4 ? 1 : 0);
  const vashyaScore = rasiA === rasiB ? 2 : 1;
  const taraA = (nakB - nakA + 27) % 27;
  const taraB = (nakA - nakB + 27) % 27;
  const taraScore = (taraA % 9 !== 2 && taraB % 9 !== 2) ? 3 : 1.5;
  
  const yoniA = YONI_INDEX[NAKSHATRA_YONI[nakA]];
  const yoniB = YONI_INDEX[NAKSHATRA_YONI[nakB]];
  const yoniScore = YONI_MATRIX[yoniA][yoniB];
  
  const RASI_LORDS = [
    "mars", "venus", "mercury", "moon", "sun", "mercury", 
    "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"
  ];
  const PLANETARY_FRIENDSHIP = {
    "sun": { "moon": 1, "mars": 1, "jupiter": 1, "mercury": 0, "venus": -1, "saturn": -1 },
    "moon": { "sun": 1, "mercury": 1, "mars": 0, "jupiter": 0, "venus": 0, "saturn": 0 },
    "mars": { "sun": 1, "moon": 1, "jupiter": 1, "venus": 0, "saturn": 0, "mercury": -1 },
    "mercury": { "sun": 1, "venus": 1, "mars": 0, "jupiter": 0, "saturn": 0, "moon": -1 },
    "jupiter": { "sun": 1, "moon": 1, "mars": 1, "saturn": 0, "mercury": -1, "venus": -1 },
    "venus": { "mercury": 1, "saturn": 1, "mars": 0, "jupiter": 0, "sun": -1, "moon": -1 },
    "saturn": { "mercury": 1, "venus": 1, "jupiter": 0, "sun": -1, "moon": -1, "mars": -1 }
  };
  const lordA = RASI_LORDS[rasiA];
  const lordB = RASI_LORDS[rasiB];
  
  let maitriScore = 0;
  if (lordA === lordB) {
    maitriScore = 5;
  } else {
    const relA = PLANETARY_FRIENDSHIP[lordA]?.[lordB] ?? 0;
    const relB = PLANETARY_FRIENDSHIP[lordB]?.[lordA] ?? 0;
    if (relA === 1 && relB === 1) maitriScore = 5;
    else if ((relA === 1 && relB === 0) || (relA === 0 && relB === 1)) maitriScore = 4;
    else if (relA === 0 && relB === 0) maitriScore = 3;
    else if ((relA === 1 && relB === -1) || (relA === -1 && relB === 1)) maitriScore = 1;
    else if ((relA === 0 && relB === -1) || (relA === -1 && relB === 0)) maitriScore = 0.5;
    else if (relA === -1 && relB === -1) maitriScore = 0;
  }
  
  const ganaA = NAKSHATRA_GANA[nakA];
  const ganaB = NAKSHATRA_GANA[nakB];
  let ganaScore = 0;
  if (ganaA === ganaB) ganaScore = 6;
  else if ((ganaA === "deva" && ganaB === "manushya") || (ganaB === "deva" && ganaA === "manushya")) ganaScore = 5;
  else if (ganaA === "deva" && ganaB === "rakshasa") ganaScore = 1;
  else ganaScore = 0;
  
  const distance = (rasiB - rasiA + 12) % 12 + 1;
  let bhakootScore = [1, 7, 3, 11, 4, 10].includes(distance) ? 7 : 0;
  
  const nadiA = NAKSHATRA_NADI[nakA];
  const nadiB = NAKSHATRA_NADI[nakB];
  let nadiScore = nadiA !== nadiB ? 8 : 0;

  // ══════════════════════════════════════════════════════════
  // Classical Dosha Pariharas (Exceptions & Cancellations)
  // ══════════════════════════════════════════════════════════
  const pariharas = [];

  // 1. Nadi Dosha Parihara: Canceled if same Rashi but different Nakshatra, or same lord
  if (nadiScore === 0) {
    if (rasiA === rasiB && nakA !== nakB) {
      pariharas.push({
        type: "nadi_dosha_cancelled",
        rule: "Đồng cung Rasi nhưng khác Nakshatra (Nadi Dosha được hóa giải)",
        scoreAdjustment: 8
      });
      nadiScore = 8;
    } else if (lordA === lordB && nakA !== nakB) {
      pariharas.push({
        type: "nadi_dosha_cancelled",
        rule: "Chủ tinh Rasi trùng nhau (Nadi Dosha được hóa giải)",
        scoreAdjustment: 8
      });
      nadiScore = 8;
    }
  }

  // 2. Bhakoot Dosha Parihara: Canceled if lords are same or mutual friends
  if (bhakootScore === 0) {
    if (lordA === lordB) {
      pariharas.push({
        type: "bhakoot_dosha_cancelled",
        rule: "Cùng chủ tinh cai quản (Bhakoot Dosha được hóa giải)",
        scoreAdjustment: 7
      });
      bhakootScore = 7;
    } else if (PLANETARY_FRIENDSHIP[lordA]?.[lordB] === 1 && PLANETARY_FRIENDSHIP[lordB]?.[lordA] === 1) {
      pariharas.push({
        type: "bhakoot_dosha_cancelled",
        rule: "Chủ tinh hai cung là bạn thân thiết (Bhakoot Dosha được hóa giải)",
        scoreAdjustment: 7
      });
      bhakootScore = 7;
    }
  }

  // 3. Gana Dosha Mitigation: Mitigated if Graha Maitri >= 4 and Nadi > 0
  if (ganaScore <= 1 && maitriScore >= 4 && nadiScore > 0) {
    pariharas.push({
      type: "gana_dosha_mitigated",
      rule: "Tình bạn Graha Maitri cao bù đắp khác biệt Gana",
      scoreAdjustment: 3
    });
    ganaScore = Math.max(ganaScore, 3);
  }

  const rawTotal = varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;
  const clampedTotal = Math.max(0, Math.min(36, rawTotal));
  
  return {
    score: clampedTotal,
    outOf: 36,
    breakdown: {
      varna: varnaScore,
      vashya: vashyaScore,
      tara: taraScore,
      yoni: yoniScore,
      maitri: maitriScore,
      gana: ganaScore,
      bhakoot: bhakootScore,
      nadi: nadiScore
    },
    pariharas
  };
}

export function computeManglikDosha(input) {
  const { marsSiderealLon = 0, ascSiderealLon = 0, moonSiderealLon = 0, venusSiderealLon = 0, age = 30 } = input;
  
  const marsRasi = Math.floor(normalizeDegrees(marsSiderealLon) / 30);
  const ascRasi = Math.floor(normalizeDegrees(ascSiderealLon) / 30);
  const moonRasi = Math.floor(normalizeDegrees(moonSiderealLon) / 30);
  const venusRasi = Math.floor(normalizeDegrees(venusSiderealLon) / 30);

  const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];
  
  const houseFromAsc = (marsRasi - ascRasi + 12) % 12 + 1;
  const houseFromMoon = (marsRasi - moonRasi + 12) % 12 + 1;
  const houseFromVenus = (marsRasi - venusRasi + 12) % 12 + 1;

  const isManglikFromAsc = MANGLIK_HOUSES.includes(houseFromAsc);
  const isManglikFromMoon = MANGLIK_HOUSES.includes(houseFromMoon);
  const isManglikFromVenus = MANGLIK_HOUSES.includes(houseFromVenus);

  const afflictions = [];
  if (isManglikFromAsc) afflictions.push(`Hỏa Tinh tại cung ${houseFromAsc} từ Lagna (Cung Mệnh)`);
  if (isManglikFromMoon) afflictions.push(`Hỏa Tinh tại cung ${houseFromMoon} từ Chandra (Mặt Trăng)`);
  if (isManglikFromVenus) afflictions.push(`Hỏa Tinh tại cung ${houseFromVenus} từ Shukra (Kim Tinh)`);

  const cancellations = [];
  // Mars in own sign (Aries = 0, Scorpio = 7) or exalted (Capricorn = 9)
  if (marsRasi === 0 || marsRasi === 7 || marsRasi === 9) {
    cancellations.push("Hỏa Tinh đắc địa / vượng địa (Aries, Scorpio, Capricorn) hóa giải sát khí");
  }
  // Age maturity (> 28 years old)
  if (age >= 28) {
    cancellations.push("Độ tuổi trưởng thành (trên 28 tuổi) giúp năng lượng Hỏa Tinh chín muồi");
  }

  const isManglik = afflictions.length > 0 && cancellations.length === 0;
  const status = isManglik ? (afflictions.length >= 2 ? "high" : "moderate") : (afflictions.length > 0 ? "cancelled" : "none");

  return {
    isManglik,
    status,
    afflictions,
    cancellations,
    houses: {
      fromAsc: houseFromAsc,
      fromMoon: houseFromMoon,
      fromVenus: houseFromVenus
    }
  };
}

export function computeVedicDignity(body, siderealLongitude) {
  const normLon = normalizeDegrees(siderealLongitude);
  const sign = Math.floor(normLon / 30);
  const degreeInSign = normLon % 30;

  const DIGNITY_RULES = {
    "sun": { exaltSign: 0, exaltDeg: 10, debilSign: 6, debilDeg: 10, moolaSign: 4, moolaStart: 0, moolaEnd: 20 },
    "moon": { exaltSign: 1, exaltDeg: 3, debilSign: 7, debilDeg: 3, moolaSign: 1, moolaStart: 4, moolaEnd: 20 },
    "mars": { exaltSign: 9, exaltDeg: 28, debilSign: 3, debilDeg: 28, moolaSign: 0, moolaStart: 0, moolaEnd: 12 },
    "mercury": { exaltSign: 5, exaltDeg: 15, debilSign: 11, debilDeg: 15, moolaSign: 5, moolaStart: 16, moolaEnd: 20 },
    "jupiter": { exaltSign: 3, exaltDeg: 5, debilSign: 9, debilDeg: 5, moolaSign: 8, moolaStart: 0, moolaEnd: 10 },
    "venus": { exaltSign: 11, exaltDeg: 27, debilSign: 5, debilDeg: 27, moolaSign: 6, moolaStart: 0, moolaEnd: 15 },
    "saturn": { exaltSign: 6, exaltDeg: 20, debilSign: 0, debilDeg: 20, moolaSign: 10, moolaStart: 0, moolaEnd: 20 }
  };

  const rule = DIGNITY_RULES[body];
  if (!rule) return "neutral";
  
  if (sign === rule.exaltSign) {
    if (Math.abs(degreeInSign - rule.exaltDeg) < 1) return "uchha_peak";
    return "uchha_sign"; 
  }
  if (sign === rule.debilSign) {
    if (Math.abs(degreeInSign - rule.debilDeg) < 1) return "neecha_peak";
    return "neecha_sign";
  }
  if (sign === rule.moolaSign && Math.floor(degreeInSign) >= rule.moolaStart && Math.floor(degreeInSign) <= rule.moolaEnd) {
    return "moolatrikona";
  }
  
  return "neutral";
}

export function calculateTarabala(natalNakshatraIndex, transitNakshatraIndex) {
  if (natalNakshatraIndex < 0 || natalNakshatraIndex > 26 || transitNakshatraIndex < 0 || transitNakshatraIndex > 26) {
    throw new RangeError("Nakshatra indexes must be between 0 and 26");
  }

  const distance = ((transitNakshatraIndex - natalNakshatraIndex + 27) % 27) + 1;
  const tarabala = distance % 9 === 0 ? 9 : distance % 9;

  const scoreMap = {
    1: -8,
    2: 8,
    3: -6,
    4: 6,
    5: -5,
    6: 8,
    7: -10,
    8: 6,
    9: 8
  };

  return {
    tarabala,
    scoreDelta: scoreMap[tarabala] || 0
  };
}

