/**
 * Gold-Standard Multi-Tradition Astrological Benchmark Fixtures — Lịch Việt v4
 *
 * 5 Reference Benchmark Fixtures for high-precision verification:
 * 1. Reference Hanoi Standard (1985-05-15 08:30 GMT+7)
 * 2. Reference Saigon Pre-1975 GMT+8 (1968-07-20 14:15 Saigon Time)
 * 3. Reference Midnight Rat / Dạ Tý Boundary (2024-02-10 23:30 Hanoi GMT+7)
 * 4. Reference High-Latitude / Polar Boundary (Tromsø Norway 69.6492°N, 1990-06-21 12:00 UTC)
 * 5. Reference Vedic Jyotish Master (Varanasi India 1975-10-24 06:15 IST GMT+5.5)
 */

export interface BenchmarkFixture {
  id: string;
  name: string;
  solarDate: Date;
  birthHour: number;
  gender: 'nam' | 'nữ';
  timezone: string;
  latitude: number;
  longitude: number;
  expectedTuVi: {
    lunarYearCanChi: string;
    lunarMonthCanChi: string;
    lunarDayCanChi: string;
    lunarHourCanChi: string;
    menhPalace: string;
    thanPalace: string;
    cucName: string;
  };
  expectedWestern: {
    sunSign: string;
    moonSign: string;
    ascendantSign: string;
  };
  expectedVedic: {
    lahiriSunSign: string;
    lahiriMoonNakshatra: string;
    d9MoonSign: string;
  };
}

export const BENCHMARK_FIXTURES: BenchmarkFixture[] = [
  {
    id: 'hanoi_1985',
    name: 'Hà Nội Standard 1985',
    solarDate: new Date('1985-05-15T08:30:00+07:00'),
    birthHour: 4, // Thìn (07:00-09:00)
    gender: 'nam',
    timezone: 'Asia/Ho_Chi_Minh',
    latitude: 21.0285,
    longitude: 105.8542,
    expectedTuVi: {
      lunarYearCanChi: 'Ất Sửu',
      lunarMonthCanChi: 'Tân Tỵ',
      lunarDayCanChi: 'Ất Tỵ',
      lunarHourCanChi: 'Canh Thìn',
      menhPalace: 'Tuất',
      thanPalace: 'Dần',
      cucName: 'Hỏa Lục Cục',
    },
    expectedWestern: {
      sunSign: 'Taurus',
      moonSign: 'Pisces',
      ascendantSign: 'Gemini',
    },
    expectedVedic: {
      lahiriSunSign: 'aries',
      lahiriMoonNakshatra: 'Purva Bhadrapada',
      d9MoonSign: 'cancer',
    },
  },
  {
    id: 'saigon_1968',
    name: 'Sài Gòn 1968 Historical GMT+8',
    solarDate: new Date('1968-07-20T14:15:00+08:00'),
    birthHour: 7, // Mùi (13:00-15:00)
    gender: 'nữ',
    timezone: 'Asia/Ho_Chi_Minh',
    latitude: 10.8231,
    longitude: 106.6297,
    expectedTuVi: {
      lunarYearCanChi: 'Mậu Thân',
      lunarMonthCanChi: 'Kỷ Mùi',
      lunarDayCanChi: 'Tân Mão',
      lunarHourCanChi: 'Ất Mùi',
      menhPalace: 'Thân',
      thanPalace: 'Thân',
      cucName: 'Mộc Tam Cục',
    },
    expectedWestern: {
      sunSign: 'Cancer',
      moonSign: 'Taurus',
      ascendantSign: 'Scorpio',
    },
    expectedVedic: {
      lahiriSunSign: 'cancer',
      lahiriMoonNakshatra: 'Krittika',
      d9MoonSign: 'sagittarius',
    },
  },
  {
    id: 'da_ty_2024',
    name: 'Dạ Tý Boundary 2024 (23:30)',
    solarDate: new Date('2024-02-10T23:30:00+07:00'),
    birthHour: 0, // Tý (23:00-01:00)
    gender: 'nam',
    timezone: 'Asia/Ho_Chi_Minh',
    latitude: 21.0285,
    longitude: 105.8542,
    expectedTuVi: {
      lunarYearCanChi: 'Giáp Thìn',
      lunarMonthCanChi: 'Bính Dần',
      lunarDayCanChi: 'Ất Tỵ', // Advanced to next day (Feb 11) for standard TuVi
      lunarHourCanChi: 'Bính Tý',
      menhPalace: 'Dần',
      thanPalace: 'Dần',
      cucName: 'Thủy Nhị Cục',
    },
    expectedWestern: {
      sunSign: 'Aquarius',
      moonSign: 'Pisces',
      ascendantSign: 'Libra',
    },
    expectedVedic: {
      lahiriSunSign: 'capricorn',
      lahiriMoonNakshatra: 'Purva Bhadrapada',
      d9MoonSign: 'aries',
    },
  },
  {
    id: 'polar_tromso_1990',
    name: 'Tromsø Polar Latitude (69.65°N)',
    solarDate: new Date('1990-06-21T12:00:00Z'),
    birthHour: 6, // Ngọ
    gender: 'nam',
    timezone: 'UTC',
    latitude: 69.6492,
    longitude: 18.9553,
    expectedTuVi: {
      lunarYearCanChi: 'Canh Ngọ',
      lunarMonthCanChi: 'Nhâm Ngọ',
      lunarDayCanChi: 'Mậu Dần',
      lunarHourCanChi: 'Mậu Ngọ',
      menhPalace: 'Tý',
      thanPalace: 'Tý',
      cucName: 'Thủy Nhị Cục',
    },
    expectedWestern: {
      sunSign: 'Gemini',
      moonSign: 'Gemini',
      ascendantSign: 'Virgo',
    },
    expectedVedic: {
      lahiriSunSign: 'gemini',
      lahiriMoonNakshatra: 'Rohini',
      d9MoonSign: 'scorpio',
    },
  },
  {
    id: 'vedic_varanasi_1975',
    name: 'Varanasi Master Jyotish 1975',
    solarDate: new Date('1975-10-24T06:15:00+05:30'),
    birthHour: 3, // Mão
    gender: 'nam',
    timezone: 'Asia/Kolkata',
    latitude: 25.3176,
    longitude: 82.9739,
    expectedTuVi: {
      lunarYearCanChi: 'Ất Mão',
      lunarMonthCanChi: 'Bính Tuất',
      lunarDayCanChi: 'Kỷ Hợi',
      lunarHourCanChi: 'Đinh Mão',
      menhPalace: 'Thìn',
      thanPalace: 'Thân',
      cucName: 'Mộc Tam Cục',
    },
    expectedWestern: {
      sunSign: 'Scorpio',
      moonSign: 'Gemini',
      ascendantSign: 'Libra',
    },
    expectedVedic: {
      lahiriSunSign: 'libra',
      lahiriMoonNakshatra: 'Mrigashira',
      d9MoonSign: 'capricorn',
    },
  },
];
