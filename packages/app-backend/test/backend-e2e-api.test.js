import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/main.js';

async function runE2eSuite() {
  process.env.NODE_ENV = 'test';
  const app = await createApp();
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  let userAToken = '';
  let userBToken = '';
  let userAEventId = '';

  console.log('Testing 1. GET /v1/calendar/day');
  const res1 = await app.inject({
    method: 'GET',
    url: '/v1/calendar/day?date=2026-08-18&timezone=7',
  });
  assert.equal(res1.statusCode, 200);
  const body1 = JSON.parse(res1.payload);
  assert.ok(body1.date && typeof body1.date.isoDate === 'string');
  assert.ok(body1.lunarDate !== undefined);
  assert.ok(body1.canChi !== undefined);

  console.log('Testing 2. GET /v1/calendar/dung-su/catalog');
  const res2 = await app.inject({
    method: 'GET',
    url: '/v1/calendar/dung-su/catalog',
  });
  assert.equal(res2.statusCode, 200);
  const body2 = JSON.parse(res2.payload);
  assert.ok(Array.isArray(body2.categories) || typeof body2 === 'object');

  console.log('Testing 3. POST /v1/tu-vi/chart');
  const res3 = await app.inject({
    method: 'POST',
    url: '/v1/tu-vi/chart',
    payload: {
      birthDate: '1995-08-15T10:30:00.000Z',
      gender: 'male',
      name: 'Nguyễn Văn A',
    },
  });
  assert.equal(res3.statusCode, 200);
  const body3 = JSON.parse(res3.payload);
  assert.ok(body3.chart !== undefined || body3.cuc !== undefined || body3.palaces !== undefined);

  console.log('Testing 4. POST /v1/astrology/western');
  const res4 = await app.inject({
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
  assert.equal(res4.statusCode, 200);
  const body4 = JSON.parse(res4.payload);
  assert.ok(body4.planets !== undefined || body4.aspects !== undefined || body4.ascendant !== undefined || body4.summary !== undefined);

  console.log('Testing 5. POST /v1/astrology/vedic');
  const res5 = await app.inject({
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
  assert.equal(res5.statusCode, 200);
  const body5 = JSON.parse(res5.payload);
  assert.ok(body5.d1 !== undefined || body5.nakshatra !== undefined || body5.dashas !== undefined || body5.lagna !== undefined || body5.summary !== undefined);

  console.log('Testing 6. POST /v1/divination/mai-hoa');
  const res6 = await app.inject({
    method: 'POST',
    url: '/v1/divination/mai-hoa',
    payload: {
      date: '2026-08-18T10:30:00.000Z',
    },
  });
  assert.equal(res6.statusCode, 200);
  const body6 = JSON.parse(res6.payload);
  assert.ok(body6.mainHexagram !== undefined || body6.reading !== undefined || body6.upperTrigram !== undefined || body6.hexagram !== undefined);

  console.log('Testing 7. POST /v1/divination/tam-thuc');
  const res7 = await app.inject({
    method: 'POST',
    url: '/v1/divination/tam-thuc',
    payload: {
      date: '2026-08-18T10:30:00.000Z',
    },
  });
  assert.equal(res7.statusCode, 200);
  const body7 = JSON.parse(res7.payload);
  assert.ok(body7.methods !== undefined && body7.methods.qmdj !== undefined);

  console.log('Testing 8. POST /v1/election/scan');
  const res8 = await app.inject({
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
  assert.equal(res8.statusCode, 200);
  const body8 = JSON.parse(res8.payload);
  assert.ok(body8.envelope !== undefined || body8.timeline !== undefined || body8.status !== undefined || body8.response !== undefined);

  console.log('Testing 9. Register User A and User B');
  const regResA = await app.inject({
    method: 'POST',
    url: '/v1/auth/register',
    payload: {
      email: `usera_${Date.now()}@lichviet.local`,
      password: 'Password123!',
      name: 'User A',
    },
  });
  assert.equal(regResA.statusCode, 201);
  const regBodyA = JSON.parse(regResA.payload);
  assert.ok(regBodyA.accessToken);
  userAToken = regBodyA.accessToken;

  const regResB = await app.inject({
    method: 'POST',
    url: '/v1/auth/register',
    payload: {
      email: `userb_${Date.now()}@lichviet.local`,
      password: 'Password123!',
      name: 'User B',
    },
  });
  assert.equal(regResB.statusCode, 201);
  const regBodyB = JSON.parse(regResB.payload);
  assert.ok(regBodyB.accessToken);
  userBToken = regBodyB.accessToken;

  console.log('Testing 10. GET and PATCH /v1/users/me');
  const getRes = await app.inject({
    method: 'GET',
    url: '/v1/users/me',
    headers: { authorization: `Bearer ${userAToken}` },
  });
  assert.equal(getRes.statusCode, 200);
  const getBody = JSON.parse(getRes.payload);
  assert.equal(getBody.name, 'User A');

  const patchRes = await app.inject({
    method: 'PATCH',
    url: '/v1/users/me',
    headers: { authorization: `Bearer ${userAToken}` },
    payload: { name: 'User A Renamed' },
  });
  assert.equal(patchRes.statusCode, 200);
  const patchBody = JSON.parse(patchRes.payload);
  assert.equal(patchBody.name, 'User A Renamed');

  console.log('Testing 11. Security - Reject unauthenticated access on protected endpoints');
  const unauthMeRes = await app.inject({
    method: 'GET',
    url: '/v1/users/me',
  });
  assert.equal(unauthMeRes.statusCode, 401);
  const unauthMeBody = JSON.parse(unauthMeRes.payload);
  assert.equal(unauthMeBody.ok, false);
  assert.equal(unauthMeBody.error.code, 'UNAUTHORIZED');

  const unauthEventsRes = await app.inject({
    method: 'GET',
    url: '/v1/calendar/events',
  });
  assert.equal(unauthEventsRes.statusCode, 401);
  const unauthEventsBody = JSON.parse(unauthEventsRes.payload);
  assert.equal(unauthEventsBody.ok, false);
  assert.equal(unauthEventsBody.error.code, 'UNAUTHORIZED');

  const unauthSyncRes = await app.inject({
    method: 'POST',
    url: '/v1/sync',
    payload: {
      clientWatermark: '2026-01-01T00:00:00.000Z',
      mutations: [],
    },
  });
  assert.equal(unauthSyncRes.statusCode, 401);

  console.log('Testing 12. CRUD /v1/calendar/events with IDOR protection');
  const createRes = await app.inject({
    method: 'POST',
    url: '/v1/calendar/events',
    headers: { authorization: `Bearer ${userAToken}` },
    payload: {
      title: 'Cúng Rằm User A',
      solarDate: '2026-08-28',
      category: 'ritual',
    },
  });
  assert.equal(createRes.statusCode, 201);
  const created = JSON.parse(createRes.payload);
  assert.ok(created.id);
  userAEventId = created.id;

  const attackUpdateRes = await app.inject({
    method: 'PUT',
    url: `/v1/calendar/events/${userAEventId}`,
    headers: { authorization: `Bearer ${userBToken}` },
    payload: {
      title: 'Hacked Title',
      solarDate: '2026-08-28',
    },
  });
  assert.equal(attackUpdateRes.statusCode, 403);

  const attackDeleteRes = await app.inject({
    method: 'DELETE',
    url: `/v1/calendar/events/${userAEventId}`,
    headers: { authorization: `Bearer ${userBToken}` },
  });
  assert.equal(attackDeleteRes.statusCode, 403);

  const legitDeleteRes = await app.inject({
    method: 'DELETE',
    url: `/v1/calendar/events/${userAEventId}`,
    headers: { authorization: `Bearer ${userAToken}` },
  });
  assert.equal(legitDeleteRes.statusCode, 204);

  console.log('Testing 13. POST /v1/sync and sync projection to calendar_events table');
  const syncEventId = `sync-evt-${Date.now()}`;
  const syncRes = await app.inject({
    method: 'POST',
    url: '/v1/sync',
    headers: { authorization: `Bearer ${userAToken}` },
    payload: {
      clientWatermark: '2026-01-01T00:00:00.000Z',
      mutations: [
        {
          mutationId: 'mut-user-a-1',
          entityType: 'calendar_event',
          entityId: syncEventId,
          action: 'insert',
          payload: {
            title: 'Sự kiện Đồng Bộ Hóa Từ Client',
            solarDate: '2026-09-01',
            category: 'work',
          },
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

  // Verify that the synced event is immediately queryable via GET /v1/calendar/events
  const verifyEventsRes = await app.inject({
    method: 'GET',
    url: '/v1/calendar/events',
    headers: { authorization: `Bearer ${userAToken}` },
  });
  assert.equal(verifyEventsRes.statusCode, 200);
  const verifyEventsBody = JSON.parse(verifyEventsRes.payload);
  const syncedEvent = verifyEventsBody.find((e) => e.id === syncEventId);
  assert.ok(syncedEvent, 'Synced event must be projected into calendar_events table');
  assert.equal(syncedEvent.title, 'Sự kiện Đồng Bộ Hóa Từ Client');

  console.log('All backend e2e tests passed!');
  await app.close();
}

test('NestJS Fastify Backend E2E - Full API Route Suite', async () => {
  await runE2eSuite();
});
