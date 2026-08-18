import { describe, it, expect } from 'vitest';
import { formatTuViChartAsMarkdown, generatePromptHeader } from '../../src/services/tuvi/markdownFormatter';
import { generateChart } from '../../src/services/tuvi/starPlacement';
import type { TuViInput } from '../../src/types/tuvi';

describe('Markdown Formatter', () => {
  const input: TuViInput = {
    name: 'Nguyễn Văn A',
    solarDate: new Date(1990, 4, 15, 12, 0),
    birthHour: 6,
    gender: 'nam',
    timezone: 'Asia/Ho_Chi_Minh',
  };

  it('should generate a complete Markdown document', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart);

    expect(markdown).toContain('# Lá Số Tử Vi');
    expect(markdown).toContain('## Thông Tin Cơ Bản');
    expect(markdown).toContain('Nguyễn Văn A');
    expect(markdown).toContain('## Thập Nhị Cung');
    expect(markdown).toContain('Mệnh');
    expect(markdown).toContain('## Cấu Trúc Lá Số & Thế Cục Bản Mệnh');
    expect(markdown).toContain('## Tam Phương Tứ Chính & Tương Tác Cung Vị Then Chốt');
    expect(markdown).toContain('## Vận Hạn & Lưu Niên Chi Tiết');
    expect(markdown).toContain('Bảng 12 Thập Niên Đại Hạn Cuộc Đời');
    expect(markdown).toContain('Luận Giải Chuyên Sâu Đại Hạn');
    expect(markdown).toContain('4 Vòng Tràng Sinh');
  });

  it('should NOT include redundant engine metadata and catalog layering', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart);
    expect(markdown).not.toContain('## Dữ Liệu Engine');
    expect(markdown).not.toContain('## Phân Tầng Danh Mục');
    expect(markdown).not.toContain('academicTargetTotal');
    expect(markdown).not.toContain('leapMonthPolicy');
  });

  it('should not include the removed scoring section', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart);
    expect(markdown).not.toContain(['## Điểm', 'Huyền', 'Khí'].join(' '));
    expect(markdown).not.toContain(['Điểm', 'huyền', 'khí'].join(' '));
  });

  it('should include combinations section when enabled', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart, { includeCombinations: true });
    // The combinations section header is always present; content depends on chart
    expect(markdown).toContain('## Cách Cục Đặc Biệt');
  });

  it('should include Flying Stars (Phi Tinh Tứ Hóa) analysis in markdown export', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart);
    expect(markdown).toContain('## Phi Tinh Tứ Hóa 12 Cung');
    expect(markdown).toContain('Bảng Tứ Hóa Phi Xuất 12 Cung');
  });

  it('should generate a prompt header', () => {
    const chart = generateChart(input);
    const header = generatePromptHeader(chart);
    expect(header).toContain('Phân tích lá số Tử Vi');
    expect(header).toContain('Nguyễn Văn A');
  });

  it('should include custom prompt header when provided', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart, { promptHeader: 'Custom header' });
    expect(markdown).toContain('Custom header');
  });

  it.each(['nam-phai', 'thien-luong', 'bac-phai'] as const)(
    'should surface Lưu Hà in the markdown chart for %s',
    (school) => {
      const chart = generateChart({
        name: 'Nguyễn Văn A',
        solarDate: new Date(1983, 10, 13, 18, 30),
        birthHour: 9,
        birthClockHour: 18,
        birthMinute: 30,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
        school,
      });

      const markdown = formatTuViChartAsMarkdown(chart);
      expect(markdown).toContain('Lưu Hà');
      expect(markdown).toContain('Sát Tinh');
    },
  );
});
