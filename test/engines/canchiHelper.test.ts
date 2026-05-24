import { describe, it, expect } from 'vitest';
import { getNapAmIndex, checkNapAmCompatibility, NAP_AM_5_HANH } from '@/utils/canchiHelper';

describe('canchiHelper', () => {
  describe('getNapAmIndex()', () => {
    it('returns correct index for Giáp Tý', () => {
      expect(getNapAmIndex('Giáp', 'Tý')).toBe(0);
    });

    it('returns correct index for Ất Sửu', () => {
      expect(getNapAmIndex('Ất', 'Sửu')).toBe(0);
    });

    it('returns correct index for Bính Dần', () => {
      expect(getNapAmIndex('Bính', 'Dần')).toBe(1);
    });

    it('returns correct index for Canh Ngọ', () => {
      expect(getNapAmIndex('Canh', 'Ngọ')).toBe(3);
    });

    it('returns correct index for Nhâm Tuất', () => {
      expect(getNapAmIndex('Nhâm', 'Tuất')).toBe(29);
    });

    it('returns -1 for invalid Can', () => {
      expect(getNapAmIndex('Invalid' as Parameters<typeof getNapAmIndex>[0], 'Tý')).toBe(-1);
    });

    it('returns -1 for invalid Chi', () => {
      expect(getNapAmIndex('Giáp', 'Invalid' as Parameters<typeof getNapAmIndex>[1])).toBe(-1);
    });
  });

  describe('NAP_AM_5_HANH', () => {
    it('is defined correctly as an array', () => {
      expect(Array.isArray(NAP_AM_5_HANH)).toBe(true);
      expect(NAP_AM_5_HANH.length).toBe(30);
    });

    it('contains expected Nạp Âm names', () => {
      const elements = new Set(NAP_AM_5_HANH);
      expect(elements.has('Hải Trung Kim')).toBe(true);
      expect(elements.has('Đại Lâm Mộc')).toBe(true);
      expect(elements.has('Giản Hạ Thủy')).toBe(true);
      expect(elements.has('Lô Trung Hỏa')).toBe(true);
      expect(elements.has('Lộ Bàng Thổ')).toBe(true);
    });
  });

  describe('checkNapAmCompatibility()', () => {
    it('returns 1 (Hợp) for compatible elements', () => {
      // Kim (3) and Thủy (4) — Thủy sinh Kim
      const result = checkNapAmCompatibility(3, 4);
      expect(result).toBe(1);
    });

    it('returns -1 (Khắc) for clashing elements', () => {
      // Index 0 = Hải Trung Kim (Kim), Index 1 = Lư Trung Hỏa (Hỏa)
      // Hỏa khắc Kim -> -1
      const result = checkNapAmCompatibility(0, 1);
      expect(result).toBe(-1);
    });

    it('returns 0 for same element', () => {
      // Kim vs Kim
      const result = checkNapAmCompatibility(3, 3);
      expect(result).toBe(0);
    });

    it('handles Thủy-Hỏa exception for Phích Lịch (12)', () => {
      // Phích Lịch Hỏa (12) with Thủy element (index 4)
      // Should be compatible (exception)
      expect(checkNapAmCompatibility(12, 4)).toBe(1);
      expect(checkNapAmCompatibility(4, 12)).toBe(1);
    });
  });
});
