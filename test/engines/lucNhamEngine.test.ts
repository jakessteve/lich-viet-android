import { describe, it, expect } from 'vitest';
import { generateLucNhamChart, interpretChart, getQuickVerdict } from '@/utils/lucNhamEngine';

describe('lucNhamEngine', () => {
  describe('generateLucNhamChart()', () => {
    it('returns a complete chart', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateLucNhamChart(date, 0); // hourBranchId 0 = Tý
      expect(chart).toHaveProperty('date');
      expect(chart).toHaveProperty('hourBranch');
      expect(chart).toHaveProperty('hourBranchName');
      expect(chart).toHaveProperty('dayStem');
      expect(chart).toHaveProperty('dayBranch');
      expect(chart).toHaveProperty('nguyetTuong');
      expect(chart).toHaveProperty('board');
      expect(chart).toHaveProperty('tuKhoa');
      expect(chart).toHaveProperty('tamTruyen');
      expect(chart).toHaveProperty('khoaThuc');
      expect(chart).toHaveProperty('verdict');
      expect(chart).toHaveProperty('thanSat');
    });

    it('has a valid board with 12 positions', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateLucNhamChart(date, 0);
      expect(chart.board.length).toBe(12);
      chart.board.forEach((pos) => {
        expect(pos).toHaveProperty('diaBan');
        expect(pos).toHaveProperty('tianBan');
        expect(pos).toHaveProperty('diaBanName');
        expect(pos).toHaveProperty('tianBanName');
      });
    });

    it('has 4 lessons in Tu Khoa', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateLucNhamChart(date, 0);
      expect(chart.tuKhoa.lessons.length).toBe(4);
      chart.tuKhoa.lessons.forEach((lesson) => {
        expect(lesson).toHaveProperty('index');
        expect(lesson).toHaveProperty('upperStem');
        expect(lesson).toHaveProperty('lowerBranch');
        expect(lesson).toHaveProperty('relationship');
      });
    });

    it('has 3 steps in Tam Truyen', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateLucNhamChart(date, 0);
      expect(chart.tamTruyen.steps.length).toBe(3);
      chart.tamTruyen.steps.forEach((step) => {
        expect(step).toHaveProperty('index');
        expect(step).toHaveProperty('label');
        expect(step).toHaveProperty('branch');
        expect(step).toHaveProperty('branchName');
      });
    });

    it('has a valid verdict', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateLucNhamChart(date, 0);
      expect(chart.verdict).toHaveProperty('level');
      expect(chart.verdict).toHaveProperty('label');
      expect(chart.verdict).toHaveProperty('description');
      expect(chart.verdict).toHaveProperty('score');
      expect(['daiCat', 'cat', 'trungBinh', 'hung', 'daiHung']).toContain(chart.verdict.level);
    });
  });

  describe('interpretChart()', () => {
    it('returns full interpretation', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateLucNhamChart(date, 0);
      const interp = interpretChart(chart);
      expect(interp).toHaveProperty('chart');
      expect(interp).toHaveProperty('categoryAdvice');
      expect(interp).toHaveProperty('summary');
      expect(Array.isArray(interp.categoryAdvice)).toBe(true);
      expect(interp.categoryAdvice.length).toBeGreaterThan(0);
    });
  });

  describe('getQuickVerdict()', () => {
    it('returns a quick verdict', () => {
      const date = new Date(2024, 1, 10);
      const verdict = getQuickVerdict(date, 0);
      expect(verdict).toHaveProperty('label');
      expect(verdict).toHaveProperty('isCat');
      expect(verdict).toHaveProperty('explanation');
      expect(typeof verdict.isCat).toBe('boolean');
    });
  });
});
