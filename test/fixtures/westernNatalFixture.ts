import { REQUIRED_OBJECT_SCHEMA, type SwissNatalChartResult } from '@/services/astrology/swissNatalChart';

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];
const SIGNS_VI = [
  'Bạch Dương',
  'Kim Ngưu',
  'Song Tử',
  'Cự Giải',
  'Sư Tử',
  'Xử Nữ',
  'Thiên Bình',
  'Bọ Cạp',
  'Nhân Mã',
  'Ma Kết',
  'Bảo Bình',
  'Song Ngư',
];

function zodiac(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const withinSign = normalized % 30;
  const degree = Math.floor(withinSign);
  return {
    longitude: normalized,
    sign: SIGNS[signIndex],
    signVi: SIGNS_VI[signIndex],
    degree,
    minute: Math.floor((withinSign - degree) * 60),
  };
}

export function createWesternNatalFixture(): SwissNatalChartResult {
  const longitudes = [14, 14.5, 42, 61, 79, 97, 116, 135, 153, 172, 190, 208, 226, 244, 263, 281, 300, 319, 338, 356];
  const objects = REQUIRED_OBJECT_SCHEMA.map((entry, index) => {
    const position = zodiac(longitudes[index]);
    const motionKnown = entry.id !== 'derived:part-of-fortune' && entry.id !== 'angle:vertex';
    const speed = motionKnown ? (index % 4 === 0 ? -0.2 : 0.7) : null;
    return {
      ...position,
      id: entry.id,
      name: entry.name,
      nameVi: entry.nameVi,
      symbol: entry.symbol,
      category: entry.category,
      isAngle: entry.isAngle,
      latitude: 0,
      distance: motionKnown ? 1 : null,
      speed,
      latitudeSpeed: motionKnown ? 0 : null,
      distanceSpeed: motionKnown ? 0 : null,
      rightAscension: motionKnown ? (position.longitude + 2) % 360 : null,
      declination: motionKnown ? -12 + index : null,
      retrograde: speed === null ? null : speed < 0,
      house: (Math.floor(((position.longitude - 14 + 360) % 360) / 30) % 12) + 1,
    };
  });
  const houses = Array.from({ length: 12 }, (_, index) => {
    const position = zodiac(14 + index * 30);
    return { number: index + 1, ...position };
  });
  const makeAngle = (
    id: string,
    name: 'Ascendant' | 'Descendant' | 'Midheaven' | 'Imum Coeli',
    nameVi: string,
    symbol: string,
    longitude: number,
  ) => ({
    id,
    name,
    nameVi,
    symbol,
    ...zodiac(longitude),
    isAngle: true as const,
  });
  const aspects = [
    {
      id: 'conjunction',
      name: 'Conjunction',
      objectAId: objects[0].id,
      objectAName: objects[0].name,
      objectBId: objects[1].id,
      objectBName: objects[1].name,
      separation: 0.5,
      exactAngle: 0,
      allowedOrb: 8,
      orbDifference: 0.5,
      state: 'applying' as const,
      strength: 0.9375,
      color: '#7A4E9D',
      opacity: 0.72,
      width: 1.35,
      dashPattern: 'solid',
      layer: 5,
    },
    {
      id: 'trine',
      name: 'Trine',
      objectAId: objects[0].id,
      objectAName: objects[0].name,
      objectBId: objects[7].id,
      objectBName: objects[7].name,
      separation: 121,
      exactAngle: 120,
      allowedOrb: 7,
      orbDifference: 1,
      state: 'separating' as const,
      strength: 6 / 7,
      color: '#315FA8',
      opacity: 0.74,
      width: 1.15,
      dashPattern: 'solid',
      layer: 3,
    },
  ];
  return {
    birth: {
      utc: '2000-01-01T05:00:00.000Z',
      julianDayUt: 2451544.708333,
      latitude: 21.0285,
      longitude: 105.8542,
      fixedUtcOffsetHours: 7,
      locationName: 'Hà Nội',
      houseSystem: 'placidus',
    },
    metadata: {
      engine: '@swisseph/browser',
      version: '2.10.03-test',
      ephemeris: 'Swiss Ephemeris files',
      fixedUtcOffsetHours: 7,
      requestedFlags: 258,
      returnedFlags: Object.fromEntries(
        REQUIRED_OBJECT_SCHEMA.filter((entry) => entry.swissBody !== undefined).map((entry) => [entry.id, 258]),
      ),
      requestedEquatorialFlags: 2306,
      returnedEquatorialFlags: Object.fromEntries(
        REQUIRED_OBJECT_SCHEMA.filter((entry) => entry.swissBody !== undefined).map((entry) => [entry.id, 2306]),
      ),
      objectPolicyVersion: 'western-natal-20-v1',
      aspectPolicyVersion: 'western-aspects-11-v1',
      timePolicy: 'fixed-utc-offset-v1',
      partOfFortuneAltitudePolicy: 'geocentric-equatorial-altitude-v1',
      partOfFortuneSolarAltitudeDeg: 42.5,
    },
    objects,
    houses,
    angles: {
      Ascendant: makeAngle('angle:ascendant', 'Ascendant', 'Cung Mọc', 'ASC', 14),
      Descendant: makeAngle('angle:descendant', 'Descendant', 'Cung Lặn', 'DSC', 194),
      Midheaven: makeAngle('angle:midheaven', 'Midheaven', 'Thiên Đỉnh', 'MC', 284),
      'Imum Coeli': makeAngle('angle:imum-coeli', 'Imum Coeli', 'Thiên Đế', 'IC', 104),
    },
    aspects,
    legacyResult: {
      planets: [],
      houses: [],
      dignities: [],
      aspects: [],
      dispositorTree: null,
      chartShape: null,
      partOfFortune: { longitude: 263, sign: 'Nhân Mã', signIndex: 8 },
      ascendant: 14,
      midheaven: 284,
    },
  };
}
