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
  // This is mathematically equivalent to the standard Movable/Fixed/Dual rules.
  if (sign % 4 === 0) startingSign = 0; 
  else if (sign % 4 === 1) startingSign = 9; 
  else if (sign % 4 === 2) startingSign = 6; 
  else startingSign = 3; 

  const d9Sign = (startingSign + navamshaIndex) % 12;
  const SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
  return SIGNS[d9Sign];
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
    const relA = PLANETARY_FRIENDSHIP[lordA][lordB];
    const relB = PLANETARY_FRIENDSHIP[lordB][lordA];
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
  const bhakootScore = [1, 7, 3, 11, 4, 10].includes(distance) ? 7 : 0;
  
  const nadiA = NAKSHATRA_NADI[nakA];
  const nadiB = NAKSHATRA_NADI[nakB];
  const nadiScore = nadiA !== nadiB ? 8 : 0; 

  const total = varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;
  
  return {
    score: total,
    outOf: 36,
    breakdown: { varna: varnaScore, vashya: vashyaScore, tara: taraScore, yoni: yoniScore, maitri: maitriScore, gana: ganaScore, bhakoot: bhakootScore, nadi: nadiScore }
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

