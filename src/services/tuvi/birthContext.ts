import type { Can, Chi } from '../../types/calendar';
import type {
  HistoricalVietnamRegion,
  TuViBirthLocation,
  TuViGioTyPolicy,
  TuViInput,
  TuViLeapMonthPolicy,
  TuViTimePolicy,
} from '../../types/tuvi';
import { CAN, CHI } from '../../utils/constants';
import { getCanChiDay, getLunarDate } from '../../utils/calendarEngine';
import { getDatePartsInTimeZone, getHourBranch, normalizeBirthTimeWithPolicy } from './timeNormalization';
import {
  TU_VI_SCHOOL_PROFILES,
  type TuViSchoolProfile,
} from './schoolProfiles';
import {
  getSwissEphemerisInstance,
  getSwissTrueSolarCivilTimeForLocation,
  type SwissGeoLocation,
} from '../astronomy/swissEphemeris';

function mod10(n: number): number {
  return ((n % 10) + 10) % 10;
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

function normalizeToIanaTimezone(date: Date, timezone: string): Date {
  const parts = getDatePartsInTimeZone(date, timezone);
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
}

function resolveCivilBirthDate(input: TuViInput): Date | null {
  const expectedHourBranch = mod12(input.birthHour);

  if (input.birthClockHour === undefined && input.birthMinute === undefined) {
    const localHourBranch = Math.floor(((input.solarDate.getHours() + 1) % 24) / 2);
    const utcHourBranch = Math.floor(((input.solarDate.getUTCHours() + 1) % 24) / 2);
    if (utcHourBranch !== expectedHourBranch || localHourBranch === expectedHourBranch) {
      return null;
    }

    return new Date(
      input.solarDate.getUTCFullYear(),
      input.solarDate.getUTCMonth(),
      input.solarDate.getUTCDate(),
      input.solarDate.getUTCHours(),
      input.solarDate.getUTCMinutes(),
      0,
      0,
    );
  }

  const localHourBranch = Math.floor(((input.solarDate.getHours() + 1) % 24) / 2);
  const utcHourBranch = Math.floor(((input.solarDate.getUTCHours() + 1) % 24) / 2);
  const shouldReadUtcByBranch =
    input.birthClockHour === undefined &&
    utcHourBranch === expectedHourBranch &&
    localHourBranch !== expectedHourBranch;

  const clockHour =
    input.birthClockHour ?? (shouldReadUtcByBranch ? input.solarDate.getUTCHours() : input.solarDate.getHours());
  const clockMinute =
    input.birthMinute ?? (shouldReadUtcByBranch ? input.solarDate.getUTCMinutes() : input.solarDate.getMinutes());
  const localMatchesClock = input.solarDate.getHours() === clockHour && input.solarDate.getMinutes() === clockMinute;
  const utcMatchesClock =
    input.solarDate.getUTCHours() === clockHour && input.solarDate.getUTCMinutes() === clockMinute;

  const readUtcFields = shouldReadUtcByBranch || (utcMatchesClock && !localMatchesClock);
  const year = readUtcFields ? input.solarDate.getUTCFullYear() : input.solarDate.getFullYear();
  const month = readUtcFields ? input.solarDate.getUTCMonth() : input.solarDate.getMonth();
  const day = readUtcFields ? input.solarDate.getUTCDate() : input.solarDate.getDate();

  return new Date(year, month, day, clockHour, clockMinute, 0, 0);
}

function applyTrueSolarTime(date: Date, birthLocation?: TuViBirthLocation): Date {
  if (!birthLocation) {
    return new Date(date.getTime());
  }

  const timezoneOffset = birthLocation.timezone * 15;
  const diffMinutes = 4 * (birthLocation.lng - timezoneOffset);
  return new Date(date.getTime() + diffMinutes * 60 * 1000);
}

function applyTrueSolarTimeLayer(date: Date, birthLocation?: TuViBirthLocation): Date {
  if (!birthLocation) {
    return new Date(date.getTime());
  }

  const swe = getSwissEphemerisInstance();
  if (swe) {
    const location: SwissGeoLocation = {
      longitude: birthLocation.lng,
      timezoneOffsetHours: birthLocation.timezone,
    };
    return getSwissTrueSolarCivilTimeForLocation(swe, date, location);
  }

  return applyTrueSolarTime(date, birthLocation);
}

function resolveLeapMonthPolicyMonth(
  lunar: { day: number; month: number; isLeap: boolean },
  leapMonthPolicy: TuViLeapMonthPolicy,
): number {
  if (!lunar.isLeap) {
    return lunar.month;
  }
  if (leapMonthPolicy === 'split-15') {
    return lunar.day > 15 ? lunar.month + 1 : lunar.month;
  }
  if (leapMonthPolicy === 'next-month') {
    return lunar.month + 1;
  }
  return lunar.month;
}

export interface TuViBirthContext {
  correctedDate: Date;
  lunarDate: {
    day: number;
    month: number;
    year: number;
    isLeap: boolean;
  };
  logicalMonth: number;
  yearCanIndex: number;
  yearChiIndex: number;
  dayCanIndex: number;
  dayChiIndex: number;
  hourBranchIndex: number;
  hourCanIndex: number;
  canChi: {
    year: { can: Can; chi: Chi };
    month: { can: Can; chi: Chi };
    day: { can: Can; chi: Chi };
    hour: { can: Can; chi: Chi };
  };
  amDuong: 'Dương' | 'Âm';
  thuanNghich: 'Thuận' | 'Nghịch';
  timePolicy: TuViTimePolicy;
  gioTyPolicy: TuViGioTyPolicy;
  leapMonthPolicy: TuViLeapMonthPolicy;
  historicalRegion?: HistoricalVietnamRegion;
  warnings: string[];
}

export function buildTuViBirthContext(input: TuViInput, schoolProfile?: TuViSchoolProfile): TuViBirthContext {
  const profile =
    schoolProfile ??
    TU_VI_SCHOOL_PROFILES[input.school || 'nam-phai'] ??
    TU_VI_SCHOOL_PROFILES['nam-phai'];
  const activeTimePolicy: TuViTimePolicy = input.timePolicy ?? profile.timePolicy ?? 'historical-vietnam';
  const activeGioTyPolicy: TuViGioTyPolicy = input.gioTyPolicy ?? 'next-day-standard';
  const activeLeapMonthPolicy: TuViLeapMonthPolicy = input.leapMonthPolicy ?? profile.leapMonthPolicy ?? 'split-15';
  const zonedDate = resolveCivilBirthDate(input) ?? normalizeToIanaTimezone(input.solarDate, input.timezone);
  const trueSolarDate = activeTimePolicy === 'true-solar'
    ? applyTrueSolarTimeLayer(zonedDate, input.birthLocation)
    : zonedDate;
  const normalized = activeTimePolicy === 'civil'
    ? {
        correctedDate: trueSolarDate,
        offsetHours: input.birthLocation?.timezone ?? 7,
        historicalRegion: undefined,
        warnings: [],
      }
    : normalizeBirthTimeWithPolicy(trueSolarDate, input.birthLocation);
  const correctedDate = normalized.correctedDate;
  const swissLocation: SwissGeoLocation | undefined = input.birthLocation
    ? {
        longitude: input.birthLocation.lng,
        timezoneOffsetHours: input.birthLocation.timezone,
      }
    : undefined;
  const lunar = getLunarDate(correctedDate, swissLocation);
  const logicalMonth = resolveLeapMonthPolicyMonth(lunar, activeLeapMonthPolicy);

  const yearCanIndex = mod10(lunar.year - 4);
  const yearChiIndex = mod12(lunar.year - 4);
  const yearCan = CAN[yearCanIndex];
  const yearChi = CHI[yearChiIndex];

  const monthCanIndex = mod10(yearCanIndex * 2 + logicalMonth + 1);
  const monthChiIndex = mod12(2 + logicalMonth - 1);
  const monthCan = CAN[monthCanIndex];
  const monthChi = CHI[monthChiIndex];

  const hourBranchIndex =
    input.birthClockHour !== undefined ? getHourBranch(correctedDate.getHours()) : mod12(input.birthHour);

  // Check if birth hour is Dạ Tý (23:00 - 24:00)
  const isLateRat = hourBranchIndex === 0 && correctedDate.getHours() === 23;
  const shouldAdvanceDayForCanChi = isLateRat && activeGioTyPolicy === 'next-day-standard';
  const dateForDayCanChi = shouldAdvanceDayForCanChi
    ? new Date(correctedDate.getFullYear(), correctedDate.getMonth(), correctedDate.getDate() + 1)
    : correctedDate;

  const dayCanChiStr = getCanChiDay(dateForDayCanChi);
  const [dayCan, dayChi] = dayCanChiStr.split(' ') as [Can, Chi];
  const dayCanIndex = CAN.indexOf(dayCan);
  const dayChiIndex = CHI.indexOf(dayChi);

  const hourCanIndex = mod10(dayCanIndex * 2 + hourBranchIndex);
  const hourCan = CAN[hourCanIndex];
  const hourChi = CHI[hourBranchIndex];

  const amDuong = yearCanIndex % 2 === 0 ? 'Dương' : 'Âm';
  const isMale = input.gender === 'nam';
  const thuanNghich = (amDuong === 'Dương' && isMale) || (amDuong === 'Âm' && !isMale) ? 'Thuận' : 'Nghịch';

  const warnings = [...normalized.warnings];
  if (activeTimePolicy === 'true-solar') {
    warnings.push('Đang áp dụng Giờ Mặt Trời Thực (True Solar Time) theo kinh độ và phương trình thời gian.');
  }
  if (isLateRat && activeGioTyPolicy === 'next-day-standard') {
    warnings.push('Sinh vào giờ Tý đêm (23h-24h): Can Chi ngày được tính chuyển sang ngày hôm sau.');
  } else if (isLateRat && activeGioTyPolicy === 'da-ty-split') {
    warnings.push('Sinh vào giờ Dạ Tý (23h-24h): Giữ nguyên Can Chi ngày cũ theo quy ước Dạ Tý phân biệt.');
  }
  if (input.leapMonthPolicy && input.leapMonthPolicy !== profile.leapMonthPolicy) {
    warnings.push(`Leap-month override applied: ${input.leapMonthPolicy}.`);
  }

  return {
    correctedDate,
    lunarDate: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      isLeap: lunar.isLeap,
    },
    logicalMonth,
    yearCanIndex,
    yearChiIndex,
    dayCanIndex,
    dayChiIndex,
    hourBranchIndex,
    hourCanIndex,
    canChi: {
      year: { can: yearCan, chi: yearChi },
      month: { can: monthCan, chi: monthChi },
      day: { can: dayCan, chi: dayChi },
      hour: { can: hourCan, chi: hourChi },
    },
    amDuong,
    thuanNghich,
    timePolicy: activeTimePolicy,
    gioTyPolicy: activeGioTyPolicy,
    leapMonthPolicy: activeLeapMonthPolicy,
    historicalRegion: normalized.historicalRegion,
    warnings,
  };
}

