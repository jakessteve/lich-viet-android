import { describe, expect, it, vi } from 'vitest';
import { createWesternNatalFixture } from '../../fixtures/westernNatalFixture';
import { createWesternNatalExport, renderWesternNatalSvg } from '@/services/astrology/westernNatalExport';

describe('standalone Western natal SVG/PNG model', () => {
  const result = createWesternNatalFixture();

  const pngHeader = (size: number) => {
    const bytes = new Uint8Array(24);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
    new DataView(bytes.buffer).setUint32(16, size);
    new DataView(bytes.buffer).setUint32(20, size);
    return new Blob([bytes], { type: 'image/png' });
  };

  it('renders the complete normalized chart as accessible standalone SVG', () => {
    const svg = renderWesternNatalSvg(result, { theme: 'light', size: 1180 });
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = document.documentElement;

    expect(root.tagName).toBe('svg');
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.getAttribute('width')).toBe('1180');
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.querySelector('foreignObject')).toBeNull();
    expect(document.querySelectorAll('[data-role="object"]')).toHaveLength(20);
    expect(document.querySelectorAll('[data-role="house"]')).toHaveLength(12);
    expect(document.querySelectorAll('[data-role="primary-angle"]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-role="aspect"]')).toHaveLength(result.aspects.length);
    expect(document.querySelectorAll('[data-role="conjunction-marker"]')).toHaveLength(1);
    expect(document.querySelector('[data-role="technical-metadata"]')?.textContent).toContain('@swisseph/browser');
    expect([...root.querySelectorAll(':scope > g[id^="layer-"]')].map((layer) => layer.id)).toEqual([
      'layer-background',
      'layer-houses',
      'layer-aspects',
      'layer-ticks',
      'layer-zodiac',
      'layer-angles',
      'layer-objects',
      'layer-metadata',
    ]);
    expect(document.querySelectorAll('[data-role="degree-tick"]')).toHaveLength(360);
    expect(document.querySelectorAll('[data-role="half-degree-tick"]')).toHaveLength(360);
    expect(document.querySelector('[data-role="symbol-path-fallback-def"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-role="symbol-path-fallback"]')).toHaveLength(20);
    const boxes = [...document.querySelectorAll('[data-role="object"]')].map((label) => ({
      x: Number(label.getAttribute('data-bbox-x')),
      y: Number(label.getAttribute('data-bbox-y')),
      width: Number(label.getAttribute('data-bbox-width')),
      height: Number(label.getAttribute('data-bbox-height')),
    }));
    expect(boxes.every((box) => Object.values(box).every(Number.isFinite))).toBe(true);
    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        const a = boxes[first];
        const b = boxes[second];
        expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(
          true,
        );
      }
    }
    expect(svg).not.toMatch(/NaN|Infinity/);
  });

  it('anchors ASC at nine o’clock and renders deterministic theme palettes', () => {
    const light = renderWesternNatalSvg(result, { theme: 'light', size: 720 });
    const dark = renderWesternNatalSvg(result, { theme: 'dark', size: 720 });
    const document = new DOMParser().parseFromString(light, 'image/svg+xml');
    const ascendant = document.querySelector('[data-angle-id="angle:ascendant"] line');

    expect(Number(ascendant?.getAttribute('x2'))).toBeLessThan(500);
    expect(Number(ascendant?.getAttribute('y2'))).toBeCloseTo(500, 6);
    expect(renderWesternNatalSvg(result, { theme: 'light', size: 720 })).toBe(light);
    expect(dark).not.toBe(light);
    expect(dark).toContain('data-theme="dark"');
  });

  it('uses the short cyclic midpoint for a conjunction across the 0/360 seam', () => {
    const seam = createWesternNatalFixture();
    seam.objects[0].longitude = 359;
    seam.objects[1].longitude = 1;
    const document = new DOMParser().parseFromString(renderWesternNatalSvg(seam, { size: 720 }), 'image/svg+xml');

    expect(document.querySelector('[data-role="conjunction-marker"]')?.getAttribute('data-midpoint-longitude')).toBe(
      '0',
    );
  });

  it('creates distinct SVG and PNG payloads without DOM capture', async () => {
    const rasterize = vi.fn(async (_svg: string, size: number) => pngHeader(size));

    const svg = await createWesternNatalExport(result, 'svg', { theme: 'dark', size: 640 });
    const png = await createWesternNatalExport(result, 'png', { theme: 'dark', size: 640, rasterize });

    expect(svg.type).toBe('image/svg+xml');
    expect(png.type).toBe('image/png');
    expect(rasterize).toHaveBeenCalledOnce();
    expect(rasterize.mock.calls[0][0]).not.toContain('foreignObject');
    expect(rasterize.mock.calls[0][1]).toBe(640);
  });

  it('rejects an invalid PNG signature or dimensions with an export-stage error', async () => {
    await expect(
      createWesternNatalExport(result, 'png', {
        size: 640,
        rasterize: async () => new Blob(['not-png'], { type: 'image/png' }),
      }),
    ).rejects.toThrow(/PNG validation stage/i);
    await expect(
      createWesternNatalExport(result, 'png', {
        size: 640,
        rasterize: async () => pngHeader(320),
      }),
    ).rejects.toThrow(/dimensions/i);
  });
});
