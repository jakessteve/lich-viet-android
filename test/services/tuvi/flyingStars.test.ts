import { describe, it, expect } from 'vitest';
import { calculateFlyingStars } from '@/services/tuvi/flyingStars';
import { generateChart } from '@/services/tuvi';
import type { TuViInput } from '@/types/tuvi';

describe('calculateFlyingStars', () => {
  const sampleInput: TuViInput = {
    name: 'Nguyễn Văn A',
    solarDate: new Date(1990, 4, 15, 6, 30),
    birthHour: 3, // Dần
    birthClockHour: 6,
    birthMinute: 30,
    gender: 'nam',
    timezone: 'Asia/Ho_Chi_Minh',
  };

  it('filters tuHuaList to only contain genuine Tu Hoa (not all 48 flying stars)', () => {
    const chart = generateChart(sampleInput);
    const result = calculateFlyingStars(chart);

    // tuHuaList must only contain items where isTuHoa === true
    expect(result.tuHuaList.every((h) => h.isTuHoa === true)).toBe(true);

    // Number of Tu Hoa on a typical chart is usually between 0 and 6, definitely NOT 48
    expect(result.tuHuaList.length).toBeLessThanOrEqual(12);
    expect(result.tuHuaList.length).not.toBe(48);
  });

  it('provides tailored customized descriptions for Tu Hoa occurrences', () => {
    const chart = generateChart(sampleInput);
    const result = calculateFlyingStars(chart);

    result.tuHuaList.forEach((tuHua) => {
      expect(tuHua.descriptionVi).toContain(`Tự Hóa ${tuHua.type}`);
      expect(tuHua.descriptionVi).toContain(tuHua.sourcePalaceName);
      expect(tuHua.descriptionVi).toContain(tuHua.starName);
      // Ensure no generic repetitive dummy sentence
      expect(tuHua.descriptionVi).not.toBe('Năng lượng tự sinh chuyển biến ngay trong bản cung.');
    });
  });

  it('generates multi-angle overall synthesis containing Tu Hoa count and interactions', () => {
    const chart = generateChart(sampleInput);
    const result = calculateFlyingStars(chart);

    expect(result.overallSynthesisVi).toContain('Phái Phi Tinh Tứ Hóa');
    expect(result.overallSynthesisVi).toContain(`toàn bàn có ${result.tuHuaList.length} vị trí Tự Hóa`);
    expect(result.overallSynthesisVi.length).toBeGreaterThan(50);
  });
});
