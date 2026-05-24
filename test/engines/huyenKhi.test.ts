import { describe, it, expect } from 'vitest';
import { calculatePalaceScore, calculateHuyenKhi } from '@/services/tuvi/huyenKhi';
import type { TuViPalace, TuViCombination } from '@/types/tuvi';

function makePalace(overrides: Partial<TuViPalace> = {}): TuViPalace {
  return {
    id: 0,
    chi: 'Tý',
    name: 'Mệnh',
    nameHanViet: '命宮',
    can: 'Giáp',
    canChi: 'Giáp Tý',
    chinhTinh: [],
    phuTinh: [],
    satTinh: [],
    tuHoa: [],
    brightness: {},
    daiHanAgeRange: '2–11',
    isMenh: true,
    isThan: false,
    hasTuan: false,
    hasTriet: false,
    ...overrides,
  };
}

describe('calculatePalaceScore', () => {
  it('returns 0 for an empty palace', () => {
    const palace = makePalace();
    expect(calculatePalaceScore(palace)).toBe(0);
  });

  it('scores Chính Tinh by brightness', () => {
    const palace = makePalace({
      chinhTinh: [
        { name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Miếu' },
        { name: 'Thiên Cơ', type: 'chinhTinh', nguHanh: 'Âm Mộc', brightness: 'Hãm' },
      ],
    });
    // Miếu = 10, Hãm = 2
    expect(calculatePalaceScore(palace)).toBe(12);
  });

  it('scores Phụ Tinh by brightness', () => {
    const palace = makePalace({
      phuTinh: [
        { name: 'Văn Xương', type: 'phuTinh', nguHanh: 'Âm Kim', brightness: 'Vượng' },
        { name: 'Văn Khúc', type: 'phuTinh', nguHanh: 'Âm Thủy', brightness: 'Bình' },
      ],
    });
    // Vượng = 5, Bình = 3
    expect(calculatePalaceScore(palace)).toBe(8);
  });

  it('scores Sát Tinh by brightness', () => {
    const palace = makePalace({
      satTinh: [
        { name: 'Kình Dương', type: 'satTinh', nguHanh: 'Dương Kim', brightness: 'Miếu' },
        { name: 'Đà La', type: 'satTinh', nguHanh: 'Âm Kim', brightness: 'Hãm' },
      ],
    });
    // Miếu = 3, Hãm = -3
    expect(calculatePalaceScore(palace)).toBe(0);
  });

  it('adds Tứ Hóa bonuses', () => {
    const palace = makePalace({
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Bình' }],
      tuHoa: [
        { type: 'Lộc', starName: 'Tử Vi', sourceCan: 'Giáp' },
        { type: 'Kỵ', starName: 'Thiên Cơ', sourceCan: 'Giáp' },
      ],
    });
    // Bình chính tinh = 4, Lộc +5, Kỵ -4
    expect(calculatePalaceScore(palace)).toBe(5);
  });

  it('combines all star types and Tứ Hóa', () => {
    const palace = makePalace({
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Miếu' }],
      phuTinh: [{ name: 'Văn Xương', type: 'phuTinh', nguHanh: 'Âm Kim', brightness: 'Vượng' }],
      satTinh: [{ name: 'Kình Dương', type: 'satTinh', nguHanh: 'Dương Kim', brightness: 'Bình' }],
      tuHoa: [{ type: 'Quyền', starName: 'Vũ Khúc', sourceCan: 'Giáp' }],
    });
    // Miếu chính = 10, Vượng phụ = 5, Bình sát = 0, Quyền +4
    expect(calculatePalaceScore(palace)).toBe(19);
  });
});

describe('calculateHuyenKhi', () => {
  it('returns 0 total for empty palaces and no combinations', () => {
    const palaces = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    const result = calculateHuyenKhi(palaces, []);
    expect(result.totalScore).toBe(0);
    expect(result.grade).toBe('Hạ Cách');
  });

  it('returns a calibrated relation score across all 12 palaces', () => {
    const palaces = Array.from({ length: 12 }, (_, i) =>
      makePalace({
        id: i,
        name: `Cung ${i}`,
        chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Bình' }],
      }),
    );
    const result = calculateHuyenKhi(palaces, []);
    expect(result.totalScore).toBe(-13.3);
    expect(result.grade).toBe('Hạ Cách');
  });

  it('adds combination bonuses', () => {
    const palaces = [makePalace()];
    const combinations: TuViCombination[] = [
      {
        name: 'Sát Phá Lang',
        nameHanViet: '殺破狼',
        involvedStars: ['Thất Sát', 'Phá Quân', 'Tham Lang'],
        involvedCung: ['Mệnh', 'Tài Bạch', 'Quan Lộc'],
        detectionReason: 'Tam hợp',
        purity: 'thuần',
        strength: 8,
        note: 'Dynamic',
        category: 'hung',
      },
      {
        name: 'Cơ Nguyệt Đồng Lương',
        nameHanViet: '機月同梁',
        involvedStars: ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'],
        involvedCung: ['Mệnh'],
        detectionReason: 'Same cung',
        purity: 'thuần',
        strength: 9,
        note: 'Stable',
        category: 'cat',
      },
    ];
    const result = calculateHuyenKhi(palaces, combinations);
    // hung = -5, cat = +5, net 0
    expect(result.totalScore).toBe(0);
  });

  it('assigns correct grades by threshold', () => {
    const emptyPalaces = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));

    const makeCatCombos = (length: number): TuViCombination[] =>
      Array.from({ length }, () => ({
        name: 'Test',
        nameHanViet: '測',
        involvedStars: [],
        involvedCung: [],
        detectionReason: 'Test',
        purity: 'thuần',
        strength: 5,
        note: '',
        category: 'cat',
      }));

    // >=25 → Thượng Cách
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(65)).totalScore).toBe(39);
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(65)).grade).toBe('Thượng Cách');

    // >=20 → Thượng Trung
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(52)).totalScore).toBe(31.2);
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(52)).grade).toBe('Thượng Cách');

    // falls below the grading thresholds
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(39)).totalScore).toBe(23.4);
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(39)).grade).toBe('Thượng Trung');

    // below Trung Hạ
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(26)).totalScore).toBe(15.6);
    expect(calculateHuyenKhi(emptyPalaces, makeCatCombos(26)).grade).toBe('Trung Cách');

    // 0 → Hạ Cách
    expect(calculateHuyenKhi(emptyPalaces, []).grade).toBe('Hạ Cách');
  });
});
