import { describe, it, expect } from 'vitest';
import { normalizeDungSuBuckets } from '@/utils/dungSuDisplay';

describe('normalizeDungSuBuckets', () => {
  it('moves items with percentage at or above 50 into Nghi', () => {
    const result = normalizeDungSuBuckets(['Cúng lễ (72%)', 'Cầu phúc (64%)'], ['Chôn cất (18%)', 'Cúng lễ (72%)']);

    expect(result.nghi).toContain('Cúng lễ (72%)');
    expect(result.nghi).toContain('Cầu phúc (64%)');
    expect(result.ky).toContain('Chôn cất (18%)');
    expect(result.ky).not.toContain('Cúng lễ (72%)');
  });

  it('keeps items below 50 in Kỵ', () => {
    const result = normalizeDungSuBuckets(['Đi xa (49%)'], ['Khởi công (12%)']);

    expect(result.nghi).toEqual([]);
    expect(result.ky).toEqual(['Đi xa (49%)', 'Khởi công (12%)']);
  });

  it('splits bundled hourly strings before normalizing', () => {
    const result = normalizeDungSuBuckets(
      ['Cúng lễ (72%)'],
      ['Cưới hỏi (50%), Cầu tài (48%), Cúng lễ (72%), Cầu phúc (64%), Khởi công (27%)'],
    );

    expect(result.nghi).toEqual(['Cúng lễ (72%)', 'Cưới hỏi (50%)', 'Cầu phúc (64%)']);
    expect(result.ky).toEqual(['Cầu tài (48%)', 'Khởi công (27%)']);
  });
});
