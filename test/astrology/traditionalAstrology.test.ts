import { describe, it, expect } from 'vitest';
import {
  calculateChartSect,
  calculateEssentialDignities,
  calculateArabicLots,
  calculateAlmutenFiguris,
  calculateFirdaria,
} from '@lich-viet/core-logic';

describe('Traditional & Hellenistic Astrology Engine', () => {
  it('correctly calculates Diurnal (Day) vs Nocturnal (Night) Sect', () => {
    // Sun at 270° (Capricorn/MC, 10th house), Ascendant at 0° (Aries), Descendant at 180° (Libra) -> Sun is above horizon (Day)
    const daySect = calculateChartSect(270, 0);
    expect(daySect.isDay).toBe(true);
    expect(daySect.beneficOfSect).toBe('jupiter');
    expect(daySect.outOfSectMalefic).toBe('mars');

    // Sun at 90° (Cancer/IC, 4th house), Ascendant at 0° (Aries), Descendant at 180° (Libra) -> Sun is below horizon (Night)
    const nightSect = calculateChartSect(90, 0);
    expect(nightSect.isDay).toBe(false);
    expect(nightSect.beneficOfSect).toBe('venus');
    expect(nightSect.outOfSectMalefic).toBe('saturn');
  });

  it('correctly scores 5-fold Essential Dignities for a planet', () => {
    // Mars in Aries 5° (Domicile +5) in Day chart
    const marsDignity = calculateEssentialDignities('mars', 'Aries', 5, true);
    expect(marsDignity.isDomicile).toBe(true);
    expect(marsDignity.totalScore).toBeGreaterThanOrEqual(5);

    // Sun in Aries 19° (Exaltation +4, Triplicity +3) in Day chart
    const sunDignity = calculateEssentialDignities('sun', 'Aries', 19, true);
    expect(sunDignity.isExaltation).toBe(true);
    expect(sunDignity.isTriplicity).toBe(true);
    expect(sunDignity.totalScore).toBeGreaterThanOrEqual(7);

    // Venus in Aries 10° (Detriment -5)
    const venusDignity = calculateEssentialDignities('venus', 'Aries', 10, true);
    expect(venusDignity.isDetriment).toBe(true);
    expect(venusDignity.totalScore).toBeLessThan(0);
  });

  it('calculates Arabic Lots (Part of Fortune & Spirit) with Day/Night inversion', () => {
    const sunLong = 45; // 15° Taurus
    const moonLong = 120; // 0° Leo
    const ascLong = 0; // 0° Aries
    const venusLong = 60; // 0° Gemini

    const dayLots = calculateArabicLots(sunLong, moonLong, ascLong, venusLong, true);
    // Day Fortune = Asc + Moon - Sun = 0 + 120 - 45 = 75° (15° Gemini)
    expect(dayLots.fortune.longitude).toBe(75);
    expect(dayLots.fortune.sign).toBe('Gemini');

    const nightLots = calculateArabicLots(sunLong, moonLong, ascLong, venusLong, false);
    // Night Fortune = Asc + Sun - Moon = 0 + 45 - 120 = 285° (15° Capricorn)
    expect(nightLots.fortune.longitude).toBe(285);
    expect(nightLots.fortune.sign).toBe('Capricorn');
  });

  it('calculates Almuten Figuris based on Ibn Ezra system', () => {
    const planets = [
      { body: 'sun', tropicalLongitude: 120 },
      { body: 'moon', tropicalLongitude: 45 },
      { body: 'mars', tropicalLongitude: 10 },
      { body: 'jupiter', tropicalLongitude: 105 },
      { body: 'saturn', tropicalLongitude: 200 },
    ];
    const almuten = calculateAlmutenFiguris(planets, 0, 75, true);
    expect(almuten.almuten).toBeDefined();
    expect(almuten.almutenScore).toBeGreaterThan(0);
    expect(almuten.rankings.length).toBe(7);
  });

  it('generates 75-year Firdaria planetary sequence', () => {
    const birth = new Date(1990, 0, 1);
    const dayFirdaria = calculateFirdaria(birth, true);
    expect(dayFirdaria.periods[0].ruler).toBe('sun');
    expect(dayFirdaria.periods[0].years).toBe(10);
    expect(dayFirdaria.periods[0].startYear).toBe(1990);
    expect(dayFirdaria.periods[0].endYear).toBe(2000);

    const nightFirdaria = calculateFirdaria(birth, false);
    expect(nightFirdaria.periods[0].ruler).toBe('moon');
    expect(nightFirdaria.periods[0].years).toBe(9);
  });
});
