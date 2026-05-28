import type { User } from '@/types/auth';
import type { TuViBirthLocation, TuViGender, TuViInput, TuViSchool, TuViTimePolicy } from '@/types/tuvi';

export interface UserBirthProfile {
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  birthMinute?: number;
  gender?: 'male' | 'female';
  birthLocation?: TuViBirthLocation;
}

function parseBirthday(birthday?: string) {
  if (!birthday) return null;
  const [year, month, day] = birthday.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function toBirthLocation(
  location?: { lat: number; lng: number; city: string; countryCode?: string; countryName?: string } | null,
): TuViBirthLocation | undefined {
  if (!location) return undefined;
  return {
    locationName: location.city,
    lat: location.lat,
    lng: location.lng,
    timezone: Math.max(-12, Math.min(14, Math.round(location.lng / 15))),
    countryCode: 'countryCode' in location ? location.countryCode : undefined,
    countryName: 'countryName' in location ? location.countryName : undefined,
  };
}

export function getUserBirthProfile(user?: User | null): UserBirthProfile | null {
  if (!user) return null;

  const parsedBirthday = parseBirthday(user.birthday);
  const birthLocation = toBirthLocation(user.extendedProfile?.birthLocation);
  const birthYear = user.profile?.birthYear ?? parsedBirthday?.year;
  const birthMonth = user.profile?.birthMonth ?? parsedBirthday?.month;
  const birthDay = user.profile?.birthDay ?? parsedBirthday?.day;
  const birthHour = user.profile?.birthHour;
  const birthMinute = user.profile?.birthMinute;
  const gender = user.profile?.gender;

  if (
    birthYear === undefined &&
    birthMonth === undefined &&
    birthDay === undefined &&
    birthHour === undefined &&
    birthMinute === undefined &&
    gender === undefined &&
    birthLocation === undefined
  ) {
    return null;
  }

  return {
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    birthMinute,
    gender,
    birthLocation,
  };
}

function getChiHourFromClockHour(hour: number): number {
  return hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
}

function getTimezoneForLocation(utcOffset: number): string {
  if (utcOffset === 7) return 'Asia/Ho_Chi_Minh';
  return `Etc/GMT${utcOffset >= 0 ? '-' : '+'}${Math.abs(utcOffset)}`;
}

export function buildTuViInputFromUser(
  user?: User | null,
  fallback?: Partial<TuViInput>,
): TuViInput | null {
  const profile = getUserBirthProfile(user);
  if (!profile?.birthYear || !profile.birthMonth || !profile.birthDay) return null;

  const birthClockHour = typeof profile.birthHour === 'number' ? profile.birthHour : fallback?.birthClockHour ?? 0;
  const birthMinute = typeof profile.birthMinute === 'number' ? profile.birthMinute : fallback?.birthMinute ?? 0;
  const birthLocation = profile.birthLocation ?? fallback?.birthLocation;
  const gender: TuViGender =
    profile.gender === 'female'
      ? 'nữ'
      : profile.gender === 'male'
        ? 'nam'
        : fallback?.gender ?? 'nam';

  return {
    name: user?.displayName ?? fallback?.name ?? '',
    solarDate: new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay, birthClockHour, birthMinute),
    birthHour: getChiHourFromClockHour(birthClockHour),
    birthClockHour,
    birthMinute,
    gender,
    timezone: birthLocation ? getTimezoneForLocation(birthLocation.timezone) : fallback?.timezone ?? 'Asia/Ho_Chi_Minh',
    birthLocation,
    isLeapMonth: fallback?.isLeapMonth,
    timePolicy: (fallback?.timePolicy as TuViTimePolicy | undefined) ?? 'historical-vietnam',
    leapMonthPolicy: fallback?.leapMonthPolicy,
    school: (fallback?.school as TuViSchool | undefined) ?? 'thien-luong',
  };
}
