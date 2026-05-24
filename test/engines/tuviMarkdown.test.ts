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
  });

  it('should include Huyền Khí section when enabled', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart, { includeHuyenKhi: true });
    expect(markdown).toContain('## Điểm Huyền Khí');
  });

  it('should exclude Huyền Khí section when disabled', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart, { includeHuyenKhi: false });
    expect(markdown).not.toContain('## Điểm Huyền Khí');
  });

  it('should include combinations section when enabled', () => {
    const chart = generateChart(input);
    const markdown = formatTuViChartAsMarkdown(chart, { includeCombinations: true });
    // The combinations section header is always present; content depends on chart
    expect(markdown).toContain('## Cách Cục Đặc Biệt');
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
});
