import type { User } from '@/types/auth';
import type { TuViBirthLocation } from '@/types/tuvi';

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
