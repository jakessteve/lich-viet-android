import { describe, it, expect } from 'vitest';
import { synthesizeWesternNatalChart } from '@/services/astrology/westernSynthesisEngine';
import type { SwissNatalChartResult } from '@/services/astrology/swissNatalChart';

describe('Western Astrology Synthesis Engine', () => {
  const mockChart: SwissNatalChartResult = {
    birth: {
      utc: '1990-05-15T12:00:00Z',
      julianDayUt: 2448027.0,
      latitude: 21.0285,
      longitude: 105.8542,
      fixedUtcOffsetHours: 7,
      houseSystem: 'Placidus',
    },
    metadata: {
      engine: '@swisseph/browser',
      version: '2.10.3',
      ephemeris: 'Swiss Ephemeris files',
      fixedUtcOffsetHours: 7,
      requestedFlags: 0,
      returnedFlags: {},
      requestedEquatorialFlags: 0,
      returnedEquatorialFlags: {},
      objectPolicyVersion: 'western-natal-20-v1',
      aspectPolicyVersion: 'western-aspects-11-v1',
      timePolicy: 'fixed-utc-offset-v1',
      partOfFortuneAltitudePolicy: 'geocentric-equatorial-altitude-v1',
      partOfFortuneSolarAltitudeDeg: 45.0,
    },
    objects: [
      {
        id: 'planet:sun',
        name: 'Sun',
        nameVi: 'Mặt Trời',
        symbol: '☉',
        category: 'planet',
        isAngle: false,
        longitude: 54.5,
        latitude: 0,
        distance: 1,
        speed: 0.98,
        latitudeSpeed: 0,
        distanceSpeed: 0,
        rightAscension: 50,
        declination: 18,
        sign: 'Taurus',
        signVi: 'Kim Ngưu',
        degree: 24,
        minute: 30,
        retrograde: false,
        house: 10,
        dignity: {
          type: 'peregrine',
          labelVi: 'Tự Do (Peregrine)',
          symbol: '○',
          badgeClass: 'badge-gray',
          score: 0,
        },
      },
      {
        id: 'planet:moon',
        name: 'Moon',
        nameVi: 'Mặt Trăng',
        symbol: '☽',
        category: 'planet',
        isAngle: false,
        longitude: 290.0,
        latitude: 2.5,
        distance: 0.0025,
        speed: 12.5,
        latitudeSpeed: 0,
        distanceSpeed: 0,
        rightAscension: 290,
        declination: -20,
        sign: 'Capricorn',
        signVi: 'Ma Kết',
        degree: 20,
        minute: 0,
        retrograde: false,
        house: 6,
        dignity: {
          type: 'detriment',
          labelVi: 'Hãm Địa (Detriment)',
          symbol: '⊘',
          badgeClass: 'badge-rose',
          score: -5,
        },
      },
      {
        id: 'planet:mercury',
        name: 'Mercury',
        nameVi: 'Sao Thủy',
        symbol: '☿',
        category: 'planet',
        isAngle: false,
        longitude: 65.0,
        latitude: -1.0,
        distance: 0.8,
        speed: 1.2,
        latitudeSpeed: 0,
        distanceSpeed: 0,
        rightAscension: 60,
        declination: 20,
        sign: 'Gemini',
        signVi: 'Song Tử',
        degree: 5,
        minute: 0,
        retrograde: false,
        house: 10,
        dignity: {
          type: 'domicile',
          labelVi: 'Cư Miếu (Domicile)',
          symbol: '♔',
          badgeClass: 'badge-emerald',
          score: 5,
        },
      },
    ],
    houses: [
      { number: 1, longitude: 145.0, sign: 'Leo', signVi: 'Sư Tử', degree: 25, minute: 0 },
      { number: 10, longitude: 50.0, sign: 'Taurus', signVi: 'Kim Ngưu', degree: 20, minute: 0 },
    ],
    angles: {
      Ascendant: {
        id: 'angle:ascendant',
        name: 'Ascendant',
        nameVi: 'Cung Mọc',
        symbol: 'ASC',
        longitude: 145.0,
        sign: 'Leo',
        signVi: 'Sư Tử',
        degree: 25,
        minute: 0,
        isAngle: true,
      },
      Descendant: {
        id: 'angle:descendant',
        name: 'Descendant',
        nameVi: 'Cung Lặn',
        symbol: 'DSC',
        longitude: 325.0,
        sign: 'Aquarius',
        signVi: 'Bảo Bình',
        degree: 25,
        minute: 0,
        isAngle: true,
      },
      Midheaven: {
        id: 'angle:midheaven',
        name: 'Midheaven',
        nameVi: 'Thiên Đỉnh',
        symbol: 'MC',
        longitude: 50.0,
        sign: 'Taurus',
        signVi: 'Kim Ngưu',
        degree: 20,
        minute: 0,
        isAngle: true,
      },
      'Imum Coeli': {
        id: 'angle:imum-coeli',
        name: 'Imum Coeli',
        nameVi: 'Thiên Đế',
        symbol: 'IC',
        longitude: 230.0,
        sign: 'Scorpio',
        signVi: 'Bọ Cạp',
        degree: 20,
        minute: 0,
        isAngle: true,
      },
    },
    aspects: [
      {
        id: 'sun-trine-moon',
        name: 'trine',
        objectAId: 'planet:sun',
        objectAName: 'Mặt Trời',
        objectBId: 'planet:moon',
        objectBName: 'Mặt Trăng',
        separation: 124.5,
        exactAngle: 120,
        allowedOrb: 8,
        orbDifference: 4.5,
        state: 'applying',
        strength: 0.8,
        color: '#22c55e',
        opacity: 0.8,
        width: 1.5,
        dashPattern: '',
        layer: 1,
      },
    ],
    aspectPatterns: [],
    elementBalance: {
      elements: { Fire: 25, Earth: 50, Air: 25, Water: 0 },
      modalities: { Cardinal: 30, Fixed: 50, Mutable: 20 },
      dominantElement: 'Earth',
      dominantModality: 'Fixed',
      signatureSign: 'Kim Ngưu',
    },
    moonPhase: {
      key: 'waning_gibbous',
      nameVi: 'Trăng Khuyết Cuối Tháng (Waning Gibbous)',
      nameEn: 'Waning Gibbous',
      symbol: '🌖',
      phaseAngle: 235.5,
      illuminationPercentage: 75,
      descriptionVi: 'Thời kỳ chia sẻ tri thức và hoàn thiện các kế hoạch.',
      personalityTraitsVi: 'Tính cách sâu sắc, thích truyền đạt kinh nghiệm.',
    },
    houseRulers: [
      {
        houseNumber: 1,
        sign: 'Leo',
        signVi: 'Sư Tử',
        degree: 25,
        minute: 0,
        traditionalRulerId: 'planet:sun',
        traditionalRulerVi: 'Mặt Trời',
        traditionalRulerSymbol: '☉',
        rulerHouse: 10,
        rulerSignVi: 'Kim Ngưu',
      },
    ],
    legacyResult: {} as unknown as SwissNatalChartResult['legacyResult'],
  };

  it('correctly calculates Diurnal Sect for Sun in House 10', () => {
    const reading = synthesizeWesternNatalChart(mockChart);
    expect(reading.sect.isDiurnal).toBe(true);
    expect(reading.sect.descriptionVi).toContain('Lá số Ban Ngày');
  });

  it('correctly synthesizes Chart Ruler and Big Three dynamics', () => {
    const reading = synthesizeWesternNatalChart(mockChart);
    expect(reading.chartRulerSynthesisVi).toContain('Mặt Trời');
    expect(reading.chartRulerSynthesisVi).toContain('Nhà 10');
    expect(reading.bigThreeSynthesisVi).toContain('Kim Ngưu');
    expect(reading.bigThreeSynthesisVi).toContain('Ma Kết');
    expect(reading.bigThreeSynthesisVi).toContain('Sư Tử');
  });

  it('generates rich object syntheses with dignity and house rulership', () => {
    const reading = synthesizeWesternNatalChart(mockChart);
    const mercurySynth = reading.objectSyntheses['planet:mercury'];
    expect(mercurySynth).toBeDefined();
    expect(mercurySynth?.dignitySummaryVi).toContain('Cư Miếu (Domicile)');
    expect(mercurySynth?.fullContextualReadingVi).toContain('Song Tử');
  });
});
