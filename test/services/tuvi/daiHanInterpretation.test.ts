import { describe, expect, it } from 'vitest';
import { generateChart } from '../../../src/services/tuvi/starPlacement';
import {
  interpretDaiHan,
  getAllDaiHanInterpretations,
  getCurrentDaiHan,
} from '../../../src/services/tuvi/daiHanInterpretation';
import type { TuViInput } from '../../../src/types/tuvi';

describe('daiHanInterpretation engine (calculation-grounded)', () => {
  const baseInput: TuViInput = {
    name: 'Test Person',
    solarDate: new Date(1990, 0, 1),
    birthHour: 0,
    gender: 'nam',
    timezone: 'Asia/Ho_Chi_Minh',
  };

  it('generates all 12 Đại Hạn in chronological order starting from Cục age', () => {
    const chart = generateChart(baseInput);
    const allDaiHan = getAllDaiHanInterpretations(chart, 2026);

    expect(allDaiHan).toHaveLength(12);
    // Chronological order verification
    for (let i = 1; i < allDaiHan.length; i++) {
      expect(allDaiHan[i].startAge).toBeGreaterThan(allDaiHan[i - 1].startAge);
      expect(allDaiHan[i].startAge).toBe(allDaiHan[i - 1].endAge + 1);
    }
  });

  it('calculates Tam Tài scores and assigns correct luck tier', () => {
    const chart = generateChart(baseInput);
    const allDaiHan = getAllDaiHanInterpretations(chart);

    allDaiHan.forEach((dh) => {
      expect(dh.luckScore).toBeGreaterThanOrEqual(1.0);
      expect(dh.luckScore).toBeLessThanOrEqual(10.0);
      expect(['Đại Cát', 'Khởi Sắc', 'Bình Hòa', 'Thử Thách', 'Gian Nan']).toContain(dh.luckTier);

      // Tam Tài
      expect(dh.tamTai.thienThoi.score).toBeGreaterThan(0);
      expect(dh.tamTai.diaLoi.score).toBeGreaterThan(0);
      expect(dh.tamTai.nhanHoa.score).toBeGreaterThan(0);
      expect(dh.tamTai.khiLuc.score).toBeGreaterThan(0);
      expect(dh.tamTai.thienThoi.desc).toBeTruthy();
      expect(dh.tamTai.diaLoi.desc).toBeTruthy();
    });
  });

  it('correctly calculates Can Cung Đại Hạn Lưu Tứ Hóa for each palace', () => {
    const chart = generateChart(baseInput);
    const allDaiHan = getAllDaiHanInterpretations(chart);

    allDaiHan.forEach((dh) => {
      expect(dh.daiHanTuHoa.canCung).toBeTruthy();
      expect(dh.daiHanTuHoa.hoaLoc).toBeTruthy();
      expect(dh.daiHanTuHoa.hoaQuyen).toBeTruthy();
      expect(dh.daiHanTuHoa.hoaKhoa).toBeTruthy();
      expect(dh.daiHanTuHoa.hoaKy).toBeTruthy();
    });
  });

  it('extracts Tam Phương Tứ Chính projection from 3 trine and 1 opposite palaces', () => {
    const chart = generateChart(baseInput);
    const menhPalace = chart.palaces.find((p) => p.isMenh)!;
    const interpretation = interpretDaiHan(menhPalace, chart, true);

    expect(interpretation.tamPhuongTuChinh.tamHopPalaces.length).toBe(2);
    expect(interpretation.tamPhuongTuChinh.doiCungPalace).toBeTruthy();
    expect(interpretation.tamPhuongTuChinh.summary).toContain('Tam Phương Tứ Chính');
  });

  it('evaluates 5-year phasing breakdown (firstHalf and secondHalf)', () => {
    const chart = generateChart(baseInput);
    const allDaiHan = getAllDaiHanInterpretations(chart);

    allDaiHan.forEach((dh) => {
      expect(dh.phasingBreakdown.firstHalf).toContain('Tiền vận');
      expect(dh.phasingBreakdown.secondHalf).toContain('Hậu vận');
    });
  });

  it('detects current active Đại Hạn based on view year', () => {
    const chart = generateChart(baseInput);
    const current = getCurrentDaiHan(chart, 2026);

    expect(current).not.toBeNull();
    if (current) {
      expect(current.isCurrent).toBe(true);
      expect(37).toBeGreaterThanOrEqual(current.startAge);
      expect(37).toBeLessThanOrEqual(current.endAge);
    }
  });

  it('correctly identifies current active Đại Hạn for DOB 13-Nov-1983 in 2026 (nominal age 44)', () => {
    const user1983Input: TuViInput = {
      name: 'User 1983',
      solarDate: new Date(1983, 10, 13), // 13-Nov-1983
      birthHour: 6, // Gio Ngo
      gender: 'nam',
      timezone: 'Asia/Ho_Chi_Minh',
    };

    const chart = generateChart(user1983Input);
    const current = getCurrentDaiHan(chart, 2026);

    expect(current).not.toBeNull();
    if (current) {
      expect(current.isCurrent).toBe(true);
      // In 2026, nominal age is 2026 - 1983 + 1 = 44
      expect(44).toBeGreaterThanOrEqual(current.startAge);
      expect(44).toBeLessThanOrEqual(current.endAge);
    }
  });

  it('correctly differentiates VCD notes for Tuần only, Triệt only, and Both', () => {
    const chart = generateChart(baseInput);

    const vcdTuanPalace = {
      ...chart.palaces[0],
      chinhTinh: [],
      hasTuan: true,
      hasTriet: false,
    };
    const resTuan = interpretDaiHan(vcdTuanPalace, chart, false);
    expect(resTuan.starStructure.vcdSpecialNote).toContain('Tuần Không');
    expect(resTuan.starStructure.vcdSpecialNote).not.toContain('Triệt Không');

    const vcdTrietPalace = {
      ...chart.palaces[0],
      chinhTinh: [],
      hasTuan: false,
      hasTriet: true,
    };
    const resTriet = interpretDaiHan(vcdTrietPalace, chart, false);
    expect(resTriet.starStructure.vcdSpecialNote).toContain('Triệt Không');
    expect(resTriet.starStructure.vcdSpecialNote).not.toContain('Tuần Không');

    const vcdBothPalace = {
      ...chart.palaces[0],
      chinhTinh: [],
      hasTuan: true,
      hasTriet: true,
    };
    const resBoth = interpretDaiHan(vcdBothPalace, chart, false);
    expect(resBoth.starStructure.vcdSpecialNote).toContain('cả Tuần lẫn Triệt');
  });
});

