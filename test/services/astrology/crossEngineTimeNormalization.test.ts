import { describe, expect, it } from 'vitest';
import { generateChart, buildTuViBirthContext } from '../../../src/services/tuvi';
import { resolveTuViSchoolProfile } from '../../../src/services/tuvi/schoolProfiles';
import { calculateWesternChart } from '../../../src/services/astrology/westernCalculator';
import type { TuViInput } from '../../../src/types/tuvi';
import type { WesternChartInput } from '../../../src/types/astrology';

describe('Cross-Engine Time & Birthplace Normalization', () => {
  describe('Tu Vi Birthplace & Time Policy Invariants', () => {
    it('generates 100% identical palaces, Menh, Than, Cuc across all Vietnamese provinces under historical-vietnam policy', () => {
      const locations = [
        { locationName: 'TP. Hồ Chí Minh, Việt Nam', lat: 10.776889, lng: 106.700806, timezone: 7, countryCode: 'VN' },
        { locationName: 'Hà Nội, Việt Nam', lat: 21.028511, lng: 105.804817, timezone: 7, countryCode: 'VN' },
        { locationName: 'Đà Nẵng, Việt Nam', lat: 16.047079, lng: 108.20623, timezone: 7, countryCode: 'VN' },
        { locationName: 'Huế, Việt Nam', lat: 16.463713, lng: 107.590866, timezone: 7, countryCode: 'VN' },
        { locationName: 'Cần Thơ, Việt Nam', lat: 10.045162, lng: 105.746857, timezone: 7, countryCode: 'VN' },
        { locationName: 'Hải Phòng, Việt Nam', lat: 20.844912, lng: 106.688084, timezone: 7, countryCode: 'VN' },
      ];

      const birthDate = new Date(1995, 4, 15, 7, 5); // 07:05 AM (Giờ Thìn)
      const baseInput: Omit<TuViInput, 'birthLocation'> = {
        name: 'Nguyen Van A',
        solarDate: birthDate,
        birthClockHour: 7,
        birthMinute: 5,
        birthHour: 4, // Thìn
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
        school: 'thien-luong',
        timePolicy: 'historical-vietnam',
      };

      const hcmChart = generateChart({ ...baseInput, birthLocation: locations[0] });

      for (let i = 1; i < locations.length; i++) {
        const otherChart = generateChart({ ...baseInput, birthLocation: locations[i] });

        expect(otherChart.centerInfo.menhCung).toBe(hcmChart.centerInfo.menhCung);
        expect(otherChart.centerInfo.thanCung).toBe(hcmChart.centerInfo.thanCung);
        expect(otherChart.centerInfo.cuc).toBe(hcmChart.centerInfo.cuc);
        expect(otherChart.centerInfo.canChiHour).toBe(hcmChart.centerInfo.canChiHour);

        // All 12 palaces must have exact same stars
        for (let p = 0; p < 12; p++) {
          const hcmPalace = hcmChart.palaces[p];
          const otherPalace = otherChart.palaces[p];
          expect(otherPalace.name).toBe(hcmPalace.name);
          expect(otherPalace.chinhTinh.map((s) => s.name)).toEqual(hcmPalace.chinhTinh.map((s) => s.name));
          expect(otherPalace.phuTinh.map((s) => s.name)).toEqual(hcmPalace.phuTinh.map((s) => s.name));
        }
      }
    });

    it('emits true solar time audit warning and allows astronomical calculation under true-solar policy', () => {
      const input: TuViInput = {
        name: 'Astronomical Test',
        solarDate: new Date(1995, 4, 15, 7, 5),
        birthClockHour: 7,
        birthMinute: 5,
        birthHour: 4,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
        school: 'thien-luong',
        timePolicy: 'true-solar',
        birthLocation: {
          locationName: 'Đà Nẵng, Việt Nam',
          lat: 16.047079,
          lng: 108.20623,
          timezone: 7,
        },
      };

      const chart = generateChart(input);
      expect(chart.auditWarnings.some((w) => w.includes('Giờ Mặt Trời Thực'))).toBe(true);
    });

    it('resolves historical 1955-1975 North/South divergence using 17.0N latitude boundary', () => {
      const birthDate = new Date(1968, 5, 1, 14, 0); // 14:00 (Mùi)
      const schoolProfile = resolveTuViSchoolProfile('thien-luong');

      // Hanoi (North, >= 17.0N) -> GMT+7 -> 14:00 remains 14:00
      const hanoiContext = buildTuViBirthContext(
        {
          name: 'Hanoi 1968',
          solarDate: birthDate,
          birthClockHour: 14,
          birthMinute: 0,
          birthHour: 7,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
          school: 'thien-luong',
          timePolicy: 'historical-vietnam',
          birthLocation: { locationName: 'Hanoi', lat: 21.0285, lng: 105.8048, timezone: 7 },
        },
        schoolProfile,
      );
      expect(hanoiContext.correctedDate.getHours()).toBe(14);
      expect(hanoiContext.historicalRegion).toBe('north');

      // Saigon (South, < 17.0N) -> GMT+8 -> 14:00 shifts to 13:00 ICT
      const saigonContext = buildTuViBirthContext(
        {
          name: 'Saigon 1968',
          solarDate: birthDate,
          birthClockHour: 14,
          birthMinute: 0,
          birthHour: 7,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
          school: 'thien-luong',
          timePolicy: 'historical-vietnam',
          birthLocation: { locationName: 'Saigon', lat: 10.7768, lng: 106.7008, timezone: 7 },
        },
        schoolProfile,
      );
      expect(saigonContext.correctedDate.getHours()).toBe(13);
      expect(saigonContext.historicalRegion).toBe('south');
    });
  });

  describe('Vedic & Western Engine Time & Location Invariants', () => {
    it('calculates different Julian Days and Ascendants for different hours of the same day in calculateWesternChart', () => {
      const baseInput: WesternChartInput = {
        name: 'Vedic Hour Test',
        birthDate: new Date(1990, 4, 15),
        birthHour: 6,
        birthMinute: 0,
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: 7,
        locationName: 'Hanoi',
      };

      const chartMorning = calculateWesternChart({ ...baseInput, birthHour: 6 });
      const chartAfternoon = calculateWesternChart({ ...baseInput, birthHour: 14 });
      const chartEvening = calculateWesternChart({ ...baseInput, birthHour: 20 });

      // Ascendant must rotate with time
      expect(chartMorning.ascendant).not.toBeCloseTo(chartAfternoon.ascendant, 0);
      expect(chartAfternoon.ascendant).not.toBeCloseTo(chartEvening.ascendant, 0);

      // Moon position must move throughout the day
      const moonMorning = chartMorning.planets.find((p) => p.body === 'moon')!;
      const moonEvening = chartEvening.planets.find((p) => p.body === 'moon')!;
      expect(moonMorning.tropicalLongitude).not.toBeCloseTo(moonEvening.tropicalLongitude, 1);
    });

    it('calculates different Ascendants for different geographical longitudes at the same UTC instant', () => {
      const hanoiInput: WesternChartInput = {
        birthDate: new Date(1990, 4, 15),
        birthHour: 14,
        birthMinute: 0,
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: 7,
      };

      // London at same UTC instant (07:00 UTC) -> 07:00 BST (GMT+1)
      const londonInput: WesternChartInput = {
        birthDate: new Date(1990, 4, 15),
        birthHour: 8,
        birthMinute: 0,
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 1,
      };

      const hanoiChart = calculateWesternChart(hanoiInput);
      const londonChart = calculateWesternChart(londonInput);

      expect(hanoiChart.ascendant).not.toBeCloseTo(londonChart.ascendant, 0);
    });
  });
});
