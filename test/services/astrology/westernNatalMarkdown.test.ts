import { describe, expect, it } from 'vitest';
import { formatWesternNatalAsMarkdown } from '@/services/astrology/westernNatalMarkdown';
import { createWesternNatalFixture } from '../../fixtures/westernNatalFixture';

describe('normalized Western natal Markdown', () => {
  it('serializes rich astrological natal chart without raw debug flags', () => {
    const result = createWesternNatalFixture();
    const markdown = formatWesternNatalAsMarkdown(result);

    expect(markdown).toContain('# Lá Số Chiêm Tinh Tây Phương (Natal Chart)');
    expect(markdown).toContain('## Thông Tin Cơ Bản & Trọng Tâm Bản Mệnh');
    expect(markdown).toContain('The Big Three (Bộ Ba Cốt Lõi)');
    expect(markdown).toContain('## Bảng Tọa Độ & Phẩm Giá Hành Tinh');
    expect(markdown).toContain('## Cân Bằng Nguyên Tố & Tính Chất');
    expect(markdown).toContain('## Cấu Trúc 12 Nhà Địa Bàn & Chủ Quản');
    expect(markdown).toContain('## Các Góc Chiếu Chính (Major Aspects)');
    expect(markdown).toContain('## Tổng Hợp Luận Giải Toàn Diện');

    for (const object of result.objects) {
      expect(markdown).toContain(object.nameVi);
    }
    expect(markdown.match(/^\| Nhà \d+ \|/gm) ?? []).toHaveLength(12);

    // Verify raw debug flags are eliminated
    expect(markdown).not.toContain('western-aspects-11-v1');
    expect(markdown).not.toContain('geocentric-equatorial-altitude-v1');
    expect(markdown).not.toContain('Flags ecl/eq');
    expect(markdown).not.toContain('Requested flags');
  });
});

