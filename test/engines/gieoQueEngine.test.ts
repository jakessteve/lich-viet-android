import { describe, it, expect } from 'vitest';
import { castHoaMai, getGieoQueFixturesCount, TRIGRAMS, HEXAGRAMS } from '@lich-viet/core';

describe('gieoQueEngine', () => {
  it('keeps the v2 fixture surface intact', () => {
    const counts = getGieoQueFixturesCount();
    expect(counts.trigrams).toBe(8);
    expect(counts.hexagrams).toBe(64);
    expect(TRIGRAMS).toHaveLength(8);
    expect(HEXAGRAMS).toHaveLength(64);
  });

  it('casts deterministically for time-based input', () => {
    const input = {
      method: 'time' as const,
      castDate: new Date(2025, 0, 29),
      castTime: '14:35',
      question: 'Công việc có thuận không?',
    };

    const first = castHoaMai(input);
    const second = castHoaMai(input);

    expect(first).toEqual(second);
    expect(first.methodLabel).toBe('Time-based');
    expect(first.haoDetails).toHaveLength(6);
    expect(first.sourceRefs.length).toBeGreaterThan(0);
    expect(new Set(first.sourceRefs.map((ref) => `${ref.sourceId}:${ref.note ?? ''}`)).size).toBe(
      first.sourceRefs.length,
    );
    expect(first.movingLine).toBeGreaterThanOrEqual(1);
    expect(first.movingLine).toBeLessThanOrEqual(6);
    expect(first.summary).toContain('Thể');
    expect(first.summary).toContain('Dụng');
  });

  it('supports number-based casting and validates numeric seeds', () => {
    const result = castHoaMai({
      method: 'number',
      castDate: new Date(2025, 0, 29),
      numbers: [18, 27],
      question: 'Hai con số này báo gì?',
    });

    expect(result.methodLabel).toBe('Number-based');
    expect(result.contextChips).toContain('#18 · #27');
    expect(result.chu.hexagramNumber).toBeGreaterThanOrEqual(1);
    expect(result.chu.hexagramNumber).toBeLessThanOrEqual(64);

    expect(() =>
      castHoaMai({
        method: 'number',
        castDate: new Date(2025, 0, 29),
        numbers: [0, 12],
      }),
    ).toThrow('Casting numbers must be positive integers.');
  });

  it('warns when the question is empty', () => {
    const result = castHoaMai({
      method: 'time',
      castDate: new Date(2025, 0, 29),
      castTime: '08:00',
    });

    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'question-empty',
      }),
    ]);
  });
});
