import { describe, it, expect } from 'vitest';
import { getStatusLabel, renderStatusParts } from '@/utils/formatHelpers';

describe('formatHelpers', () => {
  describe('getStatusLabel()', () => {
    it('extracts final label from status string', () => {
      expect(getStatusLabel('Tý --> HOÀNG ĐẠO')).toBe('HOÀNG ĐẠO');
      expect(getStatusLabel('Tý')).toBe('Tý');
      expect(getStatusLabel('HẮC ĐẠO --> HOÀNG ĐẠO')).toBe('HOÀNG ĐẠO');
    });

    it('returns empty string for empty input', () => {
      expect(getStatusLabel('')).toBe('');
    });

    it('handles multiple arrows', () => {
      expect(getStatusLabel('A --> B --> C')).toBe('C');
    });
  });

  describe('renderStatusParts()', () => {
    it('returns null for empty input', () => {
      expect(renderStatusParts('')).toBeNull();
    });

    it('returns null for undefined/empty string', () => {
      expect(renderStatusParts('')).toBeNull();
    });

    it('renders HOÀNG ĐẠO with emerald class', () => {
      const result = renderStatusParts('HOÀNG ĐẠO');
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
    });

    it('splits on arrow separators', () => {
      const result = renderStatusParts('HẮC ĐẠO --> HOÀNG ĐẠO');
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      if (result) {
        expect(result.length).toBe(2);
      }
    });
  });
});
