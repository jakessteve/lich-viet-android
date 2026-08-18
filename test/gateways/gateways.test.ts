import { describe, it, expect, beforeEach } from 'vitest';
import { getRuntime, setRuntime } from '@/gateways/bootstrap';
import { createDemoRuntime } from '@/gateways/demo';
import { createRemoteRuntime } from '@/gateways/remote';
import { useDamGioStore } from '@/stores/damGioStore';
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

    const damGios = await runtime.damGio.listDamGio();
    expect(damGios.length).toBeGreaterThan(0);
  });

  it('performs in-memory CRUD on DamGio in demo runtime', async () => {
    const runtime = createDemoRuntime();
    const created = await runtime.damGio.createDamGio({
      deceasedName: 'Cụ Mới',
      relationship: 'Bác',
      lunarDay: 5,
      lunarMonth: 8,
      alarmLeadDays: [1],
    });
    expect(created.id).toContain('dg-');
    expect(created.deceasedName).toBe('Cụ Mới');

    const updated = await runtime.damGio.updateDamGio(created.id, {
      notes: 'Ghi chú cập nhật',
    });
    expect(updated.notes).toBe('Ghi chú cập nhật');

    await runtime.damGio.deleteDamGio(created.id);
    const list = await runtime.damGio.listDamGio();
    expect(list.find((r) => r.id === created.id)).toBeUndefined();
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
    expect(remote.damGio).toBeDefined();
    expect(remote.calendar).toBeDefined();
    expect(remote.sync).toBeDefined();
  });

  it('integrates useDamGioStore seamlessly with active runtime', async () => {
    await useDamGioStore.getState().fetchDamGio();
    expect(useDamGioStore.getState().records.length).toBeGreaterThan(0);

    const created = await useDamGioStore.getState().createDamGio({
      deceasedName: 'Cụ Thân Sinh',
      relationship: 'Bố',
      lunarDay: 12,
      lunarMonth: 9,
      alarmLeadDays: [1],
    });
    expect(created.deceasedName).toBe('Cụ Thân Sinh');
    expect(useDamGioStore.getState().records.some((r) => r.id === created.id)).toBe(true);

    await useDamGioStore.getState().deleteDamGio(created.id);
    expect(useDamGioStore.getState().records.some((r) => r.id === created.id)).toBe(false);
  });

  it('executes cloud sync via profileVaultStore gracefully', async () => {
    const vault = useProfileVaultStore.getState();
    const syncRes = await vault.syncWithCloud();
    expect(syncRes.success).toBe(true);
    expect(useProfileVaultStore.getState().lastSyncedAt).toBeDefined();
  });
});
