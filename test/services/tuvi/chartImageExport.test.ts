import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadTuViChartAsImage, buildTuViImageFilename } from '@/services/tuvi/chartImageExport';
import * as htmlToImage from 'html-to-image';

vi.mock('html-to-image', () => ({
  toSvg: vi.fn(),
}));

describe('chartImageExport', () => {
  const originalClick = HTMLAnchorElement.prototype.click;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    HTMLAnchorElement.prototype.click = originalClick;
    document.body.innerHTML = '';
  });

  it('builds a safe Tu Vi filename', () => {
    expect(buildTuViImageFilename('Nguyễn Văn A')).toBe('tu-vi-nguyen-van-a.svg');
    expect(buildTuViImageFilename('')).toBe('tu-vi-la-so.svg');
  });

  it('downloads the Tu Vi chart as an SVG export', async () => {
    const chart = document.createElement('div');
    chart.dataset.tuviChartExport = '';
    chart.innerHTML = '<div class="tuvi-palace menh">Mệnh</div>';
    document.body.appendChild(chart);

    const mockDataUrl = 'data:image/svg+xml;charset=utf-8,<svg>test</svg>';
    vi.mocked(htmlToImage.toSvg).mockResolvedValue(mockDataUrl);

    const downloads: { href: string; download: string }[] = [];
    HTMLAnchorElement.prototype.click = vi.fn(function click(this: HTMLAnchorElement) {
      downloads.push({ href: this.href, download: this.download });
    });

    await downloadTuViChartAsImage('[data-tuvi-chart-export]', 'tu-vi-test-user.png');

    expect(downloads).toEqual([{ href: mockDataUrl, download: 'tu-vi-test-user.svg' }]);
    expect(htmlToImage.toSvg).toHaveBeenCalledWith(chart, { backgroundColor: '#ffffff' });
  });

  it('throws an error if chart element is not found', async () => {
    await expect(downloadTuViChartAsImage('#non-existent', 'chart.svg')).rejects.toThrow(
      'Không tìm thấy bảng Tử Vi để xuất ảnh.',
    );
  });
});
