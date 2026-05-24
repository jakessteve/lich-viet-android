import type { Chi, CanChi } from '../../types/calendar';
import type { TuViBirthLocation } from '../../types/tuvi';
import { CAN, CHI } from '../../utils/constants';
import { getCanChiDay, getCanChiYear, parseCanChi } from '../../utils/calendarEngine';
import { getHourBranch, getHourCan, normalizeBirthTimeWithPolicy } from '../tuvi/timeNormalization';
import {
  getSwissEphemerisInstance,
  getSwissTrueSolarCivilTimeForLocation,
  type SwissGeoLocation,
} from '../astronomy/swissEphemeris';

export interface PersonalBirthDetails {
  birthMonth?: number | null;
  birthDay?: number | null;
  birthHour?: number | null;
  birthMinute?: number | null;
  birthLocation?: TuViBirthLocation | null;
}

export interface ResolvedPersonalBirthMoment {
  correctedDate: Date;
  yearCanChi: CanChi;
  dayCanChi?: CanChi;
  hourCanChi?: CanChi;
  hasExactBirthDate: boolean;
  hasExactBirthTime: boolean;
}

function getValidCivilBirthDate(
  birthYear: number,
  birthMonth?: number | null,
  birthDay?: number | null,
  birthHour?: number | null,
  birthMinute?: number | null,
): Date | null {
  if (!Number.isFinite(birthYear) || !Number.isFinite(birthMonth ?? NaN) || !Number.isFinite(birthDay ?? NaN)) {
    return null;
  }

  const hour = Number.isFinite(birthHour ?? NaN) ? Number(birthHour) : 12;
  const minute = Number.isFinite(birthMinute ?? NaN) ? Number(birthMinute) : 0;
  const date = new Date(birthYear, Number(birthMonth) - 1, Number(birthDay), hour, minute, 0, 0);

  if (
    date.getFullYear() !== birthYear ||
    date.getMonth() !== Number(birthMonth) - 1 ||
    date.getDate() !== Number(birthDay)
  ) {
    return null;
  }

  return date;
}

function applyBirthLocationCorrection(date: Date, birthLocation?: TuViBirthLocation | null): Date {
  if (!birthLocation) {
    return new Date(date.getTime());
  }

  const timezoneOffsetHours = Number.isFinite(birthLocation.timezone)
    ? birthLocation.timezone
    : Math.max(-12, Math.min(14, Math.round(birthLocation.lng / 15)));

  const swe = getSwissEphemerisInstance();
  const corrected = swe
    ? getSwissTrueSolarCivilTimeForLocation(swe, date, {
        longitude: birthLocation.lng,
        timezoneOffsetHours,
      } as SwissGeoLocation)
    : new Date(date.getTime() + 4 * (birthLocation.lng - timezoneOffsetHours * 15) * 60 * 1000);

  return normalizeBirthTimeWithPolicy(corrected, birthLocation).correctedDate;
}

function toChiPair(canChi: string): CanChi {
  return parseCanChi(canChi);
}

export function resolvePersonalBirthMoment(
  birthYear: number,
  birthDetails?: PersonalBirthDetails | null,
): ResolvedPersonalBirthMoment | null {
  if (!Number.isFinite(birthYear)) {
    return null;
  }

  const yearCanChi = parseCanChi(getCanChiYear(birthYear));
  const hasExactBirthDate = Number.isFinite(birthDetails?.birthMonth ?? NaN) && Number.isFinite(birthDetails?.birthDay ?? NaN);
  const hasExactBirthTime = Number.isFinite(birthDetails?.birthHour ?? NaN) || Number.isFinite(birthDetails?.birthMinute ?? NaN);

  if (!hasExactBirthDate) {
    return {
      correctedDate: new Date(birthYear, 0, 1),
      yearCanChi,
      hasExactBirthDate: false,
      hasExactBirthTime: false,
    };
  }

  const civilBirthDate = getValidCivilBirthDate(
    birthYear,
    birthDetails?.birthMonth,
    birthDetails?.birthDay,
    birthDetails?.birthHour,
    birthDetails?.birthMinute,
  );

  if (!civilBirthDate) {
    return null;
  }

  const correctedDate = applyBirthLocationCorrection(civilBirthDate, birthDetails?.birthLocation);
  const dayCanChi = toChiPair(getCanChiDay(correctedDate));
  const hourBranch = getHourBranch(correctedDate.getHours());
  const hourCanChi = {
    can: CAN[getHourCan(CAN.indexOf(dayCanChi.can), hourBranch)],
    chi: CHI[hourBranch],
  } as CanChi;

  return {
    correctedDate,
    yearCanChi,
    dayCanChi,
    hourCanChi,
    hasExactBirthDate: true,
    hasExactBirthTime,
  };
}
