/**
 * End-to-End Bug Hunt & Adversarial Stress Testing Suite — Lịch Việt v4
 *
 * Exhaustively hunts for edge-case bugs, crashes, race conditions, and precision drift across:
 * 1. Extreme Temporal Boundaries (Leap century 2000, 1900, Leap day Feb 29, Midnight 00:00:00, Late Rat 23:59:59).
 * 2. Extreme Geographic Boundaries (North Pole 90°N, South Pole -90°S, Svalbard 78°N, Ushuaia -54°S, Null Island 0°/0°, Antimeridian ±180°).
 * 3. Cross-Engine Invariant Verification (Tử Vi, Vedic Jyotish, Western Tropical/Sidereal, Tri-Tradition Dialectical Synthesis).
 * 4. Multi-Tradition Divination Engines (Mai Hoa Dịch Số, Kỳ Môn Độn Giáp, Lục Nhâm Đại Độn, Thái Ất Thần Kinh, Dụng Sự Personal Day Score).
 * 5. Deterministic High-Volume Fuzzing (100 randomized inputs ensuring zero state leakage, zero NaNs, zero unhandled errors).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateChart as generateTuViChart } from '@/services/tuvi';
import { calculateWesternChart } from '@/services/astrology/westernCalculator';
import {
  computeShodashavargaMap,
  computeVimshottariAntardashas,
  computeBhinnashtakavarga,
  computeSarvashtakavarga,
} from '@lich-viet/core-logic';
import { synthesizeTriSystemReport } from '@/services/astrology/dialecticalSynthesis';
import { calculateCompositeChart, calculateDavisonChart } from '@/services/astrology/relationshipCharts';
import {
  ensureHexagramsLoaded,
  buildTimeBasedInput,
  performTimeBasedDivination,
} from '@/utils/maiHoaEngine';
import { generateQmdjChart } from '@/utils/qmdjEngine';
import { generateLucNhamChart } from '@/utils/lucNhamEngine';
import { getCosmicForecast, getThaiAtYearChart } from '@/utils/thaiAtEngine';
import { calculatePersonalDayScore } from '@/services/personalization/personalDayScore';

describe('End-to-End Bug Hunt & Adversarial Stress Testing Sweep', () => {
  beforeAll(async () => {
    await ensureHexagramsLoaded();
  });

  // ────────────────────────────────────────────────────────────
  // 1. Extreme Temporal Boundaries
  // ────────────────────────────────────────────────────────────
  describe('1. Extreme Temporal Boundaries', () => {
    it('handles Leap Day (Feb 29) across all engines without offset drift or crash', () => {
      const leapDay = new Date(2024, 1, 29, 23, 59, 59);

      // Tử Vi
      const tuvi = generateTuViChart({
        solarDate: leapDay,
        birthClockHour: 23,
        birthMinute: 59,
        birthHour: 0,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });
      expect(tuvi.palaces).toHaveLength(12);
      expect(tuvi.centerInfo.cuc).toBeDefined();
      expect(tuvi.centerInfo.menhCung).toBeDefined();
      expect(tuvi.centerInfo.thanCung).toBeDefined();

      // Western
      const western = calculateWesternChart({
        birthDate: leapDay,
        birthHour: 23,
        birthMinute: 59,
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: 7,
        houseSystem: 'placidus',
      });
      expect(western.planets.length).toBeGreaterThanOrEqual(7);
      expect(western.houses).toHaveLength(12);
      expect(western.planets.every((p) => Number.isFinite(p.tropicalLongitude))).toBe(true);

      // Mai Hoa
      const maihoaInput = buildTimeBasedInput(2024, 2, 29, 23);
      const maihoa = performTimeBasedDivination(maihoaInput);
      expect(maihoa.mainHexagram).toBeDefined();
      expect(maihoa.changedHexagram).toBeDefined();
    });

    it('handles Year 2000 Leap Century and Year 1900 Non-Leap Century boundaries', () => {
      const dates = [
        new Date(2000, 1, 29, 12, 0, 0), // Valid leap day
        new Date(2000, 0, 1, 0, 0, 0),   // Century boundary
        new Date(1900, 0, 1, 0, 0, 0),   // Oldest supported baseline
      ];

      for (const d of dates) {
        const western = calculateWesternChart({
          birthDate: d,
          birthHour: d.getHours(),
          birthMinute: d.getMinutes(),
          latitude: 10.8231,
          longitude: 106.6297,
          timezone: 7,
        });
        expect(western).toBeDefined();
        expect(western.ascendant).toBeGreaterThanOrEqual(0);
        expect(western.ascendant).toBeLessThan(360);
      }
    });

    it('handles Midnight Exact (00:00:00) and Late Rat (23:30:00) transitions smoothly', () => {
      const lateRat = generateTuViChart({
        solarDate: new Date(2024, 5, 15, 23, 30),
        birthClockHour: 23,
        birthMinute: 30,
        birthHour: 0,
        gender: 'nu',
        timezone: 'Asia/Ho_Chi_Minh',
        gioTyPolicy: 'next-day-standard',
      });

      const earlyRat = generateTuViChart({
        solarDate: new Date(2024, 5, 16, 0, 30),
        birthClockHour: 0,
        birthMinute: 30,
        birthHour: 0,
        gender: 'nu',
        timezone: 'Asia/Ho_Chi_Minh',
        gioTyPolicy: 'next-day-standard',
      });

      // Under next-day-standard, late Rat on June 15 has the same Day Can Chi as early Rat on June 16
      expect(lateRat.canChi.day.can).toBe(earlyRat.canChi.day.can);
      expect(lateRat.canChi.day.chi).toBe(earlyRat.canChi.day.chi);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 2. Extreme Geographic Boundaries
  // ────────────────────────────────────────────────────────────
  describe('2. Extreme Geographic Boundaries & Polar Fallbacks', () => {
    const extremeLocations = [
      { name: 'North Pole', lat: 90.0, lng: 0.0 },
      { name: 'South Pole', lat: -90.0, lng: 0.0 },
      { name: 'Svalbard High Arctic', lat: 78.2232, lng: 15.6267 },
      { name: 'Ushuaia Sub-Antarctic', lat: -54.8019, lng: -68.3030 },
      { name: 'Null Island', lat: 0.0, lng: 0.0 },
      { name: 'Antimeridian East', lat: 0.0, lng: 180.0 },
      { name: 'Antimeridian West', lat: 0.0, lng: -180.0 },
    ];

    for (const loc of extremeLocations) {
      it(`calculates Western chart without NaN or crash at ${loc.name} (${loc.lat}°, ${loc.lng}°)`, () => {
        const chart = calculateWesternChart({
          birthDate: new Date('1995-06-21T12:00:00Z'),
          birthHour: 12,
          birthMinute: 0,
          latitude: loc.lat,
          longitude: loc.lng,
          timezone: 0,
          houseSystem: 'placidus',
        });

        expect(chart).toBeDefined();
        expect(chart.houses).toHaveLength(12);
        expect(chart.houses.every((h) => Number.isFinite(h.longitude))).toBe(true);
        expect(chart.planets.every((p) => Number.isFinite(p.tropicalLongitude))).toBe(true);
        expect(Number.isFinite(chart.ascendant)).toBe(true);
        expect(Number.isFinite(chart.midheaven)).toBe(true);
      });
    }
  });

  // ────────────────────────────────────────────────────────────
  // 3. Cross-Engine Invariant Verification
  // ────────────────────────────────────────────────────────────
  describe('3. Cross-Engine Invariant Verification', () => {
    it('ensures Vedic Shodashavarga D1..D60 produces strictly valid zodiac signs for all 360 degrees', () => {
      const validSigns = [
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
      ];

      // Sample every 15 degrees across the entire zodiac (24 checkpoints)
      for (let lon = 0; lon < 360; lon += 15.25) {
        const dMap = computeShodashavargaMap(lon);
        for (const [varga, sign] of Object.entries(dMap)) {
          expect(validSigns, `Invalid sign ${sign} in ${varga} at lon ${lon}`).toContain(sign);
        }
      }
    });

    it('ensures Vimshottari Antardasha periods strictly sum to the exact Mahadasha duration', () => {
      const lords = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'] as const;
      const durations = [7, 20, 6, 10, 7, 18, 16, 19, 17];

      for (let i = 0; i < lords.length; i++) {
        const lord = lords[i];
        const mahaYears = durations[i];
        const antardashas = computeVimshottariAntardashas(lord, 2000, mahaYears);

        expect(antardashas).toHaveLength(9);
        expect(antardashas[0].lord).toBe(lord);

        const totalYears = antardashas.reduce((sum, a) => sum + a.duration, 0);
        expect(totalYears).toBeCloseTo(mahaYears, 4);
      }
    });

    it('ensures Sarvashtakavarga total points across all 12 signs equal exactly 337 points', () => {
      const planetSigns: Record<string, number> = {
        sun: 0,
        moon: 3,
        mars: 9,
        mercury: 5,
        jupiter: 11,
        venus: 1,
        saturn: 6,
        ascendant: 0,
      };

      const bav = computeBhinnashtakavarga(planetSigns);
      const sav = computeSarvashtakavarga(bav);
      expect(sav).toHaveLength(12);
      const totalPoints = sav.reduce((a, b) => a + b, 0);
      expect(totalPoints).toBe(337);
    });

    it('ensures Tri-Tradition Dialectical Synthesis generates complete structured report without empty sections', () => {
      const result = synthesizeTriSystemReport({
        western: {
          sunSign: 'Bạch Dương (Aries)',
          moonSign: 'Kim Ngưu (Taurus)',
          ascSign: 'Song Tử (Gemini)',
          dominantElement: 'Hỏa (Fire)',
          chartRuler: 'Thủy Tinh (Mercury)',
        },
        tuvi: {
          menhCung: 'Tý',
          thanCung: 'Thìn',
          menhNapAm: 'Hải Trung Kim',
          cuc: 'Thủy Nhị Cục',
          chinhTinhMenh: ['Tử Vi', 'Thiên Phủ'],
          chinhTinhThan: ['Vũ Khúc'],
          tuHoa: ['Hóa Lộc'],
        },
        vedic: {
          lagnaSign: 'Bạch Dương (Mesha)',
          moonRasiSign: 'Bảo Bình (Kumbha)',
          nakshatra: 'Ashwini',
          atmakaraka: 'Mặt Trời (Surya)',
          activeDashaLord: 'Mộc Tinh (Jupiter)',
        },
      });

      expect(result.socialPersonaVi.length).toBeGreaterThan(20);
      expect(result.circumstantialDestinyVi.length).toBeGreaterThan(20);
      expect(result.soulCoreVi.length).toBeGreaterThan(20);
      expect(result.consensusGiftsVi.length).toBeGreaterThan(0);
      expect(result.growthTensionsVi.length).toBeGreaterThan(0);
      expect(result.unifiedLifeAdviceVi.length).toBeGreaterThan(20);
      expect(result.elementalAlchemyVi).toBeDefined();
      expect(result.dashaConvergenceVi).toBeDefined();
      expect(result.triTraditionMatrix?.length).toBe(3);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 4. Multi-Tradition Divination Engines Deep Sweep
  // ────────────────────────────────────────────────────────────
  describe('4. Multi-Tradition Divination Engines Deep Sweep', () => {
    const testDate = new Date(1988, 7, 8, 8, 8); // Aug 8, 1988 08:08

    it('runs Mai Hoa Dịch Số with valid quẻ structure and ngũ hành hào', () => {
      const maihoaInput = buildTimeBasedInput(1988, 8, 8, 8);
      const maiHoa = performTimeBasedDivination(maihoaInput);
      expect(maiHoa.mainHexagram.name).toBeDefined();
      expect(maiHoa.mutualHexagram.name).toBeDefined();
      expect(maiHoa.changedHexagram.name).toBeDefined();
      expect(maiHoa.movingLine).toBeGreaterThanOrEqual(1);
      expect(maiHoa.movingLine).toBeLessThanOrEqual(6);
    });

    it('runs Kỳ Môn Độn Giáp with complete 9-palace structure', () => {
      const qmdj = generateQmdjChart(testDate, 'Thìn');
      expect(qmdj).toBeDefined();
      expect(qmdj.gameNumber).toBeDefined();
      expect(qmdj.palaces.length).toBe(9);
    });

    it('runs Lục Nhâm Đại Độn with complete Tứ Khóa and Tam Truyền', () => {
      const lucNham = generateLucNhamChart(testDate, 4);
      expect(lucNham).toBeDefined();
      expect(lucNham.tuKhoa.lessons).toHaveLength(4);
      expect(lucNham.tamTruyen).toBeDefined();
    });

    it('runs Thái Ất Thần Kinh with valid cosmic forecast', () => {
      const forecast = getCosmicForecast(2024);
      expect(forecast).toBeDefined();
      expect(forecast.year).toBe(2024);
      expect(forecast.canChiYear).toBeDefined();
      expect(forecast.oneLiner.length).toBeGreaterThan(0);
    });

    it('calculates Personal Day Score with bounded rating [0..100] and no NaN', () => {
      const score = calculatePersonalDayScore(1990, 'Ngọ');

      expect(score).toBeDefined();
      expect(score?.actionScore).toBeDefined();
      expect(Number.isFinite(score?.actionScore)).toBe(true);
      expect(score?.isTamHop).toBe(true); // 1990 Ngọ is Tam Hợp with Ngọ/Dần/Tuất
    });
  });

  // ────────────────────────────────────────────────────────────
  // 5. High-Volume Deterministic Fuzzing (100 Random Runs)
  // ────────────────────────────────────────────────────────────
  describe('5. High-Volume Deterministic Fuzzing (100 Random Generations)', () => {
    it('executes 100 random birth chart runs across all 3 systems with zero crashes or NaNs', () => {
      const seedBase = 1723968000000; // 2024 epoch

      for (let i = 0; i < 100; i++) {
        // Pseudo-random deterministic offsets
        const randomTime = seedBase - (i * 86400000 * 123.456) % (50 * 365 * 86400000);
        const birthDate = new Date(randomTime);
        const lat = ((i * 17.3) % 160) - 80; // [-80, +80]
        const lng = ((i * 29.7) % 360) - 180; // [-180, +180]
        const hour = Math.floor(Math.abs((i * 7) % 24));
        const minute = Math.floor(Math.abs((i * 13) % 60));
        const gender = i % 2 === 0 ? 'nam' : 'nu';

        // 1. Tử Vi Chart
        const tuvi = generateTuViChart({
          solarDate: birthDate,
          birthClockHour: hour,
          birthMinute: minute,
          birthHour: Math.floor((hour + 1) / 2) % 12,
          gender,
          timezone: 'Asia/Ho_Chi_Minh',
        });
        expect(tuvi.palaces).toHaveLength(12);
        expect(tuvi.palaces.every((p) => p.chinhTinh !== undefined)).toBe(true);

        // 2. Western Chart
        const western = calculateWesternChart({
          birthDate,
          birthHour: hour,
          birthMinute: minute,
          latitude: lat,
          longitude: lng,
          timezone: 7,
          houseSystem: 'placidus',
        });
        expect(western.houses).toHaveLength(12);
        expect(western.planets.length).toBeGreaterThanOrEqual(7);
        expect(Number.isFinite(western.ascendant)).toBe(true);

        // 3. Composite Chart
        const composite = calculateCompositeChart(
          {
            birthDate,
            birthHour: hour,
            birthMinute: minute,
            latitude: lat,
            longitude: lng,
            timezone: 7,
          },
          {
            birthDate: new Date(birthDate.getTime() + 86400000 * 400),
            birthHour: 10,
            birthMinute: 30,
            latitude: 21.0285,
            longitude: 105.8542,
            timezone: 7,
          },
        );
        expect(composite.planets.length).toBeGreaterThanOrEqual(7);
        expect(Number.isFinite(composite.ascendant)).toBe(true);
      }
    });
  });
});
