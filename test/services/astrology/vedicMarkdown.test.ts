import { describe, it, expect } from 'vitest';
import { formatVedicChartAsMarkdown } from '@/services/astrology/vedicMarkdownFormatter';
import type { WesternChartResult } from '@/services/astrology/westernCalculator';

describe('Vedic Jyotish Markdown Formatter', () => {
  const mockVedicResult: WesternChartResult = {
    planets: [
      {
        body: 'sun',
        sign: 'Bạch Dương',
        degreeInSign: 10.5,
        house: 10,
        speed: 1.0,
        retrograde: false,
        latitude: 0,
        distance: 1,
        tropicalLongitude: 34.5,
        siderealLongitude: 10.5,
        nakshatra: 'Ashwini',
        pada: 3,
      },
      {
        body: 'moon',
        sign: 'Kim Ngưu',
        degreeInSign: 15.0,
        house: 11,
        speed: 13.2,
        retrograde: false,
        latitude: 3.0,
        distance: 0.0025,
        tropicalLongitude: 69.0,
        siderealLongitude: 45.0,
        nakshatra: 'Rohini',
        pada: 1,
      },
      {
        body: 'mars',
        sign: 'Bạch Dương',
        degreeInSign: 5.0,
        house: 10,
        speed: 0.8,
        retrograde: false,
        latitude: 0,
        distance: 1.5,
        tropicalLongitude: 29.0,
        siderealLongitude: 5.0,
        nakshatra: 'Ashwini',
        pada: 2,
      },
      {
        body: 'mercury',
        sign: 'Song Ngư',
        degreeInSign: 12.0,
        house: 9,
        speed: 1.2,
        retrograde: false,
        latitude: 0,
        distance: 1.1,
        tropicalLongitude: 366.0,
        siderealLongitude: 342.0,
        nakshatra: 'Uttara Bhadrapada',
        pada: 3,
      },
      {
        body: 'jupiter',
        sign: 'Cự Giải',
        degreeInSign: 28.0,
        house: 1,
        speed: 0.2,
        retrograde: false,
        latitude: 0.5,
        distance: 5.2,
        tropicalLongitude: 122.0,
        siderealLongitude: 98.0,
        nakshatra: 'Pushya',
        pada: 4,
      },
      {
        body: 'venus',
        sign: 'Song Ngư',
        degreeInSign: 27.0,
        house: 9,
        speed: 1.1,
        retrograde: false,
        latitude: 0.2,
        distance: 0.9,
        tropicalLongitude: 381.0,
        siderealLongitude: 357.0,
        nakshatra: 'Revati',
        pada: 4,
      },
      {
        body: 'saturn',
        sign: 'Thiên Bình',
        degreeInSign: 20.0,
        house: 4,
        speed: 0.05,
        retrograde: false,
        latitude: -1.0,
        distance: 9.5,
        tropicalLongitude: 224.0,
        siderealLongitude: 200.0,
        nakshatra: 'Vishakha',
        pada: 1,
      },
      {
        body: 'rahu',
        sign: 'Kim Ngưu',
        degreeInSign: 18.0,
        house: 11,
        speed: -0.05,
        retrograde: true,
        latitude: 0,
        distance: 1,
        tropicalLongitude: 72.0,
        siderealLongitude: 48.0,
        nakshatra: 'Rohini',
        pada: 2,
      },
      {
        body: 'ketu',
        sign: 'Bọ Cạp',
        degreeInSign: 18.0,
        house: 5,
        speed: -0.05,
        retrograde: true,
        latitude: 0,
        distance: 1,
        tropicalLongitude: 252.0,
        siderealLongitude: 228.0,
        nakshatra: 'Jyeshtha',
        pada: 4,
      },
    ],
    houses: [
      { house: 1, sign: 'Cự Giải', degree: 15, minutes: 0 },
      { house: 2, sign: 'Sư Tử', degree: 15, minutes: 0 },
      { house: 3, sign: 'Xử Nữ', degree: 15, minutes: 0 },
      { house: 4, sign: 'Thiên Bình', degree: 15, minutes: 0 },
      { house: 5, sign: 'Bọ Cạp', degree: 15, minutes: 0 },
      { house: 6, sign: 'Nhân Mã', degree: 15, minutes: 0 },
      { house: 7, sign: 'Ma Kết', degree: 15, minutes: 0 },
      { house: 8, sign: 'Bảo Bình', degree: 15, minutes: 0 },
      { house: 9, sign: 'Song Ngư', degree: 15, minutes: 0 },
      { house: 10, sign: 'Bạch Dương', degree: 15, minutes: 0 },
      { house: 11, sign: 'Kim Ngưu', degree: 15, minutes: 0 },
      { house: 12, sign: 'Song Tử', degree: 15, minutes: 0 },
    ],
    ascendant: 105.0, // Cancer Lagna
    midheaven: 15.0,
    vertex: 180.0,
    partOfFortune: { sign: 'Sư Tử', degree: 20 },
    aspects: [],
  };

  it('formats a complete Vedic chart into rich Markdown', () => {
    const markdown = formatVedicChartAsMarkdown(mockVedicResult, {
      name: 'Vedic Native',
      birthDate: new Date('1995-05-15'),
      ayanamsa: 'Lahiri (Chitra Paksha)',
    });

    expect(markdown).toContain('# Lá Số Chiêm Tinh Vệ Đà (Vedic Jyotish - Janma Kundali)');
    expect(markdown).toContain('## Thông Tin Cơ Bản & Trọng Tâm Bản Mệnh');
    expect(markdown).toContain('Vedic Native');
    expect(markdown).toContain('Lagna (Cung Mọc Vệ Đà / Tanu Bhava)');
    expect(markdown).toContain('Janma Rasi (Cung Mặt Trăng)');
    expect(markdown).toContain('Janma Nakshatra (Chòm Sao 27 Tú)');
    expect(markdown).toContain('Rohini');
    expect(markdown).toContain('Atmakaraka (Hành Tinh Chủ Linh Hồn - AK)');

    expect(markdown).toContain('## Bảng Tọa Độ 9 Cửu Diệu (Navagrahas & Dignities)');
    expect(markdown).toContain('Mặt Trời (Surya)');
    expect(markdown).toContain('Mặt Trăng (Chandra)');
    expect(markdown).toContain('Sao Mộc (Guru)');
    expect(markdown).toContain('La Hầu (Rahu)');
    expect(markdown).toContain('Kế Đô (Ketu)');

    expect(markdown).toContain('## Ma Trận 12 Cung Vị (Bhava Matrix)');
    expect(markdown).toContain('Cung Kendra');
    expect(markdown).toContain('Cung Trikona');
    expect(markdown).toContain('Cung Upachaya');
    expect(markdown).toContain('Cung Dusthana');

    expect(markdown).toContain('## Tổ Hợp Cát Cách & Khắc Kỵ (Detected Yogas & Doshas)');
    expect(markdown).toContain('## Chu Kỳ Đại Vận Thời Gian (Vimshottari Dasha Timeline)');
    expect(markdown).toContain('## Tổng Hợp Luận Giải Jyotish & Định Hướng Nghiệp Lực');
    expect(markdown).toContain('Kim chỉ nam hành động & Tu dưỡng (Remedial Guidance)');
  });
});
