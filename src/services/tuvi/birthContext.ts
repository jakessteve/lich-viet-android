import type { TuViInput } from '../../types/tuvi';
import type { TuViSchoolProfile } from './schoolProfiles';
import { resolveTuViBirthContext, getLunarDate } from '@omce/core-logic';
import { CAN, CHI } from '../../utils/constants';
import { getCanChiDay, parseCanChi } from '../../utils/calendarEngine';

export function buildTuViBirthContext(input: TuViInput, schoolProfile: TuViSchoolProfile): any {
  // Use OMCE's core-logic for context resolution
  const omceContext = resolveTuViBirthContext({
    solarDate: input.solarDate,
    birthClockHour: input.birthClockHour,
    birthMinute: input.birthMinute,
    gender: input.gender,
    birthLocation: input.birthLocation,
    timePolicy: schoolProfile.timePolicy,
  });

  const lunar = getLunarDate(omceContext.correctedDate, input.birthLocation);
  
  // Calculate CAN CHI indices
  const yearCanIndex = (lunar.year + 6) % 10;
  const yearChiIndex = (lunar.year + 8) % 12;
  const monthCanIndex = (yearCanIndex * 2 + 2 + (lunar.month - 1)) % 10;
  const monthChiIndex = (lunar.month + 1) % 12;

  const dayCanChiStr = getCanChiDay(omceContext.correctedDate);
  const dayCanChi = parseCanChi(dayCanChiStr);
  const dayCanIndex = CAN.indexOf(dayCanChi.can);
  const dayChiIndex = CHI.indexOf(dayCanChi.chi);

  const h = omceContext.correctedDate.getHours();
  const isNextDay = h === 23;
  const hourBranchIndex = isNextDay ? 0 : Math.floor((h + 1) / 2) % 12;
  const hourCanIndex = ((dayCanIndex % 5) * 2 + hourBranchIndex) % 10;

  const amDuong = yearCanIndex % 2 === 0 ? 'Dương' : 'Âm';
  const isMale = String(input.gender).toLowerCase() === 'nam' || String(input.gender).toLowerCase() === 'male';
  const isFemale = String(input.gender).toLowerCase() === 'nữ' || String(input.gender).toLowerCase() === 'nu' || String(input.gender).toLowerCase() === 'female';
  const thuanNghich = (amDuong === 'Dương' && isMale) || (amDuong === 'Âm' && isFemale) ? 'Thuận' : 'Nghịch';

  return {
    correctedDate: omceContext.correctedDate,
    lunarDate: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      isLeap: lunar.isLeapMonth,
    },
    logicalMonth: lunar.month,
    yearCanIndex,
    yearChiIndex,
    dayCanIndex,
    dayChiIndex,
    hourBranchIndex,
    hourCanIndex,
    canChi: {
      year: { can: CAN[yearCanIndex], chi: CHI[yearChiIndex] },
      month: { can: CAN[monthCanIndex], chi: CHI[monthChiIndex] },
      day: { can: CAN[dayCanIndex], chi: CHI[dayChiIndex] },
      hour: { can: CAN[hourCanIndex], chi: CHI[hourBranchIndex] },
    },
    amDuong,
    thuanNghich,
    timePolicy: schoolProfile.timePolicy,
    leapMonthPolicy: schoolProfile.leapMonthPolicy,
    warnings: [],
    historicalRegion: undefined,
  };
}
