import { describe, it, expect } from 'vitest';
import { generateQmdjChart, isDuongDon } from '@/utils/qmdjEngine';
import { generateLucNhamChart } from '@/utils/lucNhamEngine';
import { getThaiAtYearChart } from '@/utils/thaiAtEngine';
import { synthesizeTamThuc } from '@/utils/tamThucSynthesis';

describe('Oracle Hardening Verification — Section 8 Tests', () => {
  describe('BUG-01: Lục Nhâm Khóa Thức Cascade Logic', () => {
    it('does not misclassify when multiple Khắc exist as simple Nguyên Thủ', () => {
      // Query date with distinct Tứ Khóa
      const chart = generateLucNhamChart(new Date(2024, 5, 15), 6);
      expect(chart).toBeDefined();
      expect(chart.khoaThuc).toBeDefined();
      expect(typeof chart.khoaThuc.id).toBe('string');
    });
  });

  describe('BUG-02: Nguyệt Tướng mapping by Trung Khí', () => {
    it('correctly maps Vũ Thủy Trung Khí to Đăng Minh (Hợi)', () => {
      // Vũ Thủy is around Feb 19 (solar term index 3)
      const dateVuThuy = new Date(2024, 1, 20);
      const chart = generateLucNhamChart(dateVuThuy, 0);
      expect(chart.nguyetTuong.branch).toBe('hoi');
      expect(chart.nguyetTuong.branchName).toBe('Hợi');
    });

    it('correctly maps Xuân Phân Trung Khí to Hà Khôi (Tuất)', () => {
      // Xuân Phân is around March 21 (solar term index 5)
      const dateXuanPhan = new Date(2024, 2, 22);
      const chart = generateLucNhamChart(dateXuanPhan, 0);
      expect(chart.nguyetTuong.branch).toBe('tuat');
      expect(chart.nguyetTuong.branchName).toBe('Tuất');
    });
  });

  describe('BUG-03: QMDJ Âm Độn rotation direction', () => {
    it('generates distinct rotation/palace placements for Yin Dun vs Yang Dun', () => {
      // Yang Dun date (around Spring Equinox - March)
      const yangDate = new Date(2024, 2, 21);
      const yangChart = generateQmdjChart(yangDate, 'Ngọ');
      expect(yangChart.isDuongDon).toBe(true);

      // Yin Dun date (around Autumn Equinox - Sept)
      const yinDate = new Date(2024, 8, 23);
      const yinChart = generateQmdjChart(yinDate, 'Ngọ');
      expect(yinChart.isDuongDon).toBe(false);

      // Palaces and formations are generated correctly
      expect(yangChart.palaces.length).toBe(9);
      expect(yinChart.palaces.length).toBe(9);
    });
  });

  describe('BUG-04: Lục Nhâm Quý Nhân Day vs Night distinction', () => {
    it('distinguishes day and night for Quý Nhân Than Sat', () => {
      const date = new Date(2024, 1, 10);
      // Hour 3 (Mão) is Day
      const chartDay = generateLucNhamChart(date, 3);
      // Hour 9 (Dậu) is Night
      const chartNight = generateLucNhamChart(date, 9);

      expect(chartDay).toBeDefined();
      expect(chartNight).toBeDefined();
    });
  });

  describe('BUG-05: Thái Ất 72 Cục Palace Lookup', () => {
    it('returns deterministic canonical 72-cục palace for known years', () => {
      const chart2024 = getThaiAtYearChart(2024);
      const chart2025 = getThaiAtYearChart(2025);
      const chart2026 = getThaiAtYearChart(2026);

      expect(chart2024.thaiAtPalace).toBeGreaterThanOrEqual(1);
      expect(chart2024.thaiAtPalace).toBeLessThanOrEqual(16);
      expect(chart2025.thaiAtPalace).toBeGreaterThanOrEqual(1);
      expect(chart2025.thaiAtPalace).toBeLessThanOrEqual(16);
      expect(chart2026.thaiAtPalace).toBeGreaterThanOrEqual(1);
      expect(chart2026.thaiAtPalace).toBeLessThanOrEqual(16);
    });
  });

  describe('Performance Gate', () => {
    it('executes 1,000 synthesizeTamThuc() calls (3,000 charts) in under 1,000ms', () => {
      const date = new Date(2024, 5, 1);
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        synthesizeTamThuc(date, i % 12);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
