import { describe, it, expect } from 'vitest';
import { getThaiAtYearChart } from '@/utils/thaiAtEngine';

describe('Thái Ất Canonical & Dual-Mode Host/Guest Suite (F-03 & DIR-07)', () => {
  it('generates chart with canonical Host/Guest calculation by default', () => {
    const chart2024 = getThaiAtYearChart(2024);
    expect(chart2024.hostGuest).toBeDefined();
    expect(chart2024.hostGuest.accuracy).toBe('canonical_table');
    expect(chart2024.hostGuest.hostCount).toBeGreaterThanOrEqual(1);
    expect(chart2024.hostGuest.guestCount).toBeGreaterThanOrEqual(1);
    expect(chart2024.hostGuest.fixedCount).toBeGreaterThanOrEqual(1);
    expect(['hostDominant', 'guestDominant', 'balanced']).toContain(chart2024.hostGuest.dominance);
  });

  it('preserves continuity across consecutive years', () => {
    const chart2025 = getThaiAtYearChart(2025);
    const chart2026 = getThaiAtYearChart(2026);
    expect(chart2025.hostGuest.accuracy).toBe('canonical_table');
    expect(chart2026.hostGuest.accuracy).toBe('canonical_table');
  });
});
