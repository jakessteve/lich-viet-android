import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WesternChartResult } from '@/services/astrology/westernCalculator';
import { longitudeToChartAngleDegrees, WesternWheelChart } from '@/components/Astrology/Western/WesternWheelChart';

const ASCENDANT = 63.5131;
const MIDHEAVEN = 322.8517;
const CUSPS = [
  63.5131, 89.9593, 116.4055, 142.8517, 176.4055, 209.9593, 243.5131, 269.9593, 296.4055, 322.8517, 356.4055, 29.9593,
];

const result: WesternChartResult = {
  planets: [],
  houses: CUSPS.map((longitude, index) => ({
    index: index + 1,
    longitude,
    sign: '',
    signIndex: Math.floor(longitude / 30),
  })),
  dignities: [],
  aspects: [],
  dispositorTree: null,
  chartShape: null,
  partOfFortune: { longitude: 0, sign: '', signIndex: 0 },
  ascendant: ASCENDANT,
  midheaven: MIDHEAVEN,
};

const radius = (element: Element, xName: string, yName: string) => {
  const x = Number(element.getAttribute(xName));
  const y = Number(element.getAttribute(yName));
  return Math.hypot(x - 208, y - 208);
};

describe('WesternWheelChart geometry', () => {
  it('anchors the Ascendant at left and zodiac longitude counter-clockwise', () => {
    expect(longitudeToChartAngleDegrees(ASCENDANT, ASCENDANT)).toBeCloseTo(180, 8);
    expect(longitudeToChartAngleDegrees(ASCENDANT + 30, ASCENDANT)).toBeCloseTo(150, 8);
    expect(longitudeToChartAngleDegrees(MIDHEAVEN, ASCENDANT)).toBeCloseTo(280.6614, 4);
  });

  it('renders labeled axes, full house spokes, and distinct house labels', () => {
    const { container } = render(<WesternWheelChart result={result} />);

    expect(screen.getByRole('img', { name: 'Western Birth Chart' })).not.toBeNull();
    const signSegments = container.querySelectorAll('[data-western-sign]');
    expect(signSegments).toHaveLength(12);
    expect(signSegments[0].getAttribute('d')).toContain('A180,180 0 0 0');
    expect(signSegments[0].getAttribute('d')).toContain('A152,152 0 0 1');
    expect(container.querySelectorAll('[data-western-house]')).toHaveLength(12);
    expect(container.querySelectorAll('[data-western-axis-label]')).toHaveLength(4);

    const ascAxis = container.querySelector('[data-western-axis="asc-dsc"]');
    expect(ascAxis).not.toBeNull();
    expect(Number(ascAxis?.getAttribute('y1'))).toBeCloseTo(208, 6);
    expect(Number(ascAxis?.getAttribute('y2'))).toBeCloseTo(208, 6);
    expect(Number(ascAxis?.getAttribute('x1'))).toBeLessThan(208);
    expect(Number(ascAxis?.getAttribute('x2'))).toBeGreaterThan(208);

    const firstSpoke = container.querySelector('[data-western-house="1"] line');
    expect(firstSpoke).not.toBeNull();
    expect(radius(firstSpoke!, 'x1', 'y1')).toBeCloseTo(152, 6);
    expect(radius(firstSpoke!, 'x2', 'y2')).toBeCloseTo(42, 6);

    const labelPositions = [...container.querySelectorAll('[data-western-house-label]')].map(
      (label) => `${Number(label.getAttribute('x')).toFixed(4)},${Number(label.getAttribute('y')).toFixed(4)}`,
    );
    expect(new Set(labelPositions).size).toBe(12);
  });
});
