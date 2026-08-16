import { beforeEach, describe, expect, it, vi } from 'vitest';

const { calculateSwissNatalChart } = vi.hoisted(() => ({
  calculateSwissNatalChart: vi.fn(),
}));

vi.mock('@/services/astrology/swissNatalChart', () => ({
  calculateSwissNatalChart,
}));

import { useAstrologyStore } from '@/stores/astrologyStore';

describe('Western natal store integration', () => {
  beforeEach(() => {
    calculateSwissNatalChart.mockReset();
    useAstrologyStore.getState().clearResults();
    useAstrologyStore.setState({ error: null, isCalculating: false });
  });

  it('awaits the Swiss adapter and exposes both normalized and legacy results', async () => {
    const legacyResult = { planets: [], houses: [], marker: 'legacy-projection' };
    const normalizedResult = { objects: Array.from({ length: 20 }), legacyResult };
    calculateSwissNatalChart.mockResolvedValue(normalizedResult);

    await useAstrologyStore.getState().calculateWestern();

    expect(calculateSwissNatalChart).toHaveBeenCalledOnce();
    expect(calculateSwissNatalChart).toHaveBeenCalledWith(useAstrologyStore.getState().westernInput);
    expect(useAstrologyStore.getState().westernNatalResult).toBe(normalizedResult);
    expect(useAstrologyStore.getState().westernResult).toBe(legacyResult);
    expect(useAstrologyStore.getState().isCalculating).toBe(false);
    expect(useAstrologyStore.getState().error).toBeNull();
  });

  it('clears the normalized Western natal result with the legacy results', async () => {
    const normalizedResult = { objects: Array.from({ length: 20 }), legacyResult: null };
    calculateSwissNatalChart.mockResolvedValue(normalizedResult);

    await useAstrologyStore.getState().calculateWestern();
    useAstrologyStore.getState().clearResults();

    expect(useAstrologyStore.getState().westernNatalResult).toBeNull();
  });

  it('invalidates the previous chart when inputs change or recalculation fails', async () => {
    const normalizedResult = { objects: Array.from({ length: 20 }), legacyResult: {} };
    calculateSwissNatalChart
      .mockResolvedValueOnce(normalizedResult)
      .mockRejectedValueOnce(new Error('engine unavailable'));
    await useAstrologyStore.getState().calculateWestern();
    expect(useAstrologyStore.getState().westernNatalResult).toBe(normalizedResult);
    useAstrologyStore.getState().setWesternInput({ birthMinute: 1 });
    expect(useAstrologyStore.getState().westernNatalResult).toBeNull();
    await useAstrologyStore.getState().calculateWestern();
    expect(useAstrologyStore.getState().westernNatalResult).toBeNull();
    expect(useAstrologyStore.getState().error).toMatch(/engine unavailable/);
  });
});
