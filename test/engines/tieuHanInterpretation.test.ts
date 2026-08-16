import { describe, it, expect } from 'vitest';
import { generateChart } from '@/services/tuvi';
import {
  interpretTieuHan,
  interpretNguyetHan,
  getYearCanChi,
} from '@/services/tuvi/tieuHanInterpretation';
import { formatTieuHanAsMarkdown, formatHanContextAsMarkdown } from '@/services/tuvi/markdownFormatter';
import type { TuViInput } from '@/types/tuvi';

describe('Tử Vi Tiểu Hạn & Nguyệt Hạn Dynamic Interpretation Engine', () => {
  const sampleInput: TuViInput = {
    name: 'Nguyễn Văn A',
    solarDate: new Date(1990, 4, 15), // May 15, 1990
    birthHour: 6, // Ngọ
    gender: 'nam',
    timezone: 'Asia/Ho_Chi_Minh',
    school: 'thien-luong',
  };

  const chart = generateChart(sampleInput);

  describe('getYearCanChi', () => {
    it('should correctly calculate Can Chi for various years', () => {
      expect(getYearCanChi(2024)).toEqual({ can: 'Giáp', chi: 'Thìn' });
      expect(getYearCanChi(2025)).toEqual({ can: 'Ất', chi: 'Tỵ' });
      expect(getYearCanChi(2026)).toEqual({ can: 'Bính', chi: 'Ngọ' });
      expect(getYearCanChi(2027)).toEqual({ can: 'Đinh', chi: 'Mùi' });
    });
  });

  describe('interpretTieuHan', () => {
    it('should calculate valid Tiểu Hạn interpretation result for 2026', () => {
      const result = interpretTieuHan(chart, 2026);

      expect(result.viewYear).toBe(2026);
      expect(result.yearCan).toBe('Bính');
      expect(result.yearChi).toBe('Ngọ');
      expect(result.tieuHanPalaceId).toBeGreaterThanOrEqual(0);
      expect(result.tieuHanPalaceId).toBeLessThan(12);
      expect(result.tieuHanPalaceName).toBeTruthy();
      expect(result.tieuHanPalaceChi).toBeTruthy();

      // Score bounds & luck tier
      expect(result.overallScore).toBeGreaterThanOrEqual(1.0);
      expect(result.overallScore).toBeLessThanOrEqual(10.0);
      expect(['Đại Cát', 'Khởi Sắc', 'Bình Hòa', 'Thử Thách', 'Gian Nan']).toContain(result.luckTier);

      // Tam Tài Matrix
      expect(result.tamTai.thienThoi.score).toBeGreaterThan(0);
      expect(result.tamTai.diaLoi.score).toBeGreaterThan(0);
      expect(result.tamTai.nhanHoa.score).toBeGreaterThan(0);
      expect(result.tamTai.khiLuc.score).toBeGreaterThan(0);

      // Lưu Tứ Hóa for Can Bính
      expect(result.luuTuHoa.canYear).toBe('Bính');
      expect(result.luuTuHoa.hoaLoc).toBe('Thiên Đồng');
      expect(result.luuTuHoa.hoaQuyen).toBe('Thiên Cơ');
      expect(result.luuTuHoa.hoaKhoa).toBe('Văn Xương');
      expect(result.luuTuHoa.hoaKy).toBe('Liêm Trinh');

      // Detailed Synthesis completeness
      expect(result.detailedSynthesis.generalVibe.length).toBeGreaterThan(30);
      expect(result.detailedSynthesis.careerAndFinance.length).toBeGreaterThan(20);
      expect(result.detailedSynthesis.relationshipAndHealth.length).toBeGreaterThan(20);
      expect(result.detailedSynthesis.actionableAdvice.length).toBeGreaterThan(20);

      // Monthly classification
      expect(Array.isArray(result.favorableMonths)).toBe(true);
      expect(Array.isArray(result.challengingMonths)).toBe(true);
    });

    it('should calculate Đại Hạn resonance with valid amplification', () => {
      const result = interpretTieuHan(chart, 2026);
      expect(result.daiHanResonance).toBeDefined();
      expect(result.daiHanResonance.amplification).toBeGreaterThanOrEqual(0.8);
      expect(result.daiHanResonance.amplification).toBeLessThanOrEqual(1.6);
      expect(result.daiHanResonance.titleVi).toBeTruthy();
    });
  });

  describe('interpretNguyetHan', () => {
    it('should compute monthly interpretations for all 12 months', () => {
      for (let m = 1; m <= 12; m++) {
        const monthResult = interpretNguyetHan(chart, 2026, m);
        expect(monthResult.viewMonth).toBe(m);
        expect(monthResult.viewYear).toBe(2026);
        expect(monthResult.palaceName).toBeTruthy();
        expect(monthResult.monthScore).toBeGreaterThanOrEqual(1.0);
        expect(monthResult.monthScore).toBeLessThanOrEqual(10.0);
        expect(monthResult.summaryVi.length).toBeGreaterThan(15);
        expect(monthResult.adviceVi.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Markdown Formatter Integration', () => {
    it('should format dedicated formatTieuHanAsMarkdown cleanly', () => {
      const markdown = formatTieuHanAsMarkdown(chart, 2026);
      expect(markdown).toContain('## Luận Giải Tiểu Hạn Năm 2026 (Bính Ngọ)');
      expect(markdown).toContain('Đánh Giá Tam Tài');
      expect(markdown).toContain('Luận Giải Chi Tiết');
    });

    it('should include Tiểu Hạn in formatHanContextAsMarkdown', () => {
      const fullHanMarkdown = formatHanContextAsMarkdown(chart);
      expect(fullHanMarkdown).toContain('Luận Giải Chi Tiết Tiểu Hạn Năm');
      expect(fullHanMarkdown).toContain('Nguyệt Hạn Tháng');
    });
  });

  describe('🛡️ Anti-Generic & Uniqueness Guardrail', () => {
    it('should produce distinct parameterized synthesis across different birth dates', () => {
      const chart1 = generateChart({
        solarDate: new Date(1985, 2, 10),
        birthHour: 2, // Dần
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      const chart2 = generateChart({
        solarDate: new Date(1995, 8, 22),
        birthHour: 8, // Thân
        gender: 'nu',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      const chart3 = generateChart({
        solarDate: new Date(2000, 11, 5),
        birthHour: 10, // Tuất
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      const res1 = interpretTieuHan(chart1, 2026);
      const res2 = interpretTieuHan(chart2, 2026);
      const res3 = interpretTieuHan(chart3, 2026);

      // Headlines and text must not be identical
      expect(res1.themeHeadlineVi).not.toEqual(res2.themeHeadlineVi);
      expect(res2.themeHeadlineVi).not.toEqual(res3.themeHeadlineVi);
      expect(res1.detailedSynthesis.generalVibe).not.toEqual(res2.detailedSynthesis.generalVibe);
      expect(res2.detailedSynthesis.generalVibe).not.toEqual(res3.detailedSynthesis.generalVibe);

      // Jaccard similarity test on word tokens between res1 and res2 generalVibe
      const words1 = new Set(res1.detailedSynthesis.generalVibe.toLowerCase().split(/\s+/));
      const words2 = new Set(res2.detailedSynthesis.generalVibe.toLowerCase().split(/\s+/));
      const intersection = new Set([...words1].filter((w) => words2.has(w)));
      const union = new Set([...words1, ...words2]);
      const jaccardSimilarity = intersection.size / union.size;

      // Jaccard similarity must be under 0.60 (showing high customized variance)
      expect(jaccardSimilarity).toBeLessThan(0.60);
    });
  });
});
