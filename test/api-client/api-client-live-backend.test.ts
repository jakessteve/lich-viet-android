import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../packages/app-backend/src/main';
import { LichVietApiClient } from '@lich-viet/api-client';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Live E2E Integration: LichVietApiClient <-> Fastify Backend', () => {
  let app: NestFastifyApplication;
  let client: LichVietApiClient;
  let serverPort: number;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await createApp();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Listen on random high port for live HTTP interaction
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    serverPort = typeof address === 'object' && address ? address.port : 3000;
    client = new LichVietApiClient(`http://127.0.0.1:${serverPort}`);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('performs registration and login against live backend', async () => {
    const email = `live_test_${Date.now()}@lichviet.local`;
    const regResult = await client.register({
      email,
      password: 'LivePassword123',
      name: 'Người Thử Nghiệm Sống',
    });
    expect(regResult.accessToken).toBeDefined();
    expect(regResult.user.email).toBe(email);

    const loginResult = await client.login({
      email,
      password: 'LivePassword123',
    });
    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.user.id).toBe(regResult.user.id);
  });

  it('performs full CRUD on Đám Giỗ against live backend', async () => {
    const created = await client.createDamGio({
      deceasedName: 'Cụ Khởi Tổ',
      relationship: 'Cụ Cố',
      lunarDay: 18,
      lunarMonth: 8,
      alarmLeadDays: [1, 3],
      notes: 'Lễ cúng tổ',
    });
    expect(created.id).toBeDefined();
    expect(created.deceasedName).toBe('Cụ Khởi Tổ');

    const list = await client.listDamGio();
    expect(list.some((r) => r.id === created.id)).toBe(true);

    const updated = await client.updateDamGio(created.id, {
      notes: 'Lễ cúng đại lễ tổ',
    });
    expect(updated.notes).toBe('Lễ cúng đại lễ tổ');

    await client.deleteDamGio(created.id);
  });

  it('performs Calendar calculations against live backend', async () => {
    const day = (await client.getCalendarDay('2026-08-18', 7)) as {
      date: { isoDate: string };
      canChi: unknown;
    };
    expect(day.date.isoDate).toBeDefined();
    expect(day.canChi).toBeDefined();

    const catalog = await client.getDungSuCatalog();
    expect(catalog).toBeDefined();

    const score = await client.getDungSuScore('2026-08-18');
    expect(score).toBeDefined();
  });

  it('performs Metaphysical calculations against live backend', async () => {
    const tuvi = await client.calculateTuViChart({
      birthDate: '1995-08-15T10:30:00.000Z',
      gender: 'male',
      name: 'Nguyễn Văn A',
    });
    expect(tuvi).toBeDefined();

    const western = await client.calculateWesternChart({
      birthDate: '1995-08-15T10:30:00.000Z',
      birthLocation: { latitude: 21.0285, longitude: 105.8542 },
    });
    expect(western).toBeDefined();

    const vedic = await client.calculateVedicChart({
      birthDate: '1995-08-15T10:30:00.000Z',
      birthLocation: { latitude: 21.0285, longitude: 105.8542 },
    });
    expect(vedic).toBeDefined();

    const maiHoa = await client.calculateMaiHoa({ date: '2026-08-18T10:30:00.000Z' });
    expect(maiHoa).toBeDefined();

    const tamThuc = await client.calculateTamThuc({ date: '2026-08-18T10:30:00.000Z' });
    expect(tamThuc).toBeDefined();
  });

  it('performs delta synchronization against live backend', async () => {
    const syncRes = await client.sync({
      clientWatermark: '2026-01-01T00:00:00.000Z',
      mutations: [
        {
          mutationId: 'live-sync-1',
          entityType: 'dam_gio',
          entityId: 'dg-live-1',
          action: 'insert',
          payload: { deceasedName: 'Cụ Tổ Live' },
          clientUpdatedAt: new Date().toISOString(),
        },
      ],
    });

    expect(syncRes.serverWatermark).toBeDefined();
    expect(syncRes.acks.length).toBe(1);
    expect(syncRes.acks[0].status).toBe('applied');
  });
});
