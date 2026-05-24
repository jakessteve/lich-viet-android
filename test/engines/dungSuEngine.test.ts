import { describe, it, expect } from 'vitest';
import { generateDungSu } from '@/utils/dungSuEngine';
import type { ModifyingLayerResult } from '@/types/calendar';

describe('dungSuEngine', () => {
  describe('generateDungSu()', () => {
    it('generates dụng sự data for a date with Trực Kiến', () => {
      const mockModifying: ModifyingLayerResult = {
        stars: [],
        trucDetail: { name: 'Kiến', quality: 'Good', description: 'Ngày Kiến' },
        tuDetail: { name: 'Sao 1', quality: 'Good', description: 'Tú 1' },
      };
      const result = generateDungSu(mockModifying, 'Mộc');
      expect(result).toHaveProperty('suitable');
      expect(result).toHaveProperty('unsuitable');
      expect(Array.isArray(result.suitable)).toBe(true);
      expect(Array.isArray(result.unsuitable)).toBe(true);
    });

    it('generates dụng sự data for a date with Trực Trừ', () => {
      const mockModifying: ModifyingLayerResult = {
        stars: [],
        trucDetail: { name: 'Trừ', quality: 'Good', description: 'Ngày Trừ' },
        tuDetail: { name: 'Sao 2', quality: 'Neutral', description: 'Tú 2' },
      };
      const result = generateDungSu(mockModifying, 'Thủy');
      expect(result).toHaveProperty('suitable');
      expect(result).toHaveProperty('unsuitable');
    });

    it('handles Bách Sự Hung stars', () => {
      const mockModifying: ModifyingLayerResult = {
        stars: [
          { name: 'Cửu Khổ Bát Cùng', type: 'Bad', weight: -5, description: 'Hung', unsuitable: ['Bách sự hung'] },
        ],
        trucDetail: { name: 'Kiến', quality: 'Bad', description: 'Ngày Kiến' },
        tuDetail: { name: 'Sao 3', quality: 'Bad', description: 'Tú 3' },
      };
      const result = generateDungSu(mockModifying, 'Hỏa');
      expect(Array.isArray(result.unsuitable)).toBe(true);
    });

    it('handles Sát Sư Nhật', () => {
      const mockModifying: ModifyingLayerResult = {
        stars: [{ name: 'Sát Sư Nhật', type: 'Bad', weight: -5, description: 'Sát sư' }],
        trucDetail: { name: 'Mãn', quality: 'Good', description: 'Ngày Mãn' },
        tuDetail: { name: 'Sao 4', quality: 'Good', description: 'Tú 4' },
      };
      const result = generateDungSu(mockModifying, 'Kim');
      expect(Array.isArray(result.unsuitable)).toBe(true);
    });
  });
});
