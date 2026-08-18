import { describe, it, expect } from 'vitest';
import { buildTuViBirthContext } from '../../src/services/tuvi/birthContext';
import { DEFAULT_SCHOOL_PROFILE } from '../../src/services/tuvi/schoolProfiles';
import {
  computeShodashavargaMap,
  computeVimshottariAntardashas,
  computeBhinnashtakavarga,
  computeSarvashtakavarga,
} from '../../packages/core-logic/src/vedic.js';
import { detectVedicYogasAndDoshas } from '../../src/services/astrology/vedicYogas';
import { detectAspectPatterns } from '../../src/services/astrology/aspectPatterns';
import {
  calculateCompositeChart,
  calculateDavisonChart,
  calculateMidpoint,
} from '../../src/services/astrology/relationshipCharts';
import { calculateWesternChart } from '../../src/services/astrology/westernCalculator';

describe('Astrology Precision Engines Suite (Lịch Việt v4)', () => {
  describe('1. Tử Vi Giờ Tý & Leap Month Policies', () => {
    it('applies next-day-standard policy by advancing Day Can Chi for late rat (23h-24h)', () => {
      const birthContextNextDay = buildTuViBirthContext(
        {
          solarDate: new Date('2024-02-10T23:30:00+07:00'),
          birthHour: 0,
          birthClockHour: 23,
          birthMinute: 30,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
          gioTyPolicy: 'next-day-standard',
        },
        DEFAULT_SCHOOL_PROFILE,
      );

      const birthContextDaTySplit = buildTuViBirthContext(
        {
          solarDate: new Date('2024-02-10T23:30:00+07:00'),
          birthHour: 0,
          birthClockHour: 23,
          birthMinute: 30,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
          gioTyPolicy: 'da-ty-split',
        },
        DEFAULT_SCHOOL_PROFILE,
      );

      // On 2024-02-10, calendar day is Giáp Thìn (02-10). Next day (02-11) is Ất Tỵ.
      expect(birthContextNextDay.canChi.day.can).toBe('Ất');
      expect(birthContextNextDay.canChi.day.chi).toBe('Tỵ');
      expect(birthContextNextDay.canChi.hour.can).toBe('Bính'); // Giáp/Kỷ -> Giáp Tý, Ất/Canh -> Bính Tý

      // Da Ty split keeps original day (Giáp Thìn)
      expect(birthContextDaTySplit.canChi.day.can).toBe('Giáp');
      expect(birthContextDaTySplit.canChi.day.chi).toBe('Thìn');
      expect(birthContextDaTySplit.canChi.hour.can).toBe('Giáp');
    });

    it('handles leap month split-15 and raw policies correctly', () => {
      const contextSplit15 = buildTuViBirthContext(
        {
          solarDate: new Date('2023-04-10T10:00:00+07:00'), // In leap month 2 (Nhuận Tháng 2 Quý Mão 2023)
          birthHour: 5,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
          leapMonthPolicy: 'split-15',
        },
        DEFAULT_SCHOOL_PROFILE,
      );

      expect(contextSplit15.lunarDate.isLeap).toBe(true);
      // Lunar day is 20th (> 15), so split-15 shifts logical month to 3
      expect(contextSplit15.logicalMonth).toBe(3);

      const contextRaw = buildTuViBirthContext(
        {
          solarDate: new Date('2023-04-10T10:00:00+07:00'),
          birthHour: 5,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
          leapMonthPolicy: 'raw',
        },
        DEFAULT_SCHOOL_PROFILE,
      );
      // Raw stays month 2
      expect(contextRaw.logicalMonth).toBe(2);
    });
  });

  describe('2. Vedic Shodashavarga (16 Divisional Charts)', () => {
    it('computes all 16 divisional signs for a given sidereal longitude', () => {
      // Test with 15.5° Aries (15.5 degrees total longitude)
      const lonAries = 15.5;
      const dMap = computeShodashavargaMap(lonAries);

      expect(dMap.d1).toBe('aries');
      expect(dMap.d2).toBe('cancer'); // > 15 deg in odd sign -> Cancer
      expect(dMap.d3).toBe('leo'); // second decan of Aries -> Leo
      expect(dMap.d4).toBe('libra'); // 15.5° is in 3rd quadrant of sign (15°-22.5°) -> 7th from Aries = Libra
      expect(dMap.d9).toBe('leo'); // Navamsha 5th pada of Aries (13°20' - 16°40') -> Leo
      expect(dMap.d10).toBe('virgo'); // Dashamsha part 5 of odd sign -> sign + 5 -> Virgo
      expect(dMap.d12).toBe('libra'); // Dvadashamsha part 6 (15°-17.5°) -> sign + 6 -> Libra
      expect(dMap.d60).toBe('scorpio'); // D60 part 31 (15.5° / 0.5) -> (0 + 31) % 12 = 7 -> Scorpio
    });
  });

  describe('3. Vedic Vimshottari Antardasha & Ashtakavarga', () => {
    it('calculates 9 Antardasha periods for a Mahadasha with proportional lengths', () => {
      // Jupiter Mahadasha = 16 years
      const antardashas = computeVimshottariAntardashas('jupiter', 2000, 16);
      expect(antardashas.length).toBe(9);
      expect(antardashas[0].lord).toBe('jupiter');
      expect(antardashas[0].duration).toBeCloseTo((16 * 16) / 120, 2); // 2.133 yrs
      expect(antardashas[1].lord).toBe('saturn');
      expect(antardashas[1].duration).toBeCloseTo((16 * 19) / 120, 2); // 2.533 yrs

      const totalDuration = antardashas.reduce((acc, a) => acc + a.duration, 0);
      expect(totalDuration).toBeCloseTo(16, 2);
    });

    it('computes Bhinnashtakavarga and Sarvashtakavarga points (337 total points standard)', () => {
      const planetSigns = {
        sun: 0, // Aries
        moon: 3, // Cancer
        mars: 9, // Capricorn
        mercury: 1, // Taurus
        jupiter: 3, // Cancer
        venus: 11, // Pisces
        saturn: 6, // Libra
        ascendant: 0, // Aries
      };

      const bav = computeBhinnashtakavarga(planetSigns);
      expect(Object.keys(bav)).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);
      expect(bav.sun.length).toBe(12);

      const sav = computeSarvashtakavarga(bav);
      expect(sav.length).toBe(12);
      const totalPoints = sav.reduce((acc, p) => acc + p, 0);
      expect(totalPoints).toBe(337);
    });
  });

  describe('4. Vedic Yogas & Kuja Dosha Parashari Cancellations', () => {
    it('detects Pancha Mahapurusha Yogas (Ruchaka, Hamsa, Sasa, Malavya, Bhadra)', () => {
      const planets = [
        { body: 'mars', signIndex: 0, house: 1, longitude: 10, isRetrograde: false }, // Ruchaka (Mars in Aries 1st house)
        { body: 'jupiter', signIndex: 3, house: 4, longitude: 100, isRetrograde: false }, // Hamsa (Jupiter in Cancer 4th house)
        { body: 'saturn', signIndex: 6, house: 7, longitude: 190, isRetrograde: false }, // Sasa (Saturn in Libra 7th house)
        { body: 'venus', signIndex: 11, house: 10, longitude: 340, isRetrograde: false }, // Malavya (Venus in Pisces 10th house)
      ];

      const yogas = detectVedicYogasAndDoshas(planets as never, 0);
      const yogaIds = yogas.map((y) => y.id);

      expect(yogaIds).toContain('ruchaka_yoga');
      expect(yogaIds).toContain('hamsa_yoga');
      expect(yogaIds).toContain('sasa_yoga');
      expect(yogaIds).toContain('malavya_yoga');
    });

    it('cancels Kuja Dosha when Mars is in Aries in 1st house or aspected by Jupiter', () => {
      const planets = [
        { body: 'mars', signIndex: 0, house: 1, longitude: 10, isRetrograde: false },
        { body: 'jupiter', signIndex: 3, house: 4, longitude: 100, isRetrograde: false },
      ];

      const yogas = detectVedicYogasAndDoshas(planets as never, 0);
      const manglik = yogas.find((y) => y.id === 'manglik_dosha');

      expect(manglik).toBeDefined();
      expect(manglik?.nameVi).toContain('Đã Hóa Giải');
      expect(manglik?.descriptionVi).toContain('Ruchaka Yoga');
    });
  });

  describe('5. Western Aspect Patterns & Relationship Charts', () => {
    it('detects Thor Hammer and Boomerang aspect patterns', () => {
      const planets = [
        { id: 'sun', name: 'Sun', nameVi: 'Mặt Trời', symbol: '☉', longitude: 0, signVi: 'Bạch Dương' },
        { id: 'moon', name: 'Moon', nameVi: 'Mặt Trăng', symbol: '☽', longitude: 90, signVi: 'Cự Giải' },
        { id: 'mars', name: 'Mars', nameVi: 'Sao Hỏa', symbol: '♂', longitude: 225, signVi: 'Bọ Cạp' }, // 225 - 0 = 225 (135°), 225 - 90 = 135° -> Thor's Hammer
      ];

      const patterns = detectAspectPatterns(planets);
      const thorsHammer = patterns.find((p) => p.type === 'thors_hammer');
      expect(thorsHammer).toBeDefined();
      expect(thorsHammer?.nameVi).toContain('Thor');
    });

    it('computes shortest-arc midpoint across 0°/360° correctly', () => {
      expect(calculateMidpoint(350, 10)).toBe(0);
      expect(calculateMidpoint(10, 350)).toBe(0);
      expect(calculateMidpoint(40, 60)).toBe(50);
      expect(calculateMidpoint(100, 200)).toBe(150);
    });

    it('generates Composite and Davison relationship charts', () => {
      const partnerA = {
        name: 'Alex',
        birthDate: new Date('1990-05-10T10:00:00Z'),
        latitude: 21.0285,
        longitude: 105.8542,
      };
      const partnerB = {
        name: 'Jordan',
        birthDate: new Date('1992-08-15T15:30:00Z'),
        latitude: 10.8231,
        longitude: 106.6297,
      };

      const composite = calculateCompositeChart(partnerA, partnerB);
      expect(composite.chartType).toBe('composite');
      expect(composite.planets.length).toBeGreaterThan(5);
      expect(composite.synastryInsights.length).toBe(3);

      const davison = calculateDavisonChart(partnerA, partnerB);
      expect(davison.chartType).toBe('davison');
      expect(davison.davisonLatitude).toBeCloseTo(15.9258, 2);
      expect(davison.chart.planets.length).toBeGreaterThan(5);
    });

    it('handles polar latitudes with graceful Porphyry/Equal fallback', () => {
      // Tromsø Norway 69.6492°N (above Arctic circle 66.5°N)
      const chart = calculateWesternChart({
        birthDate: new Date('1990-06-21T12:00:00Z'),
        latitude: 69.6492,
        longitude: 18.9553,
        houseSystem: 'placidus',
      });

      expect(chart).toBeDefined();
      expect(chart.houses.length).toBe(12);
      expect(chart.houses.every((h) => Number.isFinite(h.longitude))).toBe(true);
    });
  });
});
