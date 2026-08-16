/**
 * Traditional & Hellenistic Astrology Engine
 * Implements Sect, 5-fold Essential Dignities (Dorothean, Egyptian/Ptolemaic, Chaldean),
 * Accidental Dignities (Cazimi, Combust, Joys, Hayz), Almuten Figuris (Ibn Ezra),
 * Arabic Lots, and Firdaria (75-year planetary periods).
 */

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const ZODIAC_SIGNS_VI = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'
];

// Traditional rulers (7 visible planets)
export const DOMICILE_RULERS = {
  Aries: 'mars',
  Taurus: 'venus',
  Gemini: 'mercury',
  Cancer: 'moon',
  Leo: 'sun',
  Virgo: 'mercury',
  Libra: 'venus',
  Scorpio: 'mars',
  Sagittarius: 'jupiter',
  Capricorn: 'saturn',
  Aquarius: 'saturn',
  Pisces: 'jupiter'
};

export const EXALTATION_DATA = {
  Aries: { planet: 'sun', exactDegree: 19 },
  Taurus: { planet: 'moon', exactDegree: 3 },
  Cancer: { planet: 'jupiter', exactDegree: 15 },
  Virgo: { planet: 'mercury', exactDegree: 15 },
  Libra: { planet: 'saturn', exactDegree: 21 },
  Capricorn: { planet: 'mars', exactDegree: 28 },
  Pisces: { planet: 'venus', exactDegree: 27 }
};

export const DETRIMENT_RULERS = {
  Aries: 'venus',
  Taurus: 'mars',
  Gemini: 'jupiter',
  Cancer: 'saturn',
  Leo: 'saturn',
  Virgo: 'jupiter',
  Libra: 'mars',
  Scorpio: 'venus',
  Sagittarius: 'mercury',
  Capricorn: 'moon',
  Aquarius: 'sun',
  Pisces: 'mercury'
};

export const FALL_DATA = {
  Libra: { planet: 'sun', exactDegree: 19 },
  Scorpio: { planet: 'moon', exactDegree: 3 },
  Capricorn: { planet: 'jupiter', exactDegree: 15 },
  Pisces: { planet: 'mercury', exactDegree: 15 },
  Aries: { planet: 'saturn', exactDegree: 21 },
  Cancer: { planet: 'mars', exactDegree: 28 },
  Virgo: { planet: 'venus', exactDegree: 27 }
};

// Dorothean Triplicity Rulers [Day, Night, Participating]
export const DOROTHEAN_TRIPLICITIES = {
  // Fire: Aries, Leo, Sagittarius
  fire: { day: 'sun', night: 'jupiter', participating: 'saturn' },
  // Earth: Taurus, Virgo, Capricorn
  earth: { day: 'venus', night: 'moon', participating: 'mars' },
  // Air: Gemini, Libra, Aquarius
  air: { day: 'saturn', night: 'mercury', participating: 'jupiter' },
  // Water: Cancer, Scorpio, Pisces
  water: { day: 'venus', night: 'mars', participating: 'moon' }
};

export const SIGN_TRIPLICITY_ELEMENT = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water'
};

// Egyptian Terms / Bounds (Degree boundary, Ruler)
export const EGYPTIAN_TERMS = {
  Aries: [
    { maxDeg: 6, ruler: 'jupiter' },
    { maxDeg: 12, ruler: 'venus' },
    { maxDeg: 20, ruler: 'mercury' },
    { maxDeg: 25, ruler: 'mars' },
    { maxDeg: 30, ruler: 'saturn' }
  ],
  Taurus: [
    { maxDeg: 8, ruler: 'venus' },
    { maxDeg: 14, ruler: 'mercury' },
    { maxDeg: 22, ruler: 'jupiter' },
    { maxDeg: 27, ruler: 'saturn' },
    { maxDeg: 30, ruler: 'mars' }
  ],
  Gemini: [
    { maxDeg: 6, ruler: 'mercury' },
    { maxDeg: 12, ruler: 'jupiter' },
    { maxDeg: 17, ruler: 'venus' },
    { maxDeg: 24, ruler: 'mars' },
    { maxDeg: 30, ruler: 'saturn' }
  ],
  Cancer: [
    { maxDeg: 7, ruler: 'mars' },
    { maxDeg: 13, ruler: 'venus' },
    { maxDeg: 19, ruler: 'mercury' },
    { maxDeg: 26, ruler: 'jupiter' },
    { maxDeg: 30, ruler: 'saturn' }
  ],
  Leo: [
    { maxDeg: 6, ruler: 'jupiter' },
    { maxDeg: 11, ruler: 'venus' },
    { maxDeg: 18, ruler: 'saturn' },
    { maxDeg: 24, ruler: 'mercury' },
    { maxDeg: 30, ruler: 'mars' }
  ],
  Virgo: [
    { maxDeg: 7, ruler: 'mercury' },
    { maxDeg: 17, ruler: 'venus' },
    { maxDeg: 21, ruler: 'jupiter' },
    { maxDeg: 28, ruler: 'mars' },
    { maxDeg: 30, ruler: 'saturn' }
  ],
  Libra: [
    { maxDeg: 6, ruler: 'saturn' },
    { maxDeg: 14, ruler: 'mercury' },
    { maxDeg: 21, ruler: 'jupiter' },
    { maxDeg: 28, ruler: 'venus' },
    { maxDeg: 30, ruler: 'mars' }
  ],
  Scorpio: [
    { maxDeg: 7, ruler: 'mars' },
    { maxDeg: 11, ruler: 'venus' },
    { maxDeg: 19, ruler: 'mercury' },
    { maxDeg: 24, ruler: 'jupiter' },
    { maxDeg: 30, ruler: 'saturn' }
  ],
  Sagittarius: [
    { maxDeg: 12, ruler: 'jupiter' },
    { maxDeg: 17, ruler: 'venus' },
    { maxDeg: 21, ruler: 'mercury' },
    { maxDeg: 26, ruler: 'saturn' },
    { maxDeg: 30, ruler: 'mars' }
  ],
  Capricorn: [
    { maxDeg: 7, ruler: 'mercury' },
    { maxDeg: 14, ruler: 'jupiter' },
    { maxDeg: 22, ruler: 'venus' },
    { maxDeg: 26, ruler: 'saturn' },
    { maxDeg: 30, ruler: 'mars' }
  ],
  Aquarius: [
    { maxDeg: 7, ruler: 'mercury' },
    { maxDeg: 13, ruler: 'venus' },
    { maxDeg: 20, ruler: 'jupiter' },
    { maxDeg: 25, ruler: 'mars' },
    { maxDeg: 30, ruler: 'saturn' }
  ],
  Pisces: [
    { maxDeg: 12, ruler: 'venus' },
    { maxDeg: 16, ruler: 'jupiter' },
    { maxDeg: 19, ruler: 'mercury' },
    { maxDeg: 28, ruler: 'mars' },
    { maxDeg: 30, ruler: 'saturn' }
  ]
};

// Chaldean Decans / Faces (10° increments)
export const CHALDEAN_DECANS = {
  Aries: ['mars', 'sun', 'venus'],
  Taurus: ['mercury', 'moon', 'saturn'],
  Gemini: ['jupiter', 'mars', 'sun'],
  Cancer: ['venus', 'mercury', 'moon'],
  Leo: ['saturn', 'jupiter', 'mars'],
  Virgo: ['sun', 'venus', 'mercury'],
  Libra: ['moon', 'saturn', 'jupiter'],
  Scorpio: ['mars', 'sun', 'venus'],
  Sagittarius: ['mercury', 'moon', 'saturn'],
  Capricorn: ['jupiter', 'mars', 'sun'],
  Aquarius: ['venus', 'mercury', 'moon'],
  Pisces: ['saturn', 'jupiter', 'mars']
};

// Planetary Joys in Houses (1-12)
export const PLANETARY_JOYS = {
  sun: 9,      // Joy in 9th house (God)
  moon: 3,     // Joy in 3rd house (Goddess)
  mercury: 1,  // Joy in 1st house (Helm)
  venus: 5,    // Joy in 5th house (Good Fortune)
  mars: 6,     // Joy in 6th house (Bad Fortune)
  jupiter: 11, // Joy in 11th house (Good Spirit)
  saturn: 12   // Joy in 12th house (Bad Spirit)
};

/**
 * Determines whether a chart is Diurnal (Day) or Nocturnal (Night).
 * Sun above horizon (houses 7, 8, 9, 10, 11, 12) = Day.
 * Sun below horizon (houses 1, 2, 3, 4, 5, 6) = Night.
 *
 * @param {number} sunLongitude
 * @param {number} ascendantLongitude
 * @returns {{ isDay: boolean, sectLabel: string, sectLabelVi: string, beneficOfSect: string, maleficOfSect: string, outOfSectMalefic: string }}
 */
export function calculateChartSect(sunLongitude, ascendantLongitude) {
  const norm = (v) => ((v % 360) + 360) % 360;
  const sun = norm(sunLongitude);
  const asc = norm(ascendantLongitude);
  const dsc = norm(asc + 180);

  // Check if Sun is between Asc and Dsc through MC (above horizon)
  let isDay = false;
  if (asc < dsc) {
    // Horizon span is [asc, dsc] counterclockwise below, or [dsc, asc] above
    isDay = sun >= dsc || sun <= asc;
  } else {
    isDay = sun >= dsc && sun <= asc;
  }

  return {
    isDay,
    sectLabel: isDay ? 'Day Chart (Diurnal)' : 'Night Chart (Nocturnal)',
    sectLabelVi: isDay ? 'Lá Số Ban Ngày (Dương Dương)' : 'Lá Số Ban Đêm (Dương Âm)',
    beneficOfSect: isDay ? 'jupiter' : 'venus',
    beneficOutOfSect: isDay ? 'venus' : 'jupiter',
    maleficOfSect: isDay ? 'saturn' : 'mars',
    outOfSectMalefic: isDay ? 'mars' : 'saturn', // Mars is most difficult in day charts, Saturn in night charts
  };
}

/**
 * Computes 5-fold Essential Dignities for a planet at given sign and degree.
 */
export function calculateEssentialDignities(planet, signName, degreeInSign, isDay) {
  const p = (planet || '').toLowerCase();
  const elem = SIGN_TRIPLICITY_ELEMENT[signName] || 'fire';
  const triplicity = DOROTHEAN_TRIPLICITIES[elem];
  const terms = EGYPTIAN_TERMS[signName] || [];
  const decans = CHALDEAN_DECANS[signName] || [];

  // 1. Domicile (5 pts)
  const isDomicile = DOMICILE_RULERS[signName] === p;
  // 2. Exaltation (4 pts)
  const isExaltation = EXALTATION_DATA[signName]?.planet === p;
  // 3. Triplicity (3 pts)
  const isTriplicityDay = triplicity.day === p;
  const isTriplicityNight = triplicity.night === p;
  const isTriplicityParticipating = triplicity.participating === p;
  const isTriplicityOfSect = (isDay ? isTriplicityDay : isTriplicityNight) || isTriplicityParticipating;
  // 4. Term / Bound (2 pts)
  const termEntry = terms.find((t) => degreeInSign < t.maxDeg) || terms[terms.length - 1];
  const isTerm = termEntry?.ruler === p;
  // 5. Decan / Face (1 pt)
  const decanIdx = Math.min(2, Math.floor(degreeInSign / 10));
  const isDecan = decans[decanIdx] === p;

  // Debilities
  const isDetriment = DETRIMENT_RULERS[signName] === p;
  const isFall = FALL_DATA[signName]?.planet === p;

  let totalScore = 0;
  if (isDomicile) totalScore += 5;
  if (isExaltation) totalScore += 4;
  if (isTriplicityOfSect) totalScore += 3;
  if (isTerm) totalScore += 2;
  if (isDecan) totalScore += 1;

  if (isDetriment) totalScore -= 5;
  if (isFall) totalScore -= 4;

  const isPeregrine = totalScore === 0 && !isDomicile && !isExaltation && !isTriplicityOfSect && !isTerm && !isDecan && !isDetriment && !isFall;
  if (isPeregrine) totalScore -= 5;

  return {
    planet: p,
    sign: signName,
    degree: degreeInSign,
    isDomicile,
    isExaltation,
    isTriplicity: isTriplicityOfSect,
    isTerm,
    isDecan,
    isDetriment,
    isFall,
    isPeregrine,
    totalScore,
    domicileRuler: DOMICILE_RULERS[signName],
    exaltationRuler: EXALTATION_DATA[signName]?.planet || null,
    triplicityRuler: isDay ? triplicity.day : triplicity.night,
    termRuler: termEntry?.ruler || null,
    decanRuler: decans[decanIdx] || null,
  };
}

/**
 * Computes Accidental Dignities & Debilities for a planet.
 */
export function calculateAccidentalDignities(planet, houseNumber, sunLongitude, planetLongitude, isRetrograde = false) {
  const p = (planet || '').toLowerCase();
  let score = 0;
  const factors = [];

  // Angular / Succedent / Cadent
  if ([1, 4, 7, 10].includes(houseNumber)) {
    score += 5;
    factors.push({ name: 'Góc (Angular House)', score: 5, type: 'positive' });
  } else if ([2, 5, 8, 11].includes(houseNumber)) {
    score += 3;
    factors.push({ name: 'Tiếp vị (Succedent House)', score: 3, type: 'positive' });
  } else {
    score += 1;
    factors.push({ name: 'Rơi (Cadent House)', score: 1, type: 'neutral' });
  }

  // Planetary Joy
  if (PLANETARY_JOYS[p] === houseNumber) {
    score += 4;
    factors.push({ name: 'Hân hoan tại nhà (Joy in House)', score: 4, type: 'positive' });
  }

  // Solar Condition (combustion / cazimi / under beams)
  if (p !== 'sun') {
    const norm = (v) => ((v % 360) + 360) % 360;
    const dist = Math.abs(norm(planetLongitude - sunLongitude));
    const shortestDist = Math.min(dist, 360 - dist);

    if (shortestDist <= 17 / 60) {
      score += 5;
      factors.push({ name: 'Cazimi (Tại tâm Mặt Trời - Rực rỡ)', score: 5, type: 'positive' });
    } else if (shortestDist <= 8.5) {
      score -= 5;
      factors.push({ name: 'Cháy (Combust - Thiêu đốt dưới ánh mặt trời)', score: -5, type: 'negative' });
    } else if (shortestDist <= 15) {
      score -= 2;
      factors.push({ name: 'Dưới tia sáng (Under the Sun\'s Beams)', score: -2, type: 'negative' });
    }
  }

  if (isRetrograde && !['sun', 'moon'].includes(p)) {
    score -= 5;
    factors.push({ name: 'Nghịch hành (Retrograde)', score: -5, type: 'negative' });
  }

  return {
    score,
    factors
  };
}

/**
 * Computes Arabic Lots (Parts).
 */
export function calculateArabicLots(sunLong, moonLong, ascLong, venusLong, isDay) {
  const norm = (v) => ((v % 360) + 360) % 360;

  // Lot of Fortune (Tyche): Day: Asc + Moon - Sun; Night: Asc + Sun - Moon
  const fortune = isDay
    ? norm(ascLong + moonLong - sunLong)
    : norm(ascLong + sunLong - moonLong);

  // Lot of Spirit (Daimon): Day: Asc + Sun - Moon; Night: Asc + Moon - Sun
  const spirit = isDay
    ? norm(ascLong + sunLong - moonLong)
    : norm(ascLong + moonLong - sunLong);

  // Lot of Eros: Day: Asc + Venus - Spirit; Night: Asc + Spirit - Venus
  const eros = isDay
    ? norm(ascLong + venusLong - spirit)
    : norm(ascLong + spirit - venusLong);

  // Lot of Necessity: Day: Asc + Fortune - Mercury (approx using Asc + Fortune - Sun)
  const necessity = isDay
    ? norm(ascLong + fortune - sunLong)
    : norm(ascLong + sunLong - fortune);

  const getSignInfo = (longitude) => {
    const signIdx = Math.floor(longitude / 30);
    return {
      longitude,
      sign: ZODIAC_SIGNS[signIdx],
      signVi: ZODIAC_SIGNS_VI[signIdx],
      degree: Math.floor(longitude % 30),
      minute: Math.floor((longitude % 1) * 60)
    };
  };

  return {
    fortune: { name: 'Lot of Fortune (Điểm May Mắn / Tyche)', ...getSignInfo(fortune) },
    spirit: { name: 'Lot of Spirit (Điểm Tinh Thần / Daimon)', ...getSignInfo(spirit) },
    eros: { name: 'Lot of Eros (Điểm Tình Duyên / Eros)', ...getSignInfo(eros) },
    necessity: { name: 'Lot of Necessity (Điểm Tất Yếu / Ananke)', ...getSignInfo(necessity) }
  };
}

/**
 * Computes Almuten Figuris (Supreme Chart Ruler based on Ibn Ezra system).
 * Tallies dignity points across Sun, Moon, Ascendant, Part of Fortune, and Pre-natal Syzygy.
 */
export function calculateAlmutenFiguris(planets, ascendantLong, fortuneLong, isDay) {
  const CANDIDATE_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const scores = {};
  CANDIDATE_PLANETS.forEach((p) => { scores[p] = 0; });

  const pointsToEvaluate = [
    { name: 'Ascendant', long: ascendantLong },
    { name: 'Lot of Fortune', long: fortuneLong },
    ...planets.filter((p) => ['sun', 'moon'].includes(p.body.toLowerCase())).map((p) => ({ name: p.body, long: p.tropicalLongitude }))
  ];

  pointsToEvaluate.forEach((pt) => {
    const signIdx = Math.floor(pt.long / 30);
    const signName = ZODIAC_SIGNS[signIdx];
    const degInSign = pt.long % 30;

    CANDIDATE_PLANETS.forEach((planet) => {
      const d = calculateEssentialDignities(planet, signName, degInSign, isDay);
      if (d.isDomicile) scores[planet] += 5;
      if (d.isExaltation) scores[planet] += 4;
      if (d.isTriplicity) scores[planet] += 3;
      if (d.isTerm) scores[planet] += 2;
      if (d.isDecan) scores[planet] += 1;
    });
  });

  // Sort by score
  const ranked = Object.entries(scores)
    .map(([planet, score]) => ({ planet, score }))
    .sort((a, b) => b.score - a.score);

  return {
    almuten: ranked[0]?.planet || 'sun',
    almutenScore: ranked[0]?.score || 0,
    rankings: ranked
  };
}

/**
 * Computes Firdaria (75-year Persian/Medieval Planetary Periods).
 */
export function calculateFirdaria(birthDate, isDay) {
  const DAY_ORDER = [
    { ruler: 'sun', years: 10 },
    { ruler: 'venus', years: 8 },
    { ruler: 'mercury', years: 13 },
    { ruler: 'moon', years: 9 },
    { ruler: 'saturn', years: 11 },
    { ruler: 'jupiter', years: 12 },
    { ruler: 'mars', years: 7 },
    { ruler: 'north_node', years: 3 },
    { ruler: 'south_node', years: 2 }
  ];

  const NIGHT_ORDER = [
    { ruler: 'moon', years: 9 },
    { ruler: 'saturn', years: 11 },
    { ruler: 'jupiter', years: 12 },
    { ruler: 'mars', years: 7 },
    { ruler: 'sun', years: 10 },
    { ruler: 'venus', years: 8 },
    { ruler: 'mercury', years: 13 },
    { ruler: 'north_node', years: 3 },
    { ruler: 'south_node', years: 2 }
  ];

  const sequence = isDay ? DAY_ORDER : NIGHT_ORDER;
  const bYear = birthDate.getFullYear();
  let currentStartAge = 0;

  const periods = sequence.map((p) => {
    const startAge = currentStartAge;
    const endAge = currentStartAge + p.years;
    const startYear = bYear + startAge;
    const endYear = bYear + endAge;
    currentStartAge = endAge;

    return {
      ruler: p.ruler,
      years: p.years,
      startAge,
      endAge,
      startYear,
      endYear,
      periodLabel: `${startYear} - ${endYear} (Tuổi ${startAge} - ${endAge})`
    };
  });

  return {
    sect: isDay ? 'Day' : 'Night',
    periods
  };
}
