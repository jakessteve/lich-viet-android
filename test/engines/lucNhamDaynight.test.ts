import { describe, it, expect } from 'vitest';
import { generateLucNhamChart } from '@/utils/lucNhamEngine';

describe('Đại Lục Nhâm Astronomical Daytime Suite (F-04)', () => {
  it('uses branch-based day/night by default when astronomical parameter is omitted', () => {
    const testDate = new Date(2025, 5, 15, 10, 30);
    // Hour index 4 = Thìn (Daytime)
    const chartDay = generateLucNhamChart(testDate, 4);
    const thienAtLessonDay = chartDay.tuKhoa.lessons.find((l) => l.thanSat?.some((s) => s.id === 'thienAt'));
    if (thienAtLessonDay) {
      const thienAtMarker = thienAtLessonDay.thanSat?.find((s) => s.id === 'thienAt');
      expect(thienAtMarker?.description).toContain('Trực nhật');
    }

    // Hour index 0 = Tý (Nighttime)
    const chartNight = generateLucNhamChart(testDate, 0);
    const thienAtLessonNight = chartNight.tuKhoa.lessons.find((l) => l.thanSat?.some((s) => s.id === 'thienAt'));
    if (thienAtLessonNight) {
      const thienAtMarker = thienAtLessonNight.thanSat?.find((s) => s.id === 'thienAt');
      expect(thienAtMarker?.description).toContain('Dạ gian');
    }
  });

  it('allows astronomical override when astronomicalDaytime is explicitly supplied', () => {
    const testDate = new Date(2025, 5, 15, 23, 30);
    // Force Daytime for a polar midnight sun scenario
    const chartPolarDay = generateLucNhamChart(testDate, 0, true);
    const thienAtLesson = chartPolarDay.tuKhoa.lessons.find((l) => l.thanSat?.some((s) => s.id === 'thienAt'));
    if (thienAtLesson) {
      const thienAtMarker = thienAtLesson.thanSat?.find((s) => s.id === 'thienAt');
      expect(thienAtMarker?.description).toContain('Trực nhật');
    }
  });
});
