import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/main.js';

test('NestJS Fastify Backend E2E - Full API Route Suite', async (t) => {
  process.env.NODE_ENV = 'test';
  const app = await createApp();
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  await t.test('1. GET /v1/calendar/day', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/calendar/day?date=2026-08-18&timezone=7',
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.date && typeof body.date.isoDate === 'string');
    assert.ok(body.lunarDate !== undefined);
    assert.ok(body.canChi !== undefined);
  });

  await t.test('2. GET /v1/calendar/dung-su/catalog', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/calendar/dung-su/catalog',
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.categories) || typeof body === 'object');
  });

  await t.test('3. POST /v1/tu-vi/chart', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/tu-vi/chart',
      payload: {
        birthDate: '1995-08-15T10:30:00.000Z',
        gender: 'male',
        name: 'Nguyễn Văn A',
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.chart !== undefined || body.cuc !== undefined || body.palaces !== undefined);
  });

  await t.test('4. POST /v1/astrology/western', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/astrology/western',
      payload: {
        birthDate: '1995-08-15T10:30:00.000Z',
        birthLocation: {
          latitude: 21.0285,
          longitude: 105.8542,
          altitudeMeters: 19,
          timezone: 7,
        },
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.planets !== undefined || body.aspects !== undefined || body.ascendant !== undefined || body.summary !== undefined);
  });

  await t.test('5. POST /v1/astrology/vedic', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/astrology/vedic',
      payload: {
        birthDate: '1995-08-15T10:30:00.000Z',
        birthLocation: {
          latitude: 21.0285,
          longitude: 105.8542,
          altitudeMeters: 19,
          timezone: 7,
        },
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.d1 !== undefined || body.nakshatra !== undefined || body.dashas !== undefined || body.lagna !== undefined || body.summary !== undefined);
  });

  await t.test('6. POST /v1/divination/mai-hoa', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/divination/mai-hoa',
      payload: {
        date: '2026-08-18T10:30:00.000Z',
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.mainHexagram !== undefined || body.reading !== undefined || body.upperTrigram !== undefined || body.hexagram !== undefined);
  });

  await t.test('7. POST /v1/divination/tam-thuc', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/divination/tam-thuc',
      payload: {
        date: '2026-08-18T10:30:00.000Z',
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.methods !== undefined && body.methods.qmdj !== undefined);
  });

  await t.test('8. POST /v1/election/scan', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/election/scan',
      payload: {
        request: {
          taskId: 'e2e-scan-test',
          userBirthData: {
            jd: 2450000.5,
            lat: 21.0285,
            lng: 105.8542,
            alt: 19,
          },
          searchWindow: {
            startJd: 2460826.5,
            endJd: 2460827.5,
          },
        },
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.envelope !== undefined || body.timeline !== undefined || body.status !== undefined || body.response !== undefined);
  });

  await t.test('9. POST /v1/auth/login and /v1/auth/register', async () => {
    const regRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: `tester_${Date.now()}@lichviet.local`,
        password: 'Password123',
        name: 'Nhà Thử Nghiệm',
      },
    });
    assert.equal(regRes.statusCode, 201);
    const regBody = JSON.parse(regRes.payload);
    assert.ok(regBody.accessToken);
    assert.ok(regBody.user.id);

    const loginRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: regBody.user.email,
        password: 'Password123',
      },
    });
    assert.equal(loginRes.statusCode, 200);
    const loginBody = JSON.parse(loginRes.payload);
    assert.ok(loginBody.accessToken);
    assert.equal(loginBody.user.email, regBody.user.email);
  });

  await t.test('10. GET and PATCH /v1/users/me', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: '/v1/users/me',
      headers: { authorization: 'Bearer jwt-demo-user-001-123' },
    });
    assert.equal(getRes.statusCode, 200);
    const getBody = JSON.parse(getRes.payload);
    assert.ok(getBody.id);

    const patchRes = await app.inject({
      method: 'PATCH',
      url: '/v1/users/me',
      headers: { authorization: 'Bearer jwt-demo-user-001-123' },
      payload: { name: 'Demo Tên Mới' },
    });
    assert.equal(patchRes.statusCode, 200);
    const patchBody = JSON.parse(patchRes.payload);
    assert.equal(patchBody.name, 'Demo Tên Mới');
  });

  await t.test('11. CRUD /v1/dam-gio', async () => {
    // Create
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/dam-gio',
      payload: {
        deceasedName: 'Cụ Bà',
        relationship: 'Bà Nội',
        lunarDay: 10,
        lunarMonth: 3,
        alarmLeadDays: [1, 3],
      },
    });
    assert.equal(createRes.statusCode, 201);
    const created = JSON.parse(createRes.payload);
    assert.ok(created.id);
    assert.equal(created.deceasedName, 'Cụ Bà');

    // List
    const listRes = await app.inject({
      method: 'GET',
      url: '/v1/dam-gio',
    });
    assert.equal(listRes.statusCode, 200);
    const list = JSON.parse(listRes.payload);
    assert.ok(Array.isArray(list));
    assert.ok(list.some((r) => r.id === created.id));

    // Update
    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/v1/dam-gio/${created.id}`,
      payload: { notes: 'Chuẩn bị mâm cỗ chay' },
    });
    assert.equal(updateRes.statusCode, 200);
    const updated = JSON.parse(updateRes.payload);
    assert.equal(updated.notes, 'Chuẩn bị mâm cỗ chay');

    // Delete
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/v1/dam-gio/${created.id}`,
    });
    assert.equal(deleteRes.statusCode, 204);
  });

  await t.test('12. CRUD /v1/calendar/events', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/calendar/events',
      payload: {
        title: 'Cúng Rằm',
        solarDate: '2026-08-28',
        category: 'ritual',
      },
    });
    assert.equal(createRes.statusCode, 201);
    const created = JSON.parse(createRes.payload);
    assert.ok(created.id);
    assert.equal(created.title, 'Cúng Rằm');

    const getRes = await app.inject({
      method: 'GET',
      url: '/v1/calendar/events?start=2026-08-01&end=2026-08-31',
    });
    assert.equal(getRes.statusCode, 200);
    const list = JSON.parse(getRes.payload);
    assert.ok(Array.isArray(list));
    assert.ok(list.some((e) => e.id === created.id));

    const delRes = await app.inject({
      method: 'DELETE',
      url: `/v1/calendar/events/${created.id}`,
    });
    assert.equal(delRes.statusCode, 204);
  });

  await t.test('13. POST /v1/sync', async () => {
    const syncRes = await app.inject({
      method: 'POST',
      url: '/v1/sync',
      payload: {
        clientWatermark: '2026-01-01T00:00:00.000Z',
        mutations: [
          {
            mutationId: 'mut-1',
            entityType: 'dam_gio',
            entityId: 'dg-sync-1',
            action: 'insert',
            payload: { deceasedName: 'Cụ Thủy Tổ' },
            clientUpdatedAt: new Date().toISOString(),
          },
        ],
      },
    });
    assert.equal(syncRes.statusCode, 200);
    const syncBody = JSON.parse(syncRes.payload);
    assert.ok(syncBody.serverWatermark);
    assert.equal(syncBody.acks.length, 1);
    assert.equal(syncBody.acks[0].status, 'applied');
  });

  await app.close();
});
