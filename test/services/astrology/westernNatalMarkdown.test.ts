import { describe, expect, it } from 'vitest';
import { formatWesternNatalAsMarkdown } from '@/services/astrology/westernNatalMarkdown';
import { createWesternNatalFixture } from '../../fixtures/westernNatalFixture';

describe('normalized Western natal Markdown', () => {
  it('serializes all normalized objects, houses, angles, aspects, and policies', () => {
    const result = createWesternNatalFixture();
    const markdown = formatWesternNatalAsMarkdown(result);

    for (const object of result.objects) expect(markdown).toContain(`\`${object.id}\``);
    for (const angle of Object.values(result.angles)) expect(markdown).toContain(`\`${angle.id}\``);
    expect(markdown.match(/^\| Nhà \d+ \|/gm) ?? []).toHaveLength(12);
    expect(markdown.match(/^\| (Conjunction|Trine) \|/gm) ?? []).toHaveLength(result.aspects.length);
    expect(markdown).toContain('2451544.708333');
    expect(markdown).toContain('western-aspects-11-v1');
    expect(markdown).toContain('geocentric-equatorial-altitude-v1');
  });
});
