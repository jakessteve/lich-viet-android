import { describe, it, expect, beforeEach } from 'vitest';
import { useElectionStore } from '@/stores/electionStore';

describe('electionStore', () => {
  beforeEach(() => {
    useElectionStore.setState({
      input: {
        startDate: new Date(2026, 7, 16),
        endDate: new Date(2026, 7, 22),
        activityType: 'cuoi-hoi',
        birthYear: 1995,
      },
      results: null,
      isScanning: false,
      error: null,
    });
  });

  it('scans a valid date range and populates non-empty candidates sorted by totalScore descending', async () => {
    const store = useElectionStore.getState();
    await store.runScan();

    const results = useElectionStore.getState().results;
    expect(results).not.toBeNull();
    expect(Array.isArray(results)).toBe(true);
    expect(results!.length).toBe(7); // 7 days from 16 to 22

    // Check candidate structure
    const top = results![0];
    expect(top).toHaveProperty('timestamp');
    expect(top).toHaveProperty('totalScore');
    expect(top).toHaveProperty('easternScore');
    expect(top).toHaveProperty('westernScore');
    expect(top).toHaveProperty('vedicScore');
    expect(top).toHaveProperty('dayLabel');
    expect(top).toHaveProperty('solarTerm');
    expect(top).toHaveProperty('reason');

    // Total score should be a valid number between 0 and 100
    expect(top.totalScore).toBeGreaterThanOrEqual(0);
    expect(top.totalScore).toBeLessThanOrEqual(100);

    // Verify descending order by score
    for (let i = 0; i < results!.length - 1; i++) {
      expect(results![i].totalScore).toBeGreaterThanOrEqual(results![i + 1].totalScore);
    }
  });

  it('handles invalid date ranges (startDate > endDate) gracefully', async () => {
    useElectionStore.setState({
      input: {
        startDate: new Date('2026-08-25T00:00:00Z'),
        endDate: new Date('2026-08-10T00:00:00Z'),
        activityType: 'khai-truong',
      },
    });

    await useElectionStore.getState().runScan();
    expect(useElectionStore.getState().error).toContain('Ngày bắt đầu không thể sau ngày kết thúc');
    expect(useElectionStore.getState().results).toBeNull();
  });

  it('clamps date range to 60 days maximum', async () => {
    useElectionStore.setState({
      input: {
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-06-01T00:00:00Z'), // 150+ days
        activityType: 'xay-dung',
      },
    });

    await useElectionStore.getState().runScan();
    const results = useElectionStore.getState().results;
    expect(results).not.toBeNull();
    expect(results!.length).toBeLessThanOrEqual(61);
  });
});
