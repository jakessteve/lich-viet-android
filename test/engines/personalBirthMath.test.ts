import { describe, expect, it } from 'vitest';
import { calculatePersonalDayScore } from '@/services/personalization/personalDayScore';
import { calculatePersonalHourModifier } from '@/services/personalization/personalHourScore';
import { getPersonalDungSu } from '@/services/personalization/personalDungSu';
import { resolvePersonalBirthMoment } from '@/services/personalization/birthMath';
import type { CanChi } from '@/types/calendar';

const hcmBirthDetails = {
  birthMonth: 11,
  birthDay: 13,
  birthHour: 18,
  birthMinute: 30,
  birthLocation: {
    locationName: 'Ho Chi Minh City, Vietnam',
    lat: 10.8231,
    lng: 106.6297,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Vietnam',
  },
};

const referenceDate = new Date('2024-06-15');
const referenceDayCanChi: CanChi = { can: 'Tân', chi: 'Hợi' };

describe('personalBirthMath', () => {
  it('corrects the birth moment from birthday and birthplace', () => {
    const resolved = resolvePersonalBirthMoment(1983, hcmBirthDetails);

    expect(resolved).not.toBeNull();
    expect(resolved!.correctedDate.getFullYear()).toBe(1983);
    expect(resolved!.correctedDate.getMonth()).toBe(10);
    expect(resolved!.correctedDate.getDate()).toBe(13);
    expect(resolved!.correctedDate.getHours()).toBe(18);
    expect(resolved!.correctedDate.getMinutes()).toBe(36);
    expect(resolved!.dayCanChi).toEqual({ can: 'Ất', chi: 'Tỵ' });
  });

  it('lets the natal day pillar influence the personal day score', () => {
    const base = calculatePersonalDayScore(1983, 'Dậu');
    const adjusted = calculatePersonalDayScore(1983, 'Dậu', hcmBirthDetails);

    expect(base?.actionScore).toBe(0);
    expect(base?.label).toBe('Bình Hòa');
    expect(adjusted?.actionScore).toBe(3);
    expect(adjusted?.label).toBe('Đại Cát');
  });

  it('propagates the richer birth profile into personal Dụng Sự scoring', () => {
    const result = getPersonalDungSu(1983, 'Dậu', ['Khai trương', 'Động thổ'], hcmBirthDetails);

    expect(result.recommended.length).toBeGreaterThan(0);
    expect(result.recommended[0].isBoosted).toBe(true);
  });

  it('uses the birth hour when it is available', () => {
    const base = calculatePersonalHourModifier(1983, 11, 13, { can: 'Bính', chi: 'Dậu' }, referenceDayCanChi, referenceDate);
    const adjusted = calculatePersonalHourModifier(
      1983,
      11,
      13,
      { can: 'Bính', chi: 'Dậu' },
      referenceDayCanChi,
      referenceDate,
      hcmBirthDetails,
    );

    expect(base).not.toBeNull();
    expect(adjusted).not.toBeNull();
    expect(adjusted!.totalModifier).toBeGreaterThan(base!.totalModifier);
    expect(adjusted!.flags).toContain('trung_gio_sinh');
  });
});
