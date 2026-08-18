import { describe, it, expect } from 'vitest';
import {
  createScoringMetrics,
  createHybridElectionTimeline,
  createAsyncCalculationRequest,
  type UserProfile,
  type AuthResult,
  type DamGioRecord,
  type SyncMutation,
} from '@lich-viet/contracts';

describe('@lich-viet/contracts module', () => {
  it('exports scoring and election functions cleanly', () => {
    const metrics = createScoringMetrics({
      totalScore: 85,
      easternScore: 80,
      westernScore: 90,
      vedicScore: 85,
      isShortCircuited: false,
    });
    expect(metrics.totalScore).toBe(85);

    const timeline = createHybridElectionTimeline({
      timestampStart: 1000,
      timestampEnd: 2000,
      metrics,
      termName: 'Lập Xuân',
      lunarDayStr: '01/01',
    });
    expect(timeline.termName).toBe('Lập Xuân');

    const req = createAsyncCalculationRequest({
      taskId: 'task-test-01',
      userBirthData: {
        jd: 2451545.0,
        lat: 21.0285,
        lng: 105.8542,
        alt: 10,
      },
      searchWindow: {
        startJd: 2451545.0,
        endJd: 2451550.0,
      },
    });
    expect(req.taskId).toBe('task-test-01');
  });

  it('validates auth and profile types structure', () => {
    const user: UserProfile = {
      id: 'usr-1',
      email: 'user@example.com',
      name: 'Nguyễn Văn A',
      tier: 'expert',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const authRes: AuthResult = {
      accessToken: 'token-abc',
      user,
    };
    expect(authRes.user.tier).toBe('expert');
  });

  it('validates dam gio and sync contract structure', () => {
    const damGio: DamGioRecord = {
      id: 'dg-1',
      userId: 'usr-1',
      deceasedName: 'Cụ Cố',
      relationship: 'Ông',
      lunarDay: 15,
      lunarMonth: 7,
      alarmLeadDays: [1, 3, 7],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(damGio.lunarDay).toBe(15);

    const mutation: SyncMutation = {
      mutationId: 'mut-1',
      entityType: 'dam_gio',
      entityId: 'dg-1',
      action: 'insert',
      clientUpdatedAt: new Date().toISOString(),
    };
    expect(mutation.entityType).toBe('dam_gio');
  });
});
