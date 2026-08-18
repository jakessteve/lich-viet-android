import { describe, it, expect } from 'vitest';
import { solarToLunar, lunarToSolar, getYearCanChi } from '@lich-viet/core';

// 50+ Deterministic Golden Cases spanning 1900 to 2100
const GOLDEN_CASES = [
  // 1. Century start 1900
  { solar: [1900, 1, 31], lunar: [1900, 1, 1], yearCanChi: 'Canh Tý' },
  { solar: [1900, 2, 19], lunar: [1900, 1, 20], yearCanChi: 'Canh Tý' },
  { solar: [1900, 8, 25], lunar: [1900, 8, 1], yearCanChi: 'Canh Tý' },
  // 2. Historical Dates
  { solar: [1945, 9, 2], lunar: [1945, 7, 26], yearCanChi: 'Ất Dậu' },
  { solar: [1954, 5, 7], lunar: [1954, 4, 5], yearCanChi: 'Giáp Ngọ' },
  { solar: [1975, 4, 30], lunar: [1975, 3, 20], yearCanChi: 'Ất Mão' },
  // 3. Millennium Boundary 2000
  { solar: [2000, 1, 1], lunar: [1999, 11, 25], yearCanChi: 'Kỷ Mão' },
  { solar: [2000, 2, 5], lunar: [2000, 1, 1], yearCanChi: 'Canh Thìn' },
  { solar: [2000, 12, 31], lunar: [2000, 12, 6], yearCanChi: 'Canh Thìn' },
  // 4. Leap month year 2001 (Leap month 4)
  { solar: [2001, 1, 24], lunar: [2001, 1, 1], yearCanChi: 'Tân Tỵ' },
  { solar: [2001, 5, 23], lunar: [2001, 4, 1], yearCanChi: 'Tân Tỵ', isLeap: true },
  { solar: [2001, 6, 21], lunar: [2001, 5, 1], yearCanChi: 'Tân Tỵ', isLeap: false },
  // 5. 2006 (Leap month 7)
  { solar: [2006, 1, 29], lunar: [2006, 1, 1], yearCanChi: 'Bính Tuất' },
  { solar: [2006, 8, 24], lunar: [2006, 7, 1], yearCanChi: 'Bính Tuất', isLeap: true },
  // 6. 2012 (Nhâm Thìn)
  { solar: [2012, 1, 23], lunar: [2012, 1, 1], yearCanChi: 'Nhâm Thìn' },
  { solar: [2012, 5, 21], lunar: [2012, 4, 1], yearCanChi: 'Nhâm Thìn', isLeap: true },
  // 7. 2020 (Canh Tý - Leap month 4)
  { solar: [2020, 1, 25], lunar: [2020, 1, 1], yearCanChi: 'Canh Tý' },
  { solar: [2020, 5, 23], lunar: [2020, 4, 1], yearCanChi: 'Canh Tý', isLeap: true },
  // 8. 2023 (Quý Mão - Leap month 2)
  { solar: [2023, 1, 22], lunar: [2023, 1, 1], yearCanChi: 'Quý Mão' },
  { solar: [2023, 3, 22], lunar: [2023, 2, 1], yearCanChi: 'Quý Mão', isLeap: true },
  // 9. 2024 (Giáp Thìn)
  { solar: [2024, 2, 10], lunar: [2024, 1, 1], yearCanChi: 'Giáp Thìn' },
  { solar: [2024, 9, 17], lunar: [2024, 8, 15], yearCanChi: 'Giáp Thìn' },
  // 10. 2025 (Ất Tỵ - Leap month 6)
  { solar: [2025, 1, 29], lunar: [2025, 1, 1], yearCanChi: 'Ất Tỵ' },
  { solar: [2025, 7, 25], lunar: [2025, 6, 1], yearCanChi: 'Ất Tỵ', isLeap: true },
  // 11. 2026 (Bính Ngọ - Target Active Year)
  { solar: [2026, 1, 1], lunar: [2025, 11, 13], yearCanChi: 'Ất Tỵ' },
  { solar: [2026, 2, 17], lunar: [2026, 1, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 3, 3], lunar: [2026, 1, 15], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 4, 17], lunar: [2026, 3, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 5, 17], lunar: [2026, 4, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 6, 15], lunar: [2026, 5, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 7, 14], lunar: [2026, 6, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 8, 13], lunar: [2026, 7, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 9, 11], lunar: [2026, 8, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 9, 25], lunar: [2026, 8, 15], yearCanChi: 'Bính Ngọ' }, // Trung Thu
  { solar: [2026, 10, 10], lunar: [2026, 9, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 11, 9], lunar: [2026, 10, 1], yearCanChi: 'Bính Ngọ' },
  { solar: [2026, 12, 9], lunar: [2026, 11, 1], yearCanChi: 'Bính Ngọ' },
  // 12. 2027 (Đinh Mùi)
  { solar: [2027, 2, 6], lunar: [2027, 1, 1], yearCanChi: 'Đinh Mùi' },
  { solar: [2027, 2, 20], lunar: [2027, 1, 15], yearCanChi: 'Đinh Mùi' },
  { solar: [2027, 8, 2], lunar: [2027, 7, 1], yearCanChi: 'Đinh Mùi' },
  // 13. 2028 (Mậu Thân - Leap month 5)
  { solar: [2028, 1, 26], lunar: [2028, 1, 1], yearCanChi: 'Mậu Thân' },
  { solar: [2028, 6, 23], lunar: [2028, 5, 1], yearCanChi: 'Mậu Thân', isLeap: true },
  // 14. 2030 (Canh Tuất)
  { solar: [2030, 2, 2], lunar: [2030, 1, 1], yearCanChi: 'Canh Tuất' },
  // 15. 2031 (Tân Hợi - Leap month 3)
  { solar: [2031, 1, 23], lunar: [2031, 1, 1], yearCanChi: 'Tân Hợi' },
  { solar: [2031, 4, 21], lunar: [2031, 3, 1], yearCanChi: 'Tân Hợi', isLeap: true },
  // 16. 2050 (Canh Ngọ)
  { solar: [2050, 1, 23], lunar: [2050, 1, 1], yearCanChi: 'Canh Ngọ' },
  { solar: [2050, 4, 21], lunar: [2050, 3, 1], yearCanChi: 'Canh Ngọ', isLeap: true },
  // 17. 2075 (Ất Mùi)
  { solar: [2075, 2, 15], lunar: [2075, 1, 1], yearCanChi: 'Ất Mùi' },
  // 18. Century end 2100 (Canh Thân)
  { solar: [2100, 1, 1], lunar: [2099, 11, 21], yearCanChi: 'Kỷ Mùi' },
  { solar: [2100, 2, 9], lunar: [2100, 1, 1], yearCanChi: 'Canh Thân' },
  { solar: [2100, 12, 31], lunar: [2100, 12, 1], yearCanChi: 'Canh Thân' },
];

describe('Golden Reference Fixture Suite (50+ Canonical Test Cases 1900-2100)', () => {
  it('should verify all 50+ golden reference fixtures bit-for-bit with 100% precision', () => {
    expect(GOLDEN_CASES.length).toBeGreaterThanOrEqual(50);

    for (const item of GOLDEN_CASES) {
      const [sYear, sMonth, sDay] = item.solar as [number, number, number];
      const [expLYear, expLMonth, expLDay] = item.lunar as [number, number, number];

      const lunar = solarToLunar(sYear, sMonth, sDay);
      expect(lunar.year, `Lunar Year mismatch for ${sYear}-${sMonth}-${sDay}`).toBe(expLYear);
      expect(lunar.month, `Lunar Month mismatch for ${sYear}-${sMonth}-${sDay}`).toBe(expLMonth);
      expect(lunar.day, `Lunar Day mismatch for ${sYear}-${sMonth}-${sDay}`).toBe(expLDay);

      if (item.isLeap !== undefined) {
        expect(lunar.isLeapMonth, `Leap month mismatch for ${sYear}-${sMonth}-${sDay}`).toBe(item.isLeap);
      }

      const yearCanChi = getYearCanChi(lunar.year);
      expect(yearCanChi.name, `Year Can Chi mismatch for ${sYear}-${sMonth}-${sDay}`).toBe(item.yearCanChi);

      // Reversibility check
      const solar = lunarToSolar(lunar.year, lunar.month, lunar.day, lunar.isLeapMonth);
      expect(solar.year).toBe(sYear);
      expect(solar.month).toBe(sMonth);
      expect(solar.day).toBe(sDay);
    }
  });
});
