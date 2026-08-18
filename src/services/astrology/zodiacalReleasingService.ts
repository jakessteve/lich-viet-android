import { calculateZodiacalReleasing } from '@lich-viet/core-logic';
import type { SwissNatalChartResult } from './swissNatalChart';

export interface ZodiacalPeriod {
  level: number;
  sign: string;
  signVi: string;
  durationYears?: number;
  durationMonths?: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  isPeak: boolean;
  peakType?: string | null;
  isLoosingOfHelm?: boolean;
  subPeriods?: ZodiacalPeriod[];
}

export interface ZodiacalReleasingReport {
  lotOfFortune: {
    sign: string;
    signVi: string;
    longitude: number;
  };
  lotOfSpirit: {
    sign: string;
    signVi: string;
    longitude: number;
  };
  releasingFromSpirit: ZodiacalPeriod[];
  releasingFromFortune: ZodiacalPeriod[];
}

export function generateZodiacalReleasingReport(
  natalResult: SwissNatalChartResult,
  birthDate: Date,
  maxYears = 85,
): ZodiacalReleasingReport {
  const fortuneObj = natalResult.objects.find((o) => o.id === 'derived:part-of-fortune');
  const sunObj = natalResult.objects.find((o) => o.id === 'planet:sun');
  const moonObj = natalResult.objects.find((o) => o.id === 'planet:moon');
  const ascLong = natalResult.angles.Ascendant.longitude;

  const fortuneSign = fortuneObj?.sign || 'Aries';
  const fortuneSignVi = fortuneObj?.signVi || 'Bạch Dương';
  const fortuneLong = fortuneObj?.longitude || 0;

  // Lot of Spirit is reverse of Fortune relative to Asc
  const sunLong = sunObj?.longitude || 0;
  const moonLong = moonObj?.longitude || 0;
  const isDay = sunObj?.house ? sunObj.house >= 7 : true;

  const norm = (v: number) => ((v % 360) + 360) % 360;
  const spiritLong = isDay ? norm(ascLong + sunLong - moonLong) : norm(ascLong + moonLong - sunLong);

  const SIGN_NAMES = [
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
  const SIGN_NAMES_VI = [
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
  const spiritSignIdx = Math.floor(spiritLong / 30);
  const spiritSign = SIGN_NAMES[spiritSignIdx];
  const spiritSignVi = SIGN_NAMES_VI[spiritSignIdx];

  const releasingFromSpirit = calculateZodiacalReleasing(
    spiritSign,
    birthDate,
    fortuneSign,
    maxYears,
  ) as ZodiacalPeriod[];
  const releasingFromFortune = calculateZodiacalReleasing(
    fortuneSign,
    birthDate,
    fortuneSign,
    maxYears,
  ) as ZodiacalPeriod[];

  return {
    lotOfFortune: {
      sign: fortuneSign,
      signVi: fortuneSignVi,
      longitude: fortuneLong,
    },
    lotOfSpirit: {
      sign: spiritSign,
      signVi: spiritSignVi,
      longitude: spiritLong,
    },
    releasingFromSpirit,
    releasingFromFortune,
  };
}
