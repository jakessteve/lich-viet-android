import { describe, it, expect } from 'vitest';
import { synthesizeTamThuc } from '@/utils/tamThucSynthesis';

describe('tamThucSynthesis', () => {
  describe('synthesizeTamThuc()', () => {
    it('returns synthesis for a known date and hour', () => {
      const date = new Date(2024, 1, 10);
      const result = synthesizeTamThuc(date, 0); // hour index 0 = Tý
      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('hourBranchName');
      expect(result.hourBranchName).toBe('Tý');
      expect(result).toHaveProperty('methods');
      expect(result.methods).toHaveProperty('qmdj');
      expect(result.methods).toHaveProperty('lucNham');
      expect(result.methods).toHaveProperty('thaiAt');
      expect(result).toHaveProperty('agreementCount');
      expect(result).toHaveProperty('combinedVerdict');
      expect(result).toHaveProperty('combinedLabel');
      expect(result).toHaveProperty('narrative');
      expect(typeof result.narrative).toBe('string');
      expect(result.narrative.length).toBeGreaterThan(0);
    });

    it('returns different hour branch for different hour indices', () => {
      const date = new Date(2024, 1, 10);
      const resultTý = synthesizeTamThuc(date, 0);
      const resultNgọ = synthesizeTamThuc(date, 6);
      expect(resultTý.hourBranchName).toBe('Tý');
      expect(resultNgọ.hourBranchName).toBe('Ngọ');
    });

    it('each method has required fields', () => {
      const date = new Date(2024, 1, 10);
      const result = synthesizeTamThuc(date, 0);
      const { qmdj, lucNham, thaiAt } = result.methods;

      expect(qmdj).toHaveProperty('name');
      expect(qmdj).toHaveProperty('verdict');
      expect(qmdj).toHaveProperty('verdictLabel');
      expect(qmdj).toHaveProperty('summary');
      expect(qmdj).toHaveProperty('details');

      expect(lucNham).toHaveProperty('name');
      expect(lucNham).toHaveProperty('verdict');
      expect(lucNham).toHaveProperty('verdictLabel');
      expect(lucNham).toHaveProperty('summary');
      expect(lucNham).toHaveProperty('details');

      expect(thaiAt).toHaveProperty('name');
      expect(thaiAt).toHaveProperty('verdict');
      expect(thaiAt).toHaveProperty('verdictLabel');
      expect(thaiAt).toHaveProperty('summary');
      expect(thaiAt).toHaveProperty('details');
    });

    it('combined verdict is one of the allowed values', () => {
      const date = new Date(2024, 1, 10);
      const result = synthesizeTamThuc(date, 0);
      expect(['cat', 'hung', 'trungBinh']).toContain(result.combinedVerdict);
    });

    it('agreement count is between 0 and 3', () => {
      const date = new Date(2024, 1, 10);
      const result = synthesizeTamThuc(date, 0);
      expect(result.agreementCount).toBeGreaterThanOrEqual(0);
      expect(result.agreementCount).toBeLessThanOrEqual(3);
    });
  });
});
