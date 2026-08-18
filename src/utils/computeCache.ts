/**
 * Lightweight, zero-dependency Bounded LRU Cache for expensive mobile computations.
 * Used to memoize astronomical coordinates, Swiss Ephemeris natal charts, and Dụng Sự scores.
 */

export class ComputeCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize = 64) {
    this.maxSize = Math.max(1, maxSize);
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Refresh LRU order (delete & re-insert to move to tail)
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (first key in map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Creates a memoized function wrapping pure synchronous computations.
 */
export function memoizeCompute<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  keyGenerator: (...args: Args) => string,
  maxSize = 64,
): (...args: Args) => R {
  const cache = new ComputeCache<string, R>(maxSize);

  return (...args: Args): R => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
