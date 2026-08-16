/**
 * Hellenistic Time-Lord Engine: Zodiacal Releasing (ZR)
 * Based on Vettius Valens (Anthologies) and modern Hellenistic scholarship (Chris Brennan).
 *
 * Implements:
 * 1. Time releasing from Lot of Fortune (Body, Health, Vitality, Physical Circumstances)
 * 2. Time releasing from Lot of Spirit (Career, Soul Calling, Major Public Works, Fame)
 * 3. Planetary years per sign (Level 1 Decades, Level 2 Sub-periods, Level 3 Months/Weeks)
 * 4. Detection of "Loosing of the Helm" (L2 transition to opposite sign)
 * 5. Detection of "Peak Periods" (Sign of Lot of Fortune and 10th sign from Fortune)
 */

export const SIGN_YEARS = {
  Aries: 15,       // Mars
  Taurus: 8,       // Venus
  Gemini: 20,      // Mercury
  Cancer: 25,      // Moon
  Leo: 19,         // Sun
  Virgo: 20,       // Mercury
  Libra: 8,        // Venus
  Scorpio: 15,     // Mars
  Sagittarius: 12, // Jupiter
  Capricorn: 27,   // Saturn
  Aquarius: 30,    // Saturn
  Pisces: 12       // Jupiter
};

export const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const ZODIAC_ORDER_VI = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'
];

// Egyptian 360-day year used in Hellenistic Astrology (1 month = 30 days = 2.5 Egyptian days/year)
const DAYS_PER_YEAR = 360;

/**
 * Generates Zodiacal Releasing Level 1 (Major Decades) and Level 2 (Sub-periods).
 *
 * @param {string} startSign - Sign containing Lot of Spirit or Lot of Fortune
 * @param {Date} birthDate - Native birth date
 * @param {string} lotOfFortuneSign - Sign of Lot of Fortune for peak identification
 * @param {number} maxYears - Number of lifetime years to calculate (e.g. 90)
 * @returns {Array<object>}
 */
export function calculateZodiacalReleasing(startSign, birthDate, lotOfFortuneSign = 'Aries', maxYears = 90) {
  const startIdx = ZODIAC_ORDER.indexOf(startSign);
  const fortuneIdx = ZODIAC_ORDER.indexOf(lotOfFortuneSign);
  const tenthFromFortuneIdx = (fortuneIdx + 9) % 12; // 10th sign in whole signs (0-indexed + 9)

  const bYear = birthDate.getFullYear();
  const bMonth = birthDate.getMonth() + 1;
  const bDay = birthDate.getDate();

  const l1Periods = [];
  let currentSignIdx = startIdx >= 0 ? startIdx : 0;
  let elapsedYears = 0;

  while (elapsedYears < maxYears) {
    const sign = ZODIAC_ORDER[currentSignIdx];
    const signVi = ZODIAC_ORDER_VI[currentSignIdx];
    const durationYears = SIGN_YEARS[sign];
    const startAge = elapsedYears;
    const endAge = elapsedYears + durationYears;

    const isPeak = currentSignIdx === fortuneIdx || currentSignIdx === tenthFromFortuneIdx;
    const peakType = currentSignIdx === tenthFromFortuneIdx
      ? 'Đỉnh Cao Tuyệt Đối (10th from Fortune - Major Career Peak)'
      : currentSignIdx === fortuneIdx
        ? 'Cung Trọng Tâm (Fortune Sign - Physical/Core Peak)'
        : null;

    // Generate Level 2 Sub-periods within this L1 period
    const l2Periods = [];
    let l2SignIdx = currentSignIdx;
    let l2ElapsedMonths = 0; // In Egyptian months (1 sign year = 1 Egyptian month in L2)
    const totalL2Months = durationYears * 12; // Total months for this L1 sign
    let hasLoosedHelm = false;

    while (l2ElapsedMonths < totalL2Months) {
      const l2Sign = ZODIAC_ORDER[l2SignIdx];
      const l2SignVi = ZODIAC_ORDER_VI[l2SignIdx];
      const l2DurationMonths = SIGN_YEARS[l2Sign]; // In months (since L1 years = L2 months)

      const l2StartFraction = l2ElapsedMonths / 12;
      const l2EndFraction = Math.min(durationYears, (l2ElapsedMonths + l2DurationMonths) / 12);
      const l2StartAge = startAge + l2StartFraction;
      const l2EndAge = startAge + l2EndFraction;

      const isL2Peak = l2SignIdx === fortuneIdx || l2SignIdx === tenthFromFortuneIdx;

      l2Periods.push({
        level: 2,
        sign: l2Sign,
        signVi: l2SignVi,
        durationMonths: Math.round((l2EndAge - l2StartAge) * 12 * 10) / 10,
        startAge: Math.round(l2StartAge * 100) / 100,
        endAge: Math.round(l2EndAge * 100) / 100,
        startYear: Math.floor(bYear + l2StartAge),
        endYear: Math.floor(bYear + l2EndAge),
        isPeak: isL2Peak,
        isLoosingOfHelm: hasLoosedHelm && l2Periods.length > 0 && l2Periods[l2Periods.length - 1]?.sign !== ZODIAC_ORDER[(l2SignIdx + 11) % 12]
      });

      l2ElapsedMonths += l2DurationMonths;

      // Hellenistic Loosing of the Helm rule:
      // If L2 completes a full 12-sign cycle inside the same L1, it skips to the opposite sign (+6 signs)
      if (l2Periods.length === 12 && !hasLoosedHelm && l2ElapsedMonths < totalL2Months) {
        l2SignIdx = (l2SignIdx + 7) % 12; // Skip to opposite sign
        hasLoosedHelm = true;
      } else {
        l2SignIdx = (l2SignIdx + 1) % 12;
      }
    }

    l1Periods.push({
      level: 1,
      sign,
      signVi,
      durationYears,
      startAge: Math.round(startAge * 100) / 100,
      endAge: Math.round(endAge * 100) / 100,
      startYear: Math.floor(bYear + startAge),
      endYear: Math.floor(bYear + endAge),
      isPeak,
      peakType,
      subPeriods: l2Periods
    });

    elapsedYears += durationYears;
    currentSignIdx = (currentSignIdx + 1) % 12;
  }

  return l1Periods;
}
