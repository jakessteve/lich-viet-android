import { describe, it, expect } from 'vitest';
import { synthesizeTriSystemReport, type TriSystemInput } from '@/services/astrology/dialecticalSynthesis';

describe('synthesizeTriSystemReport (Dialectical Tri-System Synthesis)', () => {
  it('synthesizes multi-layered report without forcing false equivalence', () => {
    const input: TriSystemInput = {
      western: {
        sunSign: 'Bạch Dương (Aries)',
        moonSign: 'Bảo Bình (Aquarius)',
        ascSign: 'Sư Tử (Leo)',
        chartRuler: 'Mặt Trời tại Nhà 9',
      },
      tuvi: {
        menhCung: 'Ngọ',
        thanCung: 'Thân',
        menhNapAm: 'Lộ Bàng Thổ',
        cuc: 'Thổ Ngũ Cục',
        chinhTinhMenh: ['Tử Vi', 'Thất Sát'],
        chinhTinhThan: ['Liêm Trinh'],
        tuHoa: ['Hóa Quyền', 'Hóa Lộc'],
      },
      vedic: {
        lagnaSign: 'Cự Giải (Karka)',
        moonRasiSign: 'Ma Kết (Makara)',
        nakshatra: 'Shravana',
        atmakaraka: 'Thổ Tinh (Saturn)',
      },
    };

    const report = synthesizeTriSystemReport(input);

    expect(report.socialPersonaVi).toContain('Bạch Dương');
    expect(report.socialPersonaVi).toContain('Sư Tử');
    expect(report.circumstantialDestinyVi).toContain('Tử Vi, Thất Sát');
    expect(report.circumstantialDestinyVi).toContain('Thổ Ngũ Cục');
    expect(report.soulCoreVi).toContain('Cự Giải');
    expect(report.soulCoreVi).toContain('Shravana');
    expect(report.consensusGiftsVi.length).toBeGreaterThan(0);
    expect(report.growthTensionsVi.length).toBeGreaterThan(0);
    expect(report.unifiedLifeAdviceVi).toContain('Thân - Tâm - Trí');
    expect(report.elementalAlchemyVi).toBeDefined();
    expect(report.dashaConvergenceVi).toBeDefined();
    expect(report.triTraditionMatrix?.length).toBe(3);
  });
});
