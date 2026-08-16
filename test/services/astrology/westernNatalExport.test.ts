import { describe, expect, it } from 'vitest';
import { createWesternNatalFixture } from '../../fixtures/westernNatalFixture';
import { renderWesternNatalSvg } from '@/services/astrology/westernNatalExport';

describe('standalone Western natal SVG rendering model', () => {
  const result = createWesternNatalFixture();

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
});
