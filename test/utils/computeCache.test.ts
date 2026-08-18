import { describe, it, expect, vi } from 'vitest';
import { ComputeCache, memoizeCompute } from '../../src/utils/computeCache';

describe('ComputeCache', () => {
  it('stores and retrieves cached items', () => {
    const cache = new ComputeCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBeUndefined();
    expect(cache.has('a')).toBe(true);
    expect(cache.has('c')).toBe(false);
  });

  it('evicts oldest entries when exceeding maxSize (LRU behavior)', () => {
    const cache = new ComputeCache<string, number>(2);
    cache.set('a', 1);
    cache.set('b', 2);

    // Access 'a' to make it more recently used than 'b'
    cache.get('a');

    // Add 'c', which should evict 'b'
    cache.set('c', 3);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('c')).toBe(3);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.size).toBe(2);
  });

  it('clears all items correctly', () => {
    const cache = new ComputeCache<string, number>(5);
    cache.set('x', 10);
    cache.set('y', 20);
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('x')).toBeUndefined();
  });
});

describe('memoizeCompute', () => {
  it('memoizes pure function results based on custom key generator', () => {
    const expensiveFn = vi.fn((x: number, y: number) => x + y);
    const memoized = memoizeCompute(expensiveFn, (x, y) => `${x}:${y}`, 10);

    const res1 = memoized(2, 3);
    const res2 = memoized(2, 3);
    const res3 = memoized(4, 5);

    expect(res1).toBe(5);
    expect(res2).toBe(5);
    expect(res3).toBe(9);
    expect(expensiveFn).toHaveBeenCalledTimes(2);
  });
});
