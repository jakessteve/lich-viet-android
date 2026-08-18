import { describe, it, expect, beforeEach } from 'vitest';
import { getRuntime, setRuntime } from '@/gateways/bootstrap';
import { createDemoRuntime } from '@/gateways/demo';
import { createRemoteRuntime } from '@/gateways/remote';
import { useProfileVaultStore } from '@/stores/profileVaultStore';

describe('Gateway Abstraction Layer', () => {
  beforeEach(() => {
    setRuntime(null);
  });

  it('provides demo runtime by default in test environment', async () => {
    const runtime = getRuntime();
    expect(runtime.kind).toBe('demo');

    const profile = await runtime.auth.getProfile();
    expect(profile.id).toBe('demo-user-001');
  });

  it('performs in-memory CRUD on Calendar Events in demo runtime', async () => {
    const runtime = createDemoRuntime();
    const created = await runtime.calendar.saveEvent({
      title: 'Lễ Cầu An',
      solarDate: '2026-08-25',
      category: 'ritual',
    });
    expect(created.id).toContain('evt-');
    expect(created.title).toBe('Lễ Cầu An');

    const list = await runtime.calendar.getEvents({ startDate: '2026-08-01', endDate: '2026-08-31' });
    expect(list.some((e) => e.id === created.id)).toBe(true);

    await runtime.calendar.deleteEvent(created.id);
  });

  it('creates remote runtime instance correctly', () => {
    const remote = createRemoteRuntime('https://api.lichviet.local');
    expect(remote.kind).toBe('remote');
    expect(remote.auth).toBeDefined();
    expect(remote.calendar).toBeDefined();
    expect(remote.sync).toBeDefined();
  });

  it('updates user profile via AuthGateway in demo runtime', async () => {
    const runtime = createDemoRuntime();
    const updated = await runtime.auth.updateProfile({ name: 'Nguyễn Văn A' });
    expect(updated.name).toBe('Nguyễn Văn A');

    const fetched = await runtime.auth.getProfile();
    expect(fetched.name).toBe('Nguyễn Văn A');
  });

  it('exports and applies sync mutations in eventStore correctly', async () => {
    const { useEventStore } = await import('@/stores/eventStore');
    const store = useEventStore.getState();

    const created = store.addEvent({
      title: 'Đám Giỗ Ông Nội',
      solarDate: '2026-10-10',
      category: 'ritual',
      recurrence: 'yearly_lunar',
      lunarDay: 1,
      lunarMonth: 9,
    });

    const mutations = store.exportSyncMutations();
    expect(mutations.length).toBeGreaterThan(0);
    expect(mutations.some((m) => m.entityId === created.id && m.entityType === 'calendar_event')).toBe(true);

    // Apply inbound delta from server
    store.applyServerDeltas([
      {
        entityType: 'calendar_event',
        entityId: 'server-remote-evt-1',
        action: 'insert',
        payload: {
          id: 'server-remote-evt-1',
          userId: 'user-1',
          title: 'Ngày Giỗ Bà Cố',
          solarDate: '2026-11-15',
          category: 'ritual',
          recurrence: 'yearly_lunar',
          alarmOffsetsMinutes: [60],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Record<string, unknown>,
        serverUpdatedAt: new Date().toISOString(),
      },
    ]);

    const updatedList = useEventStore.getState().events;
    expect(updatedList.some((e) => e.id === 'server-remote-evt-1')).toBe(true);
  });

  it('executes cloud sync via profileVaultStore gracefully and updates timestamp', async () => {
    const vault = useProfileVaultStore.getState();
    const syncRes = await vault.syncWithCloud();
    expect(syncRes.success).toBe(true);
    expect(useProfileVaultStore.getState().lastSyncedAt).toBeDefined();
  });
});

