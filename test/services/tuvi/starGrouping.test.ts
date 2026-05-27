import { describe, it, expect } from 'vitest';
import { CHINH_TINH_LIST } from '@/services/tuvi/constants';
import { formatPalaceStars, getNguHanhElement, getStarBrightnessMarker, getStarColor } from '@/services/tuvi/starGrouping';
import type { TuViPalace } from '@/types/tuvi';

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
    daiHanAgeRange: '1–10',
    isMenh: true,
    isThan: false,
    hasTuan: false,
    hasTriet: false,
    ...overrides,
  };
}

describe('starGrouping brightness markers', () => {
  it('normalizes Ngũ Hành strings to the core element', () => {
    expect(getNguHanhElement('Âm Thổ')).toBe('Thổ');
    expect(getNguHanhElement('Dương Kim')).toBe('Kim');
    expect(getNguHanhElement('Hỏa')).toBe('Hỏa');
  });

  it('omits Bình markers', () => {
    expect(getStarBrightnessMarker({ brightness: 'Bình' } as never)).toBe('');
    expect(getStarBrightnessMarker({ brightness: 'Bất' } as never)).toBe('');
  });

  it('supports traditional intermediate brightness markers', () => {
    expect(getStarBrightnessMarker({ brightness: 'Địa' } as never)).toBe('(Đị)');
    expect(getStarBrightnessMarker({ brightness: 'Lợi' } as never)).toBe('(L)');
  });

  it('formats stars without the Bình suffix', () => {
    const palace = makePalace({
      chinhTinh: [
        {
          name: 'Tử Vi',
          type: 'chinhTinh',
          nguHanh: 'Dương Thổ',
          brightness: 'Bình',
        },
      ],
    });

    expect(formatPalaceStars(palace).chinhTinhLines).toEqual(['Tử Vi']);
  });

  it('includes sat tinh lines so stars like Lưu Hà stay visible', () => {
    const palace = makePalace({
      satTinh: [
        {
          name: 'Lưu Hà',
          type: 'satTinh',
          nguHanh: 'Âm Thủy',
          brightness: 'Miếu',
        },
      ],
    });

    expect(formatPalaceStars(palace).satTinhLines).toEqual(['Lưu Hà(M)']);
  });

  it('renders star colors from the core Ngũ Hành element', () => {
    expect(getStarColor({ name: 'Vũ Khúc', nguHanh: 'Âm Kim' } as never)).toBe('#8a8a8a');
    expect(getStarColor({ name: 'Thiên Cơ', nguHanh: 'Âm Mộc' } as never)).toBe('#2e9730');
    expect(getStarColor({ name: 'Thiên Đồng', nguHanh: 'Dương Thủy' } as never)).toBe('#161617');
  });

  it('uses a neutral color for unknown Tứ Hóa source stars instead of assuming Thổ', () => {
    const palace = makePalace({
      tuHoa: [{ type: 'Khoa', starName: 'Sao Chưa Mô Hình', sourceCan: 'Giáp' }],
    });

    expect(formatPalaceStars(palace).tuHoaLabels).toEqual(['Khoa [#888888]']);
  });

  it('keeps high-confidence chính tinh Ngũ Hành classifications in the canonical table', () => {
    const mainStarElements = new Map(CHINH_TINH_LIST.map((star) => [star.name, star.nguHanh]));

    expect(mainStarElements.get('Tử Vi')).toBe('Dương Thổ');
    expect(mainStarElements.get('Cự Môn')).toBe('Âm Thủy');
    expect(mainStarElements.get('Thiên Tướng')).toBe('Dương Thủy');
    expect(mainStarElements.get('Thiên Phủ')).toBe('Dương Thổ');
    expect(mainStarElements.get('Thiên Lương')).toBe('Âm Mộc');
  });
});
