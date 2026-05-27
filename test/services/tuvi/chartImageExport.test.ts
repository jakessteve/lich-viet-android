import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadTuViChartAsImage } from '@/services/tuvi/chartImageExport';

describe('chartImageExport', () => {
  const originalCreateObjectUrl = URL.createObjectURL;
  const originalRevokeObjectUrl = URL.revokeObjectURL;
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  const originalClick = HTMLAnchorElement.prototype.click;
  const originalGetComputedStyle = window.getComputedStyle;
  const originalCreateRange = document.createRange;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    HTMLAnchorElement.prototype.click = originalClick;
    window.getComputedStyle = originalGetComputedStyle;
    document.createRange = originalCreateRange;
    document.body.innerHTML = '';
  });

  it('downloads the Tu Vi chart as a JPEG canvas export', async () => {
    const chart = document.createElement('div');
    chart.dataset.tuviChartExport = '';
    chart.style.width = '320px';
    chart.style.height = '380px';
    chart.style.backgroundColor = 'rgb(255, 255, 255)';
    chart.innerHTML = '<div class="tuvi-palace menh">Mệnh</div>';
    chart.getBoundingClientRect = () =>
      ({
        width: 320,
        height: 380,
        top: 0,
        left: 0,
        right: 320,
        bottom: 380,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    const palace = chart.querySelector('.tuvi-palace');
    if (palace instanceof HTMLElement) {
      palace.getBoundingClientRect = () =>
        ({
          width: 80,
          height: 90,
          top: 8,
          left: 8,
          right: 88,
          bottom: 98,
          x: 8,
          y: 8,
          toJSON: () => ({}),
        }) as DOMRect;
    }
    document.body.appendChild(chart);
    window.getComputedStyle = vi.fn(
      (element: Element) =>
        ({
          backgroundColor: element instanceof HTMLElement ? element.style.backgroundColor : '',
          color: 'rgb(27, 28, 25)',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          fontStyle: 'normal',
          fontVariant: 'normal',
          fontWeight: '700',
          fontSize: '14px',
          fontFamily: 'serif',
          lineHeight: '16px',
          getPropertyValue: (property: string) =>
            element instanceof HTMLElement ? element.style.getPropertyValue(property) : '',
          getPropertyPriority: () => '',
          width: element instanceof HTMLElement ? element.style.width : '',
          height: element instanceof HTMLElement ? element.style.height : '',
          boxSizing: element instanceof HTMLElement ? element.style.boxSizing : '',
          [Symbol.iterator]: function* iterator() {
            yield 'background-color';
            yield 'width';
            yield 'height';
            yield 'box-sizing';
            yield 'color';
            yield 'font-size';
            yield 'font-family';
          },
        }) as unknown as CSSStyleDeclaration,
    );
    document.createRange = vi.fn(
      () =>
        ({
          selectNodeContents: vi.fn(),
          detach: vi.fn(),
          getClientRects: () => [
            {
              width: 42,
              height: 16,
              top: 10,
              left: 10,
              right: 52,
              bottom: 26,
              x: 10,
              y: 10,
              toJSON: () => ({}),
            },
          ],
        }) as unknown as Range,
    );
    URL.createObjectURL = vi.fn(() => 'blob:tuvi-export');
    URL.revokeObjectURL = vi.fn();
    const fillText = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () =>
        ({
          scale: vi.fn(),
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
          font: '',
          textAlign: 'left',
          textBaseline: 'alphabetic',
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          quadraticCurveTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          fillText,
          setLineDash: vi.fn(),
        }) as unknown as CanvasRenderingContext2D,
    );
    const toBlob = vi.fn(function toBlob(
      this: HTMLCanvasElement,
      callback: BlobCallback,
      type?: string,
      quality?: unknown,
    ) {
      callback(new Blob(['jpeg'], { type: type || 'image/jpeg' }));
      expect(this.width).toBeGreaterThan(0);
      expect(this.height).toBeGreaterThan(0);
      expect(type).toBe('image/jpeg');
      expect(quality).toBe(0.94);
    });
    HTMLCanvasElement.prototype.toBlob = toBlob;

    const downloads: string[] = [];
    HTMLAnchorElement.prototype.click = vi.fn(function click(this: HTMLAnchorElement) {
      downloads.push(this.download);
    });

    await downloadTuViChartAsImage('[data-tuvi-chart-export]', 'tu-vi-test-user.png');

    expect(downloads).toEqual(['tu-vi-test-user.jpg']);
    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(fillText).toHaveBeenCalledWith('Mệnh', expect.any(Number), expect.any(Number));
  });
});
